import { useState } from 'react';
import { message } from 'antd';
import { buildingService } from '../../../services/BuildingService';
import { imageService } from '../../../services/ImageService';
import type { CreateBuildingRequest, Building } from '../../../types/building';

interface BuildingFormData {
  name: string;
  description?: string;
  floors: number;
  place_id: number;
  image?: string;
  imageFile?: File;
  modelFile?: File;
  modelFileName?: string;
  modelUrl?: string;
  latitude?: number;
  longitude?: number;
  modelScale?: number;
  modelRotation?: number;
}

export const useCreateBuilding = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Upload 3D model (.glb) to server
   */
  const uploadModel = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // TODO: Replace with your actual upload endpoint for 3D models
      const response = await fetch('/api/upload/model', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Upload model failed');
      
      const data = await response.json();
      return data.meshUrl || data.url; // Return model URL
    } catch (err) {
      throw new Error('Failed to upload 3D model');
    }
  };

  /**
   * Create building with all data
   */
  const createBuilding = async (formData: BuildingFormData): Promise<Building | null> => {
    setLoading(true);
    setError(null);

    try {
      // Step 1: Upload image using imageService
      let imageUrl = formData.image || '';
      if (formData.imageFile) {
        message.loading({ content: 'Đang tải ảnh lên...', key: 'upload-image' });
        
        const uploadedImages = await imageService.uploadImages([formData.imageFile]);
        
        if (uploadedImages && uploadedImages.length > 0) {
          imageUrl = uploadedImages[0].url;
          message.success({ content: 'Tải ảnh lên thành công!', key: 'upload-image', duration: 2 });
        }
      }

      // Step 2: Upload 3D model if exists
      let meshUrl = formData.modelUrl || '';
      if (formData.modelFile) {
        message.loading({ content: 'Đang tải model 3D lên...', key: 'upload-model' });
        
        try {
          meshUrl = await uploadModel(formData.modelFile);
          message.success({ content: 'Tải model 3D lên thành công!', key: 'upload-model', duration: 2 });
        } catch (err) {
          // If model upload fails, use the local test file or skip
          console.warn('Model upload failed, using fallback URL:', err);
          meshUrl = formData.modelUrl || './model/UITglbnew.glb';
          message.warning({ 
            content: 'Không thể tải model lên server, sử dụng file mặc định', 
            key: 'upload-model',
            duration: 3 
          });
        }
      }

      // Step 3: Prepare building data
      const buildingData: CreateBuildingRequest = {
        name: formData.name,
        description: formData.description || '',
        floors: formData.floors,
        image: imageUrl,
        placeId: formData.place_id,
        objects3d: [
          {
            objectType: 0, // Mesh type
            meshes: [
              {
                meshUrl: meshUrl,
                point: {
                  type: 'Point',
                  coordinates: [
                    formData.longitude || 106.6297,
                    formData.latitude || 10.8231,
                    0 // elevation
                  ]
                },
                rotate: formData.modelRotation || 0,
                scale: formData.modelScale || 1
              }
            ]
          }
        ]
      };

      // Step 4: Create building via API
      message.loading({ content: 'Đang tạo tòa nhà...', key: 'create-building' });
      
      const createdBuilding = await buildingService.create(buildingData);
      
      message.success({ 
        content: 'Tạo tòa nhà thành công!', 
        key: 'create-building',
        duration: 3 
      });
      
      return createdBuilding;

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra';
      setError(errorMessage);
      message.error({
        content: `Tạo tòa nhà thất bại: ${errorMessage}`,
        duration: 5
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createBuilding,
    loading,
    error
  };
};