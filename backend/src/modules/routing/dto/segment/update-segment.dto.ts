import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsObject } from 'class-validator';

export class UpdateSegmentDto {
  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({
    description: 'Start junction ID',
    example: 1,
  })
  startNode?: number;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({
    description: 'End junction ID',
    example: 2,
  })
  endNode?: number;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({
    description: 'Cost of traversing this segment',
    example: 10.5,
  })
  cost?: number;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({
    description: 'Cost of traversing this segment in reverse direction',
    example: 10.5,
  })
  reverseCost?: number;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({
    description: 'Road ID',
    example: 1,
  })
  roadId?: number;

  @IsOptional()
  @IsObject()
  @ApiPropertyOptional({
    description:
      'Segment geometry in GeoJSON LineString format (SRID 4326 - WGS84)',
    example: {
      type: 'LineString',
      coordinates: [
        [106.80394, 10.87524],
        [106.80495, 10.87625],
      ],
    },
  })
  geom?: {
    type: 'LineString';
    coordinates: [number, number][];
  };
}
