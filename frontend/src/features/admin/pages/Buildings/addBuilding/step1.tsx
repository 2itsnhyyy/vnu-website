"use client"

import type React from "react"
import { useState } from "react"
import { Form, Input, Button, Upload, Select, message, InputNumber } from "antd"
import {
  SmileOutlined,
  BoldOutlined,
  ItalicOutlined,
  UnorderedListOutlined,
  OrderedListOutlined,
  LinkOutlined,
  InboxOutlined,
} from "@ant-design/icons"
import type { UploadFile } from "antd/es/upload/interface"
import type { BuildingFormData } from "../../../types/building"
import type { UploadProps } from "antd"

const { TextArea } = Input
const { Dragger } = Upload

const props: UploadProps = {
  name: "file",
  multiple: true,
  action: "https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload",
  onChange(info) {
    const { status } = info.file
    if (status !== "uploading") {
      console.log(info.file, info.fileList)
    }
    if (status === "done") {
      message.success(`${info.file.name} file uploaded successfully.`)
    } else if (status === "error") {
      message.error(`${info.file.name} file upload failed.`)
    }
  },
  onDrop(e) {
    console.log("Dropped files", e.dataTransfer.files)
  },
}

interface Step1Props {
  initialData: Partial<BuildingFormData>
  onNext: (data: Partial<BuildingFormData>) => void
}

const place = [
  { value: 1, label: "Trường Đại học Công nghệ Thông tin" },
  { value: 2, label: "Trường Đại học Khoa học Xã hội và Nhân văn" },
  { value: 3, label: "Trường Đại học Khoa học Tự nhiên" },
]

const Step1: React.FC<Step1Props> = ({ initialData, onNext }) => {
  const [form] = Form.useForm()
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [description, setDescription] = useState(initialData.description || "")
  const [selectedPlaceId, setSelectedPlaceId] = useState<number | undefined>(initialData.place_id)

  const handleUploadChange = (info: any) => {
    setFileList(info.fileList.slice(-1))
    if (info.file.status === "done") {
      message.success("Upload thành công")
    }
  }

  const handlePlaceChange = (value: number) => {
    setSelectedPlaceId(value)
  }

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const imageUrl = fileList[0]?.url || fileList[0]?.thumbUrl || ""
      onNext({
        name: values.name,
        description: description,
        image: imageUrl,
        floors: values.floors,
        place_id: selectedPlaceId,
      })
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <Form form={form} layout="vertical" initialValues={initialData}>
        {/* Image Upload */}
        <div className="flex flex-row mb-6 justify-between">
          <div>
            <label className="block text-lg font-medium mb-2">Hình ảnh tòa nhà</label>
            <p className="text-md w-50 text-justify text-gray-500 mb-4">
              Hình ảnh này sẽ được hiển thị công khai. Chỉ được tải lên 1 ảnh.
            </p>
          </div>

          <Dragger {...props}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Nhấp hoặc kéo thả ảnh vào khu vực này</p>
            <p className="ant-upload-hint">Hỗ trợ tải một ảnh (PNG, JPG, SVG, tối đa 400×400px)</p>
          </Dragger>
        </div>

        <hr className="col-span-2 my-6 border-gray-300" />

        <div className="grid grid-cols-2 gap-8">
          {/* Left Column */}
          <div>
            {/* Details Section */}
            <div className="mb-6">
              <label className="block text-lg font-medium mb-2">Chi tiết tòa nhà</label>
              <p className="text-md text-gray-500 mb-4 w-50 text-justify">
                Giới thiệu về tòa nhà của bạn đến người dùng bằng cách điền vào những ô bên cạnh
              </p>
            </div>
          </div>
          {/* Right Column */}
          <div>
            {/* Place Name */}
            <Form.Item
              name="name"
              label="Tên tòa nhà"
              rules={[{ required: true, message: "Vui lòng nhập tên tòa nhà" }]}
            >
              <Input placeholder="Nhập tên tòa nhà" size="large" />
            </Form.Item>

            {/* Belong to */}
            <Form.Item
              name="province"
              label="Trực thuộc địa điểm"
              rules={[{ required: true, message: "Vui lòng chọn địa điểm trực thuộc" }]}
            >
              <Select placeholder="Chọn địa điểm" size="large" onChange={handlePlaceChange} options={place} />
            </Form.Item>

            {/* Address Detail */}
            <Form.Item
              name="floors"
              label="Số tầng"
              rules={[
                {
                  required: true,
                  type: "number",
                  message: "Vui lòng nhập số tầng",
                },
              ]}
            >
              <InputNumber placeholder="Nhập số tầng" size="large" style={{ width: "25%" }} min={1} />
            </Form.Item>
          </div>

          <hr className="col-span-2 border-gray-300" />

          {/* General Description */}
          <div>
            <label className="block text-lg font-medium mb-2">Giới thiệu chung</label>
            <p className="text-md text-gray-500 mb-4 w-50 text-justify">
              Viết đoạn giới thiệu ngắn về địa điểm của bạn
            </p>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Mô tả</label>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <TextArea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Nhập mô tả..."
                rows={8}
                maxLength={10000}
                className="border-0 resize-none"
              />
              <div className="flex items-center justify-between px-3 py-2 border-t border-gray-300 bg-gray-50">
                <div className="flex gap-2">
                  <Button type="text" size="small" icon={<SmileOutlined />} />
                  <Button type="text" size="small" icon={<BoldOutlined />} />
                  <Button type="text" size="small" icon={<ItalicOutlined />} />
                  <Button type="text" size="small" icon={<UnorderedListOutlined />} />
                  <Button type="text" size="small" icon={<OrderedListOutlined />} />
                  <Button type="text" size="small" icon={<LinkOutlined />} />
                </div>
                <span className="text-xs text-gray-500">{description.length} / 10000</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Tối đa 10.000 ký tự</p>
          </div>
        </div>
      </Form>
      {/* Next Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          className="flex items-center gap-2 bg-primary hover:bg-primary-light hover:cursor-pointer text-white font-medium px-5 py-2 rounded-md transition"
        >
          <span>Bước tiếp theo</span>
        </button>
      </div>
    </div>
  )
}

export default Step1
