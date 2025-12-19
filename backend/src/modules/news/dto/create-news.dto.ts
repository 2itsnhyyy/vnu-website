import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateNewsDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The title of the news',
    example: 'Breaking News: VNU Announces New Campus',
  })
  title: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The content of the news in markdown format',
    example: '# Breaking News\n\nVNU announces new campus...',
  })
  contentMarkdown: string;
}
