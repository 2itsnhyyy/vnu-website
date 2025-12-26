import api from "./api";
import type {
  Building,
  GetAllBuildingResponse,
  GetAllBuildingParams, 
  CreateBuildingRequest,
  UpdateBuildingRequest  
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
    return api.post("/building", data).then((res) => res.data);
  },

  update(id: number, data: UpdateBuildingRequest): Promise<any> {
    return api.patch(`/building/${id}`, data).then((res) => res.data);
  },

  delete(id: number): Promise<{ message: string }> {
    return api.delete(`/building/${id}`).then((res) => res.data);
  },
};