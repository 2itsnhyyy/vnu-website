import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
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
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CommentResponseDto } from './dto/comment-response.dto';
import { OptionalAuthGuard } from 'src/common/guards/optional-auth.guard';
import { GetCommentsParamsDto } from './dto/get-comments-params.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

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
}
