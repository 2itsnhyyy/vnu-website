import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
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

@ApiTags('posts')
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

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
}
