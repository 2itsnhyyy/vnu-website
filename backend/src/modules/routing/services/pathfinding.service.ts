import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FindPathDto } from '../dto/find-path.dto';
import { DijkstraService } from './dijkstra.service';

@Injectable()
export class PathfindingService {
  constructor(
    private prisma: PrismaService,
    private dijkstraService: DijkstraService,
  ) {}

  private async findBestJunctionForEntrance(
    entranceId: number,
  ): Promise<number | null> {
    try {
      const entranceCoords = await this.prisma.$queryRaw<
        Array<{ lat: number; lon: number }>
      >`
        SELECT ST_Y(geom) as lat, ST_X(geom) as lon
        FROM entrance
        WHERE entrance_id = ${entranceId}
      `;

      if (entranceCoords.length === 0) {
        return null;
      }

      const { lat: eLat, lon: eLon } = entranceCoords[0];

      const nearestSegments = await this.prisma.$queryRaw<
        Array<{
          segment_id: number;
          start_node: number;
          end_node: number;
          distance: number;
        }>
      >`
        SELECT 
          segment_id,
          start_node,
          end_node,
          ST_Distance(
            geom::geography,
            ST_SetSRID(ST_MakePoint(${eLon}, ${eLat}), 4326)::geography
          ) as distance
        FROM routing_segment
        ORDER BY distance
        LIMIT 1
      `;

      if (nearestSegments.length === 0) {
        return null;
      }

      const nearestSegment = nearestSegments[0];

      const nodeCoords = await this.prisma.$queryRaw<
        Array<{ junction_id: number; lat: number; lon: number }>
      >`
        SELECT 
          junction_id,
          ST_Y(geom) as lat,
          ST_X(geom) as lon
        FROM routing_junction
        WHERE junction_id IN (${nearestSegment.start_node}, ${nearestSegment.end_node})
      `;

      if (nodeCoords.length === 0) {
        return null;
      }

      let bestJunction = nodeCoords[0].junction_id;
      let minDistance = Math.sqrt(
        Math.pow(nodeCoords[0].lat - eLat, 2) +
          Math.pow(nodeCoords[0].lon - eLon, 2),
      );

      for (let i = 1; i < nodeCoords.length; i++) {
        const dist = Math.sqrt(
          Math.pow(nodeCoords[i].lat - eLat, 2) +
            Math.pow(nodeCoords[i].lon - eLon, 2),
        );
        if (dist < minDistance) {
          minDistance = dist;
          bestJunction = nodeCoords[i].junction_id;
        }
      }

      return bestJunction;
    } catch (error) {
      return null;
    }
  }

  private async calculatePathCost(
    startJunctionId: number,
    endJunctionId: number,
  ): Promise<number | null> {
    if (startJunctionId === endJunctionId) {
      return 0;
    }

    try {
      const pathResult = await this.dijkstraService.findShortestPath(
        startJunctionId,
        endJunctionId,
      );

      if (!pathResult || pathResult.length === 0) {
        return null;
      }

      return pathResult[pathResult.length - 1].aggCost;
    } catch (error) {
      return null;
    }
  }

