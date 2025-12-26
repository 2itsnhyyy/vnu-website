"use client";

import type React from "react";
import { useState, useRef } from "react";
import { Send, ArrowLeft, Image as ImageIcon } from "lucide-react";
import forumService from "../../api/services/forumService";
import { Modal } from "./utils/modal";

interface Props {
  navigate: any;
  isAuthenticated: boolean;
}

const CreatePostContent: React.FC<Props> = ({ navigate, isAuthenticated }) => {
  const [title, setTitle] = useState("");
  const [contentMarkdown, setContentMarkdown] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ===== Modal state =====
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    title?: string;
    message: string;
    type?: "info" | "success" | "error" | "warning" | "confirm";
    onConfirm?: () => void;
  }>({
    message: "",
  });

  const openModal = (config: typeof modalConfig) => {
    setModalConfig(config);
    setModalOpen(true);
  };
  // =======================

  const uploadToCloudinary = async (file: File) => {
    try {
      const data = await forumService.uploadImages([file]);
      return data[0];
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const insertImageMarkdown = (imageUrl: string, cursorPosition: number) => {
    const beforeCursor = contentMarkdown.substring(0, cursorPosition);
    const afterCursor = contentMarkdown.substring(cursorPosition);
    const imageMarkdown = `![image](${imageUrl})`;

    const newContent = beforeCursor + imageMarkdown + afterCursor;
    setContentMarkdown(newContent);

    setTimeout(() => {
      if (textareaRef.current) {
        const newPosition = cursorPosition + imageMarkdown.length;
        textareaRef.current.setSelectionRange(newPosition, newPosition);
        textareaRef.current.focus();
      }
    }, 0);
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.type.indexOf("image") !== -1) {
        e.preventDefault();

        const file = item.getAsFile();
        if (!file) continue;

        const uploadId = Date.now() + i;
        const cursorPosition =
          textareaRef.current?.selectionStart || contentMarkdown.length;

        setUploadingImages((prev) => [
          ...prev,
          { id: uploadId, name: file.name },
        ]);

        try {
          const uploadedImage = await uploadToCloudinary(file);
          setUploadingImages((prev) =>
            prev.filter((img) => img.id !== uploadId)
          );
          insertImageMarkdown(uploadedImage.url, cursorPosition);
        } catch (error) {
          openModal({
            title: "Lỗi upload",
            message: "Không thể upload ảnh. Vui lòng thử lại.",
            type: "error",
          });
          setUploadingImages((prev) =>
            prev.filter((img) => img.id !== uploadId)
          );
        }
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;

      const uploadId = Date.now() + i;
      const cursorPosition =
        textareaRef.current?.selectionStart || contentMarkdown.length;

      setUploadingImages((prev) => [
        ...prev,
        { id: uploadId, name: file.name },
      ]);

      try {
        const uploadedImage = await uploadToCloudinary(file);
        setUploadingImages((prev) => prev.filter((img) => img.id !== uploadId));
        insertImageMarkdown(uploadedImage.url, cursorPosition);
      } catch (error) {
        openModal({
          title: "Lỗi upload",
          message: "Không thể upload ảnh. Vui lòng thử lại.",
          type: "error",
        });
        setUploadingImages((prev) => prev.filter((img) => img.id !== uploadId));
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !contentMarkdown.trim()) {
      openModal({
        title: "Thiếu thông tin",
        message: "Vui lòng nhập đầy đủ tiêu đề và nội dung",
        type: "warning",
      });
      return;
    }

    try {
      setLoading(true);
      const res = await forumService.createPost({ title, contentMarkdown });
      const postId = res.post.postId;
      openModal({
        title: "Thành công",
        message: "Đăng bài thành công!",
        type: "success",
        onConfirm: () => navigate.toPost(postId),
      });
    } catch (error: any) {
      openModal({
        title: "Lỗi",
        message: error.message || "Có lỗi xảy ra",
        type: "error",
      });
      console.error("Error saving post:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (title || contentMarkdown) {
      openModal({
        title: "Xác nhận hủy",
        message: "Bạn có chắc muốn hủy? Các thay đổi sẽ không được lưu.",
        type: "confirm",
        onConfirm: () => navigate.toList(),
      });
    } else {
      navigate.toList();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-12 pt-8 pb-10">
      <button
        onClick={() => navigate.toList()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        <span className="text-sm font-medium">Quay lại</span>
      </button>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Tạo bài đăng mới
      </h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tiêu đề <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nhập tiêu đề bài đăng"
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nội dung <span className="text-red-500">*</span>
          </label>
          <textarea
            ref={textareaRef}
            value={contentMarkdown}
            onChange={(e) => setContentMarkdown(e.target.value)}
            onPaste={handlePaste}
            placeholder="Nhập nội dung bài đăng (hỗ trợ Markdown). Bạn có thể paste ảnh trực tiếp vào đây."
            className="w-full border border-gray-300 rounded-lg p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={15}
          />

          {uploadingImages.length > 0 && (
            <div className="mt-3 space-y-2">
              {uploadingImages.map((img) => (
                <div
                  key={img.id}
                  className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded"
                >
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                  <span>Đang upload {img.name}...</span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-3 flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm"
              disabled={loading}
            >
              <ImageIcon size={18} />
              Thêm ảnh
            </button>
            <span className="text-xs text-gray-500">
              Hoặc paste ảnh trực tiếp vào ô nhập nội dung
            </span>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={handleCancel}
            disabled={loading}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || uploadingImages.length > 0}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
            {loading ? "Đang xử lý..." : "Đăng bài"}
          </button>
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
      />
    </div>
  );
};

export default CreatePostContent;
