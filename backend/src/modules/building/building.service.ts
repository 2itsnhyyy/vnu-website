import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';
import { BuildingResponseDto } from './dto/building-response.dto';
import { SearchBuildingParamsDto } from './dto/search-building-params.dto';
import { BuildingMapQueryDto } from './dto/building-map-query.dto';
import { Prisma } from '@prisma/client';
import {
  CreateFaceDto,
  CreateNodeDto,
  CreatePointDto,
} from './dto/create-geometry.dto';
import {
  geoJsonPointToWKT,
  geoJsonPolygonToWKT,
} from 'src/common/utils/geometry.utils';

@Injectable()
export class BuildingService {
  constructor(private readonly prisma: PrismaService) {}

  private createPointGeometry(pointDto: CreatePointDto): string {
    return geoJsonPointToWKT(pointDto);
  }

  private createFaceGeometry(faceDto: CreateFaceDto): string {
    return geoJsonPolygonToWKT(faceDto);
  }

  private async createPoint(
    pointDto: CreatePointDto,
    tx: any,
  ): Promise<number> {
    const geomWkt = this.createPointGeometry(pointDto);
    const point = await tx.$queryRaw<Array<{ point_id: number }>>`
      INSERT INTO point (geom) 
      VALUES (ST_GeomFromText(${geomWkt}, 4326))
      RETURNING point_id
    `;
    return point[0].point_id;
  }

  private async createFace(faceDto: CreateFaceDto, tx: any): Promise<number> {
    const geomWkt = this.createFaceGeometry(faceDto);
    const face = await tx.$queryRaw<Array<{ face_id: number }>>`
      INSERT INTO face (geom)
      VALUES (ST_GeomFromText(${geomWkt}, 4326))
      RETURNING face_id
    `;
    return face[0].face_id;
  }

  private async createNode(nodeDto: CreateNodeDto, tx: any): Promise<number> {
    let pointId: number;

    if (nodeDto.pointId) {
      pointId = nodeDto.pointId;
    } else if (nodeDto.point) {
      pointId = await this.createPoint(nodeDto.point, tx);
    } else {
      throw new BadRequestException(
        'Node must have either pointId or point data',
      );
    }

    const node = await tx.node.create({
      data: { pointId },
    });
    return node.nodeId;
  }

  private async getOrCreateFaceId(
    faceId: number | undefined,
    faceDto: CreateFaceDto | undefined,
    tx: any,
  ): Promise<number> {
    if (faceId) {
      return faceId;
    }
    if (faceDto) {
      return await this.createFace(faceDto, tx);
    }
    throw new BadRequestException('Must provide either faceId or face data');
  }

  private async getOrCreateNodeId(
    nodeId: number | undefined,
    nodeDto: CreateNodeDto | undefined,
    tx: any,
  ): Promise<number> {
    if (nodeId) {
      return nodeId;
    }
    if (nodeDto) {
      return await this.createNode(nodeDto, tx);
    }
    throw new BadRequestException('Must provide either nodeId or node data');
  }

