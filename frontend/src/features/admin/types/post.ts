export interface Post {
  postId: number;
  title: string;
  author: {
    userId: number;
    name: string;
  };
  createdAt: string;
  updatedAt?: string;
  contentMarkdown: string;
}

export interface GetPostsResponse {
  posts: Post[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

export type PostUpdateRequest = {
  title?: string;
  author?: string;
  content?: string;
};

export const posts: Post[] = [
  {
    postId: 1,
    title: "Tầm quan trọng của sức khỏe tinh thần trong cuộc sống hiện đại",
    author: {
      userId: 1,
      name: "Admin",
    },
    createdAt: "2025-01-05",
    contentMarkdown:
      "Sức khỏe tinh thần đóng vai trò rất quan trọng trong cuộc sống. Trong môi trường học tập và làm việc...",
  },
  {
    postId: 2,
    title: "5 cách giảm căng thẳng hiệu quả cho sinh viên",
    author: {
      userId: 1,
      name: "Admin",
    },
    createdAt: "2025-01-07",
    contentMarkdown:
      "Căng thẳng là vấn đề phổ biến ở sinh viên. Trong bài viết này, chúng ta sẽ tìm hiểu 5 phương pháp...",
  },
];
