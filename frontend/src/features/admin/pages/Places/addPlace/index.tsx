import React, { useState } from "react";
import { Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import Step1 from "./step1";
import Step2 from "./step2";
import Step3 from "./step3";
import type { PlaceCreateRequest } from "../../../types/place";
import StepIndicator from "../../../components/Place/Step/StepIndicator";
import { placeService } from "../../../services/PlaceService";
import { useNavigate } from "react-router-dom";

const AddPlace: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { number: 1, label: "Thông tin địa điểm", icon: "info" as const },
    { number: 2, label: "Chọn vị trí trên bản đồ", icon: "location" as const },
    { number: 3, label: "Preview", icon: "gift" as const },
  ];

  const [formData, setFormData] = useState<Partial<PlaceCreateRequest>>({
    name: "",
    description: "",
    address: "",
    image: "",
  });

  const handleNext = (data: Partial<PlaceCreateRequest>) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  // Submit CREATE
  const handleSubmit = async (data: PlaceCreateRequest) => {
    const finalData: PlaceCreateRequest = {
      ...formData,
      ...data,
    } as PlaceCreateRequest;

    // --- Tự động đóng Polygon nếu cần ---
    if (finalData.boundaryGeom?.coordinates?.[0]?.length >= 3) {
      const coords = [...finalData.boundaryGeom.coordinates[0]]; // copy mảng
      const firstPoint = coords[0];
      const lastPoint = coords[coords.length - 1];

      if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
        coords.push(firstPoint); // thêm điểm đầu vào cuối
      }

      finalData.boundaryGeom = {
        ...finalData.boundaryGeom,
        coordinates: [coords],
      };
    }

    console.log("Submitting place data:", finalData);

    try {
      setLoading(true);
      const created = await placeService.create(finalData);
      console.log("Created place:", created);
      navigate("/admin/places");
    } catch (error) {
      console.error("Error creating place:", error);
      alert("Có lỗi xảy ra khi tạo địa điểm");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {currentStep > 0 && (
          <div className="mb-6">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={handleBack}
            >
              <span className="text-xl font-semibold ml-2">Quay lại</span>
            </Button>
          </div>
        )}

        <StepIndicator currentStep={currentStep} steps={steps} />

        {currentStep === 0 && (
          <Step1 initialData={formData} onNext={handleNext} />
        )}
        {currentStep === 1 && (
          <Step2 data={formData} onNext={handleNext} onBack={handleBack} />
        )}
        {currentStep === 2 && (
          <Step3 data={formData} onSubmit={handleSubmit} onBack={handleBack} />
        )}
      </div>
    </div>
  );
};

export default AddPlace;
