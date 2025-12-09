export type News = {
  newsId: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type NewsUpdateRequest = {
  title?: string;
  content?: string;
};

export const mockNews: News[] = [
  {
    newsId: 1,
    title: "Hệ thống bảo trì định kỳ trong tháng 12",
    content: `Hệ thống sẽ tiến hành bảo trì định kỳ vào 23:00 ngày 15/12 để nâng cấp hiệu năng và bảo mật. 
      Người dùng có thể bị gián đoạn truy cập trong thời gian này.Hệ thống sẽ tiến hành bảo trì định kỳ vào 23:00 ngày 15/12 để nâng cấp hiệu năng và bảo mật. 
      Người dùng có thể bị gián đoạn truy cập trong thời gian này. Hệ thống sẽ tiến hành bảo trì định kỳ vào 23:00 ngày 15/12 để nâng cấp hiệu năng và bảo mật. 
      Người dùng có thể bị gián đoạn truy cập trong thời gian nàyHệ thống sẽ tiến hành bảo trì định kỳ vào 23:00 ngày 15/12 để nâng cấp hiệu năng và bảo mật. 
      Người dùng có thể bị gián đoạn truy cập trong thời gian nàyHệ thống sẽ tiến hành bảo trì định kỳ vào 23:00 ngày 15/12 để nâng cấp hiệu năng và bảo mật. Người dùng có thể bị gián đoạn truy cập trong thời gian nàyHệ thống sẽ tiến hành bảo trì định kỳ vào 23:00 ngày 15/12 để nâng cấp hiệu năng và bảo mật. Người dùng có thể bị gián đoạn truy cập trong thời gian này `,
    createdAt: "2024-12-01",
    updatedAt: "2024-12-01",
  },
  {
    newsId: 2,
    title: "Ra mắt tính năng báo cáo sự cố",
    content:
      "Tính năng báo cáo sự cố trực tuyến đã được triển khai. Người dùng có thể gửi thông báo lỗi để hỗ trợ xử lý nhanh hơn.",
    createdAt: "2024-11-28",
    updatedAt: "2024-11-29",
  },
  {
    newsId: 3,
    title: "Nâng cấp giao diện trang quản trị",
    content:
      "Trang quản trị được nâng cấp với giao diện trực quan hơn, tối ưu cho mobile và tablet.",
    createdAt: "2024-11-20",
    updatedAt: "2024-11-21",
  },
  {
    newsId: 4,
    title: "Thông báo ngừng hỗ trợ API cũ",
    content:
      "API phiên bản 1.0 sẽ ngừng hỗ trợ từ ngày 31/12. Vui lòng chuyển sang phiên bản API 2.0 để đảm bảo tính ổn định.",
    createdAt: "2024-11-10",
    updatedAt: "2024-11-12",
  },
  {
    newsId: 5,
    title: "Tổ chức đào tạo nội bộ tháng 12",
    content:
      "Buổi đào tạo về an toàn thông tin sẽ được tổ chức vào ngày 12/12 cho toàn bộ nhân viên.",
    createdAt: "2024-12-02",
    updatedAt: "2024-12-02",
  },
  {
    newsId: 6,
    title: "Thông báo nghỉ lễ Tết Dương Lịch",
    content:
      "Công ty sẽ nghỉ lễ Tết Dương Lịch từ ngày 30/12 đến 01/01. Chúc mọi người kỳ nghỉ vui vẻ.",
    createdAt: "2024-12-05",
    updatedAt: "2024-12-05",
  },
];
