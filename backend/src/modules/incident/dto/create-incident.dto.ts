import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateIncidentDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The title of the incident',
    example: 'Mất điện tại tòa nhà E',
  })
  title: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The content of the incident',
    example: 'Phát hiện mất điện tại tòa nhà E vào lúc 10h sáng...',
  })
  content: string;

  @IsNotEmpty()
  @IsInt()
  @ApiProperty({
    description: 'The id of the place where the incident occurred',
    example: 1,
  })
  placeId: number;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional({
    description: 'The status of the incident',
    example: 0,
  })
  status?: number;
}
