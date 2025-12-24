import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsObject } from 'class-validator';

export class CreateSegmentDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'Start junction ID',
    example: 1,
  })
  startNode: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'End junction ID',
    example: 2,
  })
  endNode: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'Cost of traversing this segment',
    example: 10.5,
  })
  cost: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'Cost of traversing this segment in reverse direction',
    example: 10.5,
  })
  reverseCost: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'Road ID',
    example: 1,
  })
  roadId: number;

  @IsNotEmpty()
  @IsObject()
  @ApiProperty({
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
  geom: {
    type: 'LineString';
    coordinates: [number, number][];
  };
}
