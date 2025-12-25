import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { PostCreateRequest } from "../../types/post";
import PageMeta from "../../components/Common/PageMeta";
import { Save, UploadCloudIcon } from "lucide-react";
import MDEditor, { type ICommand } from "@uiw/react-md-editor";
import { Link } from "react-router-dom";
import { GrFormPrevious } from "react-icons/gr";
import { forumService } from "../../services/ForumService";
import apiClient from "../../../users/api/apiClient";

export default function CreatePost() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PostCreateRequest>({
    title: "",
    contentMarkdown: "",
  });
  const [files, setFiles] = useState<File[]>([]);
  const editorRef = useRef<HTMLDivElement>(null); // dùng để gắn paste event

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    if (!formData.title || !formData.contentMarkdown) {
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
        formData.contentMarkdown += `\n${imagesMarkdown}`;
      }

      await forumService.create(formData);
      navigate("/admin/forum");
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi tạo bài đăng");
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

        const formData = new FormData();
        formData.append("files", file);

        try {
          const response = await apiClient.post(
            "/cloudinary/upload",
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
            }
          );
          const url = response.data[0].url;
          api.replaceSelection(`![image](${url})`);
        } catch (err) {
          console.error(err);
          alert("Upload ảnh thất bại");
        }
      };

      input.click();
    },
  };

  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (!file) continue;
          try {
            const response = await uploadImages([file]);
            const url = response[0].url;
            setFormData((prev) => ({
              ...prev,
              contentMarkdown: prev.contentMarkdown + `\n![image](${url})\n`,
            }));
          } catch (err) {
            console.error(err);
            alert("Upload ảnh từ clipboard thất bại");
          }
        }
      }
    };

    const editorDiv = editorRef.current;
    editorDiv?.addEventListener("paste", handlePaste as any);
    return () => editorDiv?.removeEventListener("paste", handlePaste as any);
  }, []);

  return (
    <div>
      <PageMeta
        title="Tạo bài đăng | Admin Dashboard"
        description="Tạo mới bài đăng"
      />

      <div className="mb-6 flex items-center cursor-pointer">
        <Link to="/admin/forum">
          <GrFormPrevious className="w-6 h-6 mr-2 my-auto" />
        </Link>
        <h2 className="text-xl font-semibold text-gray-800">
          Tạo bài đăng mới
        </h2>
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
              placeholder="Bài đăng mới..."
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
            <div
              className="border border-gray-300 rounded-lg p-2"
              ref={editorRef}
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
              />
            </div>
          </div>

          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={() => navigate("/admin/forum")}
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
