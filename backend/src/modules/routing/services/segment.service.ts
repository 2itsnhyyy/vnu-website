import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSegmentDto } from '../dto/segment/create-segment.dto';
import { UpdateSegmentDto } from '../dto/segment/update-segment.dto';
import { QuerySegmentDto } from '../dto/segment/query-segment.dto';
import { geoJsonLineStringToWKT } from 'src/common/utils/geometry.utils';
import { Prisma } from '@prisma/client';

@Injectable()
export class SegmentService {
  constructor(private prisma: PrismaService) {}

  async create(createSegmentDto: CreateSegmentDto) {
    const { geom, ...segmentData } = createSegmentDto;
    const geomWKT = geoJsonLineStringToWKT(geom);

    await this.prisma.$executeRaw`
      INSERT INTO routing_segment (start_node, end_node, cost, reverse_cost, road_id, geom)
      VALUES (
        ${segmentData.startNode},
        ${segmentData.endNode},
        ${segmentData.cost},
        ${segmentData.reverseCost},
        ${segmentData.roadId},
        ST_GeomFromText(${geomWKT}, 4326)
      )
    `;

    const segment = await this.prisma.routingSegment.findFirst({
      orderBy: { segmentId: 'desc' },
      include: {
        startNodeRef: true,
        endNodeRef: true,
        road: true,
      },
    });

    if (!segment) {
      throw new Error('Failed to create segment');
    }

    const geomResult = await this.prisma.$queryRaw<Array<{ geojson: any }>>`
      SELECT ST_AsGeoJSON(geom)::json as geojson
      FROM routing_segment
      WHERE segment_id = ${segment.segmentId}
    `;

    return {
      message: 'Create segment successfully',
      segment: {
        ...segment,
        geom: geomResult[0]?.geojson || null,
      },
    };
  }

  async findAll(query: QuerySegmentDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const { roadId, includeGeometry } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.RoutingSegmentWhereInput = roadId
      ? { roadId: Number(roadId) }
      : {};

    const [segments, total] = await Promise.all([
      this.prisma.routingSegment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { segmentId: 'desc' },
        include: {
          startNodeRef: true,
          endNodeRef: true,
          road: true,
        },
      }),
      this.prisma.routingSegment.count({ where }),
    ]);

    let segmentsWithGeometry = segments;
    if (includeGeometry && segments.length > 0) {
      const segmentIds = segments.map((s) => s.segmentId);
      const geometries = await this.prisma.$queryRaw<
        Array<{ segment_id: number; geojson: any }>
      >`
        SELECT segment_id, ST_AsGeoJSON(geom)::json as geojson
        FROM routing_segment
        WHERE segment_id = ANY(${segmentIds})
      `;

      const geomMap = new Map(geometries.map((g) => [g.segment_id, g.geojson]));

      segmentsWithGeometry = segments.map((segment) => ({
        ...segment,
        geom: geomMap.get(segment.segmentId) || null,
      }));
    }

    return {
      data: segmentsWithGeometry,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(segmentId: number) {
    const segment = await this.prisma.routingSegment.findUnique({
      where: { segmentId: Number(segmentId) },
      include: {
        startNodeRef: true,
        endNodeRef: true,
        road: true,
      },
    });

    if (!segment) {
      throw new NotFoundException(`Segment with ID ${segmentId} not found`);
    }

    const geomResult = await this.prisma.$queryRaw<Array<{ geojson: any }>>`
      SELECT ST_AsGeoJSON(geom)::json as geojson
      FROM routing_segment
      WHERE segment_id = ${Number(segmentId)}
    `;

    return {
      segment: {
        ...segment,
        geom: geomResult[0]?.geojson || null,
      },
    };
  }

  async update(segmentId: number, updateSegmentDto: UpdateSegmentDto) {
    const existingSegment = await this.prisma.routingSegment.findUnique({
      where: { segmentId: Number(segmentId) },
    });

    if (!existingSegment) {
      throw new NotFoundException(`Segment with ID ${segmentId} not found`);
    }

    const { geom, ...segmentData } = updateSegmentDto;

    if (Object.keys(segmentData).length > 0) {
      await this.prisma.routingSegment.update({
        where: { segmentId: Number(segmentId) },
        data: segmentData,
      });
    }

    if (geom) {
      const geomWKT = geoJsonLineStringToWKT(geom);
      await this.prisma.$executeRaw`
        UPDATE routing_segment
        SET geom = ST_GeomFromText(${geomWKT}, 4326)
        WHERE segment_id = ${Number(segmentId)}
      `;
    }

    return this.findOne(Number(segmentId));
  }

  async remove(segmentId: number) {
    const existingSegment = await this.prisma.routingSegment.findUnique({
      where: { segmentId: Number(segmentId) },
    });

    if (!existingSegment) {
      throw new NotFoundException(`Segment with ID ${segmentId} not found`);
    }

    await this.prisma.routingSegment.delete({
      where: { segmentId: Number(segmentId) },
    });

    return {
      message: 'Delete segment successfully',
    };
  }
}
