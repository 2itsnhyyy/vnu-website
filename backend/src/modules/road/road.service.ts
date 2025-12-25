import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoadDto } from './dto/create-road.dto';
import { UpdateRoadDto } from './dto/update-road.dto';
import { QueryRoadDto } from './dto/query-road.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class RoadService {
  constructor(private prisma: PrismaService) {}

  async create(createRoadDto: CreateRoadDto) {
    const road = await this.prisma.road.create({
      data: {
        name: createRoadDto.name,
      },
    });

    return {
      message: 'Create road successfully',
      road,
    };
  }

  async findAll(query: QueryRoadDto) {
    const page = Number(query.page);
    const limit = Number(query.limit);
    const { search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.RoadWhereInput = search
      ? {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        }
      : {};

    const [roads, total] = await Promise.all([
      this.prisma.road.findMany({
        where,
        skip,
        take: limit,
        orderBy: { roadId: 'desc' },
      }),
      this.prisma.road.count({ where }),
    ]);

    return {
      roads,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(roadId: number) {
    const road = await this.prisma.road.findUnique({
      where: { roadId: Number(roadId) },
      include: {
        segments: {
          include: {
            startNodeRef: true,
            endNodeRef: true,
          },
        },
      },
    });

    if (!road) {
      throw new NotFoundException(`Road with ID ${roadId} not found`);
    }

    const segmentsWithGeometry = await Promise.all(
      road.segments.map(async (segment) => {
        const geomResult = await this.prisma.$queryRaw<Array<{ geojson: any }>>`
          SELECT ST_AsGeoJSON(geom)::json as geojson
          FROM routing_segment
          WHERE segment_id = ${segment.segmentId}
        `;

        return {
          ...segment,
          geom: geomResult[0]?.geojson || null,
        };
      }),
    );

    return {
      road: {
        ...road,
        segments: segmentsWithGeometry,
      },
    };
  }

  async update(roadId: number, updateRoadDto: UpdateRoadDto) {
    const existingRoad = await this.prisma.road.findUnique({
      where: { roadId: Number(roadId) },
    });

    if (!existingRoad) {
      throw new NotFoundException(`Road with ID ${roadId} not found`);
    }

    const road = await this.prisma.road.update({
      where: { roadId: Number(roadId) },
      data: updateRoadDto,
    });

    return {
      message: 'Update road successfully',
      road,
    };
  }

  async remove(roadId: number) {
    const existingRoad = await this.prisma.road.findUnique({
      where: { roadId: Number(roadId) },
    });

    if (!existingRoad) {
      throw new NotFoundException(`Road with ID ${roadId} not found`);
    }

    await this.prisma.road.delete({
      where: { roadId: Number(roadId) },
    });

    return {
      message: 'Delete road successfully',
    };
  }
}