  async createBuilding(createBuildingDto: CreateBuildingDto) {
    const { name, description, floors, image, placeId, objects3d } =
      createBuildingDto;

    const place = await this.prisma.place.findUnique({
      where: { placeId: Number(placeId) },
    });

    if (!place) {
      throw new NotFoundException('Place not found');
    }

    const building = await this.prisma.$transaction(
      async (tx) => {
        const newBuilding = await tx.building.create({
          data: {
            name,
            description,
            floors,
            image,
            placeId,
          },
        });

        if (objects3d && objects3d.length > 0) {
          for (const obj3d of objects3d) {
            if (
              obj3d.objectType === 0 &&
              (!obj3d.meshes || obj3d.meshes.length === 0)
            ) {
              throw new NotFoundException(
                'Object3D type 0 (MeshObject) must have at least one mesh',
              );
            }
            if (obj3d.objectType === 1 && !obj3d.body) {
              throw new NotFoundException(
                'Object3D type 1 (Body) must have body data',
              );
            }
            if (obj3d.objectType === 0 && obj3d.body) {
              throw new NotFoundException(
                'Object3D type 0 (MeshObject) cannot have body data',
              );
            }
            if (
              obj3d.objectType === 1 &&
              obj3d.meshes &&
              obj3d.meshes.length > 0
            ) {
              throw new NotFoundException(
                'Object3D type 1 (Body) cannot have meshes',
              );
            }

            const createdObject3D = await tx.object3D.create({
              data: {
                buildingId: newBuilding.buildingId,
                objectType: obj3d.objectType,
              },
            });

            if (obj3d.objectType === 0 && obj3d.meshes) {
              for (const mesh of obj3d.meshes) {
                let pointId = mesh.pointId;

                if (!pointId && mesh.point) {
                  pointId = await this.createPoint(mesh.point, tx);
                }

                await tx.meshObject.create({
                  data: {
                    meshUrl: mesh.meshUrl,
                    pointId: pointId,
                    rotate: mesh.rotate,
                    scale: mesh.scale,
                    objectId: createdObject3D.objectId,
                  },
                });
              }
            }

            if (obj3d.objectType === 1 && obj3d.body) {
              const createdBody = await tx.body.create({
                data: {
                  name: obj3d.body.name,
                  objectId: createdObject3D.objectId,
                },
              });

              if (obj3d.body.frustums && obj3d.body.frustums.length > 0) {
                for (const frustum of obj3d.body.frustums) {
                  const baseFaceId = await this.getOrCreateFaceId(
                    frustum.baseFaceId,
                    frustum.baseFace,
                    tx,
                  );
                  const topFaceId = frustum.topFaceId
                    ? frustum.topFaceId
                    : frustum.topFace
                      ? await this.createFace(frustum.topFace, tx)
                      : null;

                  await tx.frustum.create({
                    data: {
                      baseFace: baseFaceId,
                      topFace: topFaceId,
                      bodyId: createdBody.bodyId,
                    },
                  });
                }
              }

              if (obj3d.body.prisms && obj3d.body.prisms.length > 0) {
                for (const prism of obj3d.body.prisms) {
                  const baseFaceId = await this.getOrCreateFaceId(
                    prism.baseFaceId,
                    prism.baseFace,
                    tx,
                  );

                  await tx.prism.create({
                    data: {
                      baseFace: baseFaceId,
                      height: prism.height,
                      bodyId: createdBody.bodyId,
                    },
                  });
                }
              }

              if (obj3d.body.pyramids && obj3d.body.pyramids.length > 0) {
                for (const pyramid of obj3d.body.pyramids) {
                  const baseFaceId = await this.getOrCreateFaceId(
                    pyramid.baseFaceId,
                    pyramid.baseFace,
                    tx,
                  );
                  const apexId = await this.getOrCreateNodeId(
                    pyramid.apexId,
                    pyramid.apex,
                    tx,
                  );

                  await tx.pyramid.create({
                    data: {
                      baseFace: baseFaceId,
                      apex: apexId,
                      bodyId: createdBody.bodyId,
                    },
                  });
                }
              }

              if (obj3d.body.cones && obj3d.body.cones.length > 0) {
                for (const cone of obj3d.body.cones) {
                  const centerId = await this.getOrCreateNodeId(
                    cone.centerId,
                    cone.center,
                    tx,
                  );
                  const apexId = await this.getOrCreateNodeId(
                    cone.apexId,
                    cone.apex,
                    tx,
                  );

                  await tx.cone.create({
                    data: {
                      center: centerId,
                      radius: cone.radius,
                      apex: apexId,
                      bodyId: createdBody.bodyId,
                    },
                  });
                }
              }

              if (obj3d.body.cylinders && obj3d.body.cylinders.length > 0) {
                for (const cylinder of obj3d.body.cylinders) {
                  const centerId = await this.getOrCreateNodeId(
                    cylinder.centerId,
                    cylinder.center,
                    tx,
                  );

                  await tx.cylinder.create({
                    data: {
                      center: centerId,
                      radius: cylinder.radius,
                      height: cylinder.height,
                      bodyId: createdBody.bodyId,
                    },
                  });
                }
              }
            }
          }
        }

        return await tx.building.findUnique({
          where: { buildingId: newBuilding.buildingId },
          include: {
            objects3d: {
              include: {
                meshes: true,
                bodies: {
                  include: {
                    frustums: true,
                    prisms: true,
                    pyramids: true,
                    cones: true,
                    cylinders: true,
                  },
                },
              },
            },
          },
        });
      },
      {
        maxWait: 10000,
        timeout: 30000,
      },
    );

    return {
      message: 'Building created successfully',
      building,
    };
  }

