import type React from "react";
import { useState, useMemo, useEffect } from "react";
import debounce from "lodash/debounce";
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
  CloseOutlined,
} from "@ant-design/icons";
import { Spin } from "antd";
import type { UploadFile, UploadProps } from "antd";
import type { RcFile } from "antd/es/upload";
import type { BuildingFormData } from "../../../types/building";
import { placeService } from "../../../services/PlaceService";
import type { BelongToPlaceOption } from "../../../types/place";

const { TextArea } = Input;
const { Dragger } = Upload;

interface Step1Props {
  initialData: Partial<BuildingFormData>;
  onNext: (data: Partial<BuildingFormData>) => void;
  onBack?: () => void;
}

const Step1: React.FC<Step1Props> = ({ initialData, onNext, onBack }) => {
  const [form] = Form.useForm();
  const [searchValue, setSearchValue] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string>(initialData.image || "");
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
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

  const debouncedFetchPlace = useMemo(
    () => debounce(fetchBelongToPlaceOption, 300),
    []
  );

  // Fetch initial place options on mount
  useEffect(() => {
    fetchBelongToPlaceOption();
  }, []);

  // Sync form fields and ensure the current place is in options when initialData changes
  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        name: initialData.name,
        floors: initialData.floors,
        place_id: initialData.place_id,
      });
      setDescription(initialData.description || "");
      setPreviewUrl(initialData.image || "");
      console.log("Link ảnh:", previewUrl);

      if (initialData.place_id) {
        // Ensure the selected place is present in the options list
        placeService
          .getById(initialData.place_id)
          .then((place) => {
            setBelongToPlaceOption((prev) => {
              const exists = prev.some((p) => p.placeId === place.placeId);
              if (exists) return prev;
              return [{ placeId: place.placeId, name: place.name }, ...prev];
            });
          })
          .catch(() => {
            // ignore if fetch fails; user can search to refetch
          });
      }
    }
  }, [initialData]);

  const handleBeforeUpload = (file: RcFile) => {
    // Validate file type
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("Chỉ được tải lên file hình ảnh!");
      return Upload.LIST_IGNORE;
    }

    // Validate file size (max 10MB)
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error("Hình ảnh phải nhỏ hơn 10MB!");
      return Upload.LIST_IGNORE;
    }

    // Save file to state
    setImageFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Return false to prevent auto upload
    return false;
  };

  const handleRemoveImage = () => {
    setFileList([]);
    setImageFile(null);
    setPreviewUrl("");
  };

  const uploadProps: UploadProps = {
    name: "file",
    multiple: false,
    accept: "image/*",
    beforeUpload: handleBeforeUpload,
    fileList: [],
    showUploadList: false,
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (!values.place_id) {
        message.warning("Vui lòng chọn địa điểm trực thuộc");
        return;
      }

      onNext({
        name: values.name,
        description: description,
        floors: values.floors,
        place_id: values.place_id,
        imageFile: imageFile, // Use the imageFile state
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

            {/* Preview Image */}
            {previewUrl && (
              <div className="mt-4 border border-gray-300 rounded-lg overflow-hidden relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-64 object-cover"
                />
                <CloseOutlined
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 text-white bg-white bg-opacity-50 rounded-full p-1 cursor-pointer hover:bg-gray-300"
                  style={{ fontSize: 16 }}
                />
              </div>
            )}
          </div>

          <div className="flex-1">
            <Dragger {...uploadProps}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Nhấp hoặc kéo thả ảnh vào khu vực này
              </p>
              <p className="ant-upload-hint">
                Hỗ trợ: PNG, JPG, SVG (tối đa 10MB)
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
                Cập nhật thông tin về tòa nhà của bạn
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
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn địa điểm trực thuộc",
                },
              ]}
            >
              <Select
                size="large"
                showSearch
                searchValue={searchValue}
                placeholder="Tìm địa điểm..."
                filterOption={false}
                onSearch={(value) => {
                  setSearchValue(value);
                  debouncedFetchPlace(value);
                }}
                notFoundContent={
                  fetching ? <Spin size="small" /> : "Không có địa điểm phù hợp"
                }
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
                  type: "number",
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

      {/* Action Buttons */}
      <div className="flex justify-between mt-8">
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
          <span>Lưu thay đổi</span>
        </button>
      </div>
    </div>
  );
};

export default Step1;
