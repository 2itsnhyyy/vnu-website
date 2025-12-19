import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Post, PostUpdateRequest } from "../../types/post";
import { posts as mockPosts } from "../../types/post";
import PageMeta from "../../components/Common/PageMeta";
import { Save } from "lucide-react";
import { GrFormPrevious } from "react-icons/gr";
import JoditEditor from "jodit-react";
import { Link } from "react-router-dom";

export default function EditPost() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [post, setPost] = useState<Post | null>(null);
  const [formData, setFormData] = useState<PostUpdateRequest>({});

  const editor = useRef(null);

  useEffect(() => {
    if (id) loadPost(Number(id));
  }, [id]);

  const loadPost = async (postId: number) => {
    setLoading(true);
    const found = mockPosts.find((p) => p.postId === postId);

    setTimeout(() => {
      if (found) {
        setPost(found);
        setFormData(found);
      }
      setLoading(false);
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      setLoading(true);
      navigate("/admin/forum");
    } catch (error) {
      console.error("Error updating post:", error);
      alert("Có lỗi xảy ra khi cập nhật bài đăng");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    console.log("Draft saved:", formData);
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                Tác giả
                <span className="text-red-500">
                  <span className="text-red-500">*</span>
                </span>
              </label>
              <input
                type="text"
                name="author"
                value={formData.author || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-300 outline-0"
              />
            </div>
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
                value={formData.content || ""}
                onChange={(newContent) => {
                  setFormData((prev) => ({
                    ...prev,
                    content: newContent,
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
              onClick={handleSaveDraft}
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
