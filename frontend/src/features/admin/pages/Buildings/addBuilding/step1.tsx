import type React from "react";
import { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Upload,
  Select,
  message,
  InputNumber,
} from "antd";
import {
  SmileOutlined,
  BoldOutlined,
  ItalicOutlined,
  UnorderedListOutlined,
  OrderedListOutlined,
  LinkOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { Spin } from "antd";
import type { UploadFile, UploadProps } from "antd";
import type { BuildingFormData } from "../../../types/building";
import { placeService } from "../../../services/PlaceService";
import type { BelongToPlaceOption } from "../../../types/place";

const { TextArea } = Input;
const { Dragger } = Upload;

interface Step1Props {
  initialData: Partial<BuildingFormData>;
  onNext: (data: Partial<BuildingFormData>) => void;
}

const place = [
  { value: 1, label: "Trường Đại học Công nghệ Thông tin" },
  { value: 2, label: "Trường Đại học Khoa học Xã hội và Nhân văn" },
  { value: 3, label: "Trường Đại học Khoa học Tự nhiên" },
];

const Step1: React.FC<Step1Props> = ({ initialData, onNext }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [description, setDescription] = useState(initialData.description || "");
  const [belongToPlaceOption, setBelongToPlaceOption] = useState<
    BelongToPlaceOption[]
  >([]);
  const [fetching, setFetching] = useState(false);

  const fetchBelongToPlaceOption = async (search?: string) => {
    setFetching(true);
    try {
      const res = await placeService.getAll(1, 10, search);
      setBelongToPlaceOption(res.data);
    } finally {
      setFetching(false);
    }
  };

  const uploadProps: UploadProps = {
    name: "file",
    multiple: false,
    accept: "image/*",
    beforeUpload: (file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error("Chỉ được tải lên file hình ảnh!");
        return false;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error("Hình ảnh phải nhỏ hơn 5MB!");
        return false;
      }
      return false; // Prevent auto upload
    },
    onChange(info) {
      const newFileList = info.fileList.slice(-1); // Only keep the last file
      setFileList(newFileList);

      if (info.file.status === "done") {
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
    fileList: fileList,
  };


  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (!values.place_id) {
        message.warning("Vui lòng chọn địa điểm trực thuộc");
        return;
      }

      // Get image file if exists
      const imageFile = fileList[0]?.originFileObj;

      onNext({
        name: values.name,
        description: description,
        floors: values.floors,
        place_id: values.place_id,
        imageFile: imageFile, // Save File object instead of URL
      });
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <Form form={form} layout="vertical" initialValues={initialData}>
        {/* Image Upload */}
        <div className="flex flex-row mb-6 justify-between gap-8">
          <div className="flex-1">
            <label className="block text-lg font-medium mb-2">
              Hình ảnh tòa nhà
            </label>
            <p className="text-md text-justify text-gray-500 mb-4">
              Hình ảnh này sẽ được hiển thị công khai. Chỉ được tải lên 1 ảnh.
            </p>
          </div>

          <div className="flex-1">
            <Dragger {...uploadProps} style={{ maxWidth: "400px" }}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Nhấp hoặc kéo thả ảnh vào khu vực này
              </p>
              <p className="ant-upload-hint">
                Hỗ trợ: PNG, JPG, SVG (tối đa 5MB)
              </p>
            </Dragger>
          </div>
        </div>

        <hr className="col-span-2 my-6 border-gray-300" />

        <div className="grid grid-cols-2 gap-8">
          {/* Left Column */}
          <div>
            {/* Details Section */}
            <div className="mb-6">
              <label className="block text-lg font-medium mb-2">
                Chi tiết tòa nhà
              </label>
              <p className="text-md text-gray-500 mb-4 text-justify">
                Giới thiệu về tòa nhà của bạn đến người dùng bằng cách điền vào
                những ô bên cạnh
              </p>
            </div>
          </div>

          {/* Right Column */}
          <div>
            {/* Building Name */}
            <Form.Item
              name="name"
              label="Tên tòa nhà"
              rules={[{ required: true, message: "Vui lòng nhập tên tòa nhà" }]}
            >
              <Input placeholder="Nhập tên tòa nhà" size="large" />
            </Form.Item>

            {/* Belong to Place */}
            <Form.Item
              name="place_id"
              label="Địa điểm trực thuộc"
              rules={[{ required: true, message: "Vui lòng chọn địa điểm trực thuộc" }]}
            >
              <Select
                showSearch
                placeholder="Tìm địa điểm..."
                filterOption={false} // ❗ BẮT BUỘC
                onSearch={fetchBelongToPlaceOption} // gọi API khi gõ
                onFocus={() => fetchBelongToPlaceOption()}
                notFoundContent={fetching ? <Spin size="small" /> : null}
                options={belongToPlaceOption.map((p) => ({
                  label: p.name,
                  value: p.placeId,
                }))}
              />
            </Form.Item>

            {/* Number of Floors */}
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
              <InputNumber
                placeholder="Nhập số tầng"
                size="large"
                style={{ width: "100%" }}
                min={1}
              />
            </Form.Item>
          </div>

          <hr className="col-span-2 border-gray-300" />

          {/* General Description */}
          <div>
            <label className="block text-lg font-medium mb-2">
              Giới thiệu chung
            </label>
            <p className="text-md text-gray-500 mb-4 text-justify">
              Viết đoạn giới thiệu ngắn về tòa nhà của bạn
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
                  <Button
                    type="text"
                    size="small"
                    icon={<UnorderedListOutlined />}
                  />
                  <Button
                    type="text"
                    size="small"
                    icon={<OrderedListOutlined />}
                  />
                  <Button type="text" size="small" icon={<LinkOutlined />} />
                </div>
                <span className="text-xs text-gray-500">
                  {description.length} / 10000
                </span>
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
  );
};

export default Step1;
