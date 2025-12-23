import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject } from 'class-validator';

export class UpdatePlaceDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Place name',
    example: 'Trường Đại học công nghệ thông tin',
  })
  name?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Description of the place',
  })
  description?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Address of the place',
  })
  address?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Image URL of the place',
  })
  image?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Opening time of the place',
  })
  openTime?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Closing time of the place',
  })
  closeTime?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Contact phone number of the place',
  })
  phone?: string;

  @IsOptional()
  @IsObject()
  @ApiPropertyOptional({
    description:
      'Boundary of the place in GeoJSON Polygon format (SRID 4326 - WGS84)',
    example: {
      type: 'Polygon',
      coordinates: [
        [
          [106.68203, 10.76298],
          [106.68303, 10.76298],
          [106.68303, 10.76398],
          [106.68203, 10.76398],
          [106.68203, 10.76298],
        ],
      ],
    },
  })
  boundaryGeom?: {
    type: 'Polygon';
    coordinates: number[][][];
  };
}
