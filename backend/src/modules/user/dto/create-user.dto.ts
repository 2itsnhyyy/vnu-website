import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsEmail,
  IsString,
  IsOptional,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The email of the user',
    example: 'thieu@gmail.com',
  })
  email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The name of the user',
    example: 'Huỳnh Văn Thiệu',
  })
  name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The password of the user',
    example: '123456',
  })
  password: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'The birthday of the user',
    example: '2025-01-01',
  })
  birthday: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'The avatar of the user',
    example: 'https://example.com/avatar.png',
  })
  avatar?: string;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({
    description: 'The role of the user',
    example: 0,
  })
  role?: number = 0;
}
