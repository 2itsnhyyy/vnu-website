import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentResponseDto } from './dto/comment-response.dto';
import { User } from '@prisma/client';
import { Role } from 'src/common/constants/role.constant';
import { GetCommentsParamsDto } from './dto/get-comments-params.dto';
import { PostSortOptions } from 'src/common/constants/post.constant';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { UserResponseDto } from '../user/dto/user-response.dto';

@Injectable()
export class CommentService {
  constructor(private readonly prisma: PrismaService) {}
  async createComment(
    createCommentDto: CreateCommentDto,
    postId: number,
    userId: number,
  ) {
    const { content, parent } = createCommentDto;
    const post = await this.prisma.post.findUnique({
      where: { postId: Number(postId) },
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    const comment = await this.prisma.comment.create({
      data: {
        content,
        parent: parent ? Number(parent) : undefined,
        postId: Number(postId),
        author: Number(userId),
      },
      include: {
        authorUser: true,
      },
    });
    return {
      message: 'Comment created successfully',
      comment: new CommentResponseDto(comment, comment.authorUser as User),
    };
  }

  async getComments(
    postId: number,
    getCommentsParamsDto: GetCommentsParamsDto,
    currentUserId?: number,
  ) {
    const { limit, page, parent, sort } = getCommentsParamsDto;
    const take = Number(limit);
    const skip = (Number(page) - 1) * take;

    const post = await this.prisma.post.findUnique({
      where: { postId: Number(postId) },
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const where: any = {
      postId: Number(postId),
      ...(parent !== undefined && { parent: Number(parent) }),
    };

    const orderBy: any =
      sort === PostSortOptions.HOTTEST
        ? [{ likes: { _count: 'desc' } }, { createdAt: 'desc' }]
        : sort === PostSortOptions.OLDEST
          ? [{ createdAt: 'asc' }]
          : [{ createdAt: 'desc' }];

    const totalItems = await this.prisma.comment.count({ where });
    const totalPages = Math.ceil(totalItems / take);

    const comments = await this.prisma.comment.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        authorUser: true,
        likes: currentUserId
          ? {
              where: { userId: currentUserId },
              select: { userId: true },
            }
          : false,
        _count: {
          select: {
            likes: true,
            children: true,
          },
        },
      },
    });

    return {
      pagination: {
        totalItems,
        totalPages,
        currentPage: Number(page),
        hasNextPage: Number(page) < totalPages,
        hasPreviousPage: Number(page) > 1,
        limit: take,
      },
      comments: comments.map(
        (comment) =>
          new CommentResponseDto(
            comment,
            comment.authorUser as User,
            comment._count.likes,
            comment._count.children,
            comment.likes?.length > 0,
          ),
      ),
    };
  }

  async updateComment(
    commentId: number,
    updateCommentDto: UpdateCommentDto,
    userId: number,
  ) {
    const comment = await this.prisma.comment.findUnique({
      where: { commentId: Number(commentId) },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.author !== userId) {
      throw new ForbiddenException('You can only update your own comments');
    }

    const updatedComment = await this.prisma.comment.update({
      where: { commentId: Number(commentId) },
      data: { content: updateCommentDto.content },
      include: {
        authorUser: true,
        _count: {
          select: {
            likes: true,
            children: true,
          },
        },
      },
    });

    return {
      message: 'Comment updated successfully',
      comment: new CommentResponseDto(
        updatedComment,
        updatedComment.authorUser as User,
        updatedComment._count.likes,
        updatedComment._count.children,
        false,
      ),
    };
  }

  async deleteComment(commentId: number, userId: number, role: Role) {
    const comment = await this.prisma.comment.findUnique({
      where: { commentId: Number(commentId) },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.author !== Number(userId) && role !== Role.ADMIN) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.prisma.comment.delete({
      where: { commentId: Number(commentId) },
    });

    return {
      message: 'Comment deleted successfully',
    };
  }

  async likeComment(commentId: number, userId: number) {
    const comment = await this.prisma.comment.findUnique({
      where: { commentId: Number(commentId) },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const existingLike = await this.prisma.likeComment.findUnique({
      where: {
        commentId_userId: {
          commentId: Number(commentId),
          userId: Number(userId),
        },
      },
    });

    if (existingLike) {
      return { message: 'Comment already liked' };
    }

    await this.prisma.likeComment.create({
      data: {
        commentId: Number(commentId),
        userId: Number(userId),
      },
    });

    return { message: 'Comment liked successfully' };
  }

  async unlikeComment(commentId: number, userId: number) {
    const comment = await this.prisma.comment.findUnique({
      where: { commentId: Number(commentId) },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const existingLike = await this.prisma.likeComment.findUnique({
      where: {
        commentId_userId: {
          commentId: Number(commentId),
          userId: Number(userId),
        },
      },
    });

    if (!existingLike) {
      return { message: 'Comment not liked yet' };
    }

    await this.prisma.likeComment.delete({
      where: {
        commentId_userId: {
          commentId: Number(commentId),
          userId: Number(userId),
        },
      },
    });

    return { message: 'Comment unliked successfully' };
  }

  async getCommentLikes(commentId: number, limit: number, page: number) {
    const comment = await this.prisma.comment.findUnique({
      where: { commentId: Number(commentId) },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const take = Number(limit);
    const skip = (Number(page) - 1) * take;

    const totalItems = await this.prisma.likeComment.count({
      where: { commentId: Number(commentId) },
    });
    const totalPages = Math.ceil(totalItems / take);

    const likes = await this.prisma.likeComment.findMany({
      where: { commentId: Number(commentId) },
      include: {
        user: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });

    return {
      pagination: {
        totalItems,
        totalPages,
        currentPage: Number(page),
        hasNextPage: Number(page) < totalPages,
        hasPreviousPage: Number(page) > 1,
        limit: take,
      },
      users: likes.map((like) => new UserResponseDto(like.user)),
    };
  }
}