  async findPath(findPathDto: FindPathDto) {
    const { fromPlaceId, toPlaceId, includeGeometry } = findPathDto;

    const [fromPlace, toPlace] = await Promise.all([
      this.prisma.place.findUnique({ where: { placeId: Number(fromPlaceId) } }),
      this.prisma.place.findUnique({ where: { placeId: Number(toPlaceId) } }),
    ]);

    if (!fromPlace) {
      throw new NotFoundException(`Place with ID ${fromPlaceId} not found`);
    }

    if (!toPlace) {
      throw new NotFoundException(`Place with ID ${toPlaceId} not found`);
    }

    const [fromEntrances, toEntrances] = await Promise.all([
      this.prisma.entrance.findMany({
        where: { placeId: Number(fromPlaceId) },
        include: { nearestJunctionRef: true },
      }),
      this.prisma.entrance.findMany({
        where: { placeId: Number(toPlaceId) },
        include: { nearestJunctionRef: true },
      }),
    ]);

    if (fromEntrances.length === 0) {
      throw new BadRequestException(
        `No entrance found for place ${fromPlace.name}`,
      );
    }

    if (toEntrances.length === 0) {
      throw new BadRequestException(
        `No entrance found for place ${toPlace.name}`,
      );
    }

    let bestFromEntrance = fromEntrances[0];
    let bestToEntrance = toEntrances[0];
    let bestCost = Infinity;
    let bestFromJunction: number | null = null;
    let bestToJunction: number | null = null;

    for (const fromEntrance of fromEntrances) {
      const fromJunction = await this.findBestJunctionForEntrance(
        fromEntrance.entranceId,
      );
      if (!fromJunction) continue;

      for (const toEntrance of toEntrances) {
        const toJunction = await this.findBestJunctionForEntrance(
          toEntrance.entranceId,
        );
        if (!toJunction) continue;

        const cost = await this.calculatePathCost(fromJunction, toJunction);

        if (cost !== null && cost < bestCost) {
          bestCost = cost;
          bestFromEntrance = fromEntrance;
          bestToEntrance = toEntrance;
          bestFromJunction = fromJunction;
          bestToJunction = toJunction;
        }
      }
    }

    if (bestCost === Infinity || !bestFromJunction || !bestToJunction) {
      throw new NotFoundException(
        `No path found between ${fromPlace.name} and ${toPlace.name}`,
      );
    }

    const startJunctionId = bestFromJunction;
    const endJunctionId = bestToJunction;

    const [startJunctionData, endJunctionData] = await Promise.all([
      this.prisma.routingJunction.findUnique({
        where: { junctionId: startJunctionId },
      }),
      this.prisma.routingJunction.findUnique({
        where: { junctionId: endJunctionId },
      }),
    ]);

    if (startJunctionId === endJunctionId) {
      return {
        message: 'Origin and destination are at the same location',
        path: {
          startPlace: fromPlace,
          endPlace: toPlace,
          startEntrance: bestFromEntrance,
          endEntrance: bestToEntrance,
          startJunction: startJunctionData,
          endJunction: endJunctionData,
          segments: [],
          totalCost: 0,
          segmentCount: 0,
          pathGeometry: null,
        },
      };
    }

    const pathResult = await this.dijkstraService.findShortestPath(
      startJunctionId,
      endJunctionId,
    );

    const pathResultFormatted = pathResult.map((row) => ({
      seq: row.seq,
      path_seq: row.pathSeq,
      node: row.node,
      edge: row.edge,
      cost: row.cost,
      agg_cost: row.aggCost,
    }));

    if (!pathResultFormatted || pathResultFormatted.length === 0) {
      throw new NotFoundException(
        `No path found between ${fromPlace.name} and ${toPlace.name}`,
      );
    }

    const segmentIds = pathResultFormatted
      .filter((row) => row.edge !== -1)
      .map((row) => row.edge);

    const segments = await this.prisma.routingSegment.findMany({
      where: { segmentId: { in: segmentIds } },
      include: {
        startNodeRef: true,
        endNodeRef: true,
        road: true,
      },
    });

    const sortedSegments = segmentIds
      .map((id) => segments.find((s) => s.segmentId === id))
      .filter((s) => s !== undefined);

    let pathGeometry: { type: string; coordinates: any[] } | null = null;
    if (includeGeometry) {
      const geometries = await Promise.all(
        sortedSegments.map(async (segment) => {
          const geomResult = await this.prisma.$queryRaw<
            Array<{ geojson: any }>
          >`
            SELECT ST_AsGeoJSON(geom)::json as geojson
            FROM routing_segment
            WHERE segment_id = ${segment.segmentId}
          `;
          return geomResult[0]?.geojson;
        }),
      );

      pathGeometry = {
        type: 'MultiLineString',
        coordinates: geometries.map((geom) => geom?.coordinates || []),
      };
    }

    const totalCost =
      pathResultFormatted.length > 0
        ? pathResultFormatted[pathResultFormatted.length - 1].agg_cost
        : 0;

    return {
      message: 'Path found successfully',
      path: {
        startPlace: fromPlace,
        endPlace: toPlace,
        startEntrance: bestFromEntrance,
        endEntrance: bestToEntrance,
        startJunction: startJunctionData,
        endJunction: endJunctionData,
        segments:
          includeGeometry && pathGeometry
            ? sortedSegments.map((segment, index) => ({
                ...segment,
                geom: pathGeometry.coordinates[index]
                  ? {
                      type: 'LineString',
                      coordinates: pathGeometry.coordinates[index],
                    }
                  : null,
              }))
            : sortedSegments,
        totalCost,
        segmentCount: segmentIds.length,
        pathGeometry: includeGeometry ? pathGeometry : null,
      },
    };
  }
}
