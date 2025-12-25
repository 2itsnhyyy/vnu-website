import React, { useState, useEffect } from "react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import Step1 from "./step1";
import type { BuildingFormData } from "../../../types/building";
import { useUpdateBuilding } from "./hook";
import { buildingService } from "../../../services/BuildingService";

const EditBuilding: React.FC = () => {
  const navigate = useNavigate();
  const { buildingId } = useParams<{ buildingId: string }>();

  const { updateBuilding, loading } = useUpdateBuilding();

  const [initialLoading, setInitialLoading] = useState(true);

  const [formData, setFormData] = useState<Partial<BuildingFormData>>({
    buildingId: buildingId ? Number(buildingId) : undefined,
  });

  // Load building data on mount
  useEffect(() => {
    if (!buildingId) {
      setInitialLoading(false);
      return;
    }

    const loadBuilding = async () => {
      try {
        const id = Number(buildingId);
        const response = await buildingService.getById(id);
        const building = response.building
        console.log("du lieu tra ve:", building);
        if (building) {
          setFormData((prev) => ({
            ...prev,
            name: building.name,
            description: building.description,
            floors: building.floors,
            place_id: building.place_id,
            buildingId: id,
          }));
        }
      } catch (error) {
        console.error("Failed to load building:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadBuilding();
  }, [buildingId]);

  const handleSubmit = async (data: Partial<BuildingFormData>) => {
    const finalData = { ...formData, ...data, buildingId: formData.buildingId };

    // Validate required fields
    if (!finalData.name || !finalData.place_id || !finalData.floors || !finalData.buildingId) {
      console.error("Missing required fields");
      return;
    }

    // Update building via API
    const result = await updateBuilding(finalData as BuildingFormData);

    if (result) {
      // Success - redirect to building detail or list page
      console.log("Updated building:", result);

      // Redirect to building detail
      navigate("/admin/buildings");
    }
  };

  if (initialLoading) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 flex flex-col items-center">
          <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
          <p className="mt-4 text-lg font-medium">Đang tải dữ liệu tòa nhà...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 flex flex-col items-center">
              <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
              <p className="mt-4 text-lg font-medium">Đang cập nhật tòa nhà...</p>
              <p className="text-sm text-gray-500">Vui lòng không đóng trang này</p>
            </div>
          </div>
        )}

        {/* Step Content - Only Step1 */}
        <Step1 
          initialData={formData} 
          onNext={handleSubmit}
          onBack={() => navigate(-1)}
        />
      </div>
    </div>
  );
};

export default EditBuilding;
