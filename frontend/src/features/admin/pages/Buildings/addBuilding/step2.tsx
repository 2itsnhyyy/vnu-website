"use client"

import type React from "react"
import { useState } from "react"
import { Upload, message, Checkbox } from "antd"
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
  const [enableDraw, setEnableDraw] = useState(true)
  const [enableUpload, setEnableUpload] = useState(false)
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
      
      // Do not store in localStorage; keep file in uploader state and upload on submit
      message.success("Đã chọn file .glb")
      
      return false // Prevent auto upload
    },
    onChange(info) {
      const newFileList = info.fileList.slice(-1)
      setFileList(newFileList)
    },
    onRemove: (file) => {
      setFileList([])
      message.info("Đã xóa file")
    },
    fileList: fileList,
  }

  const handleSubmit = () => {
    if (!enableDraw && !enableUpload) {
      message.warning("Vui lòng chọn ít nhất 1 phương thức")
      return
    }

    if (enableUpload && fileList.length === 0) {
      message.warning("Vui lòng tải lên file mô hình 3D")
      return
    }

    const modelFile = fileList.length > 0 ? fileList[0] : undefined
    
    onNext({
      ...initialData,
      enableDraw: enableDraw,
      enableUpload: enableUpload,
      modelFile: modelFile?.originFileObj,
      modelFileName: modelFile?.name,
      useLocalStorage: true,
    })
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200  p-8">
      <div className="max-w-3xl mx-auto">
        {/* Method Selection */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Draw Option */}
          <div 
            className={`border-2 rounded-lg p-4 cursor-pointer transition ${
              enableDraw 
                ? 'border-primary bg-blue-50' 
                : 'border-gray-300 hover:border-blue-400'
            }`}
            onClick={() => { setEnableDraw(!enableDraw); if (!enableDraw) setEnableUpload(false) }}
          >
            <div className="flex items-start gap-3">
                <Checkbox 
                checked={enableDraw} 
                onChange={(e) => { setEnableDraw(e.target.checked); if (e.target.checked) setEnableUpload(false) }}
                onClick={(e) => e.stopPropagation()}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-lg text-primary">Vẽ khối hình 3D</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Vẽ đa giác trên bản đồ bằng cách <br />chấm tọa độ
                </p>
              </div>
            </div>
          </div>

          {/* Upload Option */}
          <div 
            className={`border-2 rounded-lg p-4 cursor-pointer transition ${
              enableUpload 
                ? 'border-primary bg-blue-50' 
                : 'border-gray-300 hover:border-blue-400'
            }`}
            onClick={() => { setEnableUpload(!enableUpload); if (!enableUpload) setEnableDraw(false) }}
          >
            <div className="flex items-start gap-3">
              <Checkbox 
                checked={enableUpload} 
                onChange={(e) => { setEnableUpload(e.target.checked); if (e.target.checked) setEnableDraw(false) }}
                onClick={(e) => e.stopPropagation()}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-lg text-primary">Upload file .glb</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Tải lên file mô hình 3D có sẵn để sử dụng
                </p>
                <ul className="text-sm text-gray-500 space-y-1 ml-4">
                  <li>• File .glb có kích thước tối đa 10MB</li>
                  <li>• Phù hợp cho model phức tạp</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Area - Show if upload enabled */}
        {enableUpload && (
          <>
            <div className="mb-6">
              <Dragger {...uploadProps} showUploadList={false} className="mb-4">
                <p className="ant-upload-drag-icon">
                  <InboxOutlined style={{ fontSize: 48, color: "#1890ff" }} />
                </p>
                <p className="ant-upload-text text-lg">Nhấp hoặc kéo thả file vào khu vực này để tải lên</p>
                <p className="ant-upload-hint">Hỗ trợ: .glb (tối đa 10MB)</p>
              </Dragger>

              {fileList.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 border border-primary rounded-lg">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-primary font-medium">File đã tải lên: {fileList[0].name}</span>
                  </div>
                  <p className="text-sm text-primary mt-1 ml-7">
                    Kích thước: {((fileList[0].size || 0) / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>
          </>
        )}


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