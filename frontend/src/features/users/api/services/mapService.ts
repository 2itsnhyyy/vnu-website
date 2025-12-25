import axios from 'axios';
import type { Building, PathResponse } from '../types/map.types';

const API_BASE = 'http://localhost:3000/api';

export const mapService = {
  // Lấy danh sách building dựa trên vị trí camera
  getBuildings: async (lat: number, lon: number, zoom: number): Promise<Building[]> => {
    const res = await axios.get(`${API_BASE}/building/map`, { 
      params: { lat, lon, zoom, heading: 0, tilt: 45 } 
    });
    return res.data.buildings;
  },

  // Lấy chi tiết building và các object 3D
  getBuildingDetail: async (id: number): Promise<Building> => {
    const res = await axios.get(`${API_BASE}/building/${id}`);
    return res.data.building;
  },

  // Tìm đường giữa 2 placeId
  findPath: async (fromId: number, toId: number): Promise<PathResponse> => {
    const res = await axios.get(`${API_BASE}/routing/find-path`, {
      params: { fromPlaceId: fromId, toPlaceId: toId, includeGeometry: true }
    });
    return res.data;
  }
};

export default mapService;