  async getAllBuildings(searchBuildingParamsDto: SearchBuildingParamsDto) {
    const { limit, page, search, placeId, minFloors, maxFloors } =
      searchBuildingParamsDto;
    const take = Number(limit);
    const skip = (Number(page) - 1) * take;

    const where: Prisma.BuildingWhereInput = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(placeId && { placeId: Number(placeId) }),
      ...(minFloors && { floors: { gte: Number(minFloors) } }),
      ...(maxFloors && { floors: { lte: Number(maxFloors) } }),
      ...(minFloors &&
        maxFloors && {
          floors: { gte: Number(minFloors), lte: Number(maxFloors) },
        }),
    };

    const totalItems = await this.prisma.building.count({ where });
    const totalPages = Math.ceil(totalItems / take);

    const buildingList = await this.prisma.building.findMany({
      where,
      orderBy: { buildingId: 'asc' },
      skip,
      take,
    });

    return {
      pagination: {
        totalItems,
        totalPages,
        currentPage: Number(page),
        hasNextPage: Number(page) < totalPages,
        hasPreviousPage: Number(page) > 1,
        limit: take,
      },
      buildings: buildingList.map(
        (building) => new BuildingResponseDto(building),
      ),
    };
  }

  async getBuildingById(buildingId: number) {
    const building = await this.prisma.building.findUnique({
      where: { buildingId: Number(buildingId) },
      include: {
        place: true,
        objects3d: {
          include: {
            bodies: {
              include: {
                frustums: {
                  include: {
                    baseFaceRef: true,
                    topFaceRef: true,
                  },
                },
                prisms: {
                  include: {
                    baseFaceRef: true,
                  },
                },
                pyramids: {
                  include: {
                    baseFaceRef: true,
                    apexNode: true,
                  },
                },
                cones: {
                  include: {
                    centerNode: true,
                    apexNode: true,
                  },
                },
                cylinders: {
                  include: {
                    centerNode: true,
                  },
                },
              },
            },
            meshes: true,
          },
        },
      },
    });

    if (!building) {
      throw new NotFoundException('Building not found');
    }

    const pointIds: Set<number> = new Set();
    const faceIds: Set<number> = new Set();

    building.objects3d.forEach((obj) => {
      obj.meshes.forEach((mesh) => {
        if (mesh.pointId) pointIds.add(mesh.pointId);
      });

      obj.bodies.forEach((body) => {
        body.frustums.forEach((frustum) => {
          faceIds.add(frustum.baseFace);
          if (frustum.topFace) faceIds.add(frustum.topFace);
        });
        body.prisms.forEach((prism) => {
          faceIds.add(prism.baseFace);
        });
        body.pyramids.forEach((pyramid) => {
          faceIds.add(pyramid.baseFace);
          if (pyramid.apexNode?.pointId) pointIds.add(pyramid.apexNode.pointId);
        });
        body.cones.forEach((cone) => {
          if (cone.centerNode?.pointId) pointIds.add(cone.centerNode.pointId);
          if (cone.apexNode?.pointId) pointIds.add(cone.apexNode.pointId);
        });
        body.cylinders.forEach((cylinder) => {
          if (cylinder.centerNode?.pointId)
            pointIds.add(cylinder.centerNode.pointId);
        });
      });
    });

    const pointGeometries =
      pointIds.size > 0
        ? await this.prisma.$queryRaw<Array<{ pointid: number; geom: string }>>`
      SELECT point_id as pointid, ST_AsGeoJSON(geom)::text as geom
      FROM point
      WHERE point_id = ANY(${Array.from(pointIds)})
    `
        : [];

    const faceGeometries =
      faceIds.size > 0
        ? await this.prisma.$queryRaw<Array<{ faceid: number; geom: string }>>`
      SELECT face_id as faceid, ST_AsGeoJSON(geom)::text as geom
      FROM face
      WHERE face_id = ANY(${Array.from(faceIds)})
    `
        : [];

    const pointGeomMap = new Map(
      pointGeometries.map((p) => [p.pointid, JSON.parse(p.geom)]),
    );
    const faceGeomMap = new Map(
      faceGeometries.map((f) => [f.faceid, JSON.parse(f.geom)]),
    );

    const buildingWithGeometry = {
      buildingId: building.buildingId,
      name: building.name,
      description: building.description,
      floors: building.floors,
      image: building.image,
      placeId: building.placeId,
      placeName: building.place?.name,
      objects3d: building.objects3d.map((obj) => ({
        objectId: obj.objectId,
        objectType: obj.objectType,
        meshes: obj.meshes.map((mesh) => ({
          meshId: mesh.meshId,
          meshUrl: mesh.meshUrl,
          pointGeometry: mesh.pointId ? pointGeomMap.get(mesh.pointId) : null,
          rotate: mesh.rotate,
          scale: mesh.scale,
        })),
        bodies: obj.bodies.map((body) => ({
          bodyId: body.bodyId,
          frustums: body.frustums.map((frustum) => ({
            frustumId: frustum.frustumId,
            baseFaceGeometry: faceGeomMap.get(frustum.baseFace),
            topFaceGeometry: frustum.topFace
              ? faceGeomMap.get(frustum.topFace)
              : null,
          })),
          prisms: body.prisms.map((prism) => ({
            prismId: prism.prismId,
            baseFaceGeometry: faceGeomMap.get(prism.baseFace),
            height: prism.height,
          })),
          pyramids: body.pyramids.map((pyramid) => ({
            pyramidId: pyramid.pyramidId,
            baseFaceGeometry: faceGeomMap.get(pyramid.baseFace),
            apexGeometry: pyramid.apexNode?.pointId
              ? pointGeomMap.get(pyramid.apexNode.pointId)
              : null,
          })),
          cones: body.cones.map((cone) => ({
            coneId: cone.coneId,
            centerGeometry: cone.centerNode?.pointId
              ? pointGeomMap.get(cone.centerNode.pointId)
              : null,
            radius: cone.radius,
            apexGeometry: cone.apexNode?.pointId
              ? pointGeomMap.get(cone.apexNode.pointId)
              : null,
          })),
          cylinders: body.cylinders.map((cylinder) => ({
            cylinderId: cylinder.cylinderId,
            centerGeometry: cylinder.centerNode?.pointId
              ? pointGeomMap.get(cylinder.centerNode.pointId)
              : null,
            radius: cylinder.radius,
            height: cylinder.height,
          })),
        })),
      })),
    };

    return {
      building: buildingWithGeometry,
    };
  }

  async getBuildingsForMap(query: BuildingMapQueryDto) {
    const { lat, lon, zoom, heading, tilt } = query;

    const zoomToRadius: { [key: number]: number } = {
      10: 50000,
      11: 25000,
      12: 12500,
      13: 6250,
      14: 3125,
      15: 1562,
      16: 781,
      17: 390,
      18: 195,
      19: 97,
      20: 48,
      21: 24,
      22: 12,
    };

    const roundedZoom = Math.round(zoom);
    let baseRadius = zoomToRadius[roundedZoom] || 195;

    if (tilt > 0) {
      const tiltFactor = 1 + (Math.min(tilt, 85) / 85) * 1.0;
      baseRadius = baseRadius * tiltFactor;
    }

    const centerLat = lat;
    const centerLng = lon;
    const minRadius = 0;
    const maxRadius = baseRadius;

    const centerPoint = `POINT(${centerLng} ${centerLat})`;

    const buildings: any[] = await this.prisma.$queryRaw`
      WITH all_object_points AS (
        -- Points từ MeshObjects
        SELECT 
          b.building_id,
          b.name,
          b.description,
          b.floors,
          b.image,
          b.place_id,
          pl.name as place_name,
          pl.boundary_geom,
          pt.geom as point_geom
        FROM building b
        INNER JOIN place pl ON b.place_id = pl.place_id
        INNER JOIN object3d o ON b.building_id = o.building_id
        INNER JOIN mesh_object m ON o.object_id = m.object_id
        INNER JOIN point pt ON m.point_id = pt.point_id
        
        UNION ALL
        
        -- Points từ Body shapes (pyramids, cones, cylinders - có nodes)
        SELECT 
          b.building_id,
          b.name,
          b.description,
          b.floors,
          b.image,
          b.place_id,
          pl.name as place_name,
          pl.boundary_geom,
          pt.geom as point_geom
        FROM building b
        INNER JOIN place pl ON b.place_id = pl.place_id
        INNER JOIN object3d o ON b.building_id = o.building_id
        INNER JOIN body bd ON o.object_id = bd.object_id
        INNER JOIN (
          -- Nodes từ pyramids
          SELECT body_id, apex as node_id FROM pyramid
          UNION ALL
          -- Nodes từ cones
          SELECT body_id, center as node_id FROM cone
          UNION ALL
          SELECT body_id, apex as node_id FROM cone
          UNION ALL
          -- Nodes từ cylinders
          SELECT body_id, center as node_id FROM cylinder
        ) shapes ON bd.body_id = shapes.body_id
        INNER JOIN node n ON shapes.node_id = n.node_id
        INNER JOIN point pt ON n.point_id = pt.point_id
        
        UNION ALL
        
        -- Centroids từ Prisms (tính tâm của base face)
        SELECT 
          b.building_id,
          b.name,
          b.description,
          b.floors,
          b.image,
          b.place_id,
          pl.name as place_name,
          pl.boundary_geom,
          ST_Centroid(f.geom) as point_geom
        FROM building b
        INNER JOIN place pl ON b.place_id = pl.place_id
        INNER JOIN object3d o ON b.building_id = o.building_id
        INNER JOIN body bd ON o.object_id = bd.object_id
        INNER JOIN prism pr ON bd.body_id = pr.body_id
        INNER JOIN face f ON pr.base_face = f.face_id
        
        UNION ALL
        
        -- Centroids từ Frustums (tính tâm của base face)
        SELECT 
          b.building_id,
          b.name,
          b.description,
          b.floors,
          b.image,
          b.place_id,
          pl.name as place_name,
          pl.boundary_geom,
          ST_Centroid(f.geom) as point_geom
        FROM building b
        INNER JOIN place pl ON b.place_id = pl.place_id
        INNER JOIN object3d o ON b.building_id = o.building_id
        INNER JOIN body bd ON o.object_id = bd.object_id
        INNER JOIN frustum fr ON bd.body_id = fr.body_id
        INNER JOIN face f ON fr.base_face = f.face_id
      ),
      object_distances AS (
        SELECT DISTINCT
          building_id as "buildingId",
          name,
          description,
          floors,
          image,
          place_id as "placeId",
          place_name as "placeName",
          ST_AsGeoJSON(boundary_geom) as "placeGeometry",
          MIN(
            ST_Distance(
              point_geom::geography,
              ST_GeomFromText(${centerPoint}, 4326)::geography
            )
          ) as distance
        FROM all_object_points
        WHERE ST_DWithin(
          point_geom::geography,
          ST_GeomFromText(${centerPoint}, 4326)::geography,
          ${Number(maxRadius)}
        )
        GROUP BY building_id, name, description, floors, image, place_id, place_name, boundary_geom
      )
      SELECT * FROM object_distances
      WHERE distance >= ${Number(minRadius)} AND distance <= ${Number(maxRadius)}
      ORDER BY distance ASC
    `;

    const buildingIds = buildings.map((b) => b.buildingId);

    const objects3d = await this.prisma.object3D.findMany({
      where: { buildingId: { in: buildingIds } },
      include: {
        meshes: {
          include: {
            point: true,
          },
        },
        bodies: {
          include: {
            frustums: {
              include: {
                baseFaceRef: true,
                topFaceRef: true,
              },
            },
            prisms: {
              include: {
                baseFaceRef: true,
              },
            },
            pyramids: {
              include: {
                baseFaceRef: true,
                apexNode: {
                  include: {
                    point: true,
                  },
                },
              },
            },
            cones: {
              include: {
                centerNode: {
                  include: {
                    point: true,
                  },
                },
                apexNode: {
                  include: {
                    point: true,
                  },
                },
              },
            },
            cylinders: {
              include: {
                centerNode: {
                  include: {
                    point: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const meshPointIds = objects3d
      .flatMap((obj) => obj.meshes.map((m) => m.pointId))
      .filter((id) => id !== null);

    const bodyNodePointIds = objects3d
      .flatMap((obj) =>
        obj.bodies.flatMap((body) => [
          ...body.pyramids.map((p) => p.apexNode?.pointId),
          ...body.cones.flatMap((c) => [
            c.centerNode?.pointId,
            c.apexNode?.pointId,
          ]),
          ...body.cylinders.map((c) => c.centerNode?.pointId),
        ]),
      )
      .filter((id) => id !== null && id !== undefined);

    const allPointIds = [...new Set([...meshPointIds, ...bodyNodePointIds])];

    let pointGeometries: any[] = [];
    if (allPointIds.length > 0) {
      pointGeometries = await this.prisma.$queryRaw<
        Array<{ point_id: number; geom: string }>
      >`
        SELECT point_id, ST_AsGeoJSON(geom) as geom
        FROM point
        WHERE point_id IN (${Prisma.join(allPointIds)})
      `;
    }

    const faceIds = objects3d
      .flatMap((obj) =>
        obj.bodies.flatMap((body) => [
          ...body.frustums.flatMap((f) => [f.baseFace, f.topFace]),
          ...body.prisms.map((p) => p.baseFace),
          ...body.pyramids.map((p) => p.baseFace),
        ]),
      )
      .filter((id) => id !== null && id !== undefined);

    const uniqueFaceIds = [...new Set(faceIds)];

    let faceGeometries: any[] = [];
    if (uniqueFaceIds.length > 0) {
      faceGeometries = await this.prisma.$queryRaw<
        Array<{ face_id: number; geom: string }>
      >`
        SELECT face_id, ST_AsGeoJSON(geom) as geom
        FROM face
        WHERE face_id IN (${Prisma.join(uniqueFaceIds)})
      `;
    }

    const pointGeomMap = new Map(
      pointGeometries.map((p) => [p.point_id, JSON.parse(p.geom)]),
    );

    const faceGeomMap = new Map(
      faceGeometries.map((f) => [f.face_id, JSON.parse(f.geom)]),
    );

    const buildingsWithGeometry = buildings.map((building) => ({
      ...building,
      placeGeometry: JSON.parse(building.placeGeometry),
      distance: parseFloat(building.distance),
      objects3d: objects3d
        .filter((obj) => obj.buildingId === building.buildingId)
        .map((obj) => ({
          ...obj,
          meshes: obj.meshes.map((mesh) => ({
            meshId: mesh.meshId,
            meshUrl: mesh.meshUrl,
            pointGeometry: mesh.pointId ? pointGeomMap.get(mesh.pointId) : null,
            rotate: mesh.rotate,
            scale: mesh.scale,
          })),
          bodies: obj.bodies.map((body) => ({
            ...body,
            frustums: body.frustums.map((frustum) => ({
              frustumId: frustum.frustumId,
              baseFaceGeometry: faceGeomMap.get(frustum.baseFace),
              topFaceGeometry: frustum.topFace
                ? faceGeomMap.get(frustum.topFace)
                : null,
            })),
            prisms: body.prisms.map((prism) => ({
              prismId: prism.prismId,
              baseFaceGeometry: faceGeomMap.get(prism.baseFace),
              height: prism.height,
            })),
            pyramids: body.pyramids.map((pyramid) => ({
              pyramidId: pyramid.pyramidId,
              baseFaceGeometry: faceGeomMap.get(pyramid.baseFace),
              apexGeometry: pyramid.apexNode?.pointId
                ? pointGeomMap.get(pyramid.apexNode.pointId)
                : null,
            })),
            cones: body.cones.map((cone) => ({
              coneId: cone.coneId,
              centerGeometry: cone.centerNode?.pointId
                ? pointGeomMap.get(cone.centerNode.pointId)
                : null,
              radius: cone.radius,
              apexGeometry: cone.apexNode?.pointId
                ? pointGeomMap.get(cone.apexNode.pointId)
                : null,
            })),
            cylinders: body.cylinders.map((cylinder) => ({
              cylinderId: cylinder.cylinderId,
              centerGeometry: cylinder.centerNode?.pointId
                ? pointGeomMap.get(cylinder.centerNode.pointId)
                : null,
              radius: cylinder.radius,
              height: cylinder.height,
            })),
          })),
        })),
    }));

    return {
      buildings: buildingsWithGeometry,
      count: buildingsWithGeometry.length,
    };
  }

  async updateBuilding(
    buildingId: number,
    updateBuildingDto: UpdateBuildingDto,
  ) {
    const building = await this.prisma.building.findUnique({
      where: { buildingId: Number(buildingId) },
    });

    if (!building) {
      throw new NotFoundException('Building not found');
    }

    if (updateBuildingDto.placeId) {
      const place = await this.prisma.place.findUnique({
        where: { placeId: Number(updateBuildingDto.placeId) },
      });
      if (!place) {
        throw new NotFoundException('Place not found');
      }
    }

    const updatedBuilding = await this.prisma.building.update({
      where: { buildingId: Number(buildingId) },
      data: {
        ...(updateBuildingDto.name && { name: updateBuildingDto.name }),
        ...(updateBuildingDto.description !== undefined && {
          description: updateBuildingDto.description,
        }),
        ...(updateBuildingDto.floors !== undefined && {
          floors: updateBuildingDto.floors,
        }),
        ...(updateBuildingDto.image !== undefined && {
          image: updateBuildingDto.image,
        }),
        ...(updateBuildingDto.placeId && {
          placeId: updateBuildingDto.placeId,
        }),
      },
    });

    return {
      message: 'Building updated successfully',
      building: new BuildingResponseDto(updatedBuilding),
    };
  }

  async deleteBuilding(buildingId: number) {
    const building = await this.prisma.building.findUnique({
      where: { buildingId: Number(buildingId) },
    });

    if (!building) {
      throw new NotFoundException('Building not found');
    }

    const deletedBuilding = await this.prisma.building.delete({
      where: { buildingId: Number(buildingId) },
    });

    return {
      message: 'Building deleted successfully',
      building: new BuildingResponseDto(deletedBuilding),
    };
  }
}
