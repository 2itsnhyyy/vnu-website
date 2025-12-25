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
import { RoadService } from './road.service';
import { CreateRoadDto } from './dto/create-road.dto';
import { UpdateRoadDto } from './dto/update-road.dto';
import { QueryRoadDto } from './dto/query-road.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/common/constants/role.constant';
import { RoleGuard } from 'src/common/guards/role.guard';

@ApiTags('Road')
@Controller('roads')
export class RoadController {
  constructor(private readonly roadService: RoadService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Create new road' })
  create(@Body() createRoadDto: CreateRoadDto) {
    return this.roadService.create(createRoadDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get list of roads',
    description: 'Support pagination and search',
  })
  findAll(@Query() query: QueryRoadDto) {
    return this.roadService.findAll(query);
  }

  @Get(':roadId')
  @ApiOperation({ summary: 'Get detail of road by ID' })
  findOne(@Param('roadId') roadId: number) {
    return this.roadService.findOne(roadId);
  }

  @Patch(':roadId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Update road' })
  update(
    @Param('roadId') roadId: number,
    @Body() updateRoadDto: UpdateRoadDto,
  ) {
    return this.roadService.update(roadId, updateRoadDto);
  }

  @Delete(':roadId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Delete road' })
  remove(@Param('roadId') roadId: number) {
    return this.roadService.remove(roadId);
  }
}
