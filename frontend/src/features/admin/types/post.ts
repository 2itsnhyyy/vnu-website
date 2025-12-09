export type Post = {
  postId: number;
  title: string;
  author: string;
  createdAt: string;
  content: string;
};

export type PostUpdateRequest = {
  title?: string;
  author?: string;
  content?: string;
};

export const posts: Post[] = [
  {
    postId: 1,
    title: "Tầm quan trọng của sức khỏe tinh thần trong cuộc sống hiện đại",
    author: "Admin",
    createdAt: "2025-01-05",
    content:
      "Sức khỏe tinh thần đóng vai trò rất quan trọng trong cuộc sống. Trong môi trường học tập và làm việc...",
  },
  {
    postId: 2,
    title: "5 cách giảm căng thẳng hiệu quả cho sinh viên",
    author: "Nguyễn Minh",
    createdAt: "2025-01-07",
    content:
      "Căng thẳng là vấn đề phổ biến ở sinh viên. Trong bài viết này, chúng ta sẽ tìm hiểu 5 phương pháp...",
  },
  {
    postId: 3,
    title: "Hướng dẫn thiền cơ bản dành cho người mới bắt đầu",
    author: "Trần Đỗ Phương Nhi",
    createdAt: "2025-01-08",
    content:
      "Thiền giúp cải thiện sự tập trung và giảm lo âu. Đây là hướng dẫn cơ bản dành cho người mới...",
  },
  {
    postId: 4,
    title: "Hướng dẫn thiền cơ bản dành cho người mới bắt đầu",
    author: "Trần Đỗ Phương Nhi",
    createdAt: "2025-01-08",
    content:
      "Thiền giúp cải thiện sự tập trung và giảm lo âu. Đây là hướng dẫn cơ bản dành cho người mới...",
  },
  {
    postId: 5,
    title: "Hướng dẫn thiền cơ bản dành cho người mới bắt đầu",
    author: "Trần Đỗ Phương Nhi",
    createdAt: "2025-01-08",
    content:
      "Thiền giúp cải thiện sự tập trung và giảm lo âu. Đây là hướng dẫn cơ bản dành cho người mới...",
  },
  {
    postId: 6,
    title: "Hướng dẫn thiền cơ bản dành cho người mới bắt đầu",
    author: "Trần Đỗ Phương Nhi",
    createdAt: "2025-01-08",
    content:
      "Thiền giúp cải thiện sự tập trung và giảm lo âu. Đây là hướng dẫn cơ bản dành cho người mới...",
  },
  {
    postId: 7,
    title: "Hướng dẫn thiền cơ bản dành cho người mới bắt đầu",
    author: "Trần Đỗ Phương Nhi",
    createdAt: "2025-01-08",
    content:
      "Thiền giúp cải thiện sự tập trung và giảm lo âu. Đây là hướng dẫn cơ bản dành cho người mới...",
  },
  {
    postId: 8,
    title: "Hướng dẫn thiền cơ bản dành cho người mới bắt đầu",
    author: "Trần Đỗ Phương Nhi",
    createdAt: "2025-01-08",
    content:
      "Thiền giúp cải thiện sự tập trung và giảm lo âu. Đây là hướng dẫn cơ bản dành cho người mới...",
  },
];
