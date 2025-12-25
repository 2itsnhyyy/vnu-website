import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject } from 'class-validator';

export class CreateJunctionDto {
  @IsNotEmpty()
  @IsObject()
  @ApiProperty({
    description:
      'Junction location in GeoJSON Point format (SRID 4326 - WGS84)',
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
