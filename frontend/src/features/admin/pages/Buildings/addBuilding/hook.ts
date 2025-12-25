import { useState } from 'react';
import { message } from 'antd';
import { buildingService } from '../../../services/BuildingService';
import { imageService } from '../../../services/ImageService';
import type { CreateBuildingRequest, Building, Geometry3DObject, Mesh3DObject } from '../../../types/building';

interface Vector3 { x: number; y: number; z: number }

interface ShapeBase {
  id: string
  type: 'box' | 'cylinder' | 'prism'
  position: Vector3
  rotation: Vector3
  scale: Vector3
  color: string
}

interface BoxShape extends ShapeBase { 
  type: 'box'
  width: number
  height: number
  depth: number
}

interface CylinderShape extends ShapeBase { 
  type: 'cylinder'
  radius: number
  height: number
}

interface PrismShape extends ShapeBase { 
  type: 'prism'
  points: [number, number][]
  height: number
}

type Shape = BoxShape | CylinderShape | PrismShape

interface GlbAsset {
  id: string
  name: string
  file: File
  url: string
  instances: {
    id: string
    position: Vector3
    rotation: Vector3
    scale: Vector3
  }[]
}

interface BuildingFormData {
  name: string
  description?: string
  floors: number
  place_id: number
  imageFile?: File
  modelType?: 'upload' | 'draw'
  modelFile?: File
  modelFileName?: string

  latitude?: number
  longitude?: number
  shapes?: Shape[]
  glbAssets?: GlbAsset[]
}

