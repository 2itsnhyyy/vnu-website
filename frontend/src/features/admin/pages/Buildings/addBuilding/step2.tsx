import type React from "react"
import { useState } from "react"
import { Upload, message } from "antd"
import { InboxOutlined } from "@ant-design/icons"
import type { UploadFile, UploadProps } from "antd"
import type { BuildingFormData } from "../../../types/building"

const { Dragger } = Upload

interface Step2Props {
  initialData: Partial<BuildingFormData>
  onNext: (data: Partial<BuildingFormData>) => void
  onBack: () => void
}

const Step2: React.FC<Step2Props> = ({ initialData, onNext, onBack }) => {
  const [fileList, setFileList] = useState<UploadFile[]>([])

  const uploadProps: UploadProps = {
    name: "file",
    multiple: false,
    accept: ".glb,.gltf",
    beforeUpload: (file) => {
      const isGLB = file.name.endsWith(".glb") || file.name.endsWith(".gltf")
      if (!isGLB) {
        message.error("Chỉ chấp nhận file .glb hoặc .gltf!")
        return false
      }
      const isLt50M = file.size / 1024 / 1024 < 50
      if (!isLt50M) {
        message.error("File phải nhỏ hơn 50MB!")
        return false
      }
      return false // Prevent auto upload
    },
    onChange(info) {
      const newFileList = info.fileList.slice(-1) // Only keep the last file
      setFileList(newFileList)

      if (info.file.status === "done") {
        message.success(`${info.file.name} tải lên thành công.`)
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} tải lên thất bại.`)
      }
    },
    onRemove: () => {
      setFileList([])
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files)
    },
    fileList: fileList,
  }

  const handleSubmit = () => {
    if (fileList.length === 0) {
      message.warning("Vui lòng tải lên file mô hình 3D (.glb hoặc .gltf)")
      return
    }

    const modelFile = fileList[0]
    
    onNext({
      ...initialData,
      modelFile: modelFile.originFileObj, // Save File object
      modelFileName: modelFile.name,
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Tải lên mô hình 3D</h2>
          <p className="text-gray-500">Tải lên file mô hình 3D (.glb) của tòa nhà để hiển thị trên bản đồ</p>
        </div>

        {/* Upload Area */}
        <div className="mb-6">
          <label className="block text-lg font-medium mb-4">File mô hình 3D</label>
          <Dragger {...uploadProps} className="mb-4">
            <p className="ant-upload-drag-icon">
              <InboxOutlined style={{ fontSize: 48, color: "#1890ff" }} />
            </p>
            <p className="ant-upload-text text-lg">Nhấp hoặc kéo thả file vào khu vực này</p>
            <p className="ant-upload-hint">Hỗ trợ: .glb, .gltf (tối đa 50MB)</p>
          </Dragger>

          {/* Show selected file info */}
          {fileList.length > 0 && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-800 font-medium">File đã chọn: {fileList[0].name}</span>
              </div>
              <p className="text-sm text-green-600 mt-1">
                Kích thước: {((fileList[0].size || 0) / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-blue-900 mb-2">📌 Lưu ý quan trọng:</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>File phải ở định dạng .glb (GL Transmission Format Binary) hoặc .gltf</li>
            <li>Kích thước file tối đa: 50MB</li>
            <li>Mô hình sẽ được hiển thị trên bản đồ 3D</li>
            <li>Đảm bảo mô hình đã được tối ưu để tải nhanh</li>
            <li>Hệ tọa độ: Y-up (hướng lên trên)</li>
          </ul>
        </div>

        {/* Tips Box */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-gray-900 mb-2">💡 Mẹo:</h3>
          <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
            <li>Sử dụng Blender để tạo và export file .glb</li>
            <li>Nên scale mô hình về kích thước thực tế (đơn vị: mét)</li>
            <li>Bạn sẽ điều chỉnh vị trí và góc xoay ở bước tiếp theo</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-5 py-2 rounded-md transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Quay lại</span>
          </button>
          <button
            onClick={handleSubmit}
            disabled={fileList.length === 0}
            className={`flex items-center gap-2 font-medium px-5 py-2 rounded-md transition ${
              fileList.length === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-primary hover:bg-primary-light hover:cursor-pointer text-white"
            }`}
          >
            <span>Bước tiếp theo</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Step2