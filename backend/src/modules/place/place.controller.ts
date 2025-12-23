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
import { PlaceService } from './place.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { QueryPlaceDto } from './dto/query-place.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/common/constants/role.constant';
import { RoleGuard } from 'src/common/guards/role.guard';

@ApiTags('Place')
@Controller('places')
export class PlaceController {
  constructor(private readonly placeService: PlaceService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Create a new place' })
  create(@Body() createPlaceDto: CreatePlaceDto) {
    return this.placeService.create(createPlaceDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get list of places',
    description: 'Support pagination, search and optional include geometry',
  })
  findAll(@Query() query: QueryPlaceDto) {
    return this.placeService.findAll(query);
  }

  @Get(':placeId')
  @ApiOperation({ summary: 'Get detail of place by ID' })
  findOne(@Param('placeId') placeId: number) {
    return this.placeService.findOne(placeId);
  }

  @Patch(':placeId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Update place' })
  update(
    @Param('placeId') placeId: number,
    @Body() updatePlaceDto: UpdatePlaceDto,
  ) {
    return this.placeService.update(placeId, updatePlaceDto);
  }

  @Delete(':placeId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Delete place' })
  remove(@Param('placeId') placeId: number) {
    return this.placeService.remove(placeId);
  }
}
