import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { EmailModule } from './modules/email/email.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [AuthModule, PrismaModule, JwtModule, EmailModule, UserModule],
})
export class AppModule {}
