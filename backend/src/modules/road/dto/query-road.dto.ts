import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
} from 'src/common/constants/pagination.constant';

export class QueryRoadDto {
  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
  })
  page: number = DEFAULT_PAGE;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
  })
  limit: number = DEFAULT_LIMIT;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Search by name',
    example: 'Võ Trường Toản',
  })
  search?: string;
}
