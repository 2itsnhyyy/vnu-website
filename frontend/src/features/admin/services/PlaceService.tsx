import api from "./api";
import type {
  Place,
  GetPlaceResponse,
  PlaceUpdateRequest
} from "../types/place";

export const placeService = {
  getAll(page = 1, limit = 10): Promise<GetPlaceResponse> {
    return api
      .get("/places", {
        params: { page, limit },
      })
      .then((res) => res.data);
  },

  getById(id: number): Promise<Place> {
    return api.get(`/places/${id}`).then((res) => res.data.place);
  },

  create(data: Place): Promise<Place> {
    return api.post("/places", data).then((res) => res.data.place);
  },

  update(id: number, data: PlaceUpdateRequest): Promise<Place> {
    return api.patch(`/places/${id}`, data).then((res) => res.data.place);
  },

  delete(id: number): Promise<{ success: boolean; message: string }> {
    return api.delete(`/places/${id}`).then((res) => res.data.place);
  },
};