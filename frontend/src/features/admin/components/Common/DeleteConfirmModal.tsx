import React from "react";
import { message } from "antd";

interface DeleteConfirmModalProps {
  open: boolean;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
  loading?: boolean;
  title: string;
  description: string;
  successMessage?: string;
  errorMessage?: string;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  open,
  onConfirm,
  onCancel,
  loading = false,
  title,
  description,
  successMessage = "Xóa thành công!",
  errorMessage = "Xóa thất bại. Vui lòng thử lại!",
}) => {
  const handleConfirm = async () => {
    const hide = message.loading("Đang xóa...", 0);
    try {
      await onConfirm();
      hide();
      message.success(successMessage);
    } catch (error) {
      hide();
      message.error(errorMessage);
      console.error("Delete error:", error);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={!loading ? onCancel : undefined}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 p-5">
        <div className="text-center">
          {/* Warning Icon */}
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-semibold mb-4 text-gray-900">{title}</h3>

          {/* Description */}
          <p className="text-sm text-gray-600 leading-relaxed mb-8">
            {description}
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 hover:cursor-pointer"
            >
              Xóa
            </button>
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-gray-700 font-medium py-3 px-6 rounded-lg border border-gray-300 transition-colors duration-200 hover:cursor-pointer"
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;