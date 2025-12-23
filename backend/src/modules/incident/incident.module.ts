import { Module } from '@nestjs/common';
import { IncidentService } from './incident.service';
import { IncidentController } from './incident.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [IncidentService],
  controllers: [IncidentController],
})
export class IncidentModule {}
