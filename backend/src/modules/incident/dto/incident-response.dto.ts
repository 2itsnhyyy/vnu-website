import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Incident } from '@prisma/client';

export class IncidentResponseDto {
  @ApiProperty({
    description: 'The id of the incident',
    example: 1,
  })
  incidentId: number;

  @ApiProperty({
    description: 'The title of the incident',
    example: 'Mất điện tại tòa nhà E',
  })
  title: string;

  @ApiProperty({
    description: 'The content of the incident',
    example: 'Phát hiện mất điện tại tòa nhà E vào lúc 11h sáng...',
  })
  content: string;

  @ApiProperty({
    description: 'The id of the place where the incident occurred',
    example: 1,
  })
  placeId: number;

  @ApiPropertyOptional({
    description: 'The status of the incident',
    example: 0,
  })
  status?: number;

  @ApiProperty({
    description: 'The created at timestamp',
    example: '2025-12-19T10:00:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'The updated at timestamp',
    example: '2025-12-19T15:00:00.000Z',
  })
  updatedAt: string;

  constructor(incident: Incident) {
    this.incidentId = incident.incidentId;
    this.title = incident.title;
    this.content = incident.content;
    this.placeId = incident.placeId;
    this.status = incident.status ?? undefined;
    this.createdAt = incident.createdAt?.toISOString() ?? '';
    this.updatedAt = incident.updatedAt?.toISOString() ?? '';
  }
}
