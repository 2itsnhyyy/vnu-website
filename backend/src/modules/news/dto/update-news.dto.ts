import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateNewsDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'The title of the news',
    example: 'Updated News Title',
  })
  title?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'The content of the news in markdown format',
    example: '# Updated Content\n\nThis is updated news...',
  })
  contentMarkdown?: string;
}
