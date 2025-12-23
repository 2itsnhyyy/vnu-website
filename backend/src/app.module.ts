import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { EmailModule } from './modules/email/email.module';
import { UserModule } from './modules/user/user.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { PostModule } from './modules/post/post.module';
import { CommentModule } from './modules/comment/comment.module';
import { NewsModule } from './modules/news/news.module';
import { PlaceModule } from './modules/place/place.module';
import { IncidentModule } from './modules/incident/incident.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    JwtModule,
    EmailModule,
    UserModule,
    CloudinaryModule,
    PostModule,
    CommentModule,
    NewsModule,
    PlaceModule,
    IncidentModule,
  ],
})
export class AppModule {}
