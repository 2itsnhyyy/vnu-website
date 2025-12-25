import api from "./api";
import type {
  Incident,
  IncidentUpdateRequest,
  GetIncidentsResponse,
  IncidentCreateRequest,
} from "../types/incident";

export const incidentService = {
  getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<GetIncidentsResponse> {
    return api
      .get("/incident", {
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          search: params?.search,
        },
      })
      .then((res) => res.data);
  },

  getById(id: number): Promise<Incident> {
    return api.get(`/incident/${id}`).then((res) => res.data.incident);
  },

  create(data: IncidentCreateRequest): Promise<Incident> {
    return api.post("/incident", data).then((res) => res.data.incident);
  },

  update(id: number, data: IncidentUpdateRequest): Promise<Incident> {
    return api.patch(`/incident/${id}`, data).then((res) => res.data.incident);
  },

  delete(id: number): Promise<{ success: boolean; message: string }> {
    return api.delete(`/incident/${id}`).then((res) => res.data.incident);
  },
};
