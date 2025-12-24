import axios from 'axios';
import type { Building3D, MapQueryParams } from '../types/map.types';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/building`; 

export const mapService = {
  getBuildingsForMap: async (params: MapQueryParams) => {
    const { data } = await axios.get(`${API_URL}/map`, { params });
    return data; 
  },

  searchBuildings: async (search: string): Promise<Building3D[]> => {
    const { data } = await axios.get(API_URL, {
      params: { search, page: 1, limit: 10 }
    });
    return data.buildings; 
  },

  getBuildingById: async (id: number): Promise<{ building: Building3D }> => {
    const { data } = await axios.get(`${API_URL}/${id}`);
    return data;
  }
};

export default mapService;
