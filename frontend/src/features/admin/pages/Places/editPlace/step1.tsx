import type React from "react";
import { useState } from "react";
import { Form, Input, Button, Upload, Select, TimePicker, message } from "antd";
import { provinces, districtsByProvince, wardsByDistrict } from "../../../../../assets/data/location";
import dayjs from "dayjs";
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
import type { UploadFile } from "antd/es/upload/interface";
import type {
  PlaceCreateRequestWithFile,
  PlaceDraft,
} from "../../../types/place";
import type { RcFile } from "antd/es/upload";

const { TextArea } = Input;
const { Dragger } = Upload;

interface Step1Props {
  initialData: Partial<PlaceDraft>;
  onNext: (data: Partial<PlaceCreateRequestWithFile>) => void;
}


// Helper function to parse address
const parseAddress = (address: string | undefined) => {
  if (!address)
    return {
      province: undefined,
      district: undefined,
      ward: undefined,
      detail: undefined,
    };

  const parts = address.split(",").map((s) => s.trim());

  if (parts.length < 2) {
    return {
      province: undefined,
      district: undefined,
      ward: undefined,
      detail: address,
    };
  }

  // Lấy từ cuối lên đầu: Tỉnh/Thành phố (cuối cùng), Quận/Huyện (kế cuối), Phường/Xã, Chi tiết
  const provinceLabel = parts[parts.length - 1];
  const districtLabel = parts.length > 1 ? parts[parts.length - 2] : undefined;
  const wardLabel = parts.length > 2 ? parts[parts.length - 3] : undefined;
  const detail =
    parts.length > 3 ? parts.slice(0, parts.length - 3).join(", ") : parts[0];

  // Tìm value tương ứng với label
  const province = provinces.find((p) => p.label === provinceLabel)?.value;
  const district =
    province && districtLabel
      ? districtsByProvince[province]?.find((d) => d.label === districtLabel)
          ?.value
      : undefined;
  const ward =
    district && wardLabel
      ? wardsByDistrict[district]?.find((w) => w.label === wardLabel)?.value
      : undefined;

  return { province, district, ward, detail };
};

