import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The content of the comment',
    example: 'The content of the comment',
  })
  content: string;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({
    description: 'The parent of the comment',
    example: 1,
  })
  parent?: number;
}
