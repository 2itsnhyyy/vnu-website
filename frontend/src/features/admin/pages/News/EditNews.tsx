import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { News, NewsUpdateRequest } from "../../types/news";
import { mockNews } from "../../types/news";
import PageMeta from "../../components/Common/PageMeta";
import { Save } from "lucide-react";
import { GrFormPrevious } from "react-icons/gr";
import JoditEditor from "jodit-react";
import { Link } from "react-router-dom";

export default function EditNews() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [news, setNews] = useState<News | null>(null);
  const [formData, setFormData] = useState<NewsUpdateRequest>({});

  const editor = useRef(null);

  useEffect(() => {
    if (id) loadNews(Number(id));
  }, [id]);

  const loadNews = async (newsId: number) => {
    setLoading(true);
    const found = mockNews.find((n) => n.newsId === newsId);

    setTimeout(() => {
      if (found) {
        setNews(found);
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
      navigate("/admin/news");
    } catch (error) {
      console.error("Error updating news:", error);
      alert("Có lỗi xảy ra khi cập nhật tin tức");
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

  if (loading && !news) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Đang tải thông tin tin tức...</div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-600">Không tìm thấy tin tức</div>
      </div>
    );
  }

  return (
    <div>
      <PageMeta
        title={`Chỉnh sửa ${news.title} | Admin Dashboard`}
        description="Chỉnh sửa thông tin tin tức"
      />

      <div className="mb-6 flex items-center">
        <Link to="/admin/news">
          <GrFormPrevious className="w-6 h-6 mr-2 my-auto" />
        </Link>
        <h2 className="text-xl font-semibold text-gray-800">
          Chỉnh sửa tin tức
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
