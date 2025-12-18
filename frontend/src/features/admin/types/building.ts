export type Building = {
  building_id: number;
  name: string;
  description?: string;
  floors?: number;
  image?: string;
  place_id: number;
  created_at: string;
}

export type Object3D = {
  object_id?: number
  building_id: number
  object_type: 0 | 1 // 0: mesh, 1: sudm
}

export type Point = {
  point_id?: number
  geom: {
    type: "Point"
    coordinates: [number, number, number] // [longitude, latitude, altitude]
  }
}

export type MeshObject = {
  mesh_id?: number
  mesh_url: string
  point_id: number
  object_id: number
  rotate: number
  scale: number
}

export type BuildingFormData = {
  // Step 1: Building details
  name: string
  description?: string
  image?: string
  floors?: number
  place_id?: number

  // Step 2: 3D Model file
  modelFile?: File
  modelFileName?: string

  // Step 3: Position and model settings
  latitude?: number
  longitude?: number
  modelScale?: number
  modelRotation?: number
}

export const mockBuilding: Building[] = [
    {
      image: "https://fptshop.com.vn/tin-tuc/danh-gia/hoc-phi-uit-2025-176136",
      name: "UIT",
      building_id: 1,
      place_id: 1,
      created_at: "21/04/2025",
      floors: 12,
      description: "Tòa nhà chính của trường ĐH Công nghệ Thông tin",
    },
    {
      image: "https://fptshop.com.vn/tin-tuc/danh-gia/hoc-phi-uit-2025-176136",
      name: "USSH",
      building_id: 2,
      place_id: 2,
      created_at: "21/04/2025",
      floors: 12,
      description: "Tòa nhà chính của trường ĐH Công nghệ Thông tin",
    },
    {
      image: "https://fptshop.com.vn/tin-tuc/danh-gia/hoc-phi-uit-2025-176136",
      name: "UIS",
      building_id: 3,
      place_id: 3,
      created_at: "21/04/2025",
      floors: 12,
      description: "Tòa nhà chính của trường ĐH Công nghệ Thông tin",
    },
    {
      image: "https://fptshop.com.vn/tin-tuc/danh-gia/hoc-phi-uit-2025-176136",
      name: "UT",
      building_id: 4,
      place_id: 4,
      created_at: "21/04/2025",
      floors: 12,
      description: "Tòa nhà chính của trường ĐH Công nghệ Thông tin",
    },
    {
      image: "https://fptshop.com.vn/tin-tuc/danh-gia/hoc-phi-uit-2025-176136",
      name: "Tòa E - UIT",
      building_id: 5,
      place_id: 5,
      created_at: "21/04/2025",
      floors: 12,
      description: "Tòa nhà chính của trường ĐH Công nghệ Thông tin",
    },
    {
      image: "https://fptshop.com.vn/tin-tuc/danh-gia/hoc-phi-uit-2025-176136",
      name: "Tòa A - UIT",
      building_id: 6,
      place_id: 6,
      created_at: "21/04/2025",
      floors: 12,
      description: "Tòa nhà chính của trường ĐH Công nghệ Thông tin",
    },
    {
      image: "https://fptshop.com.vn/tin-tuc/danh-gia/hoc-phi-uit-2025-176136",
      name: "Tòa B - UIT",
      building_id: 7,
      place_id: 7,
      created_at: "21/04/2025",
      floors: 12,
      description: "Tòa nhà chính của trường ĐH Công nghệ Thông tin",
    },
    {
      image: "https://fptshop.com.vn/tin-tuc/danh-gia/hoc-phi-uit-2025-176136",
      name: "Nhà văn hóa SV",
      building_id: 8,
      place_id: 8,
      created_at: "21/04/2025",
      floors: 12,
      description: "Tòa nhà chính của trường ĐH Công nghệ Thông tin",
    },
    {
      image: "https://fptshop.com.vn/tin-tuc/danh-gia/hoc-phi-uit-2025-176136",
      name: "KTX khu A",
      building_id: 9,
      place_id: 9,
      created_at: "21/04/2025",
      floors: 12,
      description: "Tòa nhà chính của trường ĐH Công nghệ Thông tin",
    },
  ];
