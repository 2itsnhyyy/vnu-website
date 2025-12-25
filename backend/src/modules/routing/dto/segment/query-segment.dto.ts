import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsBoolean } from 'class-validator';
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
} from 'src/common/constants/pagination.constant';

export class QuerySegmentDto {
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
    description: 'Filter by road ID',
    example: 1,
  })
  roadId?: number;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({
    description: 'Include geometry in response',
    example: false,
  })
  includeGeometry: boolean = false;
}
