import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { comparePassword, hashPassword } from 'src/common/utils/hash.utils';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ForgotPasswordDto } from './dto/fotgot-password.dto';
import { EmailService } from '../email/email.service';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, confirmPassword, name, birthday } = registerDto;

    const persistedEmail = await this.prisma.user.findUnique({
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
        role: 0,
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
    const user = await this.prisma.user.findUnique({
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

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;
    const user = await this.prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('Email is not exists');
    }

    await this.prisma.otp.deleteMany({
      where: {
        userId: user.userId,
      },
    });

    const otp = Math.floor(100000 + Math.random() * 900000);
    const expireAt = new Date(Date.now() + 10 * 60 * 1000);
    await this.prisma.otp.create({
      data: {
        userId: user.userId,
        code: otp.toString(),
        expireAt,
      },
    });

    await this.emailService.sendEmail(
      user.email,
      otp.toString(),
      user.name,
      10,
    );

    return {
      message: 'OTP has been sent to your email',
    };
  }

  async verify(verifyDto: VerifyOtpDto) {
    const { email, code } = verifyDto;
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('Email is not exists');
    }

    const otp = await this.prisma.otp.findFirst({
      where: {
        code,
        userId: user.userId,
      },
    });

    if (!otp) {
      throw new BadRequestException('Invalid OTP');
    }

    if (otp.expireAt < new Date()) {
      throw new BadRequestException('OTP has expired');
    }

    await this.prisma.otp.delete({
      where: { otpId: otp.otpId },
    });

    const resetToken = await this.jwtService.signAsync(
      {
        sub: user.userId,
        role: user.role,
      },
      {
        expiresIn: '2m',
      },
    );

    return {
      message: 'OTP verified successfully',
      resetToken,
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto, userId: number) {
    if (resetPasswordDto.password !== resetPasswordDto.confirmPassword) {
      throw new BadRequestException(
        'Password and confirm password do not match',
      );
    }

    const hashedPassword = await hashPassword(resetPasswordDto.password);

    await this.prisma.user.update({
      where: { userId },
      data: {
        password: hashedPassword,
      },
    });

    return {
      message: 'Password reset successfully',
    };
  }
}
