"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Upload, message } from "antd"
import { InboxOutlined } from "@ant-design/icons"
import type { UploadFile } from "antd/es/upload/interface"
import type { BuildingFormData } from "../../../types/building"
import type { UploadProps } from "antd"

const { Dragger } = Upload

interface Step2Props {
  initialData: Partial<BuildingFormData>
  onNext: (data: Partial<BuildingFormData>) => void
  onBack: () => void
}

const Step2: React.FC<Step2Props> = ({ initialData, onNext, onBack }) => {
  const [fileList, setFileList] = useState<UploadFile[]>([])

  // TODO: Xóa useEffect này khi đã có backend thật để xử lý upload file
  useEffect(() => {
    const testFile: UploadFile = {
      uid: "test-model",
      name: "test-building.glb",
      status: "done",
      url: "./model/UITglbnew.glb",
    }
    setFileList([testFile])
  }, [])

  const uploadProps: UploadProps = {
    name: "file",
    multiple: false,
    accept: ".glb",
    beforeUpload: (file) => {
      const isGLB = file.name.endsWith(".glb")
      if (!isGLB) {
        message.error("Chỉ chấp nhận file .glb!")
        return false
      }
      const isLt50M = file.size / 1024 / 1024 < 50
      if (!isLt50M) {
        message.error("File phải nhỏ hơn 50MB!")
        return false
      }
      // TODO: Khi có backend, return true để upload file lên server
      return false // Prevent auto upload (chưa có backend)
    },
    onChange(info) {
      const newFileList = info.fileList.slice(-1)
      setFileList(newFileList)

      if (info.file.status === "done") {
        message.success(`${info.file.name} tải lên thành công.`)
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} tải lên thất bại.`)
      }
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files)
    },
    fileList: fileList,
  }

  const handleSubmit = () => {
    if (fileList.length === 0) {
      message.warning("Vui lòng tải lên file mô hình 3D (.glb)")
      return
    }

    const modelFile = fileList[0]
    // TODO: Khi có backend, gửi file lên server và lưu URL trả về vào modelUrl
    onNext({
      ...initialData,
      modelFile: modelFile.originFileObj, // File object (chưa upload lên server)
      modelFileName: modelFile.name,
      modelUrl: modelFile.url || "./UITglbnew.glb", // Tạm dùng test file
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <div className="max-w-3xl mx-auto">

        {/* Upload Area */}
        <div className="mb-6">
          <label className="block text-lg font-medium mb-4">File mô hình 3D (.glb)</label>
          <Dragger {...uploadProps} className="mb-4">
            <p className="ant-upload-drag-icon">
              <InboxOutlined style={{ fontSize: 48, color: "#1890ff" }} />
            </p>
            <p className="ant-upload-text text-lg">Nhấp hoặc kéo thả file vào khu vực này</p>
          </Dragger>

        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-blue-900 mb-2">Lưu ý:</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>File phải ở định dạng .glb (GL Transmission Format Binary)</li>
            <li>Kích thước file tối đa: 50MB</li>
            <li>Mô hình sẽ được hiển thị trên bản đồ ở bước tiếp theo</li>
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
          className="flex items-center gap-2 bg-primary hover:bg-primary-light hover:cursor-pointer text-white font-medium px-5 py-2 rounded-md transition"
        >
          <span>Bước tiếp theo</span>
        </button>
        </div>
      </div>
    </div>
  )
}

export default Step2
