import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateIncidentDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'The title of the incident',
    example: 'Mất điện tại tòa nhà E (Cập nhật)',
  })
  title?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'The content of the incident',
    example: 'Phát hiện mất điện tại tòa nhà E vào lúc 11h sáng... (Cập nhật)',
  })
  content?: string;

  @IsInt()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'The id of the place where the incident occurred',
    example: 1,
  })
  placeId?: number;

  @IsInt()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'The status of the incident',
    example: 1,
  })
  status?: number;
}
