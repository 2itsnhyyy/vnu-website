import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BuildingResponseDto {
  @ApiProperty({
    description: 'The id of the building',
    example: 1,
  })
  buildingId: number;

  @ApiProperty({
    description: 'The name of the building',
    example: 'Tòa nhà E3',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'The description of the building',
    example: 'Tòa nhà giảng đường chính',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Number of floors',
    example: 5,
  })
  floors?: number;

  @ApiPropertyOptional({
    description: 'Image URL of the building',
    example: 'https://example.com/building.jpg',
  })
  image?: string;

  @ApiProperty({
    description: 'The id of the place where the building is located',
    example: 1,
  })
  placeId: number;

  constructor(building: any) {
    this.buildingId = building.buildingId;
    this.name = building.name;
    this.description = building.description ?? undefined;
    this.floors = building.floors ?? undefined;
    this.image = building.image ?? undefined;
    this.placeId = building.placeId;
  }
}
