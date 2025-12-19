import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';
import { DEFAULT_LIMIT, DEFAULT_PAGE } from '../constants/pagination.constant';

export class PaginationParamsDto {
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
}
