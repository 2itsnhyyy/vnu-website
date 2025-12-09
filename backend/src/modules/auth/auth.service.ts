import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { comparePassword, hashPassword } from 'src/common/utils/hash.utils';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, confirmPassword, name, birthday } = registerDto;

    const persistedEmail = await this.prisma.user.findFirst({
      where: { email },
    });
    if (persistedEmail) {
      throw new BadRequestException('Email already exists');
    }

    if (password !== confirmPassword) {
      throw new BadRequestException(
        'Password and confirm password do not match',
      );
    }
    const hashedPassword = await hashPassword(password);

    await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        birthday: new Date(birthday),
      },
      select: {
        email: true,
        name: true,
        birthday: true,
        avatar: true,
      },
    });

    return {
      message: 'User created successfully',
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('Email is not exists');
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Password is incorrect');
    }

    const token = await this.jwtService.signAsync({
      sub: user.userId,
      role: user.role ?? 0,
    });

    return {
      message: 'Login successfully',
      token,
    };
  }
}
