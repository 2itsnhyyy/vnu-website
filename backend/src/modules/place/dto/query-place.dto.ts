import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
} from 'src/common/constants/pagination.constant';

export class QueryPlaceDto {
  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({
    description: 'page number',
    example: 1,
  })
  page: number = DEFAULT_PAGE;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({
    description: 'number of items per page',
    example: 10,
  })
  limit: number = DEFAULT_LIMIT;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Search by name',
    example: 'Trường Đại học',
  })
  search?: string;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({
    description: 'Return geometry or not (reduce payload if false)',
    example: false,
  })
  includeGeometry: boolean = false;
}
