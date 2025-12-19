import { ApiPropertyOptional } from '@nestjs/swagger';
import { DEFAULT_PAGE } from 'src/common/constants/pagination.constant';
import { IsEnum, IsInt } from 'class-validator';
import { Min } from 'class-validator';
import { IsOptional } from 'class-validator';
import { DEFAULT_LIMIT } from 'src/common/constants/pagination.constant';
import { PostSortOptions } from 'src/common/constants/post.constant';

export class GetCommentsParamsDto {
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
  @IsInt()
  @ApiPropertyOptional({
    description: 'The parent comment id (null for root comments)',
    example: 1,
  })
  parent?: number;

  @IsOptional()
  @IsEnum(PostSortOptions)
  @ApiPropertyOptional({
    description: `The sort field (${Object.values(PostSortOptions).join(', ')})`,
    example: PostSortOptions.NEWEST,
  })
  sort?: PostSortOptions;
}
