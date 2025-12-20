import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { DEFAULT_LIMIT } from 'src/common/constants/pagination.constant';
import { DEFAULT_PAGE } from 'src/common/constants/pagination.constant';
import {
  DEFAULT_POST_SORT,
  PostSortOptions,
} from 'src/common/constants/post.constant';

export class SearchParamsDto {
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
    description: 'The search query',
  })
  search?: string;

  @IsOptional()
  @IsEnum(PostSortOptions)
  @ApiPropertyOptional({
    description: `The sort field (${Object.values(PostSortOptions).join(', ')})`,
    example: DEFAULT_POST_SORT.toString(),
  })
  sort?: PostSortOptions = DEFAULT_POST_SORT;
}
