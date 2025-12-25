import api from "./api";
import type {
  Building,
  GetAllBuildingResponse,
  GetAllBuildingParams, 
  CreateBuildingRequest  
} from "../types/building";

export const buildingService = {
  getAll(params: GetAllBuildingParams = {}): Promise<GetAllBuildingResponse> {
    return api
      .get("/building", { params })
      .then(res => res.data);
  },

  getById(id: number): Promise<Building> {
    return api.get(`/building/${id}`).then((res) => res.data);
  },

  create(data: CreateBuildingRequest): Promise<any> {
    return api.post("/building", data).then((res) => res.data.place);
  },

  update(id: number, data: PlaceUpdateRequest): Promise<Place> {
    return api.patch(`/places/${id}`, data).then((res) => res.data.place);
  },

  delete(id: number): Promise<{ message: string }> {
    return api.delete(`/places/${id}`).then((res) => res.data);
  },
};