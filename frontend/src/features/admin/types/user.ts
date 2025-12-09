export type User = {
  userId: number;
  name: string;
  avatar: string;
  email: string;
  birthday: string;
  role: number;
  createdAt: string;
};

export const mockUsers: User[] = [
  {
    userId: 1,
    name: "Nguyễn Văn An",
    avatar:
      "https://maunailxinh.com/wp-content/uploads/2025/05/anh-meo-ngao-cute-1.jpg",
    email: "an.nguyen@example.com",
    birthday: "1999-04-15",
    role: 1,
    createdAt: "2024-02-01 09:30:00",
  },
  {
    userId: 2,
    name: "Trần Đỗ Phương Nhi",
    avatar:
      "https://maunailxinh.com/wp-content/uploads/2025/05/anh-meo-ngao-cute-1.jpg",
    email: "phuong.nhi@example.com",
    birthday: "2003-06-21",
    role: 1,
    createdAt: "2024-05-10 14:20:00",
  },
  {
    userId: 3,
    name: "Lê Minh Khoa",
    avatar:
      "https://maunailxinh.com/wp-content/uploads/2025/05/anh-meo-ngao-cute-1.jpg",
    email: "khoa.le@example.com",
    birthday: "1998-12-02",
    role: 0,
    createdAt: "2024-06-18 08:55:00",
  },
  {
    userId: 4,
    name: "Phạm Ngọc Hân",
    avatar:
      "https://maunailxinh.com/wp-content/uploads/2025/05/anh-meo-ngao-cute-1.jpg",
    email: "ngoc.han@example.com",
    birthday: "2000-09-09",
    role: 0,
    createdAt: "2024-07-12 10:15:00",
  },
  {
    userId: 5,
    name: "Đỗ Thành Trung",
    avatar:
      "https://maunailxinh.com/wp-content/uploads/2025/05/anh-meo-ngao-cute-1.jpg",
    email: "thanh.trung@example.com",
    birthday: "1997-03-30",
    role: 1,
    createdAt: "2024-03-05 16:40:00",
  },
];
