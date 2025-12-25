import apiClient from '../apiClient';
import type {
    IncidentsResponse,
    IncidentDetailResponse,
    IncidentFilters,
    Place
} from '../types/issues.types';

const issuesService = {
    getIncidents: async (filters?: IncidentFilters): Promise<IncidentsResponse> => {
        try {
            const params = new URLSearchParams();

            if (filters?.limit) params.append('limit', filters.limit.toString());
            if (filters?.page) params.append('page', filters.page.toString());
            if (filters?.search) params.append('search', filters.search);
            if (filters?.placeId) params.append('placeId', filters.placeId.toString());
            if (filters?.status !== undefined) params.append('status', filters.status.toString());

            const response = await apiClient.get<IncidentsResponse>(
                `/incident?${params.toString()}`
            );

            return response.data;
        } catch (error: any) {
            console.error('Error fetching incidents:', error);
            throw error;
        }
    },

    /**
     * Lấy chi tiết một incident
     */
    getIncidentById: async (incidentId: number): Promise<IncidentDetailResponse> => {
        try {
            const response = await apiClient.get<IncidentDetailResponse>(
                `/incident/${incidentId}`
            );

            return response.data;
        } catch (error: any) {
            console.error('Error fetching incident detail:', error);
            throw error;
        }
    },

    /**
     * Lấy thông tin địa điểm theo placeId
     */
    getPlaceById: async (placeId: number): Promise<Place> => {
        try {
            const response = await apiClient.get<Place>(
                `/places/${placeId}`
            );

            return response.data;
        } catch (error: any) {
            console.error('Error fetching place detail:', error);
            throw error;
        }
    },
};

export default issuesService;