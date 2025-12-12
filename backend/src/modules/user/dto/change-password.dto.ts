import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The old password of the user',
    example: '123456',
  })
  oldPassword: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The new password of the user',
    example: '12345678',
  })
  newPassword: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The confirm new password of the user',
    example: '12345678',
  })
  confirmNewPassword: string;
}
