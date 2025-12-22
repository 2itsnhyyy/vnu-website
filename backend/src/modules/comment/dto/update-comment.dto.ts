import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateCommentDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The content of the comment',
    example: 'The updated content of the comment',
  })
  content: string;
}
