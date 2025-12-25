import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Post, PostEditRequest } from "../../types/post";
import PageMeta from "../../components/Common/PageMeta";
import { Save, UploadCloudIcon } from "lucide-react";
import { GrFormPrevious } from "react-icons/gr";
import { Link } from "react-router-dom";
import { forumService } from "../../services/ForumService";
import MDEditor, { type ICommand } from "@uiw/react-md-editor";
import apiClient from "../../../users/api/apiClient";

export default function EditPost() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [post, setPost] = useState<Post | null>(null);
  const [formData, setFormData] = useState<PostEditRequest>({});
  const [files, setFiles] = useState<File[]>([]);
  const editorRef = useRef<HTMLDivElement | null>(null);

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

      await forumService.update(Number(id), {
        title: formData.title,
        contentMarkdown: formData.contentMarkdown,
      });

      navigate("/admin/forum");
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
              Tiêu đề <span className="text-red-500">*</span>
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
              Nội dung chi tiết <span className="text-red-500">*</span>
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
