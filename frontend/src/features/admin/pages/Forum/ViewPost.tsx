import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import type { Post } from "../../types/post";
import PageMeta from "../../components/Common/PageMeta";
import { GrFormPrevious } from "react-icons/gr";
import { forumService } from "../../services/ForumService";
import dayjs from "dayjs";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ViewPost() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [post, setPost] = useState<Post | null>(null);

  useEffect(() => {
    if (id) loadPost(Number(id));
    console.log(id);
  }, [id]);

  const loadPost = async (postId: number) => {
    setLoading(true);
    try {
      const data = await forumService.getById(postId);
      setPost(data);
    } catch (err) {
      console.error("Load post failed", err);
      setPost(null);
    } finally {
      setLoading(false);
    }
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
                value={post.author.name || ""}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500/20 focus:border-base-500 outline-0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="text"
                name="email"
                value={post.author.email || ""}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500/20 focus:border-base-500 outline-0"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày tạo
              </label>
              <input
                type="date"
                name="createdAt"
                value={
                  post.createdAt
                    ? dayjs(post.createdAt).format("YYYY-MM-DD")
                    : ""
                }
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500/20 focus:border-base-500 outline-0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày cập nhật
              </label>
              <input
                type="date"
                name="updatedAt"
                value={
                  post.updatedAt
                    ? dayjs(post.updatedAt).format("YYYY-MM-DD")
                    : ""
                }
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500/20 focus:border-base-500 outline-0"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nội dung chi tiết
            </label>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-[400px] overflow-auto">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {post.contentMarkdown || ""}
              </ReactMarkdown>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
