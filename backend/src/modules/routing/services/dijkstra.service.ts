import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DijkstraService {
  constructor(private prisma: PrismaService) {}

  async findShortestPath(
    startNode: number,
    endNode: number,
  ): Promise<
    Array<{
      seq: number;
      pathSeq: number;
      node: number;
      edge: number;
      cost: number;
      aggCost: number;
    }>
  > {
    const segments = await this.prisma.routingSegment.findMany({
      select: {
        segmentId: true,
        startNode: true,
        endNode: true,
        cost: true,
        reverseCost: true,
      },
    });

    const graph = new Map<
      number,
      Array<{ to: number; cost: number; edgeId: number }>
    >();
    const allNodes = new Set<number>();

    for (const segment of segments) {
      allNodes.add(segment.startNode);
      allNodes.add(segment.endNode);

      if (!graph.has(segment.startNode)) {
        graph.set(segment.startNode, []);
      }
      graph.get(segment.startNode)!.push({
        to: segment.endNode,
        cost: segment.cost,
        edgeId: segment.segmentId,
      });

      if (segment.reverseCost > 0 && segment.reverseCost !== -1) {
        if (!graph.has(segment.endNode)) {
          graph.set(segment.endNode, []);
        }
        graph.get(segment.endNode)!.push({
          to: segment.startNode,
          cost: segment.reverseCost,
          edgeId: segment.segmentId,
        });
      }
    }

    if (!allNodes.has(startNode) || !allNodes.has(endNode)) {
      return [];
    }

    const distances = new Map<number, number>();
    const previous = new Map<number, { node: number; edge: number }>();
    const visited = new Set<number>();
    const queue: Array<{ node: number; cost: number }> = [];

    distances.set(startNode, 0);
    queue.push({ node: startNode, cost: 0 });

    while (queue.length > 0) {
      queue.sort((a, b) => a.cost - b.cost);
      const current = queue.shift()!;

      if (visited.has(current.node)) continue;
      visited.add(current.node);

      if (current.node === endNode) break;

      const neighbors = graph.get(current.node) || [];
      for (const neighbor of neighbors) {
        if (visited.has(neighbor.to)) continue;

        const newCost = current.cost + neighbor.cost;
        const oldCost = distances.get(neighbor.to) ?? Infinity;

        if (newCost < oldCost) {
          distances.set(neighbor.to, newCost);
          previous.set(neighbor.to, {
            node: current.node,
            edge: neighbor.edgeId,
          });
          queue.push({ node: neighbor.to, cost: newCost });
        }
      }
    }

    if (!distances.has(endNode)) {
      return [];
    }

    const path: Array<{
      seq: number;
      pathSeq: number;
      node: number;
      edge: number;
      cost: number;
      aggCost: number;
    }> = [];

    let currentNode: number | undefined = endNode;
    let pathSeq = 1;
    const reversePath: Array<{ node: number; edge: number }> = [];

    while (currentNode !== undefined && currentNode !== startNode) {
      const prev = previous.get(currentNode);
      if (!prev) break;

      reversePath.push({ node: currentNode, edge: prev.edge });
      currentNode = prev.node;
    }

    reversePath.push({ node: startNode, edge: -1 });
    reversePath.reverse();

    let aggCost = 0;
    for (let i = 0; i < reversePath.length; i++) {
      const item = reversePath[i];
      const nextNode = reversePath[i + 1]?.node;

      let edgeCost = 0;
      if (nextNode !== undefined) {
        const nextDist = distances.get(nextNode) ?? 0;
        const currDist = distances.get(item.node) ?? 0;
        edgeCost = nextDist - currDist;
      }

      path.push({
        seq: i + 1,
        pathSeq: pathSeq++,
        node: item.node,
        edge: item.edge,
        cost: edgeCost,
        aggCost: aggCost,
      });

      aggCost += edgeCost;
    }

    return path;
  }
}
