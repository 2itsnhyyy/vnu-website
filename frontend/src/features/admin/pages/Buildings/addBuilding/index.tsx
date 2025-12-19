import React, { useState } from "react";
import { Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import Step1 from "./step1";
import Step2 from "./step2";
import Step3 from "./step3";
import type { BuildingFormData } from "../../../types/building";
import StepIndicator from "../../../components/Place/Step/StepIndicator";


const AddBuilding: React.FC = () => {
   const [currentStep, setCurrentStep] = useState(0);
   const steps = [
    { number: 1, label: "Nhập thông tin tòa nhà", icon: "info" as const },
    { number: 2, label: "Tải lên file .glb", icon: "upload" as const },
    { number: 3, label: "Điều chỉnh vị trí trên bản đồ", icon: "location" as const },
  ]  


   const [formData, setFormData] = useState<Partial<BuildingFormData>>({
    latitude: 10.8231, // Default to Ho Chi Minh City
    longitude: 106.6297,
    modelScale: 1,
    modelRotation: 0,
  })

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
    console.log("Submitting place data:", finalData);
    // Handle API submission here
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
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
          <Step3 initialData={formData}  onNext={handleSubmit} onBack={handleBack} />
        )}
      </div>
    </div>
  );
};

export default AddBuilding;
