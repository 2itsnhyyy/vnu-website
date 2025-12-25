export type Place = {
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

export interface BelongToPlaceOption {
  placeId: number
  name: string
}