export const useCreateBuilding = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Convert shapes to Geometry3DObject
   */
  const convertShapesToGeometry = (shapes: Shape[], latitude: number, longitude: number): Geometry3DObject => {
    const prisms = shapes.map(shape => {
      // Convert shape coordinates to GeoJSON polygon
      let basePoints: number[][][] = []

      if (shape.type === 'box') {
        // Create rectangle polygon
        const hw = shape.width / 2
        const hd = shape.depth / 2
        basePoints = [[
          [longitude - hw/111320, latitude - hd/110540, 0],
          [longitude + hw/111320, latitude - hd/110540, 0],
          [longitude + hw/111320, latitude + hd/110540, 0],
          [longitude - hw/111320, latitude + hd/110540, 0],
          [longitude - hw/111320, latitude - hd/110540, 0] // Close polygon
        ]]
      } else if (shape.type === 'cylinder') {
        // Approximate cylinder with octagon
        const segments = 8
        const points: number[][] = []
        for (let i = 0; i <= segments; i++) {
          const angle = (i / segments) * Math.PI * 2
          const x = longitude + (shape.radius * Math.cos(angle)) / 111320
          const y = latitude + (shape.radius * Math.sin(angle)) / 110540
          points.push([x, y, 0])
        }
        basePoints = [points]
      } else if (shape.type === 'prism') {
        // If original lat/lng were stored (draw mode), prefer those exact coordinates
        const sAny: any = shape
        if (sAny.baseLatLng && Array.isArray(sAny.baseLatLng) && sAny.baseLatLng.length > 0) {
          const pts = sAny.baseLatLng.map((p: any) => [p.lng, p.lat, 0])
          // ensure closed
          if (JSON.stringify(pts[0]) !== JSON.stringify(pts[pts.length - 1])) pts.push(pts[0])
          basePoints = [pts]
        } else {
          // Fallback: convert local meter offsets back to lat/lng using provided latitude/longitude
          const points = shape.points.map(([x, z]) => [
            longitude + x / 111320,
            latitude + z / 110540,
            0
          ])
          points.push(points[0]) // Close polygon
          basePoints = [points]
        }
      }

      return {
        baseFace: {
          type: 'Polygon' as const,
          coordinates: basePoints
        },
        height: shape.height
      }
    })

    return {
      objectType: 1, // Geometry type
      body: {
        name: 'building_body',
        prisms
      }
    }
  }

  /**
   * Convert GLB assets to Mesh3DObject
   */
  const convertGlbAssetsToMeshes = async (glbAssets: GlbAsset[], latitude: number, longitude: number): Promise<Mesh3DObject> => {
    const meshes = []

    for (const asset of glbAssets) {
      // Upload GLB file via imageService to obtain a public URL
      try {
        const uploaded = await imageService.uploadImages([asset.file])
        const url = uploaded && uploaded[0] && uploaded[0].url ? uploaded[0].url : ''

        // Create mesh entry for each instance using the uploaded URL
        for (const instance of asset.instances) {
          meshes.push({
            meshUrl: url,
            point: {
              type: 'Point' as const,
              coordinates: [
                longitude + instance.position.x / 111320,
                latitude + instance.position.z / 110540,
                instance.position.y
              ]
            },
            rotate: instance.rotation.y * (180 / Math.PI), // Convert to degrees
            scale: instance.scale.x
          })
        }
      } catch (err) {
        // Failed to upload GLB asset
      }
    }

    return {
      objectType: 0, // Mesh type
      meshes
    }
  }

  /**
   * Create building with all data
   */
  const createBuilding = async (formData: BuildingFormData): Promise<Building | null> => {
    setLoading(true);
    setError(null);

    try {
      // Step 1: Upload image
      let imageUrl = ''
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

      // Step 2: Validate required fields
      if (!formData.name || !formData.place_id || !formData.floors) {
        throw new Error('Thiếu thông tin bắt buộc');
      }

      if (!formData.shapes && !formData.modelFile) {
        throw new Error('Vui lòng vẽ khối hình hoặc tải file model');
      }

      const latitude = formData.latitude || 10.874334
      const longitude = formData.longitude || 106.803250

      // Step 3: Prepare 3D objects
      const objects3d: (Geometry3DObject | Mesh3DObject)[] = []

      // Add geometry shapes if drawing mode
      if (formData.shapes && formData.shapes.length > 0) {
        message.loading({ content: 'Đang xử lý các khối hình...', key: 'process-shapes' });
        const geometryObject = convertShapesToGeometry(formData.shapes, latitude, longitude)
        objects3d.push(geometryObject)
        message.success({ content: 'Đã xử lý khối hình!', key: 'process-shapes', duration: 2 });
      }

      // Add GLB mesh instances
      if (formData.glbAssets && formData.glbAssets.length > 0) {
        message.loading({ content: 'Đang xử lý GLB assets...', key: 'process-glb' });
        const meshObject = await convertGlbAssetsToMeshes(formData.glbAssets, latitude, longitude)
        objects3d.push(meshObject)
        message.success({ content: 'Đã xử lý GLB assets!', key: 'process-glb', duration: 2 });
      }

      // Add uploaded model if provided
      if (formData.modelFile) {
        message.loading({ content: 'Đang xử lý model...', key: 'save-model' });
        
          // Upload model file (GLB) via imageService and use returned URL
          try {
            const uploaded = await imageService.uploadImages([formData.modelFile as File])
            const modelUrl = uploaded && uploaded[0] && uploaded[0].url ? uploaded[0].url : ''
            const meshObject: Mesh3DObject = {
              objectType: 0,
              meshes: [{
                meshUrl: modelUrl,
                point: {
                  type: 'Point',
                  coordinates: [longitude, latitude, 0]
                },
                rotate: 0,
                scale: 1
              }]
            }
            objects3d.push(meshObject)
            message.success({ content: 'Đã lưu model!', key: 'save-model', duration: 2 });
          } catch (err) {
            message.warning({ content: 'Không thể lưu model lên server, tiếp tục không có model', key: 'save-model', duration: 2 })
          }
      }

      // Step 4: Create building request
      // Normalize objects3d: remove any empty entries
      const normalizedObjects3d = objects3d.filter(obj => {
        if (!obj) return false
        if ((obj as any).objectType === 0) {
          return Array.isArray((obj as any).meshes) && (obj as any).meshes.length > 0
        }
        if ((obj as any).objectType === 1) {
          return (obj as any).body && Array.isArray((obj as any).body.prisms) && (obj as any).body.prisms.length > 0
        }
        return false
      })
      // Normalized objects3d successfully
      const buildingData: CreateBuildingRequest = {
        name: formData.name,
        description: formData.description || '',
        floors: formData.floors,
        image: imageUrl,
        placeId: formData.place_id,
        objects3d: normalizedObjects3d
      };

      // Step 5: Create building via API
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