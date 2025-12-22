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
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { CommentService } from './comment.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CommentResponseDto } from './dto/comment-response.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PaginationParamsDto } from 'src/common/dto/pagination-params.dto';

@ApiTags('Comment')
@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Patch(':commentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Update a comment' })
  @ApiExtraModels(CommentResponseDto)
  @ApiOkResponse({
    description: 'Comment updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Comment updated successfully' },
        comment: { $ref: getSchemaPath(CommentResponseDto) },
      },
    },
  })
  async updateComment(
    @Param('commentId') commentId: number,
    @Body() updateCommentDto: UpdateCommentDto,
    @Req() req: any,
  ) {
    return this.commentService.updateComment(
      commentId,
      updateCommentDto,
      req.user.userId,
    );
  }

  @Delete(':commentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiOkResponse({
    description: 'Comment deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Comment deleted successfully' },
      },
    },
  })
  async deleteComment(@Param('commentId') commentId: number, @Req() req: any) {
    return this.commentService.deleteComment(commentId, req.user.userId);
  }

  @Post(':commentId/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({
    summary: 'Like comment',
    description: 'Like comment by userId and commentId',
  })
  @ApiOkResponse({
    description: 'Comment liked successfully',
    example: {
      message: 'Comment liked successfully',
    },
  })
  async likeComment(@Param('commentId') commentId: number, @Req() req: any) {
    return this.commentService.likeComment(commentId, req.user.userId);
  }

  @Delete(':commentId/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({
    summary: 'Unlike comment',
    description: 'Unlike comment by userId and commentId',
  })
  @ApiOkResponse({
    description: 'Comment unliked successfully',
    example: {
      message: 'Comment unliked successfully',
    },
  })
  async unlikeComment(@Param('commentId') commentId: number, @Req() req: any) {
    return this.commentService.unlikeComment(commentId, req.user.userId);
  }

  @Get(':commentId/likes')
  @ApiOperation({
    summary: 'Get users who liked the comment',
    description: 'Get list of users who liked the comment with pagination',
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
          name: 'Huỳnh Văn Thiệu',
          email: 'thieu@gmail.com',
          birthday: '2025-01-01',
          avatar: 'https://example.com/avatar.png',
          role: 0,
        },
      ],
    },
  })
  async getCommentLikes(
    @Param('commentId') commentId: number,
    @Query() paginationParams: PaginationParamsDto,
  ) {
    return this.commentService.getCommentLikes(
      commentId,
      paginationParams.limit,
      paginationParams.page,
    );
  }
}
