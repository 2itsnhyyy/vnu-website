import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @IsEmail({}, { message: 'Invalid email' })
  @ApiProperty({
    description: 'The email of the user',
    example: 'thieu@gmail.com',
  })
  email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The password of the user',
    example: '123456',
  })
  password: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The confirm password of the user',
    example: '123456',
  })
  confirmPassword: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The name of the user',
    example: 'Huỳnh Văn Thiệu',
  })
  name: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'The birthday of the user',
    example: '2025-01-01',
  })
  birthday: string;
}
