export interface Building {
    buildingId: number;
    name: string;
    description: string | null;
    floors: number;
    image: string | null;
    placeId: number;
}

export interface Entrance {
    entranceId: number;
    name: string;
    nearestJunction: number;
    placeId: number;
}

export interface BoundaryGeom {
    type: string;
    coordinates: number[][][];
}

export interface Place {
    placeId: number;
    name: string;
    description: string;
    address: string;
    image: string;
    openTime: string;
    closeTime: string;
    phone: string;
    buildings: Building[];
    entrances: Entrance[];
    boundaryGeom: BoundaryGeom;
}

export interface Incident {
    incidentId: number;
    title: string;
    content: string;
    placeId: number;
    status: number; 
    createdAt: string;
    updatedAt: string;
}

export interface PaginationInfo {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    limit: number;
}

export interface IncidentsResponse {
    pagination: PaginationInfo;
    incidents: Incident[];
}

export interface IncidentDetailResponse {
    incident: Incident;
}

export interface IncidentFilters {
    limit?: number;
    page?: number;
    search?: string;
    placeId?: number;
    status?: number;
}

export type IncidentStatus = 'pending' | 'resolved';

export const INCIDENT_STATUS = {
    PENDING: 0,
    RESOLVED: 1,
} as const;

export const getCategoryFromTitle = (title: string): string => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('điện')) return 'Mất điện';
    if (lowerTitle.includes('nước')) return 'Cúp nước';
    if (lowerTitle.includes('sửa chữa')) return 'Đang sửa chữa';
    return 'Khác';
};