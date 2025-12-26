import { useState } from "react";
import { message } from "antd";
import { buildingService } from "../../../services/BuildingService";
import { imageService } from "../../../services/ImageService";
import type {
  CreateBuildingRequest,
  Building,
  Geometry3DObject,
  Mesh3DObject,
} from "../../../types/building";

interface Vector3 {
  x: number;
  y: number;
  z: number;
}

interface ShapeBase {
  id: string;
  type: "prism" | "cylinder" | "pyramid" | "cone" | "frustum";
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
  color: string;
}

interface PrismShape extends ShapeBase {
  type: "prism";
  points: [number, number][];
  height: number;
  baseLatLng?: { lat: number; lng: number }[];
}

interface CylinderShape extends ShapeBase {
  type: "cylinder";
  centerLatLng: { lat: number; lng: number };
  radius: number;
  height: number;
}

interface PyramidShape extends ShapeBase {
  type: "pyramid";
  basePoints: [number, number][];
  baseLatLng: { lat: number; lng: number }[];
  apexLatLng: { lat: number; lng: number };
  apexHeight: number;
}

interface ConeShape extends ShapeBase {
  type: "cone";
  centerLatLng: { lat: number; lng: number };
  apexLatLng: { lat: number; lng: number };
  radius: number;
  apexHeight: number;
}

interface FrustumShape extends ShapeBase {
  type: "frustum";
  basePoints: [number, number][];
  topPoints: [number, number][];
  baseLatLng: { lat: number; lng: number }[];
  topLatLng: { lat: number; lng: number }[];
  topHeight: number;
}

type Shape =
  | PrismShape
  | CylinderShape
  | PyramidShape
  | ConeShape
  | FrustumShape;

interface GlbAsset {
  id: string;
  name: string;
  file: File;
  url: string;
  instances: {
    id: string;
    position: Vector3;
    rotation: Vector3;
    scale: Vector3;
  }[];
}

interface BuildingFormData {
  name: string;
  description?: string;
  floors: number;
  place_id: number;
  imageFile?: File;
  modelType?: "upload" | "draw";
  modelFile?: File;
  modelFileName?: string;

  latitude?: number;
  longitude?: number;
  shapes?: Shape[];
  glbAssets?: GlbAsset[];
}

