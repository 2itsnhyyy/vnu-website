import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import type { IncidentUpdateRequest } from "../../types/incident";
import PageMeta from "../../components/Common/PageMeta";
import { Save } from "lucide-react";
import JoditEditor from "jodit-react";
import { Link } from "react-router-dom";
import { GrFormPrevious } from "react-icons/gr";

export default function CreateIncident() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<IncidentUpdateRequest>({});
  const editor = useRef(null);

  const numberFields = ["status"];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: numberFields.includes(name) ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      console.log("Created Incident:", formData);

      navigate("/admin/incidents");
    } catch (error) {
      console.error("Error creating incident:", error);
      alert("Có lỗi xảy ra khi tạo sự cố");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageMeta
        title="Tạo sự cố mới | Admin Dashboard"
        description="Tạo mới sự cố"
      />

      <div className="mb-6 flex items-center cursor-pointer">
        <Link to="/admin/incidents">
          <GrFormPrevious className="w-6 h-6 mr-2 my-auto" />
        </Link>
        <h2 className="text-xl font-semibold text-gray-800">Tạo sự cố mới</h2>
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
              placeholder="Cúp điện..."
              value={formData.title || ""}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500/20 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tình trạng <span className="text-red-500">*</span>
            </label>
            <select
              name="status"
              value={String(formData.status ?? "")}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500/20 outline-none"
            >
              <option value="">Chọn tình trạng</option>
              <option value="0">Mới</option>
              <option value="1">Đã giải quyết</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nội dung chi tiết <span className="text-red-500">*</span>
            </label>
            <div className="border border-gray-300 rounded-lg p-2">
              <JoditEditor
                ref={editor}
                value={formData.content || ""}
                onChange={(newContent) =>
                  setFormData((prev) => ({ ...prev, content: newContent }))
                }
              />
            </div>
          </div>

          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={() => navigate("/admin/incidents")}
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
