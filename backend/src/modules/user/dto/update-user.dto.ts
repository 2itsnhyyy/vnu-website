import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateUserDtoAdmin {
  @IsEmail()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'The email of the user',
    example: 'thieu@gmail.com',
  })
  email?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'The name of the user',
    example: 'Huỳnh Văn Thiệu',
  })
  name?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'The avatar of the user',
    example: 'https://example.com/avatar.png',
  })
  avatar?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'The birthday of the user',
    example: '2025-01-01',
  })
  birthday?: string;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({
    description: 'The role of the user',
    example: 0,
  })
  role?: number;
}

export class UpdateUserDtoMe {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'The name of the user',
    example: 'Huỳnh Văn Thiệu',
  })
  name?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'The avatar of the user',
    example: 'https://example.com/avatar.png',
  })
  avatar?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'The birthday of the user',
    example: '2025-01-01',
  })
  birthday?: string;
}
