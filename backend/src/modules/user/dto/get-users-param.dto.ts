import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
} from 'src/common/constants/pagination.constant';
import { Role } from 'src/common/constants/role.constant';

export class GetUsersParamDto {
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
  @IsInt()
  @ApiPropertyOptional({
    description: 'The role of the user (1: admin, 0: user)',
  })
  role?: Role;
}
