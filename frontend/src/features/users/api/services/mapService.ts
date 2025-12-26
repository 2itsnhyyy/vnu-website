import axios from "axios";
import type { Building, PathResponse } from "../types/map.types";

const API_BASE = "http://localhost:3000/api";

export const mapService = {
  // Lấy danh sách building dựa trên vị trí camera
  getBuildings: async (
    lat: number,
    lon: number,
    zoom: number,
    heading: number,
    tilt: number
  ): Promise<Building[]> => {
    const res = await axios.get(`${API_BASE}/building/map`, {
      params: { lat, lon, zoom, heading, tilt },
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
      params: { fromPlaceId: fromId, toPlaceId: toId, includeGeometry: true },
    });
    return res.data;
  },

  // Lấy danh sách địa điểm để tra cứu (hỗ trợ search theo tên)
  searchPlaces: async (name: string): Promise<any[]> => {
    const res = await axios.get(`${API_BASE}/places`, {
      params: { search: name, page: 1, limit: 10 },
    });
    return res.data.data; // Trả về mảng places từ PlaceService
  },

  getPlace: async (placeId: number): Promise<any> => {
    const res = await axios.get(`${API_BASE}/places/${placeId}`);
    return res.data;
  },

  // Lấy tất cả places với geometry để render trên map
  getAllPlaces: async (): Promise<any[]> => {
    const res = await axios.get(`${API_BASE}/places`, {
      params: { page: 1, limit: 50, includeGeometry: true },
    });
    return res.data.data;
  },
};

export default mapService;
