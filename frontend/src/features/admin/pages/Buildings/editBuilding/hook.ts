import { useState } from 'react';
import { message } from 'antd';
import { buildingService } from '../../../services/BuildingService';
import { imageService } from '../../../services/ImageService';
import type { Building, UpdateBuildingRequest } from '../../../types/building';

interface BuildingFormData {
  buildingId?: number;
  name: string;
  description?: string;
  floors: number;
  place_id: number;
  imageFile?: File;
}

export const useUpdateBuilding = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Update building with basic info only (name, description, floors, place_id, image)
   */
  const updateBuilding = async (formData: BuildingFormData): Promise<Building | null> => {
    setLoading(true);
    setError(null);

    try {
      if (!formData.buildingId) {
        throw new Error('Building ID not provided');
      }

      // Validate required fields
      if (!formData.name || !formData.place_id || !formData.floors) {
        throw new Error('Thiếu thông tin bắt buộc');
      }

      // Upload image if changed
      let imageUrl = '';
      if (formData.imageFile) {
        message.loading({ content: 'Đang tải ảnh lên...', key: 'upload-image' });
        try {
          const uploadedImages = await imageService.uploadImages([formData.imageFile]);
          if (uploadedImages && uploadedImages.length > 0) {
            imageUrl = uploadedImages[0].url;
            message.success({ content: 'Tải ảnh lên thành công!', key: 'upload-image', duration: 2 });
          }
        } catch (err: any) {
          message.warning({ 
            content: 'Không thể tải ảnh, tiếp tục không có ảnh', 
            key: 'upload-image',
            duration: 2 
          });
        }
      }

      // Prepare update request
      const buildingData: UpdateBuildingRequest = {
        name: formData.name,
        description: formData.description || '',
        floors: formData.floors,
        placeId: formData.place_id,
        ...(imageUrl && { image: imageUrl }),
      };

      // Update building via API
      message.loading({ content: 'Đang cập nhật tòa nhà...', key: 'update-building' });
      
      const updatedBuilding = await buildingService.update(formData.buildingId, buildingData);
      
      message.success({ 
        content: 'Cập nhật tòa nhà thành công!', 
        key: 'update-building',
        duration: 3 
      });
      
      return updatedBuilding;

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra';
      setError(errorMessage);
      
      message.error({
        content: `Cập nhật tòa nhà thất bại: ${errorMessage}`,
        duration: 5
      });
      
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateBuilding,
    loading,
    error
  };
};