export const useCreateBuilding = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Convert shapes to Geometry3DObject array (grouped by type)
   */
  const convertShapesToGeometry = (
    shapes: Shape[],
    latitude: number,
    longitude: number
  ): Geometry3DObject[] => {
    const objects3d: Geometry3DObject[] = [];

    // Group shapes by type
    const shapesByType: Record<string, Shape[]> = {
      prism: [],
      cylinder: [],
      pyramid: [],
      cone: [],
      frustum: [],
    };

    shapes.forEach((shape) => {
      if (shapesByType[shape.type]) {
        shapesByType[shape.type].push(shape);
      }
    });

    // Process prisms
    if (shapesByType.prism.length > 0) {
      const prisms = shapesByType.prism
        .map((shape) => {
          const prismShape = shape as PrismShape;
          if (
            !prismShape.baseLatLng ||
            !Array.isArray(prismShape.baseLatLng) ||
            prismShape.baseLatLng.length < 3
          ) {
            return null;
          }

          const yOffset = prismShape.position.y || 0;
          const coordinates = [
            prismShape.baseLatLng
              .filter(
                (p) =>
                  p && typeof p.lat === "number" && typeof p.lng === "number"
              )
              .map((p) => [p.lng, p.lat, yOffset]),
          ];

          if (coordinates[0] && coordinates[0].length >= 3) {
            if (
              JSON.stringify(coordinates[0][0]) !==
              JSON.stringify(coordinates[0][coordinates[0].length - 1])
            ) {
              coordinates[0].push(coordinates[0][0]);
            }
            return {
              baseFace: {
                type: "Polygon" as const,
                coordinates: coordinates,
              },
              height: prismShape.height,
            };
          }
          return null;
        })
        .filter((p) => p !== null);

      if (prisms.length > 0) {
        objects3d.push({
          objectType: 1,
          body: {
            name: `Prisms (${prisms.length})`,
            prisms: prisms as any[],
          },
        });
      }
    }

    // Process cylinders
    if (shapesByType.cylinder.length > 0) {
      const cylinders = shapesByType.cylinder
        .map((shape) => {
          const cylinderShape = shape as CylinderShape;
          if (
            !cylinderShape.centerLatLng ||
            typeof cylinderShape.centerLatLng.lng !== "number" ||
            typeof cylinderShape.centerLatLng.lat !== "number" ||
            !cylinderShape.radius ||
            cylinderShape.radius <= 0 ||
            !cylinderShape.height ||
            cylinderShape.height <= 0
          ) {
            return null;
          }

          return {
            center: {
              point: {
                type: "Point" as const,
                coordinates: [
                  cylinderShape.centerLatLng.lng,
                  cylinderShape.centerLatLng.lat,
                  cylinderShape.position.y || 0,
                ],
              },
            },
            radius: cylinderShape.radius,
            height: cylinderShape.height,
          };
        })
        .filter((c) => c !== null);

      if (cylinders.length > 0) {
        objects3d.push({
          objectType: 1,
          body: {
            name: `Cylinders (${cylinders.length})`,
            cylinders: cylinders as any[],
          },
        });
      }
    }

    // Process pyramids
    if (shapesByType.pyramid.length > 0) {
      const pyramids = shapesByType.pyramid
        .map((shape) => {
          const pyramidShape = shape as PyramidShape;
          if (
            !pyramidShape.baseLatLng ||
            !Array.isArray(pyramidShape.baseLatLng) ||
            pyramidShape.baseLatLng.length < 3 ||
            !pyramidShape.apexLatLng ||
            typeof pyramidShape.apexLatLng.lng !== "number" ||
            typeof pyramidShape.apexLatLng.lat !== "number" ||
            !pyramidShape.apexHeight ||
            pyramidShape.apexHeight <= 0
          ) {
            return null;
          }

          const yOffset = pyramidShape.position.y || 0;
          const baseCoordinates = [
            pyramidShape.baseLatLng
              .filter(
                (p) =>
                  p && typeof p.lat === "number" && typeof p.lng === "number"
              )
              .map((p) => [p.lng, p.lat, yOffset]),
          ];

          if (baseCoordinates[0] && baseCoordinates[0].length >= 3) {
            if (
              JSON.stringify(baseCoordinates[0][0]) !==
              JSON.stringify(baseCoordinates[0][baseCoordinates[0].length - 1])
            ) {
              baseCoordinates[0].push(baseCoordinates[0][0]);
            }
            return {
              baseFace: {
                type: "Polygon" as const,
                coordinates: baseCoordinates,
              },
              apex: {
                point: {
                  type: "Point" as const,
                  coordinates: [
                    pyramidShape.apexLatLng.lng,
                    pyramidShape.apexLatLng.lat,
                    yOffset + pyramidShape.apexHeight,
                  ],
                },
              },
            };
          }
          return null;
        })
        .filter((p) => p !== null);

      if (pyramids.length > 0) {
        objects3d.push({
          objectType: 1,
          body: {
            name: `Pyramids (${pyramids.length})`,
            pyramids: pyramids as any[],
          },
        });
      }
    }

    // Process cones
    if (shapesByType.cone.length > 0) {
      const cones = shapesByType.cone
        .map((shape) => {
          const coneShape = shape as ConeShape;
          if (
            !coneShape.centerLatLng ||
            typeof coneShape.centerLatLng.lng !== "number" ||
            typeof coneShape.centerLatLng.lat !== "number" ||
            !coneShape.apexLatLng ||
            typeof coneShape.apexLatLng.lng !== "number" ||
            typeof coneShape.apexLatLng.lat !== "number" ||
            !coneShape.radius ||
            coneShape.radius <= 0 ||
            !coneShape.apexHeight ||
            coneShape.apexHeight <= 0
          ) {
            return null;
          }

          const yOffset = coneShape.position.y || 0;
          return {
            center: {
              point: {
                type: "Point" as const,
                coordinates: [
                  coneShape.centerLatLng.lng,
                  coneShape.centerLatLng.lat,
                  yOffset,
                ],
              },
            },
            radius: coneShape.radius,
            apex: {
              point: {
                type: "Point" as const,
                coordinates: [
                  coneShape.apexLatLng.lng,
                  coneShape.apexLatLng.lat,
                  yOffset + coneShape.apexHeight,
                ],
              },
            },
          };
        })
        .filter((c) => c !== null);

      if (cones.length > 0) {
        objects3d.push({
          objectType: 1,
          body: {
            name: `Cones (${cones.length})`,
            cones: cones as any[],
          },
        });
      }
    }

    // Process frustums
    if (shapesByType.frustum.length > 0) {
      const frustums = shapesByType.frustum
        .map((shape) => {
          const frustumShape = shape as FrustumShape;
          if (
            !frustumShape.baseLatLng ||
            !Array.isArray(frustumShape.baseLatLng) ||
            frustumShape.baseLatLng.length < 3 ||
            !frustumShape.topLatLng ||
            !Array.isArray(frustumShape.topLatLng) ||
            frustumShape.topLatLng.length < 3 ||
            !frustumShape.topHeight ||
            frustumShape.topHeight <= 0
          ) {
            return null;
          }

          const yOffset = frustumShape.position.y || 0;
          const baseCoordinates = [
            frustumShape.baseLatLng
              .filter(
                (p) =>
                  p && typeof p.lat === "number" && typeof p.lng === "number"
              )
              .map((p) => [p.lng, p.lat, yOffset]),
          ];
          const topCoordinates = [
            frustumShape.topLatLng
              .filter(
                (p) =>
                  p && typeof p.lat === "number" && typeof p.lng === "number"
              )
              .map((p) => [p.lng, p.lat, yOffset + frustumShape.topHeight]),
          ];

          if (
            baseCoordinates[0] &&
            baseCoordinates[0].length >= 3 &&
            topCoordinates[0] &&
            topCoordinates[0].length >= 3
          ) {
            if (
              JSON.stringify(baseCoordinates[0][0]) !==
              JSON.stringify(baseCoordinates[0][baseCoordinates[0].length - 1])
            ) {
              baseCoordinates[0].push(baseCoordinates[0][0]);
            }
            if (
              JSON.stringify(topCoordinates[0][0]) !==
              JSON.stringify(topCoordinates[0][topCoordinates[0].length - 1])
            ) {
              topCoordinates[0].push(topCoordinates[0][0]);
            }
            return {
              baseFace: {
                type: "Polygon" as const,
                coordinates: baseCoordinates,
              },
              topFace: {
                type: "Polygon" as const,
                coordinates: topCoordinates,
              },
            };
          }
          return null;
        })
        .filter((f) => f !== null);

      if (frustums.length > 0) {
        objects3d.push({
          objectType: 1,
          body: {
            name: `Frustums (${frustums.length})`,
            frustums: frustums as any[],
          },
        });
      }
    }

    return objects3d;
  };

  /**
   * Convert GLB assets to Mesh3DObject
   */
  const convertGlbAssetsToMeshes = async (
    glbAssets: GlbAsset[],
    latitude: number,
    longitude: number
  ): Promise<Mesh3DObject> => {
    const meshes = [];

    for (const asset of glbAssets) {
      // Upload GLB file via imageService to obtain a public URL
      try {
        const uploaded = await imageService.uploadImages([asset.file]);
        const url =
          uploaded && uploaded[0] && uploaded[0].url ? uploaded[0].url : "";

        // Create mesh entry for each instance using the uploaded URL
        for (const instance of asset.instances) {
          meshes.push({
            meshUrl: url,
            point: {
              type: "Point" as const,
              coordinates: [
                longitude + instance.position.x / 111320,
                latitude + instance.position.z / 110540,
                instance.position.y,
              ] as [number, number, number],
            },
            rotate: instance.rotation.y * (180 / Math.PI), // Convert to degrees
            scale: instance.scale.x,
          });
        }
      } catch (err) {
        // Failed to upload GLB asset
      }
    }

    return {
      objectType: 0, // Mesh type
      meshes,
    };
  };

  /**
   * Create building with all data
   */
  const createBuilding = async (
    formData: BuildingFormData
  ): Promise<Building | null> => {
    setLoading(true);
    setError(null);

    try {
      // Step 1: Upload image
      let imageUrl = "";
      if (formData.imageFile) {
        message.loading({
          content: "Đang tải ảnh lên...",
          key: "upload-image",
        });

        try {
          const uploadedImages = await imageService.uploadImages([
            formData.imageFile,
          ]);

          if (uploadedImages && uploadedImages.length > 0) {
            imageUrl = uploadedImages[0].url;
            message.success({
              content: "Tải ảnh lên thành công!",
              key: "upload-image",
              duration: 2,
            });
          }
        } catch (err: any) {
          message.warning({
            content: "Không thể tải ảnh, tiếp tục không có ảnh",
            key: "upload-image",
            duration: 2,
          });
        }
      }

      // Step 2: Validate required fields
      if (!formData.name || !formData.place_id || !formData.floors) {
        throw new Error("Thiếu thông tin bắt buộc");
      }

      if (!formData.shapes && !formData.modelFile) {
        throw new Error("Vui lòng vẽ khối hình hoặc tải file model");
      }

      const latitude = formData.latitude || 10.874334;
      const longitude = formData.longitude || 106.80325;

      // Step 3: Prepare 3D objects
      const objects3d: (Geometry3DObject | Mesh3DObject)[] = [];

      // Add geometry shapes if drawing mode
      if (formData.shapes && formData.shapes.length > 0) {
        message.loading({
          content: "Đang xử lý các khối hình...",
          key: "process-shapes",
        });
        const geometryObjects = convertShapesToGeometry(
          formData.shapes,
          latitude,
          longitude
        );
        objects3d.push(...geometryObjects);
        message.success({
          content: "Đã xử lý khối hình!",
          key: "process-shapes",
          duration: 2,
        });
      }

      // Add GLB mesh instances
      if (formData.glbAssets && formData.glbAssets.length > 0) {
        message.loading({
          content: "Đang xử lý GLB assets...",
          key: "process-glb",
        });
        const meshObject = await convertGlbAssetsToMeshes(
          formData.glbAssets,
          latitude,
          longitude
        );
        objects3d.push(meshObject);
        message.success({
          content: "Đã xử lý GLB assets!",
          key: "process-glb",
          duration: 2,
        });
      }

      // Add uploaded model if provided
      if (formData.modelFile) {
        message.loading({ content: "Đang xử lý model...", key: "save-model" });

        // Upload model file (GLB) via imageService and use returned URL
        try {
          const uploaded = await imageService.uploadImages([
            formData.modelFile as File,
          ]);
          const modelUrl =
            uploaded && uploaded[0] && uploaded[0].url ? uploaded[0].url : "";
          const meshObject: Mesh3DObject = {
            objectType: 0,
            meshes: [
              {
                meshUrl: modelUrl,
                point: {
                  type: "Point",
                  coordinates: [longitude, latitude, 0],
                },
                rotate: 0,
                scale: 1,
              },
            ],
          };
          objects3d.push(meshObject);
          message.success({
            content: "Đã lưu model!",
            key: "save-model",
            duration: 2,
          });
        } catch (err) {
          message.warning({
            content: "Không thể lưu model lên server, tiếp tục không có model",
            key: "save-model",
            duration: 2,
          });
        }
      }

      // Step 4: Create building request
      // Normalize objects3d: remove any empty entries
      console.log("objects3d", objects3d);
      const normalizedObjects3d = objects3d.filter((obj) => {
        if (!obj) return false;
        if ((obj as any).objectType === 0) {
          return (
            Array.isArray((obj as any).meshes) && (obj as any).meshes.length > 0
          );
        }
        if ((obj as any).objectType === 1) {
          const body = (obj as any).body;
          if (!body) return false;
          // Check if body has at least one valid shape type
          return (
            (Array.isArray(body.prisms) && body.prisms.length > 0) ||
            (Array.isArray(body.cylinders) && body.cylinders.length > 0) ||
            (Array.isArray(body.pyramids) && body.pyramids.length > 0) ||
            (Array.isArray(body.cones) && body.cones.length > 0) ||
            (Array.isArray(body.frustums) && body.frustums.length > 0)
          );
        }
        return false;
      });
      console.log("normalizedObjects3d", normalizedObjects3d);
      // Normalized objects3d successfully
      const buildingData: CreateBuildingRequest = {
        name: formData.name,
        description: formData.description || "",
        floors: formData.floors,
        image: imageUrl,
        placeId: formData.place_id,
        objects3d: normalizedObjects3d,
      };

      // Step 5: Create building via API
      message.loading({
        content: "Đang tạo tòa nhà...",
        key: "create-building",
      });
      console.log("buildingData", buildingData);
      const createdBuilding = await buildingService.create(buildingData);

      message.success({
        content: "Tạo tòa nhà thành công!",
        key: "create-building",
        duration: 3,
      });

      return createdBuilding;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Có lỗi xảy ra";
      setError(errorMessage);

      message.error({
        content: `Tạo tòa nhà thất bại: ${errorMessage}`,
        duration: 5,
      });

      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createBuilding,
    loading,
    error,
  };
};
