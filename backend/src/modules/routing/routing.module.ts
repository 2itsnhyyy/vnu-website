import { Module } from '@nestjs/common';
import { RoutingController } from './routing.controller';
import { JunctionService } from './services/junction.service';
import { SegmentService } from './services/segment.service';
import { EntranceService } from './services/entrance.service';
import { PathfindingService } from './services/pathfinding.service';
import { DijkstraService } from './services/dijkstra.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RoutingController],
  providers: [
    JunctionService,
    SegmentService,
    EntranceService,
    PathfindingService,
    DijkstraService,
  ],
  exports: [
    JunctionService,
    SegmentService,
    EntranceService,
    PathfindingService,
    DijkstraService,
  ],
})
export class RoutingModule {}
