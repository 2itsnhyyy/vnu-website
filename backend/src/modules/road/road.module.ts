import { Module } from '@nestjs/common';
import { RoadService } from './road.service';
import { RoadController } from './road.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [RoadService],
  controllers: [RoadController],
})
export class RoadModule {}
