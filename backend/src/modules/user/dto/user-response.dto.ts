import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';

export class UserResponseDto {
  @ApiProperty({
    description: 'The email of the user',
    example: 'thieu@gmail.com',
  })
  email: string;
  @ApiProperty({
    description: 'The name of the user',
    example: 'Huỳnh Văn Thiệu',
  })
  name: string;
  @ApiProperty({
    description: 'The birthday of the user',
    example: '2025-01-01',
  })
  birthday: string;
  @ApiProperty({
    description: 'The avatar of the user',
    example: 'https://example.com/avatar.png',
  })
  avatar: string;
  @ApiProperty({
    description: 'The role of the user',
    example: 0,
  })
  role: number;
  @ApiProperty({
    description: 'The user ID',
    example: 1,
  })
  userId: number;

  constructor(user: User) {
    this.email = user.email;
    this.name = user.name;
    this.birthday = user.birthday.toISOString();
    this.avatar = user.avatar ?? '';
    this.role = user.role ?? 0;
    this.userId = user.userId;
  }
}
