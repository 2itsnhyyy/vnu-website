import { ApiProperty } from '@nestjs/swagger';
import { Comment, User } from '@prisma/client';
import { UserResponseDto } from 'src/modules/user/dto/user-response.dto';

export class CommentResponseDto {
  @ApiProperty({
    description: 'The id of the comment',
    example: 1,
  })
  commentId: number;
  @ApiProperty({
    description: 'The content of the comment',
    example: 'The content of the comment',
  })
  content: string;
  @ApiProperty({
    description: 'The parent of the comment',
    example: 1,
  })
  parent: number | null;
  @ApiProperty({
    description: 'The post id of the comment',
    example: 1,
  })
  postId: number;

  @ApiProperty({
    description: 'The author of the comment',
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
    description: 'The created at of the comment',
    example: '2025-01-01 09:00:00',
  })
  createdAt: string;
  @ApiProperty({
    description: 'The updated at of the comment',
    example: '2025-01-01 10:00:00',
  })
  updatedAt: string;

  @ApiProperty({
    description: 'The number of likes of the comment',
    example: 10,
  })
  likesCount: number;

  @ApiProperty({
    description: 'The number of comments of the comment',
    example: 10,
  })
  commentsCount: number;

  @ApiProperty({
    description: 'Whether the current user has liked the comment',
    example: true,
  })
  liked: boolean;

  constructor(
    comment: Comment,
    author: User,
    likesCount?: number,
    commentsCount?: number,
    liked?: boolean,
  ) {
    this.commentId = comment.commentId;
    this.content = comment.content ?? '';
    this.parent = comment.parent;
    this.postId = comment.postId ?? 0;
    this.author = new UserResponseDto(author);
    this.createdAt = comment.createdAt?.toISOString() ?? '';
    this.updatedAt = comment.updatedAt?.toISOString() ?? '';
    this.likesCount = likesCount ?? 0;
    this.commentsCount = commentsCount ?? 0;
    this.liked = liked ?? false;
  }
}
