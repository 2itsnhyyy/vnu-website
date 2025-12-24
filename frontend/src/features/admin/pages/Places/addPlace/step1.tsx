import type React from "react";
import { useState } from "react";
import { Form, Input, Button, Upload, Select, TimePicker, message } from "antd";
import {
  SmileOutlined,
  BoldOutlined,
  ItalicOutlined,
  UnorderedListOutlined,
  OrderedListOutlined,
  LinkOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import type { Place } from "../../../types/place";
import type { UploadProps } from "antd";
import type { UploadedImageResponse } from "../../../types/image";
import { imageService } from "../../../services/ImageService";
import type { RcFile } from "antd/es/upload";

const { TextArea } = Input;
const { Dragger } = Upload;

const props: UploadProps = {
  name: "file",
  multiple: true,
  action: "https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload",
  onChange(info) {
    const { status } = info.file;
    if (status !== "uploading") {
      console.log(info.file, info.fileList);
    }
    if (status === "done") {
      message.success(`${info.file.name} file uploaded successfully.`);
    } else if (status === "error") {
      message.error(`${info.file.name} file upload failed.`);
    }
  },
  onDrop(e) {
    console.log("Dropped files", e.dataTransfer.files);
  },
};

interface Step1Props {
  initialData: Partial<Place>;
  onNext: (data: Partial<Place>) => void;
}

const provinces = [
  { value: "tp-hcm", label: "TP. Hồ Chí Minh" },
  { value: "ha-noi", label: "Hà Nội" },
  { value: "da-nang", label: "Đà Nẵng" },
];

const districtsByProvince: Record<string, { value: string; label: string }[]> =
  {
    "tp-hcm": [
      { value: "thu-duc", label: "Thủ Đức" },
      { value: "quan-1", label: "Quận 1" },
      { value: "quan-10", label: "Quận 10" },
      { value: "binh-thanh", label: "Bình Thạnh" },
    ],
    "ha-noi": [
      { value: "hoan-kiem", label: "Hoàn Kiếm" },
      { value: "ba-dinh", label: "Ba Đình" },
    ],
    "da-nang": [
      { value: "hai-chau", label: "Hải Châu" },
      { value: "thanh-khe", label: "Thanh Khê" },
    ],
  };

const wardsByDistrict: Record<string, { value: string; label: string }[]> = {
  "thu-duc": [
    { value: "linh-trung", label: "Linh Trung" },
    { value: "linh-xuan", label: "Linh Xuân" },
    { value: "dong-hoa", label: "Đông Hòa" },
  ],
  "quan-1": [
    { value: "ben-nghe", label: "Bến Nghé" },
    { value: "ben-thanh", label: "Bến Thành" },
  ],
};

const Step1: React.FC<Step1Props> = ({ initialData, onNext }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploadedImage, setUploadedImage] =
    useState<UploadedImageResponse | null>(null);
  const [description, setDescription] = useState(initialData.description || "");
  const [selectedProvince, setSelectedProvince] = useState<string | undefined>(
    initialData.province
  );
  const [selectedDistrict, setSelectedDistrict] = useState<string | undefined>(
    initialData.district
  );
  const [districts, setDistricts] = useState<
    { value: string; label: string }[]
  >(selectedProvince ? districtsByProvince[selectedProvince] || [] : []);
  const [wards, setWards] = useState<{ value: string; label: string }[]>(
    selectedDistrict ? wardsByDistrict[selectedDistrict] || [] : []
  );

  const handleUploadImage = async (options: any) => {
    const { file, onSuccess, onError } = options;

    try {
      const res = await imageService.uploadImages([file as File]);

      const image = res[0];

      setUploadedImage(image);

      setFileList([
        {
          uid: file.uid,
          name: file.name,
          status: "done",
          url: image.url,
        },
      ]);

      onSuccess(image);
      message.success("Upload ảnh thành công");
    } catch (error) {
      console.error(error);
      onError(error);
      message.error("Upload ảnh thất bại");
    }
  };

  const handleUploadChange = (info: any) => {
    setFileList(info.fileList.slice(-1));
    if (info.file.status === "done") {
      message.success("Upload thành công");
    }
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
      if (!uploadedImage) {
        message.error("Vui lòng upload hình ảnh");
        return;
      }

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
        image: uploadedImage.url, 
        openTime: values.open_time?.format("HH:mm"),
        closeTime: values.close_time?.format("HH:mm"),
        phone: "0961565563"
      });
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <Form form={form} layout="vertical" initialValues={initialData}>
        {/* Image Upload */}
        <div className="flex flex-row mb-6 justify-between">
          <div>
            <label className="block text-lg font-medium mb-2">
              Hình ảnh địa điểm
            </label>
            <p className="text-md w-50 text-justify text-gray-500 mb-4">
              Hình ảnh này sẽ được hiển thị công khai. Chỉ được tải lên 1 ảnh.
            </p>
          </div>

          <Dragger
            multiple={false}
            accept="image/*"
            customRequest={handleUploadImage}
            fileList={fileList}
            onRemove={() => {
              setFileList([]);
              setUploadedImage(null);
            }}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Nhấp hoặc kéo thả ảnh vào khu vực này
            </p>
            <p className="ant-upload-hint">
              Hỗ trợ tải một ảnh (PNG, JPG, SVG)
            </p>
          </Dragger>
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
            <Form.Item
              name="province"
              label="Tỉnh/Thành phố"
              rules={[
                { required: true, message: "Vui lòng chọn tỉnh/thành phố" },
              ]}
            >
              <Select
                placeholder="Chọn tỉnh/thành phố"
                size="large"
                onChange={handleProvinceChange}
                options={provinces}
              />
            </Form.Item>

            {/* District */}
            <Form.Item
              name="district"
              label="Quận/Huyện"
              rules={[{ required: true, message: "Vui lòng chọn quận/huyện" }]}
            >
              <Select
                placeholder="Chọn quận/huyện"
                size="large"
                onChange={handleDistrictChange}
                options={districts}
                disabled={!selectedProvince}
              />
            </Form.Item>

            {/* Ward */}
            <Form.Item
              name="ward"
              label="Phường/Xã"
              rules={[{ required: true, message: "Vui lòng chọn phường/xã" }]}
            >
              <Select
                placeholder="Chọn phường/xã"
                size="large"
                options={wards}
                disabled={!selectedDistrict}
              />
            </Form.Item>

            {/* Address Detail */}
            <Form.Item
              name="address_detail"
              label="Địa chỉ chi tiết"
              rules={[
                { required: true, message: "Vui lòng nhập địa chỉ chi tiết" },
              ]}
            >
              <Input placeholder="Số nhà, tên đường" size="large" />
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
