import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePostDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'The title of the post',
    example: 'The title of the post',
  })
  title?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'The content of the post in markdown format',
    example: '# Hello World\n\nThis is a markdown post',
  })
  contentMarkdown?: string;
}
