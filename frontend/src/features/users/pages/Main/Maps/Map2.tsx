import { useEffect, useRef, useState } from "react";

import Map from "@arcgis/core/Map";
import SceneView from "@arcgis/core/views/SceneView";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from "@arcgis/core/Graphic";

import Point from "@arcgis/core/geometry/Point";
import Polygon from "@arcgis/core/geometry/Polygon";
import Mesh from "@arcgis/core/geometry/Mesh";

import { mapService } from "../../../api/services/mapService";

// Utility: debounce function
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function Map2() {
  const mapDiv = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<SceneView | null>(null);
  const graphicsLayerRef = useRef<GraphicsLayer | null>(null);

  const [buildings, setBuildings] = useState<any[]>([]);
  const [mapCenter, setMapCenter] = useState({ lat: 10.8709, lon: 106.8023 });
  const [mapZoom, setMapZoom] = useState(18);
  const [mapHeading, setMapHeading] = useState(0);
  const [mapTilt, setMapTilt] = useState(65);

  // Debounce để tránh gọi API quá nhiều
  const debouncedCenter = useDebounce(mapCenter, 500);
  const debouncedZoom = useDebounce(mapZoom, 500);
  const debouncedHeading = useDebounce(mapHeading, 500);
  const debouncedTilt = useDebounce(mapTilt, 500);

  // Track rendered buildings để tránh duplicate
  const renderedBuildingIdsRef = useRef<Set<number>>(new Set());

  // Load buildings từ API
  useEffect(() => {
    const loadBuildings = async () => {
      try {
        const data = await mapService.getBuildings(
          debouncedCenter.lat,
          debouncedCenter.lon,
          Math.floor(debouncedZoom),
          debouncedHeading ?? 0,
          debouncedTilt ?? 0
        );

        setBuildings((prev) => {
          const existingIds = new Set(prev.map((b) => b.buildingId));
          const uniqueNew = data.filter(
            (b: any) => !existingIds.has(b.buildingId)
          );
          return [...prev, ...uniqueNew];
        });
      } catch (error) {
        console.error("Lỗi nạp tòa nhà:", error);
      }
    };

    loadBuildings();
  }, [debouncedCenter, debouncedZoom, debouncedHeading, debouncedTilt]);

  useEffect(() => {
    if (!mapDiv.current) return;

    /* ================= MAP 3D ================= */
    const map = new Map({
      basemap: "osm",
      ground: "world-elevation",
    });

    const view = new SceneView({
      container: mapDiv.current,
      map,
      camera: {
        position: {
          longitude: 106.8023,
          latitude: 10.8709,
          z: 300,
        },
        tilt: 65,
      },
      environment: {
        lighting: {
          directShadowsEnabled: true,
        } as any,
      },
    });

    viewRef.current = view;

    /* ================= GRAPHICS LAYER ================= */
    const graphicsLayer = new GraphicsLayer({
      elevationInfo: {
        mode: "relative-to-ground",
      },
    });

    map.add(graphicsLayer);
    graphicsLayerRef.current = graphicsLayer;

    /* ================= UPDATE MAP STATE ================= */
    const updateMapState = () => {
      const center = view.center;
      if (
        center &&
        typeof center.latitude === "number" &&
        typeof center.longitude === "number"
      ) {
        setMapCenter({ lat: center.latitude, lon: center.longitude });
      }

      const zoom = view.zoom;
      if (typeof zoom === "number") {
        setMapZoom(zoom);
      }

      const camera = view.camera;
      if (camera) {
        const heading = typeof camera.heading === "number" ? camera.heading : 0;
        const tilt = typeof camera.tilt === "number" ? camera.tilt : 0;
        setMapHeading(heading);
        setMapTilt(tilt);
      }
    };

    view.watch("center", updateMapState);
    view.watch("zoom", updateMapState);
    view.watch("camera", updateMapState);

    /* ================= ADD PRISM (EXTRUDE) ================= */
    const addPrism = (prism: any, building: any) => {
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
              // Màu xám trắng đặc trưng của OSM 3D
              material: {
                color: [245, 245, 242, 1],
              },
              edges: {
                type: "solid",
                // Viền xám mảnh giúp khối rõ nét nhưng không bị thô
                color: [130, 130, 130, 0.6],
                size: 0.5, // Độ dày nhỏ để thanh thoát
              } as any,
            },
          ],
        },
        attributes: {
          name: building.name,
          height: prism.height,
          buildingId: building.buildingId,
        },
      });

      graphicsLayer.add(graphic);
    };

    /* ================= ADD MESH (GLTF → Mesh Geometry) ================= */
    const addMeshFromGLTF = async (mesh: any, building: any) => {
      try {
        const point = new Point({
          longitude: mesh.pointGeometry.coordinates[0],
          latitude: mesh.pointGeometry.coordinates[1],
          z: mesh.pointGeometry.coordinates[2] || 0,
          spatialReference: { wkid: 4326 },
        });

        // 🔥 CORE: createFromGLTF
        const gltfMesh = await Mesh.createFromGLTF(point, mesh.meshUrl);

        gltfMesh.rotate(0, 0, mesh.rotate || 0);
        gltfMesh.scale(mesh.scale || 1);

        const graphic = new Graphic({
          geometry: gltfMesh,
          symbol: {
            type: "mesh-3d",
            symbolLayers: [
              {
                type: "fill",
                material: {
                  color: "white",
                },
              },
            ],
          },
          attributes: {
            meshId: mesh.meshId,
            name: building.name,
            buildingId: building.buildingId,
          },
        });

        graphicsLayer.add(graphic);
      } catch (error) {
        console.error(`Lỗi load GLB mesh ${mesh.meshUrl}:`, error);
      }
    };

    /* ================= RENDER BUILDINGS ================= */
    const renderBuildings = (buildingsToRender: any[]) => {
      if (!graphicsLayer) return;

      const renderedIds = renderedBuildingIdsRef.current;
      const newBuildings = buildingsToRender.filter(
        (b) => !renderedIds.has(b.buildingId)
      );

      if (newBuildings.length === 0) return;

      console.log(
        `🏗️ Rendering ${newBuildings.length} new buildings out of ${buildingsToRender.length} total`
      );

      newBuildings.forEach((building: any) => {
        if (!building.objects3d || building.objects3d.length === 0) {
          console.warn(`⚠️ Building "${building.name}" has no objects3d`);
          return;
        }

        building.objects3d.forEach((obj: any) => {
          // GLTF Mesh
          if (obj.objectType === 0 && obj.meshes) {
            obj.meshes.forEach((mesh: any) => {
              addMeshFromGLTF(mesh, building); // ⚠ async
            });
          }

          // Extrude
          if (obj.objectType === 1 && obj.bodies) {
            obj.bodies.forEach((body: any) => {
              body.prisms?.forEach((prism: any) => {
                addPrism(prism, building);
              });
            });
          }
        });

        renderedIds.add(building.buildingId);
      });
    };

    // Render buildings khi có data mới
    if (buildings.length > 0) {
      renderBuildings(buildings);
    }

    /* ================= POPUP ================= */
    // Popup sẽ được set trên từng graphic riêng lẻ

    return () => {
      view.destroy();
    };
  }, []); // Chỉ chạy một lần khi mount

  // Render buildings khi buildings state thay đổi
  useEffect(() => {
    if (!graphicsLayerRef.current || buildings.length === 0) return;

    const graphicsLayer = graphicsLayerRef.current;
    const renderedIds = renderedBuildingIdsRef.current;
    const newBuildings = buildings.filter(
      (b) => !renderedIds.has(b.buildingId)
    );

    if (newBuildings.length === 0) return;

    console.log(
      `🏗️ Rendering ${newBuildings.length} new buildings out of ${buildings.length} total`
    );

    /* ================= ADD PRISM (EXTRUDE) ================= */
    const addPrism = (prism: any, building: any) => {
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
              // 1. Đổi màu về xám trắng giống OSM
              material: {
                color: [245, 245, 242, 1],
              },
              // 2. Đổi viền trắng thô sang xám mảnh cho tinh tế
              edges: {
                type: "solid",
                color: [130, 130, 130, 0.6],
                size: 0.5,
              } as any,
            },
          ],
        },
        attributes: {
          name: building.name,
          height: prism.height,
          buildingId: building.buildingId,
        },
      });

      graphicsLayer.add(graphic);
    };

    /* ================= ADD MESH (GLTF → Mesh Geometry) ================= */
    const addMeshFromGLTF = async (mesh: any, building: any) => {
      try {
        const point = new Point({
          longitude: mesh.pointGeometry.coordinates[0],
          latitude: mesh.pointGeometry.coordinates[1],
          z: mesh.pointGeometry.coordinates[2] || 0,
          spatialReference: { wkid: 4326 },
        });

        // 🔥 CORE: createFromGLTF
        const gltfMesh = await Mesh.createFromGLTF(point, mesh.meshUrl);

        gltfMesh.rotate(0, 0, mesh.rotate || 0);
        gltfMesh.scale(mesh.scale || 1);

        const graphic = new Graphic({
          geometry: gltfMesh,
          symbol: {
            type: "mesh-3d",
            symbolLayers: [
              {
                type: "fill",
                material: {
                  color: "white",
                },
              },
            ],
          },
          attributes: {
            meshId: mesh.meshId,
            name: building.name,
            buildingId: building.buildingId,
          },
        });

        graphicsLayer.add(graphic);
      } catch (error) {
        console.error(`Lỗi load GLB mesh ${mesh.meshUrl}:`, error);
      }
    };

    newBuildings.forEach((building: any) => {
      if (!building.objects3d || building.objects3d.length === 0) {
        console.warn(`⚠️ Building "${building.name}" has no objects3d`);
        return;
      }

      building.objects3d.forEach((obj: any) => {
        // GLTF Mesh
        if (obj.objectType === 0 && obj.meshes) {
          obj.meshes.forEach((mesh: any) => {
            addMeshFromGLTF(mesh, building); // ⚠ async
          });
        }

        // Extrude
        if (obj.objectType === 1 && obj.bodies) {
          obj.bodies.forEach((body: any) => {
            body.prisms?.forEach((prism: any) => {
              addPrism(prism, building);
            });
          });
        }
      });

      renderedBuildingIdsRef.current.add(building.buildingId);
    });
  }, [buildings]);

  return <div ref={mapDiv} style={{ width: "100%", height: "100vh" }} />;
}
