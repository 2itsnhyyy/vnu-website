import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Incident, IncidentUpdateRequest } from "../../types/incident";
import PageMeta from "../../components/Common/PageMeta";
import { Save, UploadCloudIcon } from "lucide-react";
import { GrFormPrevious } from "react-icons/gr";
import { Link } from "react-router-dom";
import { incidentService } from "../../services/IncidentService";
import type { Place } from "../../types/place";
import { placeService } from "../../services/PlaceService";
import MDEditor, { type ICommand } from "@uiw/react-md-editor";
import apiClient from "../../../users/api/apiClient";

export default function EditIncident() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [incident, setIncident] = useState<Incident | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [formData, setFormData] = useState<IncidentUpdateRequest>({});
  const [files, setFiles] = useState<File[]>([]);
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
        placeId: data.placeId,
        status: data.status,
      });
    } catch (err) {
      console.error("Load incident failed", err);
      setIncident(null);
    } finally {
      setLoading(false);
    }
  };

  const uploadImages = async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    const response = await apiClient.post("/cloudinary/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.title ||
      !formData.content ||
      formData.placeId == null ||
      formData.status == null
    ) {
      alert("Vui lòng nhập đầy đủ tiêu đề và nội dung");
      return;
    }

    try {
      setLoading(true);

      if (files.length > 0) {
        const uploadedImages = await uploadImages(files);
        const imagesMarkdown = uploadedImages
          .map((img: { url: any }) => `![image](${img.url})`)
          .join("\n");
        formData.content += `\n${imagesMarkdown}`;
      }

      const updated = await incidentService.update(Number(id), {
        title: formData.title,
        content: formData.content,
        placeId: formData.placeId,
        status: formData.status,
      });
      console.log("Updated incident:", updated);
      navigate("/admin/incidents");
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi cập nhật bài đăng");
    } finally {
      setLoading(false);
    }
  };

  const insertImageCommand: ICommand = {
    name: "insert-image",
    keyCommand: "insert-image",
    buttonProps: { "aria-label": "Insert image" },
    icon: <UploadCloudIcon className="w-4 h-4" />,
    execute: async (state, api) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";

      input.onchange = async () => {
        if (!input.files?.length) return;
        const file = input.files[0];
        try {
          const response = await uploadImages([file]);
          const url = response[0].url;
          api.replaceSelection(`![image](${url})`);
        } catch (err) {
          console.error(err);
          alert("Upload ảnh thất bại");
        }
      };

      input.click();
    },
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
              Nội dung chi tiết <span className="text-red-500">*</span>
            </label>
            <div
              ref={editorRef}
              className="border border-gray-300 rounded-lg p-2"
            >
              <MDEditor
                value={formData.content}
                onChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    content: value || "",
                  }))
                }
                extraCommands={[insertImageCommand]}
                textareaProps={{
                  onPaste: async (
                    e: React.ClipboardEvent<HTMLTextAreaElement>
                  ) => {
                    const items = e.clipboardData.items;
                    for (let i = 0; i < items.length; i++) {
                      const item = items[i];
                      if (!item.type.startsWith("image/")) continue;
                      const file = item.getAsFile();
                      if (!file) continue;
                      try {
                        const response = await uploadImages([file]);
                        const url = response[0].url;
                        setFormData((prev) => ({
                          ...prev,
                          content: prev.content + `\n![image](${url})\n`,
                        }));
                      } catch (err) {
                        console.error(err);
                        alert("Upload ảnh từ clipboard thất bại");
                      }
                    }
                  },
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
