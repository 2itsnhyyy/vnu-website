import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { News, NewsUpdateRequest } from "../../types/news";
import PageMeta from "../../components/Common/PageMeta";
import { Save, UploadCloudIcon } from "lucide-react";
import { GrFormPrevious } from "react-icons/gr";
import { Link } from "react-router-dom";
import { newsService } from "../../services/NewsService";
import MDEditor, { type ICommand } from "@uiw/react-md-editor";
import apiClient from "../../../users/api/apiClient";

export default function EditNews() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [news, setNews] = useState<News | null>(null);
  const [formData, setFormData] = useState<NewsUpdateRequest>({});
  const [files, setFiles] = useState<File[]>([]);
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (id) loadNews(Number(id));
  }, [id]);

  const loadNews = async (newsId: number) => {
    setLoading(true);
    try {
      const data = await newsService.getById(newsId);
      setNews(data);
      setFormData({
        title: data.title,
        contentMarkdown: data.contentMarkdown,
      });
    } catch (err) {
      console.error("Load post failed", err);
      setNews(null);
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
    if (!id) return;

    try {
      setLoading(true);

      if (files.length > 0) {
        const uploadedImages = await uploadImages(files);
        const imagesMarkdown = uploadedImages
          .map((img: { url: any }) => `![image](${img.url})`)
          .join("\n");
        formData.contentMarkdown += `\n${imagesMarkdown}`;
      }

      const updated = await newsService.update(Number(id), {
        title: formData.title,
        contentMarkdown: formData.contentMarkdown,
      });
      console.log("Updated news:", updated);
      navigate("/admin/news");
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

            <div
              ref={editorRef}
              className="border border-gray-300 rounded-lg p-2"
            >
              <MDEditor
                value={formData.contentMarkdown}
                onChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    contentMarkdown: value || "",
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
                          contentMarkdown:
                            prev.contentMarkdown + `\n![image](${url})\n`,
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
              type="submit"
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
