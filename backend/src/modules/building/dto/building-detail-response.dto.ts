import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class GeoJsonPoint {
  @ApiProperty({ example: 'Point' })
  type: string;

  @ApiProperty({
    example: [105.84415, 21.00561, 5.0],
    description: '[longitude, latitude, elevation]',
  })
  coordinates: number[];
}

class GeoJsonPolygon {
  @ApiProperty({ example: 'Polygon' })
  type: string;

  @ApiProperty({
    example: [
      [
        [105.84415, 21.00561, 0],
        [105.84425, 21.00561, 0],
        [105.84425, 21.00571, 0],
        [105.84415, 21.00571, 0],
        [105.84415, 21.00561, 0],
      ],
    ],
  })
  coordinates: number[][][];
}

class MeshObjectDto {
  @ApiProperty({ example: 1 })
  meshId: number;

  @ApiProperty({ example: 'https://example.com/model.glb' })
  meshUrl: string;

  @ApiPropertyOptional({ type: GeoJsonPoint })
  pointGeometry?: GeoJsonPoint;

  @ApiPropertyOptional({ example: [0, 0, 0] })
  rotate?: number[];

  @ApiPropertyOptional({ example: [1, 1, 1] })
  scale?: number[];
}

class FrustumDto {
  @ApiProperty({ example: 1 })
  frustumId: number;

  @ApiProperty({ type: GeoJsonPolygon })
  baseFaceGeometry: GeoJsonPolygon;

  @ApiPropertyOptional({ type: GeoJsonPolygon })
  topFaceGeometry?: GeoJsonPolygon;
}

class PrismDto {
  @ApiProperty({ example: 1 })
  prismId: number;

  @ApiProperty({ type: GeoJsonPolygon })
  baseFaceGeometry: GeoJsonPolygon;

  @ApiProperty({ example: 10.5 })
  height: number;
}

class PyramidDto {
  @ApiProperty({ example: 1 })
  pyramidId: number;

  @ApiProperty({ type: GeoJsonPolygon })
  baseFaceGeometry: GeoJsonPolygon;

  @ApiPropertyOptional({ type: GeoJsonPoint })
  apexGeometry?: GeoJsonPoint;
}

class ConeDto {
  @ApiProperty({ example: 1 })
  coneId: number;

  @ApiPropertyOptional({ type: GeoJsonPoint })
  centerGeometry?: GeoJsonPoint;

  @ApiProperty({ example: 5.0 })
  radius: number;

  @ApiPropertyOptional({ type: GeoJsonPoint })
  apexGeometry?: GeoJsonPoint;
}

class CylinderDto {
  @ApiProperty({ example: 1 })
  cylinderId: number;

  @ApiPropertyOptional({ type: GeoJsonPoint })
  centerGeometry?: GeoJsonPoint;

  @ApiProperty({ example: 5.0 })
  radius: number;

  @ApiProperty({ example: 10.0 })
  height: number;
}

class BodyDto {
  @ApiProperty({ example: 1 })
  bodyId: number;

  @ApiProperty({ type: [FrustumDto], default: [] })
  frustums: FrustumDto[];

  @ApiProperty({ type: [PrismDto], default: [] })
  prisms: PrismDto[];

  @ApiProperty({ type: [PyramidDto], default: [] })
  pyramids: PyramidDto[];

  @ApiProperty({ type: [ConeDto], default: [] })
  cones: ConeDto[];

  @ApiProperty({ type: [CylinderDto], default: [] })
  cylinders: CylinderDto[];
}

class Object3DDto {
  @ApiProperty({ example: 1 })
  objectId: number;

  @ApiProperty({ example: 0, description: '0 = MeshObject, 1 = Body' })
  objectType: number;

  @ApiProperty({ type: [MeshObjectDto], default: [] })
  meshes: MeshObjectDto[];

  @ApiProperty({ type: [BodyDto], default: [] })
  bodies: BodyDto[];
}

export class BuildingDetailResponseDto {
  @ApiProperty({ example: 1 })
  buildingId: number;

  @ApiProperty({ example: 'Tòa nhà E3' })
  name: string;

  @ApiPropertyOptional({ example: 'Tòa nhà giảng đường chính' })
  description?: string;

  @ApiPropertyOptional({ example: 5 })
  floors?: number;

  @ApiPropertyOptional({ example: 'https://example.com/building.jpg' })
  image?: string;

  @ApiProperty({ example: 1 })
  placeId: number;

  @ApiPropertyOptional({ example: 'Trường ĐHQGHN' })
  placeName?: string;

  @ApiProperty({ type: [Object3DDto] })
  objects3d: Object3DDto[];
}
