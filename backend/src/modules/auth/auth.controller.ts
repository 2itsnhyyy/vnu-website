import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/fotgot-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiCreatedResponse({
    description: 'Register success',
    schema: {
      example: {
        message: 'User created successfully',
      },
    },
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login a user' })
  @ApiOkResponse({
    description: 'Login success',
    schema: {
      example: {
        message: 'Login successfully',
        token: 'token',
      },
    },
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('forgot-password')
  @HttpCode(200)
  @ApiOperation({ summary: 'Forgot password' })
  @ApiOkResponse({
    description: 'Forgot password success',
    schema: {
      example: {
        message: 'OTP has been sent to your email',
      },
    },
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('verify')
  @HttpCode(200)
  @ApiOperation({ summary: 'Verify OTP' })
  @ApiOkResponse({
    description: 'Verify OTP success',
    schema: {
      example: {
        message: 'OTP verified successfully',
        resetToken: 'resetToken',
      },
    },
  })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verify(verifyOtpDto);
  }

  @Post('reset-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Reset password',
    description:
      'Reset token is required. If 2 minutes has passed, please request a new OTP',
  })
  @ApiOkResponse({
    description: 'Reset password success',
    schema: {
      example: {
        message: 'Password reset successfully',
      },
    },
  })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Req() request: any,
  ) {
    const userId = request.user.userId;
    return this.authService.resetPassword(resetPasswordDto, userId);
  }
}
