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

export const addCylinderToLayer = (
  cylinder: any,
  building: any,
  layer: GraphicsLayer
) => {
  try {
    const center = cylinder.centerGeometry.coordinates;
    const lon = center[0];
    const lat = center[1];
    const z = center[2] || 0;
    const radius = cylinder.radius;
    const height = cylinder.height;

    // Create a circle polygon approximation (32 segments)
    const segments = 32;
    const rings: number[][] = [];
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const latFactor = 111320;
      const lngFactor = Math.cos((lat * Math.PI) / 180) * 111320;
      const x = lon + (radius * Math.cos(angle)) / lngFactor;
      const y = lat + (radius * Math.sin(angle)) / latFactor;
      rings.push([x, y, z]);
    }

    const polygon = new Polygon({
      rings: [rings],
      spatialReference: { wkid: 4326 },
    });

    const graphic = new Graphic({
      geometry: polygon,
      symbol: {
        type: "polygon-3d",
        symbolLayers: [
          {
            type: "extrude",
            size: height,
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
        height: height,
        placeId: building.placeId,
      },
    });

    layer.add(graphic);
  } catch (error) {
    console.warn(`Failed to add cylinder for ${building.name}`, error);
  }
};

export const addPyramidToLayer = (
  pyramid: any,
  building: any,
  layer: GraphicsLayer
) => {
  try {
    const baseCoords = pyramid.baseFaceGeometry.coordinates[0];
    const apex = pyramid.apexGeometry.coordinates;
    const apexLon = apex[0];
    const apexLat = apex[1];
    const apexZ = apex[2] || 0;

    // Get base elevation (first point's Z coordinate)
    const baseZ = baseCoords[0][2] || 0;

    // Create vertices: apex first, then base vertices
    const vertexPositions: number[] = [];
    const vertexIndices: number[] = [];

    // Add apex vertex (index 0)
    vertexPositions.push(apexLon, apexLat, apexZ);

    // Add base vertices (indices 1 to baseCoords.length)
    const baseVertexCount = baseCoords.length;
    for (let i = 0; i < baseVertexCount; i++) {
      const coord = baseCoords[i];
      vertexPositions.push(coord[0], coord[1], coord[2] || baseZ);
    }

    // Create side faces (triangles from apex to base edges)
    for (let i = 0; i < baseVertexCount; i++) {
      const v0 = 0; // Apex
      const v1 = 1 + i; // Current base vertex
      const v2 = 1 + ((i + 1) % baseVertexCount); // Next base vertex
      vertexIndices.push(v0, v1, v2);
    }

    // Create base face (fan triangulation)
    for (let i = 1; i < baseVertexCount - 1; i++) {
      const v0 = 1; // First base vertex
      const v1 = 1 + i;
      const v2 = 1 + i + 1;
      vertexIndices.push(v0, v1, v2);
    }

    // Create mesh geometry using ArcGIS Mesh constructor
    const mesh = new Mesh({
      vertexAttributes: {
        position: vertexPositions,
      },
      components: [
        {
          faces: vertexIndices,
        },
      ],
      spatialReference: { wkid: 4326 },
    });

    const graphic = new Graphic({
      geometry: mesh,
      symbol: {
        type: "mesh-3d",
        symbolLayers: [
          {
            type: "fill",
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
        height: apexZ - baseZ,
        placeId: building.placeId,
      },
    });

    layer.add(graphic);
  } catch (error) {
    console.warn(`Failed to add pyramid for ${building.name}`, error);
  }
};

export const addConeToLayer = (
  cone: any,
  building: any,
  layer: GraphicsLayer
) => {
  try {
    const center = cone.centerGeometry.coordinates;
    const lon = center[0];
    const lat = center[1];
    const baseZ = center[2] || 0;

    const apex = cone.apexGeometry.coordinates;
    const apexLon = apex[0];
    const apexLat = apex[1];
    const apexZ = apex[2] || 0;

    const radius = cone.radius;
    const segments = 32;

    // Create vertices for the cone mesh
    const vertices: number[] = [];
    const indices: number[] = [];

    // Add apex vertex (top point)
    const latFactor = 111320;
    const lngFactor = Math.cos((lat * Math.PI) / 180) * 111320;
    vertices.push(apexLon, apexLat, apexZ);

    // Add base vertices (circle)
    const baseVertices: number[] = [];
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const x = lon + (radius * Math.cos(angle)) / lngFactor;
      const y = lat + (radius * Math.sin(angle)) / latFactor;
      baseVertices.push(x, y, baseZ);
      vertices.push(x, y, baseZ);
    }

    // Create triangular faces from apex to base
    for (let i = 0; i < segments; i++) {
      const v0 = 0; // Apex vertex index
      const v1 = 1 + i; // Current base vertex
      const v2 = 1 + ((i + 1) % segments); // Next base vertex

      // Add two triangles for each face (ensuring correct winding order)
      indices.push(v0, v1, v2);
    }

    // Create base face (fan triangulation)
    for (let i = 1; i < segments - 1; i++) {
      const v0 = 1; // First base vertex
      const v1 = 1 + i;
      const v2 = 1 + i + 1;
      indices.push(v0, v1, v2);
    }

    // Create mesh geometry using ArcGIS Mesh constructor
    const mesh = new Mesh({
      vertexAttributes: {
        position: vertices,
      },
      components: [
        {
          faces: indices,
        },
      ],
      spatialReference: { wkid: 4326 },
    });

    const graphic = new Graphic({
      geometry: mesh,
      symbol: {
        type: "mesh-3d",
        symbolLayers: [
          {
            type: "fill",
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
        height: apexZ - baseZ,
        placeId: building.placeId,
      },
    });

    layer.add(graphic);
  } catch (error) {
    console.warn(`Failed to add cone for ${building.name}`, error);
  }
};

export const addFrustumToLayer = (
  frustum: any,
  building: any,
  layer: GraphicsLayer
) => {
  try {
    const basePolygon = new Polygon({
      rings: frustum.baseFaceGeometry.coordinates[0],
      spatialReference: { wkid: 4326 },
    });

    // Get base and top elevations
    const baseZ = frustum.baseFaceGeometry.coordinates[0][0][2] || 0;
    const topZ = frustum.topFaceGeometry.coordinates[0][0][2] || 0;
    const height = Math.abs(topZ - baseZ);

    // Render base polygon with extrude (approximation of frustum)
    const baseGraphic = new Graphic({
      geometry: basePolygon,
      symbol: {
        type: "polygon-3d",
        symbolLayers: [
          {
            type: "extrude",
            size: height,
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
        height: height,
        placeId: building.placeId,
      },
    });

    layer.add(baseGraphic);
  } catch (error) {
    console.warn(`Failed to add frustum for ${building.name}`, error);
  }
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
