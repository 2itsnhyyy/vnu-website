import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEntranceDto } from '../dto/entrance/create-entrance.dto';
import { UpdateEntranceDto } from '../dto/entrance/update-entrance.dto';
import { QueryEntranceDto } from '../dto/entrance/query-entrance.dto';
import { geoJsonPointToWKT } from 'src/common/utils/geometry.utils';
import { Prisma } from '@prisma/client';

@Injectable()
export class EntranceService {
  constructor(private prisma: PrismaService) {}

  async create(createEntranceDto: CreateEntranceDto) {
    const { geom, ...entranceData } = createEntranceDto;
    const geomWKT = geoJsonPointToWKT(geom);

    let nearestJunction = entranceData.nearestJunction;

    if (!nearestJunction) {
      const [lon, lat] = geom.coordinates;
      const nearestJunctions = await this.prisma.$queryRaw<
        Array<{ junction_id: number; distance: number }>
      >`
        SELECT 
          junction_id,
          ST_Distance(
            geom::geography,
            ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326)::geography
          ) as distance
        FROM routing_junction
        ORDER BY distance
        LIMIT 1
      `;

      if (nearestJunctions.length === 0) {
        throw new Error('No junctions found in the system');
      }

      nearestJunction = nearestJunctions[0].junction_id;
    }

    await this.prisma.$executeRaw`
      INSERT INTO entrance (name, nearest_junction, place_id, geom)
      VALUES (
        ${entranceData.name},
        ${nearestJunction},
        ${entranceData.placeId},
        ST_GeomFromText(${geomWKT}, 4326)
      )
    `;

    const entrance = await this.prisma.entrance.findFirst({
      where: { name: entranceData.name },
      orderBy: { entranceId: 'desc' },
      include: {
        place: true,
        nearestJunctionRef: true,
      },
    });

    if (!entrance) {
      throw new Error('Failed to create entrance');
    }

    const geomResult = await this.prisma.$queryRaw<Array<{ geojson: any }>>`
      SELECT ST_AsGeoJSON(geom)::json as geojson
      FROM entrance
      WHERE entrance_id = ${entrance.entranceId}
    `;

    return {
      message: 'Create entrance successfully',
      entrance: {
        ...entrance,
        geom: geomResult[0]?.geojson || null,
      },
    };
  }

  async findAll(query: QueryEntranceDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const { placeId, search, includeGeometry } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.EntranceWhereInput = {};

    if (placeId) {
      where.placeId = Number(placeId);
    }

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const [entrances, total] = await Promise.all([
      this.prisma.entrance.findMany({
        where,
        skip,
        take: limit,
        orderBy: { entranceId: 'desc' },
        include: {
          place: true,
          nearestJunctionRef: true,
        },
      }),
      this.prisma.entrance.count({ where }),
    ]);

    let entrancesWithGeometry = entrances;
    if (includeGeometry && entrances.length > 0) {
      const entranceIds = entrances.map((e) => e.entranceId);
      const geometries = await this.prisma.$queryRaw<
        Array<{ entrance_id: number; geojson: any }>
      >`
        SELECT entrance_id, ST_AsGeoJSON(geom)::json as geojson
        FROM entrance
        WHERE entrance_id = ANY(${entranceIds})
      `;

      const geomMap = new Map(
        geometries.map((g) => [g.entrance_id, g.geojson]),
      );

      entrancesWithGeometry = entrances.map((entrance) => ({
        ...entrance,
        geom: geomMap.get(entrance.entranceId) || null,
      }));
    }

    return {
      data: entrancesWithGeometry,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(entranceId: number) {
    const entrance = await this.prisma.entrance.findUnique({
      where: { entranceId: Number(entranceId) },
      include: {
        place: true,
        nearestJunctionRef: true,
      },
    });

    if (!entrance) {
      throw new NotFoundException(`Entrance with ID ${entranceId} not found`);
    }

    const geomResult = await this.prisma.$queryRaw<Array<{ geojson: any }>>`
      SELECT ST_AsGeoJSON(geom)::json as geojson
      FROM entrance
      WHERE entrance_id = ${Number(entranceId)}
    `;

    return {
      entrance: {
        ...entrance,
        geom: geomResult[0]?.geojson || null,
      },
    };
  }

  async update(entranceId: number, updateEntranceDto: UpdateEntranceDto) {
    const existingEntrance = await this.prisma.entrance.findUnique({
      where: { entranceId: Number(entranceId) },
    });

    if (!existingEntrance) {
      throw new NotFoundException(`Entrance with ID ${entranceId} not found`);
    }

    const { geom, ...entranceData } = updateEntranceDto;

    if (geom && !updateEntranceDto.nearestJunction) {
      const [lon, lat] = geom.coordinates;
      const nearestJunctions = await this.prisma.$queryRaw<
        Array<{ junction_id: number; distance: number }>
      >`
        SELECT 
          junction_id,
          ST_Distance(
            geom::geography,
            ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326)::geography
          ) as distance
        FROM routing_junction
        ORDER BY distance
        LIMIT 1
      `;

      if (nearestJunctions.length > 0) {
        entranceData.nearestJunction = nearestJunctions[0].junction_id;
      }
    }

    if (Object.keys(entranceData).length > 0) {
      await this.prisma.entrance.update({
        where: { entranceId: Number(entranceId) },
        data: entranceData,
      });
    }

    if (geom) {
      const geomWKT = geoJsonPointToWKT(geom);
      await this.prisma.$executeRaw`
        UPDATE entrance
        SET geom = ST_GeomFromText(${geomWKT}, 4326)
        WHERE entrance_id = ${Number(entranceId)}
      `;
    }

    return this.findOne(Number(entranceId));
  }

  async remove(entranceId: number) {
    const existingEntrance = await this.prisma.entrance.findUnique({
      where: { entranceId: Number(entranceId) },
    });

    if (!existingEntrance) {
      throw new NotFoundException(`Entrance with ID ${entranceId} not found`);
    }

    await this.prisma.entrance.delete({
      where: { entranceId: Number(entranceId) },
    });

    return {
      message: 'Delete entrance successfully',
    };
  }
}
