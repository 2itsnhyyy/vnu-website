import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CommentModule } from '../comment/comment.module';

@Module({
  imports: [PrismaModule, CommentModule],
  providers: [PostService],
  controllers: [PostController],
})
export class PostModule {}
