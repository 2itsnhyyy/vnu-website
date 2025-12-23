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
import { BuildingService } from './building.service';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';
import { BuildingResponseDto } from './dto/building-response.dto';
import { SearchBuildingParamsDto } from './dto/search-building-params.dto';
import { BuildingMapQueryDto } from './dto/building-map-query.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/common/constants/role.constant';

@ApiTags('Building')
@Controller('building')
export class BuildingController {
  constructor(private readonly buildingService: BuildingService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('jwt')
  @ApiOperation({
    summary: 'Create a new building',
    description: 'Only admin can create building',
  })
  @ApiExtraModels(BuildingResponseDto)
  @ApiCreatedResponse({
    description: 'Building created successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Building created successfully' },
        building: { $ref: getSchemaPath(BuildingResponseDto) },
      },
    },
  })
  async createBuilding(@Body() createBuildingDto: CreateBuildingDto) {
    return this.buildingService.createBuilding(createBuildingDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all buildings with pagination and filters',
    description: 'Get buildings list for management with basic information',
  })
  @ApiOkResponse({
    description: 'Buildings fetched successfully',
    example: {
      pagination: {
        totalItems: 50,
        totalPages: 5,
        currentPage: 1,
        hasNextPage: true,
        hasPreviousPage: false,
        limit: 10,
      },
      buildings: [],
    },
  })
  async getAllBuildings(
    @Query() searchBuildingParamsDto: SearchBuildingParamsDto,
  ) {
    return this.buildingService.getAllBuildings(searchBuildingParamsDto);
  }

  @Get('map')
  @ApiOperation({
    summary: 'Get buildings with 3D objects for map rendering',
    description:
      'Get buildings in a ring area (minRadius to maxRadius from center) with their 3D objects (meshes and bodies) for rendering on map. Start with minRadius=0 for initial load, then use previous maxRadius as new minRadius when zooming out.',
  })
  @ApiOkResponse({
    description: 'Buildings with 3D objects for map fetched successfully',
    example: {
      buildings: [
        {
          buildingId: 1,
          name: 'Tòa nhà E3',
          description: 'Tòa nhà giảng đường',
          floors: 5,
          image: 'https://...',
          placeId: 1,
          placeName: 'Khu A',
          placeGeometry: {
            type: 'Polygon',
            coordinates: [[[105.8342, 21.0285]]],
          },
          distance: 150.5,
          objects3d: [
            {
              objectId: 1,
              objectType: 0,
              meshes: [
                {
                  meshId: 1,
                  meshUrl: 'https://example.com/models/e3.glb',
                  rotate: 0,
                  scale: 1.0,
                  pointGeometry: {
                    type: 'Point',
                    coordinates: [105.8342, 21.0285, 0],
                  },
                },
              ],
              bodies: [],
            },
          ],
        },
      ],
      count: 15,
    },
  })
  async getBuildingsForMap(@Query() query: BuildingMapQueryDto) {
    return this.buildingService.getBuildingsForMap(query);
  }

  @Get(':buildingId')
  @ApiOperation({
    summary: 'Get building detail with 3D objects',
    description:
      'Get full building information including all 3D objects and their GeoJSON geometries (no IDs, only geometry data)',
  })
  @ApiOkResponse({
    description: 'Building detail fetched successfully',
    example: {
      building: {
        buildingId: 1,
        name: 'Tòa nhà E3',
        description: 'Tòa nhà giảng đường',
        floors: 5,
        image: 'https://example.com/building.jpg',
        placeId: 1,
        placeName: 'Khu A',
        objects3d: [
          {
            objectId: 1,
            objectType: 0,
            meshes: [
              {
                meshId: 1,
                meshUrl: 'https://example.com/model.glb',
                pointGeometry: {
                  type: 'Point',
                  coordinates: [105.84415, 21.00561, 5.0],
                },
                rotate: [0, 0, 0],
                scale: [1, 1, 1],
              },
            ],
            bodies: [],
          },
          {
            objectId: 2,
            objectType: 1,
            meshes: [],
            bodies: [
              {
                bodyId: 1,
                frustums: [],
                prisms: [
                  {
                    prismId: 1,
                    baseFaceGeometry: {
                      type: 'Polygon',
                      coordinates: [
                        [
                          [105.84415, 21.00561, 0],
                          [105.84425, 21.00561, 0],
                          [105.84425, 21.00571, 0],
                          [105.84415, 21.00571, 0],
                          [105.84415, 21.00561, 0],
                        ],
                      ],
                    },
                    height: 10.5,
                  },
                ],
                pyramids: [],
                cones: [],
                cylinders: [],
              },
            ],
          },
        ],
      },
    },
  })
  async getBuildingById(@Param('buildingId') buildingId: number) {
    return this.buildingService.getBuildingById(buildingId);
  }

  @Patch(':buildingId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('jwt')
  @ApiOperation({
    summary: 'Update a building by id',
    description: 'Only admin can update building',
  })
  @ApiExtraModels(BuildingResponseDto)
  @ApiOkResponse({
    description: 'Building updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Building updated successfully' },
        building: { $ref: getSchemaPath(BuildingResponseDto) },
      },
    },
  })
  async updateBuilding(
    @Param('buildingId') buildingId: number,
    @Body() updateBuildingDto: UpdateBuildingDto,
  ) {
    return this.buildingService.updateBuilding(buildingId, updateBuildingDto);
  }

  @Delete(':buildingId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('jwt')
  @ApiOperation({
    summary: 'Delete a building by id',
    description:
      'Only admin can delete building. All associated 3D objects (Object3D, MeshObject, Body, and geometric shapes) will be automatically deleted in cascade.',
  })
  @ApiExtraModels(BuildingResponseDto)
  @ApiOkResponse({
    description: 'Building deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Building deleted successfully' },
        building: { $ref: getSchemaPath(BuildingResponseDto) },
      },
    },
  })
  async deleteBuilding(@Param('buildingId') buildingId: number) {
    return this.buildingService.deleteBuilding(buildingId);
  }
}
