import React, { useEffect, useState } from "react"
import { Button } from "antd"
import { ArrowLeftOutlined } from "@ant-design/icons"
import { useNavigate, useParams } from "react-router-dom";

import Step1 from "./step1"
import Step2 from "./step2"
import Step3 from "./step3"
import StepIndicator from "../../../components/Place/Step/StepIndicator"
import type { Place, PlaceUpdateResquest } from "../../../types/place"
import { mockPlace } from "../../../types/place";

const EditPlace: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0)
   const steps = [
    { number: 1, label: "Thông tin địa điểm", icon: "info" as const },
    { number: 2, label: "Chọn vị trí trên bản đồ", icon: "location" as const },
    { number: 3, label: "Preview", icon: "gift" as const },
  ]  
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [place, setPlace] = useState<Place | null>(null);
  const [formData, setFormData] = useState<PlaceUpdateResquest>({});


  useEffect(() => {
    if (id) loadPlace(Number(id));
  }, [id]);

  const loadPlace = async (place_id: number) => {
    setLoading(true);
    const found = mockPlace.find((n) => n.place_id === place_id);

    setTimeout(() => {
      if (found) {
        setPlace(found);
        setFormData(found);
      }
      setLoading(false);
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      setLoading(true);
      navigate("/admin/places");
    } catch (error) {
      console.error("Error updating places:", error);
      alert("Có lỗi xảy ra khi cập nhật địa điểm");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    console.log("Draft saved:", formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading && !place) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Đang tải thông tin địa điểm...</div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-600">Không tìm thấy địa điểm</div>
      </div>
    );
  }

  const handleNext = (data: Partial<Place>) => {
    setFormData((prev) => ({ ...prev, ...data }))
    setCurrentStep((prev) => prev + 1)
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }


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

        <StepIndicator currentStep={currentStep} steps={steps} />

        {currentStep === 0 && (
          <Step1 initialData={formData} onNext={handleNext} />
        )}
        {currentStep === 1 && (
          <Step2 data={formData} onNext={handleNext} onBack={handleBack} />
        )}
        {currentStep === 2 && (
          <Step3 data={formData} onSubmit={handleSaveDraft} onBack={handleBack} />
        )}
      </div>
    </div>
  )
}

export default EditPlace
