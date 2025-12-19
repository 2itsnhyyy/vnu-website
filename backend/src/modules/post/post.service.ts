import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { PrismaService } from '../prisma/prisma.service';
import { PostResponseDto } from './dto/post-response.dto';
import { SearchParamsDto } from './dto/search-params.dto';
import { PostSortOptions } from 'src/common/constants/post.constant';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}
  async createPost(createPostDto: CreatePostDto, author: number) {
    const { title, contentMarkdown } = createPostDto;

    const post = await this.prisma.post.create({
      data: {
        title,
        contentMarkdown,
        author,
      },
      include: {
        authorUser: true,
      },
    });

    return { post: new PostResponseDto(post, post.authorUser) };
  }
  async getPosts(searchParamsDto: SearchParamsDto, currentUserId?: number) {
    const { limit, page, search, sort } = searchParamsDto;
    const take = Number(limit);
    const skip = (Number(page) - 1) * take;

    const where: any = {
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { contentMarkdown: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const orderBy: any =
      sort === PostSortOptions.HOTTEST
        ? [{ comments: { _count: 'desc' } }, { createdAt: 'desc' }]
        : sort === PostSortOptions.OLDEST
          ? [{ createdAt: 'asc' }]
          : [{ createdAt: 'desc' }];

    const totalItems = await this.prisma.post.count({ where });
    const totalPages = Math.ceil(totalItems / take);

    const posts = await this.prisma.post.findMany({
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
            comments: true,
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
      posts: posts.map(
        (post) =>
          new PostResponseDto(
            post,
            post.authorUser,
            post._count.likes,
            post._count.comments,
            post.likes?.length > 0,
          ),
      ),
    };
  }

  async getPost(postId: number, currentUserId?: number) {
    const post = await this.prisma.post.findUnique({
      where: { postId: Number(postId) },
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
            comments: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return {
      post: new PostResponseDto(
        post,
        post.authorUser,
        post._count.likes,
        post._count.comments,
        post.likes?.length > 0,
      ),
    };
  }

  async updatePost(
    postId: number,
    updatePostDto: UpdatePostDto,
    currentUserId?: number,
  ) {
    const { title, contentMarkdown } = updatePostDto;

    const post = await this.prisma.post.findUnique({
      where: { postId: Number(postId) },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.author !== currentUserId) {
      throw new ForbiddenException('You are not the author of this post');
    }

    const data: any = {};
    if (title) {
      data.title = title;
    }
    if (contentMarkdown) {
      data.contentMarkdown = contentMarkdown;
    }

    const updatedPost = await this.prisma.post.update({
      where: { postId: Number(postId) },
      data,
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
            comments: true,
          },
        },
      },
    });

    return { post: new PostResponseDto(updatedPost, updatedPost.authorUser) };
  }

  async deletePost(postId: number, currentUserId?: number, isAdmin?: boolean) {
    const post = await this.prisma.post.findUnique({
      where: { postId: Number(postId) },
      include: {
        authorUser: true,
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.author !== currentUserId && !isAdmin) {
      throw new ForbiddenException('You are not allowed to delete this post');
    }

    const deletedPost = await this.prisma.post.delete({
      where: { postId: Number(postId) },
      include: {
        authorUser: true,
      },
    });

    return {
      message: 'Post deleted successfully',
      post: new PostResponseDto(deletedPost, deletedPost.authorUser),
    };
  }
}
