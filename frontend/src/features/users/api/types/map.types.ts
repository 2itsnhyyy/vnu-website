export interface PointGeometry {
  type: 'Point';
  coordinates: [number, number, number?];
}

export interface MeshObject {
  meshId: number;
  meshUrl: string;
  pointGeometry: PointGeometry | null;
  rotate: [number, number, number];
  scale: [number, number, number];
}

export interface Building3D {
  buildingId: number;
  name: string;
  description: string;
  floors: number;
  image: string;
  placeId: number;
  placeName: string;
  distance?: number;
  objects3d: {
    objectId: number;
    objectType: number;
    meshes: MeshObject[];
    bodies: any[];
  }[];
}

export interface MapQueryParams {
  lat: number;
  lon: number;
  zoom: number;
  heading: number;
  tilt: number;
}
