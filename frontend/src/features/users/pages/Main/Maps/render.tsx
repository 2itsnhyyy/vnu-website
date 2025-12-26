import Graphic from "@arcgis/core/Graphic";
import Polygon from "@arcgis/core/geometry/Polygon";
import Point from "@arcgis/core/geometry/Point";
import Mesh from "@arcgis/core/geometry/Mesh";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";

export const buildingPopupTemplate = {
  title: `<div style="font-size: 1.1rem; font-weight: 600; color: #1a73e8; margin-bottom: 4px;">{name}</div>`,
  content: [
    {
      type: "text",
      text: `
        <div style="font-family: sans-serif; font-size: 0.9rem; line-height: 1.4;">
          <div style="margin-bottom: 4px;"><b>📍 Vị trí:</b> {placeName}</div>
          <div style="margin-bottom: 4px;"><b>🏢 Số tầng:</b> {floors}</div>
          <div style="margin-bottom: 8px;"><b>📝 Mô tả:</b> {description}</div>
        </div>
      `,
    },
    {
      type: "media",
      mediaInfos: [
        {
          title: "Hình ảnh thực tế",
          type: "image",
          value: { sourceURL: "{imageUrl}" },
        },
      ],
    },
  ],
};

export const addPrismToLayer = (
  prism: any,
  building: any,
  layer: GraphicsLayer
) => {
  const polygon = new Polygon({
    rings: prism.baseFaceGeometry.coordinates[0],
    spatialReference: { wkid: 4326 },
  });

  const graphic = new Graphic({
    geometry: polygon,
    symbol: {
      type: "polygon-3d",
      symbolLayers: [
        {
          type: "extrude",
          size: prism.height,
          material: { color: [245, 245, 242, 0.9] },
          edges: {
            type: "solid",
            color: [130, 130, 130, 0.5],
            size: 0.5,
          } as any,
        },
      ],
    } as any,
    attributes: {
      name: building.name,
      description: building.description || "Đang cập nhật...",
      floors: building.floors || 0,
      placeName: building.placeName || "",
      imageUrl: building.image,
      buildingId: building.buildingId,
      height: prism.height,
      placeId: building.placeId,
    },
  });

  layer.add(graphic);
};

export const addMeshToLayer = async (
  mesh: any,
  building: any,
  layer: GraphicsLayer
) => {
  try {
    const point = new Point({
      longitude: mesh.pointGeometry.coordinates[0],
      latitude: mesh.pointGeometry.coordinates[1],
      z: mesh.pointGeometry.coordinates[2] || 0,
      spatialReference: { wkid: 4326 },
    });

    const gltfMesh = await Mesh.createFromGLTF(point, mesh.meshUrl);

    const rotationZ = Array.isArray(mesh.rotate)
      ? mesh.rotate[2]
      : mesh.rotate || 0;
    const scaleValue = Array.isArray(mesh.scale)
      ? mesh.scale[0]
      : mesh.scale || 1;

    gltfMesh.rotate(0, 0, rotationZ);
    gltfMesh.scale(scaleValue);

    const graphic = new Graphic({
      geometry: gltfMesh,
      symbol: {
        type: "mesh-3d",
        symbolLayers: [{ type: "fill", material: { color: "white" } }],
      } as any,
      attributes: {
        name: building.name,
        description: building.description || "Đang cập nhật...",
        floors: building.floors || 0,
        placeName: building.placeName || "",
        imageUrl: building.image,
        buildingId: building.buildingId,
        placeId: building.placeId,
      },
    });

    layer.add(graphic);
  } catch (error) {
    console.warn(`Failed to load mesh for ${building.name}`, error);
  }
};
