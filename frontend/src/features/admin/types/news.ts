export interface News {
  newsId: number;
  title: string;
  contentMarkdown: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetNewsResponse {
  news: News[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

export interface NewsUpdateRequest {
  title?: string;
  contentMarkdown?: string;
}

export interface NewsCreateRequest {
  title: string;
  contentMarkdown: string;
}
