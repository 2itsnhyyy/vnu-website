import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import type { NewsCreateRequest } from "../../types/news";
import PageMeta from "../../components/Common/PageMeta";
import { Save } from "lucide-react";
import MDEditor from "@uiw/react-md-editor";
import { Link } from "react-router-dom";
import { GrFormPrevious } from "react-icons/gr";
import { newsService } from "../../services/NewsService";

export default function CreateNews() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<NewsCreateRequest>({
    title: "",
    contentMarkdown: "",
  });

  const editor = useRef(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.contentMarkdown) {
      alert("Vui lòng nhập đầy đủ tiêu đề và nội dung");
      return;
    }

    try {
      setLoading(true);
      const created = await newsService.create(formData);
      console.log("Created news:", created);
      navigate("/admin/news");
    } catch (error) {
      console.error("Error creating news:", error);
      alert("Có lỗi xảy ra khi tạo tin tức");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageMeta
        title="Tạo tin tức | Admin Dashboard"
        description="Tạo mới tin tức"
      />

      <div className="mb-6 flex items-center cursor-pointer">
        <Link to="/admin/news">
          <GrFormPrevious className="w-6 h-6 mr-2 my-auto" />
        </Link>
        <h2 className="text-xl font-semibold text-gray-800">Tạo tin tức mới</h2>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              placeholder="Thông báo khẩn cấp..."
              value={formData.title || ""}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-300 outline-0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nội dung chi tiết <span className="text-red-500">*</span>
            </label>
            <div className="border border-gray-300 rounded-lg p-2">
              <MDEditor
                value={formData.contentMarkdown}
                onChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    contentMarkdown: value || "",
                  }))
                }
              />
            </div>
          </div>

          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={() => navigate("/admin/news")}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 cursor-pointer"
            >
              Hủy
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 bg-[#1D4ED8] text-white rounded-lg hover:bg-blue-600 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              {loading ? "Đang tạo..." : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
