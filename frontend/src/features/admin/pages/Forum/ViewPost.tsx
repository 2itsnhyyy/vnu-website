import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import type { Post } from "../../types/post";
import { posts as mockPosts } from "../../types/post";
import PageMeta from "../../components/Common/PageMeta";
import { GrFormPrevious } from "react-icons/gr";

export default function ViewPost() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [post, setPost] = useState<Post | null>(null);

  useEffect(() => {
    if (id) loadNews(Number(id));
  }, [id]);

  const loadNews = (postId: number) => {
    setLoading(true);

    const found = mockPosts.find((p) => p.postId === postId);

    setTimeout(() => {
      if (found) {
        setPost(found);
      }
      setLoading(false);
    }, 300);
  };

  if (loading && !post) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-600">Không tìm thấy bài đăng</div>
      </div>
    );
  }

  return (
    <div>
      <PageMeta
        title={`Chỉnh sửa ${post.title} | Admin Dashboard`}
        description="Chỉnh sửa thông tin bài đăng"
      />

      <div className="mb-6 flex items-center">
        <Link to="/admin/forum">
          <GrFormPrevious className="w-6 h-6 mr-2 my-auto" />
        </Link>
        <h2 className="text-xl font-semibold text-gray-800">Xem bài đăng</h2>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề
            </label>
            <input
              type="text"
              name="title"
              value={post.title || ""}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500/20 focus:border-base-500 outline-0"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tác giả
              </label>
              <input
                type="text"
                name="author"
                value={post.author}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500/20 focus:border-base-500 outline-0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày tạo
              </label>
              <input
                type="date"
                name="createdAt"
                value={post.createdAt || ""}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500/20 focus:border-base-500 outline-0"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nội dung chi tiết
            </label>

            <textarea
              name="content"
              value={post.content || ""}
              disabled
              rows={9}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-base-500/20 focus:border-base-500 outline-0"
            ></textarea>
          </div>
        </form>
      </div>
    </div>
  );
}
