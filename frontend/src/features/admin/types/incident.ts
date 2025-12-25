import type { Place } from "./place";
export interface Incident {
  incidentId: number;
  title: string;
  content: string;
  place: Place;
  status: IncidentStatus;
  createdAt: string;
  updatedAt: string;
}

export type IncidentStatus = 0 | 1;

export interface IncidentCreateRequest {
  title: string;
  content: string;
  placeId: number;
  status: IncidentStatus;
}

export interface GetIncidentsResponse {
  incidents: Incident[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

export interface IncidentUpdateRequest {
  title?: string;
  content?: string;
  placeId?: number;
  status?: IncidentStatus;
}
