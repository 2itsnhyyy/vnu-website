import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreatePointDto {
  @IsNotEmpty()
  @IsString()
  @IsIn(['Point'])
  @ApiProperty({
    description: 'Geometry type',
    example: 'Point',
    enum: ['Point'],
  })
  type: 'Point';

  @IsNotEmpty()
  @IsArray()
  @IsNumber({}, { each: true })
  @ApiProperty({
    description:
      'Point coordinates [longitude, latitude] or [longitude, latitude, elevation]',
    example: [105.8342, 21.0285, 10.5],
    type: [Number],
  })
  coordinates: [number, number] | [number, number, number];
}

export class CreateFaceDto {
  @IsNotEmpty()
  @IsString()
  @IsIn(['Polygon'])
  @ApiProperty({
    description: 'Geometry type',
    example: 'Polygon',
    enum: ['Polygon'],
  })
  type: 'Polygon';

  @IsNotEmpty()
  @IsArray()
  @ApiProperty({
    description: 'Polygon coordinates [[[lng, lat] or [lng, lat, z]]]',
    example: [
      [
        [105.8342, 21.0285, 0],
        [105.8343, 21.0285, 0],
        [105.8343, 21.0286, 0],
        [105.8342, 21.0286, 0],
        [105.8342, 21.0285, 0],
      ],
    ],
    type: 'array',
  })
  coordinates: number[][][];
}

export class CreateNodeDto {
  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({
    description: 'Existing point ID (if not creating new point)',
    example: 1,
  })
  pointId?: number;

  @IsOptional()
  @ValidateNested()
  @ApiPropertyOptional({
    description: 'Create new point inline',
    type: CreatePointDto,
  })
  point?: CreatePointDto;
}
