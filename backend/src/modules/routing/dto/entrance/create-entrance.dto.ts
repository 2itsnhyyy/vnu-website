import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsObject,
  IsOptional,
} from 'class-validator';

export class CreateEntranceDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Name of the entrance',
    example: 'Cổng chính',
  })
  name: string;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({
    description:
      'Nearest junction ID (optional, will be auto-detected if not provided)',
    example: 1,
  })
  nearestJunction?: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'Place ID',
    example: 1,
  })
  placeId: number;

  @IsNotEmpty()
  @IsObject()
  @ApiProperty({
    description:
      'Entrance location in GeoJSON Point format (SRID 4326 - WGS84)',
    example: {
      type: 'Point',
      coordinates: [106.80394, 10.87524],
    },
  })
  geom: {
    type: 'Point';
    coordinates: [number, number];
  };
}
