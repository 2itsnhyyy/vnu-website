import { ApiProperty } from '@nestjs/swagger';
import { IsLatitude, IsLongitude, IsNumber, Min } from 'class-validator';

export class BuildingMapQueryDto {
  @IsNumber()
  @IsLatitude()
  @ApiProperty({
    description: 'Center latitude',
    example: 21.0285,
  })
  centerLat: number;

  @IsNumber()
  @IsLongitude()
  @ApiProperty({
    description: 'Center longitude',
    example: 105.8342,
  })
  centerLng: number;

  @IsNumber()
  @Min(0)
  @ApiProperty({
    description: 'Minimum radius in meters (inner circle, already loaded)',
    example: 0,
  })
  minRadius: number;

  @IsNumber()
  @Min(0)
  @ApiProperty({
    description: 'Maximum radius in meters (outer circle, new area to load)',
    example: 1000,
  })
  maxRadius: number;
}
