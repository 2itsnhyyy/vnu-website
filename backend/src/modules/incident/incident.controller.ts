import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { IncidentService } from './incident.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { IncidentResponseDto } from './dto/incident-response.dto';
import { SearchIncidentParamsDto } from './dto/search-incident-params.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/common/constants/role.constant';

@ApiTags('Incident')
@Controller('incident')
export class IncidentController {
  constructor(private readonly incidentService: IncidentService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('jwt')
  @ApiOperation({
    summary: 'Create a new incident',
    description: 'Only admin can create incident',
  })
  @ApiExtraModels(IncidentResponseDto)
  @ApiCreatedResponse({
    description: 'Incident created successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Incident created successfully' },
        incident: { $ref: getSchemaPath(IncidentResponseDto) },
      },
    },
  })
  async createIncident(@Body() createIncidentDto: CreateIncidentDto) {
    return this.incidentService.createIncident(createIncidentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all incidents with pagination and search' })
  @ApiOkResponse({
    description: 'Incidents fetched successfully',
    example: {
      pagination: {
        totalItems: 50,
        totalPages: 5,
        currentPage: 1,
        hasNextPage: true,
        hasPreviousPage: false,
        limit: 10,
      },
      incidents: [],
    },
  })
  async getAllIncidents(
    @Query() searchIncidentParamsDto: SearchIncidentParamsDto,
  ) {
    return this.incidentService.getAllIncidents(searchIncidentParamsDto);
  }

  @Get(':incidentId')
  @ApiOperation({ summary: 'Get an incident by id' })
  @ApiExtraModels(IncidentResponseDto)
  @ApiOkResponse({
    description: 'Incident fetched successfully',
    schema: {
      type: 'object',
      properties: {
        incident: { $ref: getSchemaPath(IncidentResponseDto) },
      },
    },
  })
  async getIncidentById(@Param('incidentId') incidentId: number) {
    return this.incidentService.getIncidentById(incidentId);
  }

  @Patch(':incidentId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('jwt')
  @ApiOperation({
    summary: 'Update an incident by id',
    description: 'Only admin can update incident',
  })
  @ApiExtraModels(IncidentResponseDto)
  @ApiOkResponse({
    description: 'Incident updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Incident updated successfully' },
        incident: { $ref: getSchemaPath(IncidentResponseDto) },
      },
    },
  })
  async updateIncident(
    @Param('incidentId') incidentId: number,
    @Body() updateIncidentDto: UpdateIncidentDto,
  ) {
    return this.incidentService.updateIncident(incidentId, updateIncidentDto);
  }

  @Delete(':incidentId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('jwt')
  @ApiOperation({
    summary: 'Delete an incident by id',
    description: 'Only admin can delete incident',
  })
  @ApiExtraModels(IncidentResponseDto)
  @ApiOkResponse({
    description: 'Incident deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Incident deleted successfully' },
        incident: { $ref: getSchemaPath(IncidentResponseDto) },
      },
    },
  })
  async deleteIncident(@Param('incidentId') incidentId: number) {
    return this.incidentService.deleteIncident(incidentId);
  }
}
