import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString, IsObject } from 'class-validator';

export class UpdateEntranceDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Name of the entrance',
    example: 'Cổng chính',
  })
  name?: string;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({
    description:
      'Nearest junction ID (will be auto-detected if geom is updated)',
    example: 1,
  })
  nearestJunction?: number;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({
    description: 'Place ID',
    example: 1,
  })
  placeId?: number;

  @IsOptional()
  @IsObject()
  @ApiPropertyOptional({
    description:
      'Entrance location in GeoJSON Point format (SRID 4326 - WGS84)',
    example: {
      type: 'Point',
      coordinates: [106.80394, 10.87524],
    },
  })
  geom?: {
    type: 'Point';
    coordinates: [number, number];
  };
}
