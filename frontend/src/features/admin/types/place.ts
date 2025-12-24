export type Place = {
  //formdata, bổ sung thêm tỉnh, quận huyện, xã phườn
  placeId: number;
  name: string;
  description?: string;
  address?: string;
  image?: string;
  openTime?: string;
  closeTime?: string;
  phone?: string;
  created_at: string;
  boundary?: {
    geom: any;
  };
  province?: string;
  district?: string;
  ward?: string;
};

export interface PlaceCreateRequest {
  name: string;
  description?: string;
  address?: string;
  image?: string;
  openTime?: string;
  closeTime?: string;
  phone?: string;
  boundaryGeom: {
    type: 'Polygon'
    coordinates: number[][][]
  }
}

export type PlaceCreateRequestWithFile = PlaceCreateRequest & {
  imageFile?: File | null;
};

export type PlaceDraft = Partial<PlaceCreateRequest> & {
  province?: string;
  district?: string;
  ward?: string;
};


export interface GetPlaceResponse {
  data: Place[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
}

export type PlaceUpdateRequest = {
  name?: string;
  description?: string;
  address?: string;
  image?: string;
  open_time?: string;
  close_time?: string;
  boundary?: {
    geom: any;
  };
};

export const mockPlace: Place[] = [
  {
    image: "https://fptshop.com.vn/tin-tuc/danh-gia/hoc-phi-uit-2025-176136",
    name: "UIT",
    place_id: 1,
    created_at: "21/04/2025",
    address: "số 1, Linh Trung, Thủ Đức, TP. Hồ Chí Minh",
    open_time: "08:00",
    close_time: "22:00",
    phone: "0123456789",
  },
  {
    image: "https://fptshop.com.vn/tin-tuc/danh-gia/hoc-phi-uit-2025-176136",
    name: "USSH",
    place_id: 2,
    created_at: "21/04/2025",
    address: "Số 6 Hàn Thuyên",
    open_time: "08:00",
    close_time: "22:00",
    phone: "0123456789",
  },
  {
    image: "https://fptshop.com.vn/tin-tuc/danh-gia/hoc-phi-uit-2025-176136",
    name: "UIS",
    place_id: 3,
    created_at: "21/04/2025",
    address: "Số 6 Hàn Thuyên",
    open_time: "08:00",
    close_time: "22:00",
    phone: "0123456789",
  },
  {
    image: "https://fptshop.com.vn/tin-tuc/danh-gia/hoc-phi-uit-2025-176136",
    name: "UT",
    place_id: 4,
    created_at: "21/04/2025",
    address: "Số 6 Hàn Thuyên",
    open_time: "08:00",
    close_time: "22:00",
    phone: "0123456789",
  },
  {
    image: "https://fptshop.com.vn/tin-tuc/danh-gia/hoc-phi-uit-2025-176136",
    name: "Tòa E - UIT",
    place_id: 5,
    created_at: "21/04/2025",
    address: "Số 6 Hàn Thuyên",
    open_time: "08:00",
    close_time: "22:00",
    phone: "0123456789",
  },
  {
    image: "https://fptshop.com.vn/tin-tuc/danh-gia/hoc-phi-uit-2025-176136",
    name: "Tòa A - UIT",
    place_id: 6,
    created_at: "21/04/2025",
    address: "Số 6 Hàn Thuyên",
    open_time: "08:00",
    close_time: "22:00",
    phone: "0123456789",
  },
  {
    image: "https://fptshop.com.vn/tin-tuc/danh-gia/hoc-phi-uit-2025-176136",
    name: "Tòa B - UIT",
    place_id: 7,
    created_at: "21/04/2025",
    address: "Số 6 Hàn Thuyên",
    open_time: "08:00",
    close_time: "22:00",
    phone: "0123456789",
  },
  {
    image: "https://fptshop.com.vn/tin-tuc/danh-gia/hoc-phi-uit-2025-176136",
    name: "Nhà văn hóa SV",
    place_id: 8,
    created_at: "21/04/2025",
    address: "Số 6 Hàn Thuyên",
    open_time: "08:00",
    close_time: "22:00",
    phone: "0123456789",
  },
  {
    image: "https://fptshop.com.vn/tin-tuc/danh-gia/hoc-phi-uit-2025-176136",
    name: "KTX khu A",
    place_id: 9,
    created_at: "21/04/2025",
    address: "Số 6 Hàn Thuyên",
    open_time: "08:00",
    close_time: "22:00",
    phone: "0123456789",
  },
];
