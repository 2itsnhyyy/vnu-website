import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import {
  CreateFaceDto,
  CreateNodeDto,
  CreatePointDto,
} from './create-geometry.dto';

export class CreateMeshObjectDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'URL of the mesh file (GLB, GLTF, etc.)',
    example: 'https://example.com/models/building-e3.glb',
  })
  meshUrl: string;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional({
    description:
      'Existing point ID for mesh position (if not creating new point)',
    example: 1,
  })
  pointId?: number;

  @IsOptional()
  @ValidateNested()
  @ApiPropertyOptional({
    description: 'Create new point inline for mesh position',
    type: CreatePointDto,
    example: {
      type: 'Point',
      coordinates: [105.8342, 21.0285, 0],
    },
  })
  point?: CreatePointDto;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({
    description: 'Rotation angle in degrees',
    example: 90,
  })
  rotate?: number;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({
    description: 'Scale factor',
    example: 1.0,
  })
  scale?: number;
}

export class CreateFrustumDto {
  @IsOptional()
  @IsInt()
  @ApiPropertyOptional({
    description: 'Base face ID (if using existing face)',
    example: 1,
  })
  baseFaceId?: number;

  @IsOptional()
  @ValidateNested()
  @ApiPropertyOptional({
    description: 'Create base face inline',
    type: CreateFaceDto,
  })
  baseFace?: CreateFaceDto;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional({
    description: 'Top face ID (if using existing face)',
    example: 2,
  })
  topFaceId?: number;

  @IsOptional()
  @ValidateNested()
  @ApiPropertyOptional({
    description: 'Create top face inline',
    type: CreateFaceDto,
  })
  topFace?: CreateFaceDto;
}

export class CreatePrismDto {
  @IsOptional()
  @IsInt()
  @ApiPropertyOptional({
    description: 'Base face ID (if using existing face)',
    example: 1,
  })
  baseFaceId?: number;

  @IsOptional()
  @ValidateNested()
  @ApiPropertyOptional({
    description: 'Create base face inline',
    type: CreateFaceDto,
  })
  baseFace?: CreateFaceDto;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'Height of the prism',
    example: 10.5,
  })
  height: number;
}

export class CreatePyramidDto {
  @IsOptional()
  @IsInt()
  @ApiPropertyOptional({
    description: 'Base face ID (if using existing face)',
    example: 1,
  })
  baseFaceId?: number;

  @IsOptional()
  @ValidateNested()
  @ApiPropertyOptional({
    description: 'Create base face inline',
    type: CreateFaceDto,
  })
  baseFace?: CreateFaceDto;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional({
    description: 'Apex node ID (if using existing node)',
    example: 5,
  })
  apexId?: number;

  @IsOptional()
  @ValidateNested()
  @ApiPropertyOptional({
    description: 'Create apex node inline',
    type: CreateNodeDto,
  })
  apex?: CreateNodeDto;
}

export class CreateConeDto {
  @IsOptional()
  @IsInt()
  @ApiPropertyOptional({
    description: 'Center node ID (if using existing node)',
    example: 1,
  })
  centerId?: number;

  @IsOptional()
  @ValidateNested()
  @ApiPropertyOptional({
    description: 'Create center node inline',
    type: CreateNodeDto,
  })
  center?: CreateNodeDto;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'Radius of the cone base',
    example: 5.0,
  })
  radius: number;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional({
    description: 'Apex node ID (if using existing node)',
    example: 2,
  })
  apexId?: number;

  @IsOptional()
  @ValidateNested()
  @ApiPropertyOptional({
    description: 'Create apex node inline',
    type: CreateNodeDto,
  })
  apex?: CreateNodeDto;
}

export class CreateCylinderDto {
  @IsOptional()
  @IsInt()
  @ApiPropertyOptional({
    description: 'Center node ID (if using existing node)',
    example: 1,
  })
  centerId?: number;

  @IsOptional()
  @ValidateNested()
  @ApiPropertyOptional({
    description: 'Create center node inline',
    type: CreateNodeDto,
  })
  center?: CreateNodeDto;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'Radius of the cylinder',
    example: 3.0,
  })
  radius: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'Height of the cylinder',
    example: 10.0,
  })
  height: number;
}

export class CreateBodyDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Name of the body',
    example: 'Main Structure',
  })
  name: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @ApiPropertyOptional({
    description: 'Array of frustums',
    type: [CreateFrustumDto],
  })
  frustums?: CreateFrustumDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @ApiPropertyOptional({
    description: 'Array of prisms',
    type: [CreatePrismDto],
  })
  prisms?: CreatePrismDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @ApiPropertyOptional({
    description: 'Array of pyramids',
    type: [CreatePyramidDto],
  })
  pyramids?: CreatePyramidDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @ApiPropertyOptional({
    description: 'Array of cones',
    type: [CreateConeDto],
  })
  cones?: CreateConeDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @ApiPropertyOptional({
    description: 'Array of cylinders',
    type: [CreateCylinderDto],
  })
  cylinders?: CreateCylinderDto[];
}

export class CreateObject3DDto {
  @IsNotEmpty()
  @IsInt()
  @IsIn([0, 1])
  @ApiProperty({
    description:
      'Type of the 3D object: 0 = MeshObject (3D model files), 1 = Body (geometric primitives)',
    example: 0,
    enum: [0, 1],
    examples: {
      meshObject: {
        summary: 'Type 0 - MeshObject',
        value: 0,
      },
      body: {
        summary: 'Type 1 - Body',
        value: 1,
      },
    },
  })
  objectType: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @ApiPropertyOptional({
    description:
      'Array of mesh objects (ONLY if objectType = 0). Cannot be used with body. Each mesh must have position (point or pointId).',
    type: [CreateMeshObjectDto],
    example: [
      {
        meshUrl: 'https://example.com/models/building.glb',
        point: {
          type: 'Point',
          coordinates: [105.8342, 21.0285, 0],
        },
        rotate: 0,
        scale: 1.0,
      },
      {
        meshUrl: 'https://example.com/models/roof.glb',
        point: {
          type: 'Point',
          coordinates: [105.8342, 21.0285, 15],
        },
        rotate: 0,
        scale: 1.0,
      },
    ],
  })
  meshes?: CreateMeshObjectDto[];

  @IsOptional()
  @ValidateNested()
  @ApiPropertyOptional({
    description:
      'Body object with geometric shapes (ONLY if objectType = 1). Cannot be used with meshes.',
    type: CreateBodyDto,
    example: {
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
      cylinders: [
        {
          center: {
            point: {
              type: 'Point',
              coordinates: [105.8342, 21.0285, 0],
            },
          },
          radius: 2.5,
          height: 10.0,
        },
      ],
    },
  })
  body?: CreateBodyDto;
}
