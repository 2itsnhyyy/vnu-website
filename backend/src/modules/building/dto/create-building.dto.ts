import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { CreateObject3DDto } from './create-object3d.dto';

export class CreateBuildingDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The name of the building',
    example: 'Tòa E',
  })
  name: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'The description of the building',
    example: 'Tòa nhà dành cho chương trình đặc biệt',
  })
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({
    description: 'Number of floors',
    example: 12,
  })
  floors?: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Image URL of the building',
    example: 'https://example.com/building.jpg',
  })
  image?: string;

  @IsNotEmpty()
  @IsInt()
  @ApiProperty({
    description: 'The id of the place where the building is located',
    example: 1,
  })
  placeId: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @ApiPropertyOptional({
    description:
      'Array of 3D objects for this building. Each object can be EITHER MeshObject (type=0) OR Body (type=1), not both.',
    type: [CreateObject3DDto],
    example: [
      {
        objectType: 0,
        meshes: [
          {
            meshUrl: 'https://example.com/models/building.glb',
            point: {
              type: 'Point',
              coordinates: [105.8342, 21.0285, 0],
            },
            rotate: 0,
            scale: 1.0,
          },
        ],
      },
      {
        objectType: 1,
        body: {
          name: 'Main Structure',
          prisms: [
            {
              baseFace: {
                type: 'Polygon',
                coordinates: [
                  [
                    [105.8342, 21.0285, 0],
                    [105.8343, 21.0285, 0],
                    [105.8343, 21.0286, 0],
                    [105.8342, 21.0286, 0],
                    [105.8342, 21.0285, 0],
                  ],
                ],
              },
              height: 15.0,
            },
          ],
        },
      },
    ],
  })
  objects3d?: CreateObject3DDto[];
}
