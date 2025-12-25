import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString, IsBoolean } from 'class-validator';
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
} from 'src/common/constants/pagination.constant';

export class QueryEntranceDto {
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
  @IsNumber()
  @ApiPropertyOptional({
    description: 'Filter by place ID',
    example: 1,
  })
  placeId?: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Search by entrance name',
    example: 'Cổng chính',
  })
  search?: string;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({
    description: 'Include geometry in response',
    example: false,
  })
  includeGeometry: boolean = false;
}
