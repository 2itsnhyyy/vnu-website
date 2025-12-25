import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsDateString } from 'class-validator';

export class StatsQueryDto {
  @IsNotEmpty()
  @IsDateString()
  @ApiProperty({
    description: 'Start date (ISO format)',
    example: '2024-01-01',
    required: true,
  })
  startDate: string;

  @IsNotEmpty()
  @IsDateString()
  @ApiProperty({
    description: 'End date (ISO format)',
    example: '2024-12-31',
    required: true,
  })
  endDate: string;
}
