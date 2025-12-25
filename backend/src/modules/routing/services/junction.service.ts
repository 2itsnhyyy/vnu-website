import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateJunctionDto } from '../dto/junction/create-junction.dto';
import { UpdateJunctionDto } from '../dto/junction/update-junction.dto';
import { geoJsonPointToWKT } from 'src/common/utils/geometry.utils';

@Injectable()
export class JunctionService {
  constructor(private prisma: PrismaService) {}

  async create(createJunctionDto: CreateJunctionDto) {
    const { geom } = createJunctionDto;
    const geomWKT = geoJsonPointToWKT(geom);

    await this.prisma.$executeRaw`
      INSERT INTO routing_junction (geom)
      VALUES (ST_GeomFromText(${geomWKT}, 4326))
    `;

    const junction = await this.prisma.routingJunction.findFirst({
      orderBy: { junctionId: 'desc' },
    });

    if (!junction) {
      throw new Error('Failed to create junction');
    }

    const geomResult = await this.prisma.$queryRaw<Array<{ geojson: any }>>`
      SELECT ST_AsGeoJSON(geom)::json as geojson
      FROM routing_junction
      WHERE junction_id = ${junction.junctionId}
    `;

    return {
      message: 'Create junction successfully',
      junction: {
        ...junction,
        geom: geomResult[0]?.geojson || null,
      },
    };
  }

  async update(junctionId: number, updateJunctionDto: UpdateJunctionDto) {
    const existingJunction = await this.prisma.routingJunction.findUnique({
      where: { junctionId: Number(junctionId) },
    });

    if (!existingJunction) {
      throw new NotFoundException(`Junction with ID ${junctionId} not found`);
    }

    const { geom } = updateJunctionDto;

    if (geom) {
      const geomWKT = geoJsonPointToWKT(geom);
      await this.prisma.$executeRaw`
        UPDATE routing_junction
        SET geom = ST_GeomFromText(${geomWKT}, 4326)
        WHERE junction_id = ${Number(junctionId)}
      `;
    }

    const updatedJunction = await this.prisma.routingJunction.findUnique({
      where: { junctionId: Number(junctionId) },
    });

    const geomResult = await this.prisma.$queryRaw<Array<{ geojson: any }>>`
      SELECT ST_AsGeoJSON(geom)::json as geojson
      FROM routing_junction
      WHERE junction_id = ${Number(junctionId)}
    `;

    return {
      message: 'Update junction successfully',
      junction: {
        ...updatedJunction,
        geom: geomResult[0]?.geojson || null,
      },
    };
  }

  async remove(junctionId: number) {
    const existingJunction = await this.prisma.routingJunction.findUnique({
      where: { junctionId: Number(junctionId) },
    });

    if (!existingJunction) {
      throw new NotFoundException(`Junction with ID ${junctionId} not found`);
    }

    await this.prisma.routingJunction.delete({
      where: { junctionId: Number(junctionId) },
    });

    return {
      message: 'Delete junction successfully',
    };
  }
}
