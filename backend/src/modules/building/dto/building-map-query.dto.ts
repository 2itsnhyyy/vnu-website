import { ApiProperty } from '@nestjs/swagger';
import { IsLatitude, IsLongitude, IsNumber, Max, Min } from 'class-validator';

export class BuildingMapQueryDto {
  @IsNumber()
  @IsLatitude()
  @ApiProperty({
    description: 'Camera latitude position',
    example: 10.8696679,
  })
  lat: number;

  @IsNumber()
  @IsLongitude()
  @ApiProperty({
    description: 'Camera longitude position',
    example: 106.8032823,
  })
  lon: number;

  @IsNumber()
  @Min(0)
  @Max(22)
  @ApiProperty({
    description:
      'Zoom level (0-22). Higher = more detail. 10=City, 15=District, 18=Building, 20=Detail',
    example: 19,
    minimum: 0,
    maximum: 22,
  })
  zoom: number;

  @IsNumber()
  @Min(0)
  @Max(360)
  @ApiProperty({
    description:
      'Camera heading (rotation) in degrees (0-360). 0 = North, 90 = East, 180 = South, 270 = West',
    example: 50.787,
    minimum: 0,
    maximum: 360,
  })
  heading: number;

  @IsNumber()
  @Min(0)
  @Max(90)
  @ApiProperty({
    description:
      'Camera tilt (elevation angle) in degrees (0-90). 0 = top-down view, 45 = tilted, 90 = horizontal view',
    example: 8.078,
    minimum: 0,
    maximum: 90,
  })
  tilt: number;
}
