export interface Incident {
  incidentId: number;
  title: string;
  content: string;
  placeId: number;
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

export const mockIncidents: Incident[] = [
  {
    incidentId: 1,
    title: "Mạng Wi-Fi bị gián đoạn",
    content:
      "Nhân viên tại tầng 5 báo cáo mạng Wi-Fi chập chờn, không thể truy cập hệ thống nội bộ.",
    status: 0,
    placeId: 1,
    createdAt: "2025-01-10",
    updatedAt: "2025-01-10",
  },
  {
    incidentId: 2,
    title: "Không đăng nhập được vào hệ thống HR",
    content:
      "Một số nhân viên không thể đăng nhập vào hệ thống quản lý nhân sự để chấm công.",
    status: 1,
    placeId: 1,
    createdAt: "2025-01-12",
    updatedAt: "2025-01-12",
  },
  {
    incidentId: 3,
    title: "Máy in bị lỗi tại văn phòng 3F",
    content:
      "Máy in chung tại khu vực 3F không nhận lệnh in và hiển thị lỗi kết nối.",
    status: 1,
    placeId: 1,
    createdAt: "2025-01-14",
    updatedAt: "2025-01-14",
  },
  {
    incidentId: 4,
    title: "Laptop bị nóng bất thường",
    content:
      "Thiết bị của nhân viên tự động tắt nguồn do nhiệt độ cao và tiếng quạt lớn.",
    status: 0,
    placeId: 1,
    createdAt: "2025-01-18",
    updatedAt: "2025-01-18",
  },
  {
    incidentId: 5,
    title: "VPN không kết nối được",
    content:
      "Nhân viên làm việc từ xa báo cáo không thể kết nối VPN để truy cập server nội bộ.",
    status: 1,
    placeId: 1,
    createdAt: "2025-01-20",
    updatedAt: "2025-01-20",
  },
];
