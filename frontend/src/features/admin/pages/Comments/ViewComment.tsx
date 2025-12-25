import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import PageMeta from "../../components/Common/PageMeta";
import { GrFormPrevious } from "react-icons/gr";
import dayjs from "dayjs";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { commentService } from "../../services/CommentService";
import type { Comment } from "../../types/comment";
import { userService } from "../../services/UserService";
import type { User } from "../../types/user";

export type CommentRaw = Omit<Comment, "author"> & {
  author: number;
};
export interface CommentView extends Omit<CommentRaw, "author"> {
  author: User;
}

export default function ViewComment() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState<CommentView | null>(null);

  useEffect(() => {
    if (id) loadComment(Number(id));
  }, [id]);

  const loadComment = async (commentId: number) => {
    setLoading(true);
    try {
      const raw = await commentService.getById(commentId);
      const user = await userService.getById(raw.author);

      const view: CommentView = {
        ...raw,
        author: user,
      };

      setComment(view);
    } catch (err) {
      console.error("Load comment failed", err);
      setComment(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !comment) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (!comment) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-600">Không tìm thấy bài đăng</div>
      </div>
    );
  }

  return (
    <div>
      <PageMeta
        title={`Chỉnh sửa ${comment.content} | Admin Dashboard`}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tác giả
              </label>
              <input
                type="text"
                name="author"
                value={comment.author.name || ""}
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
                value={comment.author.email || ""}
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
                type="text"
                name="createdAt"
                value={
                  comment.createdAt
                    ? dayjs(comment.createdAt).format("DD/MM/YYYY")
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
                type="text"
                name="updatedAt"
                value={
                  comment.updatedAt
                    ? dayjs(comment.updatedAt).format("DD/MM/YYYY")
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
                {comment.content || ""}
              </ReactMarkdown>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
