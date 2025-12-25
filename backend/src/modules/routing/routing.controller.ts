import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JunctionService } from './services/junction.service';
import { SegmentService } from './services/segment.service';
import { EntranceService } from './services/entrance.service';
import { PathfindingService } from './services/pathfinding.service';
import { CreateJunctionDto } from './dto/junction/create-junction.dto';
import { UpdateJunctionDto } from './dto/junction/update-junction.dto';
import { CreateSegmentDto } from './dto/segment/create-segment.dto';
import { UpdateSegmentDto } from './dto/segment/update-segment.dto';
import { QuerySegmentDto } from './dto/segment/query-segment.dto';
import { CreateEntranceDto } from './dto/entrance/create-entrance.dto';
import { UpdateEntranceDto } from './dto/entrance/update-entrance.dto';
import { QueryEntranceDto } from './dto/entrance/query-entrance.dto';
import { FindPathDto } from './dto/find-path.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/common/constants/role.constant';
import { RoleGuard } from 'src/common/guards/role.guard';

@ApiTags('Routing')
@Controller('routing')
export class RoutingController {
  constructor(
    private readonly junctionService: JunctionService,
    private readonly segmentService: SegmentService,
    private readonly entranceService: EntranceService,
    private readonly pathfindingService: PathfindingService,
  ) {}

  @Get('find-path')
  @ApiOperation({
    summary: 'Find shortest path between two places',
    description: 'Uses pgRouting Dijkstra algorithm to find the optimal route',
  })
  findPath(@Query() findPathDto: FindPathDto) {
    return this.pathfindingService.findPath(findPathDto);
  }

  @Post('junctions')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Create new routing junction' })
  createJunction(@Body() createJunctionDto: CreateJunctionDto) {
    return this.junctionService.create(createJunctionDto);
  }

  @Patch('junctions/:junctionId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Update routing junction' })
  updateJunction(
    @Param('junctionId') junctionId: number,
    @Body() updateJunctionDto: UpdateJunctionDto,
  ) {
    return this.junctionService.update(junctionId, updateJunctionDto);
  }

  @Delete('junctions/:junctionId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Delete routing junction' })
  removeJunction(@Param('junctionId') junctionId: number) {
    return this.junctionService.remove(junctionId);
  }

  @Post('segments')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Create new routing segment' })
  createSegment(@Body() createSegmentDto: CreateSegmentDto) {
    return this.segmentService.create(createSegmentDto);
  }

  @Get('segments')
  @ApiOperation({
    summary: 'Get list of routing segments',
    description: 'Support pagination, filter by road and optional geometry',
  })
  findAllSegments(@Query() query: QuerySegmentDto) {
    return this.segmentService.findAll(query);
  }

  @Get('segments/:segmentId')
  @ApiOperation({ summary: 'Get detail of routing segment by ID' })
  findOneSegment(@Param('segmentId') segmentId: number) {
    return this.segmentService.findOne(segmentId);
  }

  @Patch('segments/:segmentId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Update routing segment' })
  updateSegment(
    @Param('segmentId') segmentId: number,
    @Body() updateSegmentDto: UpdateSegmentDto,
  ) {
    return this.segmentService.update(segmentId, updateSegmentDto);
  }

  @Delete('segments/:segmentId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Delete routing segment' })
  removeSegment(@Param('segmentId') segmentId: number) {
    return this.segmentService.remove(segmentId);
  }

  @Post('entrances')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Create new entrance' })
  createEntrance(@Body() createEntranceDto: CreateEntranceDto) {
    return this.entranceService.create(createEntranceDto);
  }

  @Get('entrances')
  @ApiOperation({
    summary: 'Get list of entrances',
    description:
      'Support pagination, search, filter by place and optional geometry',
  })
  findAllEntrances(@Query() query: QueryEntranceDto) {
    return this.entranceService.findAll(query);
  }

  @Get('entrances/:entranceId')
  @ApiOperation({ summary: 'Get detail of entrance by ID' })
  findOneEntrance(@Param('entranceId') entranceId: number) {
    return this.entranceService.findOne(entranceId);
  }

  @Patch('entrances/:entranceId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Update entrance' })
  updateEntrance(
    @Param('entranceId') entranceId: number,
    @Body() updateEntranceDto: UpdateEntranceDto,
  ) {
    return this.entranceService.update(entranceId, updateEntranceDto);
  }

  @Delete('entrances/:entranceId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Delete entrance' })
  removeEntrance(@Param('entranceId') entranceId: number) {
    return this.entranceService.remove(entranceId);
  }
}
