import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Post, PostEditRequest } from "../../types/post";
import PageMeta from "../../components/Common/PageMeta";
import { Save } from "lucide-react";
import { GrFormPrevious } from "react-icons/gr";
import JoditEditor from "jodit-react";
import { Link } from "react-router-dom";
import { forumService } from "../../services/ForumService";

export default function EditPost() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [post, setPost] = useState<Post | null>(null);
  const [formData, setFormData] = useState<PostEditRequest>({});

  const editor = useRef(null);

  useEffect(() => {
    if (id) loadPost(Number(id));
  }, [id]);

  const loadPost = async (postId: number) => {
    setLoading(true);
    try {
      const data = await forumService.getById(postId);
      setPost(data);
      setFormData({
        title: data.title,
        contentMarkdown: data.contentMarkdown,
      });
    } catch (err) {
      console.error("Load post failed", err);
      setPost(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      setLoading(true);
      const updated = await forumService.update(Number(id), {
        title: formData.title,
        contentMarkdown: formData.contentMarkdown,
      });
      console.log("Updated post:", updated);
      navigate("/admin/forum");
    } catch (error: any) {
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error status:", error.response.status);
        console.error("Error headers:", error.response.headers);
        alert(`Có lỗi xảy ra: ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        console.error("No response received:", error.request);
        alert("Không nhận được phản hồi từ server");
      } else {
        console.error("Error message:", error.message);
        alert(`Lỗi: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading && !post) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Đang tải thông tin bài đăng...</div>
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
        <h2 className="text-xl font-semibold text-gray-800">
          Chỉnh sửa bài đăng
        </h2>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề
              <span className="text-red-500">
                <span className="text-red-500">*</span>
              </span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title || ""}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-300 outline-0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nội dung chi tiết
              <span className="text-red-500">
                <span className="text-red-500">*</span>
              </span>
            </label>

            <div className="border border-gray-300 rounded-lg p-2">
              <JoditEditor
                ref={editor}
                value={formData.contentMarkdown || ""}
                onChange={(newContent) => {
                  setFormData((prev) => ({
                    ...prev,
                    contentMarkdown: newContent,
                  }));
                }}
              />
            </div>
          </div>

          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={() => navigate("/admin/forum")}
              className="flex items-center gap-2 px-6 py-2 bg-gray-500/70 text-white rounded-lg hover:bg-gray-600/70 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex items-center gap-2 px-6 py-2 bg-[#1D4ED8] text-white rounded-lg hover:bg-blue-500 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              {loading ? "Đang cập nhật..." : "Cập nhật"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
