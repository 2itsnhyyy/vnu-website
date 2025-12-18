import React, { useState } from "react";
import { Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import Step1 from "./step1";
import Step2 from "./step2";
import Step3 from "./step3";
import type { Place } from "../../../types/place";
import StepIndicator from "../../../components/Place/Step/StepIndicator";


const AddPlace: React.FC = () => {
   const [currentStep, setCurrentStep] = useState(0);
   const steps = [
    { number: 1, label: "Thông tin địa điểm", icon: "info" as const },
    { number: 2, label: "Chọn vị trí trên bản đồ", icon: "location" as const },
    { number: 3, label: "Preview", icon: "gift" as const },
  ]  


  const [formData, setFormData] = useState<Partial<Place>>({
    name: "",
    description: "",
    address: "",
    image: "",
  });

  const handleNext = (data: Partial<Place>) => {
    setFormData({ ...formData, ...data });
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (data: Partial<Place>) => {
    const finalData = { ...formData, ...data };
    console.log("Submitting place data:", finalData);
    // Handle API submission here
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        {currentStep > 0 && (
        <div className="mb-6">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            className="text-gray-700 hover:text-gray-900"
          >
            <span className="text-xl font-semibold ml-2">Quay lại</span>
          </Button>
        </div>
        )}
         {/* Step Indicator */}
        <StepIndicator currentStep={currentStep} steps={steps} />
        

        {/* Step Content */}
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
