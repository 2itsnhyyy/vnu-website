import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [AuthModule, AuthModule, PrismaModule, JwtModule],
})
export class AppModule {}