const Step1: React.FC<Step1Props> = ({ initialData, onNext }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(initialData.image || "");
  const [description, setDescription] = useState(initialData.description || "");

  // Parse address nếu có
  const parsedAddress = parseAddress(initialData.address);

  const [selectedProvince, setSelectedProvince] = useState<string | undefined>(
    initialData.province || parsedAddress.province
  );
  const [selectedDistrict, setSelectedDistrict] = useState<string | undefined>(
    initialData.district || parsedAddress.district
  );
  const [districts, setDistricts] = useState<
    { value: string; label: string }[]
  >(
    initialData.province || parsedAddress.province
      ? districtsByProvince[
          initialData.province || parsedAddress.province || ""
        ] || []
      : []
  );
  const [wards, setWards] = useState<{ value: string; label: string }[]>(
    initialData.district || parsedAddress.district
      ? wardsByDistrict[initialData.district || parsedAddress.district || ""] ||
          []
      : []
  );

  // Prepare initial values cho Form
  const formInitialValues = {
    name: initialData.name,
    province: initialData.province || parsedAddress.province,
    district: initialData.district || parsedAddress.district,
    ward: initialData.ward || parsedAddress.ward,
    address_detail: initialData.address_detail || parsedAddress.detail,
    phone: initialData.phone,
    open_time: initialData.openTime
      ? dayjs(initialData.openTime, "HH:mm")
      : undefined,
    close_time: initialData.closeTime
      ? dayjs(initialData.closeTime, "HH:mm")
      : undefined,
  };

  const handleBeforeUpload = (file: RcFile) => {
    // Validate file type
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("Chỉ được tải lên file ảnh!");
      return Upload.LIST_IGNORE;
    }

    // Validate file size (e.g., max 5MB)
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error("Ảnh phải nhỏ hơn 5MB!");
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

    // Update file list for display
    setFileList([
      {
        uid: file.uid,
        name: file.name,
        status: "done",
        originFileObj: file,
      },
    ]);

    // Prevent auto upload
    return false;
  };

  const handleProvinceChange = (value: string) => {
    setSelectedProvince(value);
    setSelectedDistrict(undefined);
    setDistricts(districtsByProvince[value] || []);
    setWards([]);
    form.setFieldsValue({ district: undefined, ward: undefined });
  };

  const handleDistrictChange = (value: string) => {
    setSelectedDistrict(value);
    setWards(wardsByDistrict[value] || []);
    form.setFieldsValue({ ward: undefined });
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const addressParts = [
        values.address_detail,
        wards.find((w) => w.value === values.ward)?.label,
        districts.find((d) => d.value === values.district)?.label,
        provinces.find((p) => p.value === values.province)?.label,
      ].filter(Boolean);

      onNext({
        name: values.name,
        address: addressParts.join(", "),
        description,
        imageFile: imageFile,
        image: previewUrl,
        openTime: values.open_time?.format("HH:mm"),
        closeTime: values.close_time?.format("HH:mm"),
        phone: values.phone,
      });
    });
  };

  const handleRemoveImage = () => {
    setFileList([]);
    setImageFile(null);
    setPreviewUrl("");
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <Form form={form} layout="vertical" initialValues={formInitialValues}>
        {/* Image Upload */}
        <div className="flex flex-row mb-6 justify-between gap-6">
          <div className="flex-1">
            <label className="block text-lg font-medium mb-2">
              Hình ảnh địa điểm
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
            <Dragger
              multiple={false}
              accept="image/*"
              beforeUpload={handleBeforeUpload}
              fileList={[]}
              showUploadList={false}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Nhấp hoặc kéo thả ảnh vào khu vực này
              </p>
              <p className="ant-upload-hint">
                Hỗ trợ tải một ảnh (PNG, JPG, SVG) - tối đa 5MB
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
                Chi tiết địa điểm
              </label>
              <p className="text-md text-gray-500 mb-4 w-50 text-justify">
                Giới thiệu về địa điểm của bạn đến người dùng bằng cách điền vào
                những ô bên cạnh
              </p>
            </div>
          </div>
          {/* Right Column */}
          <div>
            {/* Place Name */}
            <Form.Item
              name="name"
              label="Tên địa điểm"
              rules={[
                { required: true, message: "Vui lòng nhập tên địa điểm" },
              ]}
            >
              <Input placeholder="Nhập tên địa điểm" size="large" />
            </Form.Item>

            {/* Province */}
            <Form.Item name="province" label="Tỉnh/Thành phố">
              <Select
                placeholder="Chọn tỉnh/thành phố"
                size="large"
                onChange={handleProvinceChange}
                options={provinces}
              />
            </Form.Item>

            {/* District */}
            <Form.Item name="district" label="Quận/Huyện">
              <Select
                placeholder="Chọn quận/huyện"
                size="large"
                onChange={handleDistrictChange}
                options={districts}
                disabled={!selectedProvince}
              />
            </Form.Item>

            {/* Ward */}
            <Form.Item name="ward" label="Phường/Xã">
              <Select
                placeholder="Chọn phường/xã"
                size="large"
                options={wards}
                disabled={!selectedDistrict}
              />
            </Form.Item>

            {/* Address Detail */}
            <Form.Item name="address_detail" label="Địa chỉ chi tiết">
              <Input placeholder="Số nhà, tên đường" size="large" />
            </Form.Item>
            {/* Phone */}
            <Form.Item
              name="phone"
              label="Số điện thoại"
              rules={[
                {
                  pattern: /^\d{10,11}$/,
                  message: "Số điện thoại không hợp lệ",
                },
              ]}
            >
              <Input placeholder="Nhập số điện thoại" size="large" />
            </Form.Item>

            {/* Opening and Closing Hours */}
            <div className="grid grid-cols-2 gap-4">
              <Form.Item name="open_time" label="Giờ mở cửa">
                <TimePicker
                  placeholder="Chọn giờ mở cửa"
                  size="large"
                  format="HH:mm"
                  className="w-full"
                />
              </Form.Item>

              <Form.Item name="close_time" label="Giờ đóng cửa">
                <TimePicker
                  placeholder="Chọn giờ đóng cửa"
                  size="large"
                  format="HH:mm"
                  className="w-full"
                />
              </Form.Item>
            </div>
          </div>

          <hr className="col-span-2  border-gray-300" />

          {/* General Description */}
          <div>
            <label className="block text-lg font-medium mb-2">
              Giới thiệu chung
            </label>
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
                maxLength={500}
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
