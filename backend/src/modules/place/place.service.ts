import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { QueryPlaceDto } from './dto/query-place.dto';
import { Prisma } from '@prisma/client';
import { geoJsonToPostGIS } from 'src/common/utils/geometry.utils';

@Injectable()
export class PlaceService {
  constructor(private prisma: PrismaService) {}

  async create(createPlaceDto: CreatePlaceDto) {
    const { boundaryGeom, ...placeData } = createPlaceDto;
    const geomWKT = geoJsonToPostGIS(boundaryGeom);

    const result = await this.prisma.$executeRaw`
      INSERT INTO place (name, description, address, image, open_time, close_time, phone, boundary_geom)
      VALUES (
        ${placeData.name},
        ${placeData.description || null},
        ${placeData.address || null},
        ${placeData.image || null},
        ${placeData.openTime || null},
        ${placeData.closeTime || null},
        ${placeData.phone || null},
        ST_GeomFromText(${geomWKT})
      )
    `;
    const place = await this.prisma.place.findFirst({
      where: { name: placeData.name },
      orderBy: { placeId: 'desc' },
    });

    if (!place) {
      throw new Error('Failed to create place');
    }

    const geomResult = await this.prisma.$queryRaw<Array<{ geojson: any }>>`
      SELECT ST_AsGeoJSON(boundary_geom)::json as geojson
      FROM place
      WHERE place_id = ${place.placeId}
    `;
    const geometry = geomResult[0]?.geojson || null;

    return {
      place: {
        ...place,
        boundaryGeom: geometry,
      },
    };
  }

  async findAll(query: QueryPlaceDto) {
    const page = Number(query.page);
    const limit = Number(query.limit);
    const { search, includeGeometry } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.PlaceWhereInput = search
      ? {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        }
      : {};

    const [places, total] = await Promise.all([
      this.prisma.place.findMany({
        where,
        skip,
        take: limit,
        orderBy: { placeId: 'desc' },
      }),
      this.prisma.place.count({ where }),
    ]);

    let placesWithGeometry = places;
    if (includeGeometry) {
      placesWithGeometry = await Promise.all(
        places.map(async (place) => {
          const geomResult = await this.prisma.$queryRaw<
            Array<{ geojson: any }>
          >`
            SELECT ST_AsGeoJSON(boundary_geom)::json as geojson
            FROM place
            WHERE place_id = ${place.placeId}
          `;
          return {
            ...place,
            boundaryGeom: geomResult[0]?.geojson || null,
          };
        }),
      );
    }

    return {
      data: placesWithGeometry,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const place = await this.prisma.place.findUnique({
      where: { placeId: id },
      include: {
        buildings: true,
        entrances: true,
      },
    });

    if (!place) {
      throw new NotFoundException(`Place with ID ${id} not found`);
    }

    const geomResult = await this.prisma.$queryRaw<Array<{ geojson: any }>>`
      SELECT ST_AsGeoJSON(boundary_geom)::json as geojson
      FROM place
      WHERE place_id = ${id}
    `;
    const geometry = geomResult[0]?.geojson || null;

    return {
      ...place,
      boundaryGeom: geometry,
    };
  }

  async update(placeId: number, updatePlaceDto: UpdatePlaceDto) {
    const place = await this.prisma.place.findUnique({
      where: { placeId: Number(placeId) },
    });

    if (!place) {
      throw new NotFoundException(`Place with ID ${placeId} not found`);
    }

    const { boundaryGeom, ...placeData } = updatePlaceDto;

    if (Object.keys(placeData).length > 0) {
      await this.prisma.place.update({
        where: { placeId: Number(placeId) },
        data: placeData,
      });
    }

    if (boundaryGeom) {
      const geomWKT = geoJsonToPostGIS(boundaryGeom);
      await this.prisma.$executeRaw`
        UPDATE place
        SET boundary_geom = ST_GeomFromText(${geomWKT})
        WHERE place_id = ${Number(placeId)}
      `;
    }

    return this.findOne(Number(placeId));
  }

  async remove(placeId: number) {
    const place = await this.prisma.place.findUnique({
      where: { placeId: Number(placeId) },
    });

    if (!place) {
      throw new NotFoundException(`Place with ID ${placeId} not found`);
    }

    await this.prisma.place.delete({
      where: { placeId: Number(placeId) },
    });

    return {
      message: 'Place deleted successfully',
    };
  }
}
