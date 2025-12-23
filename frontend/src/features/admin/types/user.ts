export type UserRole = 0 | 1;

export interface User {
  userId: number;
  name: string;
  avatar: string;
  email: string;
  birthday: string;
  role: UserRole;
}

export interface GetUsersResponse {
  users: User[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}
