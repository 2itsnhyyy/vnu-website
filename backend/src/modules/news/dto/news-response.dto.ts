import { ApiProperty } from '@nestjs/swagger';
import { News } from '@prisma/client';

export class NewsResponseDto {
  @ApiProperty({
    description: 'The id of the news',
    example: 1,
  })
  newsId: number;

  @ApiProperty({
    description: 'The title of the news',
    example: 'Breaking News: VNU Announces New Campus',
  })
  title: string;

  @ApiProperty({
    description: 'The content of the news in markdown format',
    example: '# Breaking News\n\nVNU announces new campus...',
  })
  contentMarkdown: string;

  @ApiProperty({
    description: 'The created at timestamp',
    example: '2025-12-19T10:00:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'The updated at timestamp',
    example: '2025-12-19T15:00:00.000Z',
  })
  updatedAt: string;

  constructor(news: News) {
    this.newsId = news.newsId;
    this.title = news.title;
    this.contentMarkdown = news.contentMarkdown;
    this.createdAt = news.createdAt?.toISOString() ?? '';
    this.updatedAt = news.updatedAt?.toISOString() ?? '';
  }
}
