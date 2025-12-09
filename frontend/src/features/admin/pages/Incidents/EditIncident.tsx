import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Incident, IncidentUpdateRequest } from "../../types/incident";
import { mockIncidents } from "../../types/incident";
import PageMeta from "../../components/Common/PageMeta";
import { Save } from "lucide-react";
import { GrFormPrevious } from "react-icons/gr";
import JoditEditor from "jodit-react";
import { Link } from "react-router-dom";

export default function EditIncident() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [incident, setIncident] = useState<Incident | null>(null);
  const [formData, setFormData] = useState<IncidentUpdateRequest>({});

  const editor = useRef(null);

  useEffect(() => {
    if (id) loadIncident(Number(id));
  }, [id]);

  const loadIncident = async (incidentId: number) => {
    setLoading(true);
    const found = mockIncidents.find((i) => i.incidentId === incidentId);

    setTimeout(() => {
      if (found) {
        setIncident(found);
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
      navigate("/admin/incidents");
    } catch (error) {
      console.error("Error updating incident:", error);
      alert("Có lỗi xảy ra khi cập nhật sự cố");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    console.log("Draft saved:", formData);
  };

  const numberFields = ["status", "price", "quantity"];

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

  if (loading && !incident) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Đang tải thông tin sự cố...</div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-600">Không tìm thấy sự cố</div>
      </div>
    );
  }

  return (
    <div>
      <PageMeta
        title={`Chỉnh sửa ${incident.title} | Admin Dashboard`}
        description="Chỉnh sửa thông tin sự cố"
      />

      <div className="mb-6 flex items-center cursor-pointer">
        <Link to="/admin/incidents">
          <GrFormPrevious className="w-6 h-6 mr-2 my-auto" />
        </Link>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90 ">
          Chỉnh sửa sự cố
        </h2>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 dark:border-gray-800">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500/20 focus:border-base-500 outline-0"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ngày tạo
              </label>
              <input
                type="date"
                name="createdAt"
                value={incident.createdAt || ""}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500/20 focus:border-base-500 outline-0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tình trạng <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={String(formData.status ?? "")}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500/20 focus:border-base-500 outline-0"
              >
                <option value="">Chọn danh mục</option>
                <option value="0">Mới</option>
                <option value="1">Đã giải quyết</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
