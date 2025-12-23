import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import {
  ApiTags,
  ApiOperation,
  getSchemaPath,
  ApiExtraModels,
  ApiCreatedResponse,
  ApiBearerAuth,
  ApiOkResponse,
} from '@nestjs/swagger';
import { PostResponseDto } from './dto/post-response.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { SearchParamsDto } from './dto/search-params.dto';
import { OptionalAuthGuard } from 'src/common/guards/optional-auth.guard';
import { UpdatePostDto } from './dto/update-post.dto';
import { Role } from 'src/common/constants/role.constant';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { CommentService } from '../comment/comment.service';
import { GetCommentsParamsDto } from '../comment/dto/get-comments-params.dto';
import { CreateCommentDto } from '../comment/dto/create-comment.dto';
import { CommentResponseDto } from '../comment/dto/comment-response.dto';
import { PaginationParamsDto } from 'src/common/dto/pagination-params.dto';

@ApiTags('Post')
@Controller('posts')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly commentService: CommentService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Create a new post with markdown content' })
  @ApiExtraModels(PostResponseDto)
  @ApiCreatedResponse({
    description: 'Post created successfully',
    schema: {
      type: 'object',
      properties: { post: { $ref: getSchemaPath(PostResponseDto) } },
    },
  })
  async createPost(@Body() createPostDto: CreatePostDto, @Req() req: any) {
    return this.postService.createPost(createPostDto, req.user.userId);
  }

  @Get()
  @UseGuards(OptionalAuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Get posts (authentication is optional)' })
  @ApiOkResponse({
    description: 'Posts fetched successfully',
    example: {
      pagination: {
        totalItems: 10,
        totalPages: 1,
        currentPage: 1,
        hasNextPage: false,
        hasPreviousPage: false,
        limit: 10,
      },
      posts: [],
    },
  })
  async getPosts(@Query() searchParamsDto: SearchParamsDto, @Req() req?: any) {
    return this.postService.getPosts(searchParamsDto, req?.user?.userId);
  }

  @Get(':postId')
  @UseGuards(OptionalAuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Get a post by id (authentication is optional)' })
  @ApiExtraModels(PostResponseDto)
  @ApiOkResponse({
    description: 'Post fetched successfully',
    schema: {
      type: 'object',
      properties: { post: { $ref: getSchemaPath(PostResponseDto) } },
    },
  })
  async getPost(@Param('postId') postId: number, @Req() req?: any) {
    return this.postService.getPost(postId, req?.user?.userId);
  }

  @Patch(':postId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Update a post by id' })
  @ApiExtraModels(PostResponseDto)
  @ApiOkResponse({
    description: 'Post updated successfully',
    schema: {
      type: 'object',
      properties: { post: { $ref: getSchemaPath(PostResponseDto) } },
    },
  })
  async updatePost(
    @Param('postId') postId: number,
    @Body() updatePostDto: UpdatePostDto,
    @Req() req: any,
  ) {
    return this.postService.updatePost(postId, updatePostDto, req.user.userId);
  }

  @Delete(':postId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.USER)
  @ApiBearerAuth('jwt')
  @ApiOperation({
    summary: 'Delete a post by id',
    description:
      'Delete a post by id. Only admin and the owner of the post can access this endpoint',
  })
  @ApiExtraModels(PostResponseDto)
  @ApiOkResponse({
    description: 'Post deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Post deleted successfully' },
        post: { $ref: getSchemaPath(PostResponseDto) },
      },
    },
  })
  async deletePost(@Param('postId') postId: number, @Req() req: any) {
    return this.postService.deletePost(
      postId,
      req.user.userId,
      req.user.role === Role.ADMIN,
    );
  }

  @Post(':postId/likes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({
    summary: 'Like post',
    description: 'Like post by userId and postId',
  })
  @ApiOkResponse({
    description: 'Post liked successfully',
    example: {
      message: 'Post liked successfully',
    },
  })
  async likePost(@Param('postId') postId: number, @Req() req: any) {
    return this.postService.likePost(req.user.userId, postId);
  }

  @Delete(':postId/likes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({
    summary: 'Unlike post',
    description: 'Unlike post by userId and postId',
  })
  @ApiOkResponse({
    description: 'Post unliked successfully',
    example: {
      message: 'Post unliked successfully',
    },
  })
  async unlikePost(@Param('postId') postId: number, @Req() req: any) {
    return this.postService.unlikePost(req.user.userId, postId);
  }

  @Get(':postId/likes')
  @ApiOperation({
    summary: 'Get users who liked the post',
    description: 'Get list of users who liked the post with pagination',
  })
  @ApiOkResponse({
    description: 'Users fetched successfully',
    example: {
      pagination: {
        totalItems: 100,
        totalPages: 10,
        currentPage: 1,
        hasNextPage: true,
        hasPreviousPage: false,
        limit: 10,
      },
      users: [
        {
          userId: 1,
          email: 'thieu@gmail.com',
          name: 'Huỳnh Văn Thiệu',
          birthday: '2025-01-01',
          avatar: 'https://example.com/avatar.png',
          role: 0,
        },
      ],
    },
  })
  async getPostLikes(
    @Param('postId') postId: number,
    @Query() paginationParams: PaginationParamsDto,
  ) {
    return this.postService.getPostLikes(
      postId,
      paginationParams.limit,
      paginationParams.page,
    );
  }

  @Get(':postId/comments')
  @UseGuards(OptionalAuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({
    summary: 'Get comments by post id (authentication is optional)',
  })
  @ApiExtraModels(CommentResponseDto)
  @ApiOkResponse({
    description: 'Comments fetched successfully',
    example: {
      pagination: {
        totalItems: 10,
        totalPages: 1,
        currentPage: 1,
        hasNextPage: false,
        hasPreviousPage: false,
        limit: 10,
      },
      comments: [],
    },
  })
  async getComments(
    @Param('postId') postId: number,
    @Query() getCommentsParamsDto: GetCommentsParamsDto,
    @Req() req: any,
  ) {
    return this.commentService.getComments(
      postId,
      getCommentsParamsDto,
      req.user?.userId,
    );
  }

  @Post(':postId/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Create a new comment' })
  @ApiExtraModels(CommentResponseDto)
  @ApiCreatedResponse({
    description: 'Comment created successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Comment created successfully' },
        comment: { $ref: getSchemaPath(CommentResponseDto) },
      },
    },
  })
  async createComment(
    @Body() createCommentDto: CreateCommentDto,
    @Param('postId') postId: number,
    @Req() req: any,
  ) {
    return this.commentService.createComment(
      createCommentDto,
      postId,
      req.user.userId,
    );
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('jwt')
  @ApiOperation({
    summary: 'Get posts by a specific user',
  })
  @ApiOkResponse({
    description: 'Posts fetched successfully',
    example: {
      pagination: {
        totalItems: 10,
        totalPages: 1,
        currentPage: 1,
        hasNextPage: false,
        hasPreviousPage: false,
        limit: 10,
      },
      posts: [],
    },
  })
  async getPostsByUser(
    @Param('userId') userId: number,
    @Query('limit') limit?: number,
    @Query('page') page?: number,
    @Req() req?: any,
  ) {
    return this.postService.getPostsByUser(
      Number(userId),
      limit ? Number(limit) : undefined,
      page ? Number(page) : undefined,
      req?.user?.userId,
    );
  }
}
