import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { EmailModule } from './modules/email/email.module';

@Module({
  imports: [AuthModule, PrismaModule, JwtModule, EmailModule],
})
export class AppModule {}
