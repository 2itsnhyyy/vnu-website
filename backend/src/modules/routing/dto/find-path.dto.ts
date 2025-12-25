import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class FindPathDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'Starting place ID',
    example: 1,
  })
  fromPlaceId: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'Destination place ID',
    example: 2,
  })
  toPlaceId: number;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({
    description: 'Include geometry of the path in response',
    example: true,
    default: true,
  })
  includeGeometry: boolean = true;
}
