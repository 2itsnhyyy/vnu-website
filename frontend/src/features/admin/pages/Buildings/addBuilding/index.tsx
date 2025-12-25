import React, { useState } from "react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import Step1 from "./step1";
import Step2 from "./step2";
import Step3 from "./step3";
import type { BuildingFormData } from "../../../types/building";
import StepIndicator from "../../../components/Place/Step/StepIndicator";
import { useCreateBuilding } from "./hook";
import { useNavigate } from "react-router-dom"

const AddBuilding: React.FC = () => {
  const navigate = useNavigate()
  const { createBuilding, loading } = useCreateBuilding();
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    { number: 1, label: "Nhập thông tin tòa nhà", icon: "info" as const },
    { number: 2, label: "Lựa chọn cách tạo mô hình", icon: "box" as const },
    { number: 3, label: "Điều chỉnh vị trí trên bản đồ", icon: "location" as const },
  ];

  const [formData, setFormData] = useState<Partial<BuildingFormData>>({
    latitude: 10.874334,
    longitude: 106.80325,
    modelScale: 1,
    modelRotation: 0,
  });

  const handleNext = (data: Partial<BuildingFormData>) => {
    setFormData({ ...formData, ...data });
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (data: Partial<BuildingFormData>) => {
    const finalData = { ...formData, ...data };
    
    console.log("Submitting building data:", finalData);
    
    // Validate required fields
    if (!finalData.name || !finalData.place_id || !finalData.floors) {
      console.error("Missing required fields");
      return;
    }

    // Create building via API
    const result = await createBuilding(finalData as BuildingFormData);
    
    if (result) {
      // Success - redirect to building list or detail page
      console.log("Created building:", result);
      navigate("/admin/buildings");
      
    }
  };

  return (
    <div className="h-full bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 flex flex-col items-center">
              <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
              <p className="mt-4 text-lg font-medium">Đang tạo tòa nhà...</p>
              <p className="text-sm text-gray-500">Vui lòng không đóng trang này</p>
            </div>
          </div>
        )}

        {/* Step Indicator */}
        <StepIndicator currentStep={currentStep} steps={steps} />

        {/* Step Content */}
        {currentStep === 0 && (
          <Step1 initialData={formData} onNext={handleNext} />
        )}
        {currentStep === 1 && (
          <Step2 initialData={formData} onNext={handleNext} onBack={handleBack} />
        )}
        {currentStep === 2 && (
          <Step3 initialData={formData} onNext={handleSubmit} onBack={handleBack} />
        )}
      </div>
    </div>
  );
};

export default AddBuilding;