import type React from "react"
import { useState, useEffect } from "react"
import { Button, message } from "antd"
import { ArrowLeftOutlined } from "@ant-design/icons"
import Step1 from "./step1"
import Step2 from "./step2"
import Step3 from "./step3"
import type { PlaceCreateRequest, PlaceCreateRequestWithFile } from "../../../types/place"
import StepIndicator from "../../../components/Place/Step/StepIndicator"
import { placeService } from "../../../services/PlaceService"
import { imageService } from "../../../services/ImageService"
import { useNavigate, useParams } from "react-router-dom"

const EditPlace: React.FC = () => {
  const navigate = useNavigate()
  const { placeId } = useParams<{ placeId: string }>();
  const placeIdNumber = Number(placeId);
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)
  const [originalData, setOriginalData] = useState<Partial<PlaceCreateRequest>>({})

  const steps = [
    { number: 1, label: "Thông tin địa điểm", icon: "info" as const },
    { number: 2, label: "Chọn vị trí trên bản đồ", icon: "location" as const },
    { number: 3, label: "Preview", icon: "gift" as const },
  ]

  console.log("Editing placeId:", placeIdNumber)

  const [formData, setFormData] = useState<Partial<PlaceCreateRequest>>({
    name: "",
    description: "",
    address: "",
    image: "",
    openTime: "",
    closeTime: "",
    phone: "",
    boundaryGeom: undefined,
  })

  useEffect(() => {
    const fetchPlaceData = async () => {
      if (isNaN(placeIdNumber)) {
        message.error("ID địa điểm không hợp lệ")
        navigate("/admin/places")
        setInitialLoading(false)
        return
      }

      try {
        setInitialLoading(true)
        const placeData = await placeService.getById(placeIdNumber)
        console.log("Fetched place data:", placeData)

        const initialData = {
          name: placeData.name,
          description: placeData.description,
          address: placeData.address,
          image: placeData.image,
          openTime: placeData.openTime,
          closeTime: placeData.closeTime,
          phone: placeData.phone,
          boundaryGeom: placeData.boundaryGeom,
        }

        setFormData(initialData)
        setOriginalData(initialData) // Lưu dữ liệu gốc để so sánh

      } catch (error) {
        console.error("Error fetching place data:", error)
        navigate("/admin/places")
      } finally {
        setInitialLoading(false)
      }
    }

    fetchPlaceData()
  }, [placeIdNumber, navigate])

  const handleNext = (data: Partial<PlaceCreateRequest>) => {
    setFormData((prev) => ({ ...prev, ...data }))
    setCurrentStep((prev) => prev + 1)
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const handleSubmit = async (data: Partial<PlaceCreateRequestWithFile>) => {
    const finalData: Partial<PlaceCreateRequestWithFile> = {
      ...formData,
      ...data,
    }

    // Xử lý closing polygon cho boundaryGeom
    if (finalData.boundaryGeom?.coordinates?.[0]?.length >= 3) {
      const coords = [...finalData.boundaryGeom.coordinates[0]] 
      const firstPoint = coords[0]
      const lastPoint = coords[coords.length - 1]

      if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
        coords.push(firstPoint) 
      }

      finalData.boundaryGeom = {
        ...finalData.boundaryGeom,
        coordinates: [coords],
      }
    }

    try {
      setLoading(true)

      // Upload ảnh mới nếu có
      if (finalData.imageFile) {
        message.loading({ content: "Đang tải ảnh lên...", key: "upload" })
        const uploadedImages = await imageService.uploadImages([finalData.imageFile as File])
        finalData.image = uploadedImages[0].url
        message.success({ content: "Tải ảnh thành công!", key: "upload", duration: 2 })
        delete finalData.imageFile
      }

      // Tạo payload chỉ chứa các field đã thay đổi
      const updatePayload: Partial<PlaceCreateRequest> = {}
      
      // So sánh và chỉ gửi các field đã thay đổi
      if (finalData.name !== originalData.name) updatePayload.name = finalData.name
      if (finalData.address !== originalData.address) updatePayload.address = finalData.address
      if (finalData.description !== originalData.description) updatePayload.description = finalData.description
      if (finalData.phone !== originalData.phone) updatePayload.phone = finalData.phone
      if (finalData.openTime !== originalData.openTime) updatePayload.openTime = finalData.openTime
      if (finalData.closeTime !== originalData.closeTime) updatePayload.closeTime = finalData.closeTime
      if (finalData.image !== originalData.image) updatePayload.image = finalData.image
      
      // Luôn gửi boundaryGeom nếu có thay đổi
      if (JSON.stringify(finalData.boundaryGeom) !== JSON.stringify(originalData.boundaryGeom)) {
        updatePayload.boundaryGeom = finalData.boundaryGeom
      }

      // Nếu không có gì thay đổi
      if (Object.keys(updatePayload).length === 0) {
        message.info("Không có thay đổi nào để cập nhật")
        navigate("/admin/places")
        return
      }

      console.log("Submitting update payload:", updatePayload)

      message.loading({ content: "Đang cập nhật địa điểm...", key: "update" })
      await placeService.update(placeIdNumber, updatePayload)

      message.success({ content: "Cập nhật địa điểm thành công!", key: "update", duration: 2 })
      navigate("/admin/places")
    } catch (error) {
      console.error("Error updating place:", error)
      message.error("Có lỗi xảy ra khi cập nhật địa điểm")
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {currentStep > 0 && (
          <div className="mb-6">
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={handleBack} disabled={loading}>
              <span className="text-xl font-semibold ml-2">Quay lại</span>
            </Button>
          </div>
        )}

        <StepIndicator currentStep={currentStep} steps={steps} />

        {currentStep === 0 && <Step1 initialData={formData} onNext={handleNext} />}
        {currentStep === 1 && <Step2 data={formData} onNext={handleNext} onBack={handleBack} />}
        {currentStep === 2 && (
          <Step3 
            data={formData} 
            onSubmit={handleSubmit} 
            onBack={handleBack} 
            loading={loading}
            isEdit={true}
          />
        )}
      </div>
    </div>
  )
}

export default EditPlace