import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type {
  Incident,
  IncidentStatus,
  IncidentUpdateRequest,
} from "../../types/incident";
import PageMeta from "../../components/Common/PageMeta";
import { Save } from "lucide-react";
import { GrFormPrevious } from "react-icons/gr";
import { Link } from "react-router-dom";
import { incidentService } from "../../services/IncidentService";
import type { Place } from "../../types/place";
import { placeService } from "../../services/PlaceService";

export default function EditIncident() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [incident, setIncident] = useState<Incident | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [formData, setFormData] = useState<IncidentUpdateRequest>({});
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadPlaces();
  }, []);

  const loadPlaces = async () => {
    try {
      const data = await placeService.getAll();
      setPlaces(data.data);
    } catch (err) {
      console.error("Load places failed", err);
    }
  };

  useEffect(() => {
    if (id) loadPost(Number(id));
  }, [id]);

  const loadPost = async (incidentId: number) => {
    setLoading(true);
    try {
      const data = await incidentService.getById(incidentId);
      setIncident(data);
      setFormData({
        title: data.title,
        content: data.content,
        placeId: data.place.placeId,
        status: data.status,
      });
    } catch (err) {
      console.error("Load incident failed", err);
      setIncident(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      setLoading(true);
      const updated = await incidentService.update(Number(id), {
        title: formData.title,
        content: formData.content,
        placeId: formData.placeId,
        status: formData.status,
      });
      console.log("Updated incident:", updated);
      navigate("/admin/incidents");
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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "status" || name === "placeId" ? Number(value) : value,
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
        <h2 className="text-xl font-semibold text-gray-800">Chỉnh sửa sự cố</h2>
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
              Tình trạng <span className="text-red-500">*</span>
            </label>
            <select
              name="status"
              value={String(formData.status ?? "")}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-300 outline-0"
            >
              <option value="">Chọn danh mục</option>
              <option value={0}>Mới</option>
              <option value={1}>Đã giải quyết</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Địa điểm <span className="text-red-500">*</span>
            </label>

            <select
              name="placeId"
              value={formData.placeId ?? ""}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">-- Chọn địa điểm --</option>

              {places.map((place) => (
                <option key={place.placeId} value={place.placeId}>
                  {place.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nội dung chi tiết
              <span className="text-red-500">
                <span className="text-red-500">*</span>
              </span>
            </label>

            <div className="border border-gray-300 rounded-lg p-2">
              <textarea
                className="w-full p-2"
                name="content"
                value={formData.content || ""}
                onChange={handleChange}
                rows={4}
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
