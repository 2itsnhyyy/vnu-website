import { ApiProperty } from '@nestjs/swagger';
import { Post, User } from '@prisma/client';
import { UserResponseDto } from 'src/modules/user/dto/user-response.dto';

export class PostResponseDto {
  @ApiProperty({
    description: 'The ID of the post',
    example: 1,
  })
  postId: number;

  @ApiProperty({
    description: 'The title of the post',
    example: 'Hello World',
  })
  title: string;

  @ApiProperty({
    description: 'The content of the post in markdown format',
    example: '# Hello World\n\nThis is a markdown post',
  })
  contentMarkdown: string;

  @ApiProperty({
    description: 'The created at of the post',
    example: '2025-01-01 09:00:00',
  })
  createdAt: string;

  @ApiProperty({
    description: 'The updated at of the post',
    example: '2025-01-01 10:00:00',
  })
  updatedAt: string;

  @ApiProperty({
    description: 'The author of the post',
    example: {
      userId: 1,
      name: 'Huỳnh Văn Thiệu',
      email: 'thieu@gmail.com',
      avatar: 'https://example.com/avatar.png',
      role: 0,
    },
  })
  author: UserResponseDto;

  @ApiProperty({
    description: 'The number of likes of the post',
    example: 10,
  })
  likesCount: number;

  @ApiProperty({
    description: 'The number of comments of the post',
    example: 10,
  })
  commentsCount: number;

  @ApiProperty({
    description: 'Whether the current user has liked the post',
    example: true,
  })
  liked: boolean;

  constructor(
    post: Post,
    author: User,
    likesCount?: number,
    commentsCount?: number,
    liked?: boolean,
  ) {
    this.postId = post.postId;
    this.title = post.title;
    this.contentMarkdown = post.contentMarkdown;
    this.createdAt = post.createdAt.toISOString();
    this.updatedAt = post.updatedAt.toISOString();
    this.author = new UserResponseDto(author);
    this.likesCount = likesCount ?? 0;
    this.commentsCount = commentsCount ?? 0;
    this.liked = liked ?? false;
  }
}
