import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
} from 'src/common/constants/pagination.constant';

export class SearchBuildingParamsDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({
    description: 'The size of a page',
    example: 10,
  })
  limit: number = DEFAULT_LIMIT;

  @IsOptional()
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({
    description: 'The page number (starts from 1)',
    example: 1,
  })
  page: number = DEFAULT_PAGE;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Search keyword for name or description',
  })
  search?: string;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional({
    description: 'Filter by place id',
  })
  placeId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({
    description: 'Filter by minimum number of floors',
  })
  minFloors?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({
    description: 'Filter by maximum number of floors',
  })
  maxFloors?: number;
}
