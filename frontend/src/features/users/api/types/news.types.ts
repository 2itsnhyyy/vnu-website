export interface News {
  newsId: number;
  title: string;
  contentMarkdown: string;
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  limit: number;
}

export interface NewsListResponse {
  pagination: Pagination;
  news: News[];
}

export interface NewsDetailResponse {
  news: News;
}