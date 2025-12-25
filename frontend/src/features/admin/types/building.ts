export type Building = {
  buildingId: number;
  name: string;
  description?: string;
  floors?: number;
  image?: string;
  place_id: number;
  created_at: string;
}

export interface BuildingFormData {
  name: string;
  description?: string;
  floors: number;
  place_id: number;
  image?: string;
  modelFile?: File;
  modelFileName?: string;
  modelUrl?: string;
  latitude?: number;
  longitude?: number;
  modelScale?: number;
  modelRotation?: number;
}


export interface Pagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  limit: number;
}

export interface GetAllBuildingParams {
  page?: number;
  limit?: number;
  placeId?: number;
  search?: string;
  minFloors?: number;
  maxFloors?: number;
}

export interface GetAllBuildingResponse {
  pagination: Pagination;
  buildings: Building[]; 
}

/* =======================
   BUILDING REQUEST
======================= */

export interface CreateBuildingRequest {
  name: string;
  description?: string;
  floors: number;
  image: string;
  placeId: number;
  objects3d: Building3DObject[];
}

/* =======================
   OBJECT TYPE (NO ENUM)
======================= */

export const Object3DType = {
  Mesh: 0,
  Geometry: 1,
} as const;

export type Object3DType =
  (typeof Object3DType)[keyof typeof Object3DType];

/* =======================
   UNION OBJECT
======================= */

export type Building3DObject =
  | Mesh3DObject
  | Geometry3DObject;

/* =======================
   MESH OBJECT (objectType = 0)
======================= */

export interface Mesh3DObject {
  objectType: typeof Object3DType.Mesh;
  meshes: Mesh3D[];
}

export interface Mesh3D {
  meshUrl: string;
  point: GeoJSONPoint;
  rotate: number;
  scale: number;
}

/* =======================
   GEOMETRY OBJECT (objectType = 1)
======================= */

export interface Geometry3DObject {
  objectType: typeof Object3DType.Geometry;
  body: GeometryBody;
}

export interface GeometryBody {
  name: string;
  prisms: Prism[];
}

export interface Prism {
  baseFace: GeoJSONPolygon;
  height: number;
}

/* =======================
   GEO JSON
======================= */

export interface GeoJSONPoint {
  type: "Point";
  coordinates: [number, number, number];
}

export interface GeoJSONPolygon {
  type: "Polygon";
  coordinates: number[][][][];
}



