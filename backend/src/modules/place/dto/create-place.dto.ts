import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsObject } from 'class-validator';

export class CreatePlaceDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Place name',
    example: 'Trường Đại học công nghệ thông tin',
  })
  name: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Description of the place',
    example: 'Trường đại học chuyên đào tạo về công nghệ thông tin',
  })
  description?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Address of the place',
    example: 'Khu phố 6, Phường Linh Trung, TP. Thủ Đức, TP. Hồ Chí Minh',
  })
  address?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Image URL of the place',
    example: 'https://example.com/university.jpg',
  })
  image?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Opening time of the place',
    example: '07:00',
  })
  openTime?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Closing time of the place',
    example: '22:00',
  })
  closeTime?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Contact phone number of the place',
    example: '02837252002',
  })
  phone?: string;

  @IsNotEmpty()
  @IsObject()
  @ApiProperty({
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
  boundaryGeom: {
    type: 'Polygon';
    coordinates: number[][][];
  };
}
