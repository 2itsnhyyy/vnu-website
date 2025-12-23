import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class UpdateBuildingDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'The name of the building',
    example: 'Tòa B',
  })
  name?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'The description of the building',
    example: 'Tòa nhà giảng đường chính',
  })
  description?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Number of floors',
    example: 6,
  })
  floors?: number;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Image URL of the building',
    example: 'https://example.com/building-updated.jpg',
  })
  image?: string;

  @IsInt()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'The id of the place where the building is located',
    example: 1,
  })
  placeId?: number;
}
