export interface Geometry {
  type: string;
  coordinates: any;
}

export interface MeshData {
  meshId: number;
  meshUrl: string;
  pointGeometry: Geometry;
  rotate: number[];
  scale: number[];
}

export interface BodyData {
  bodyId: number;
  prisms: any[];
  pyramids: any[];
  cones: any[];
  cylinders: any[];
}

export interface Object3D {
  objectId: number;
  objectType: number;
  meshes: MeshData[];
  bodies: BodyData[];
}

export interface Building {
  buildingId: number;
  name: string;
  description: string;
  floors: number;
  image?: string;
  placeId: number;
  placeName?: string;
  objects3d: Object3D[];
}

export interface PathResponse {
  message: string;
  path: {
    pathGeometry: Geometry | null;
    totalCost: number;
    segments: any[];
  };
}
