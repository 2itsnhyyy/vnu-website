import React, { useState, useEffect, useRef } from "react";
import { message, InputNumber, Select } from "antd";
import leftClickIcon from "../../../../../assets/icons/left-click.png";
import rightClickIcon from "../../../../../assets/icons/right-click.png";

// Preview scale constant: 1 unit ThreeJS = 1 meter, but scale down for better visuals
const PREVIEW_SCALE = 1.0;

// Types
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
  name?: string;
  description?: string;
  floors?: number;
  place_id?: number;
  imageFile?: File;
  enableDraw?: boolean;
  enableUpload?: boolean;
  modelFile?: File;
  modelFileName?: string;
  useLocalStorage?: boolean;
  latitude?: number;
  longitude?: number;
  shapes?: Shape[];
  glbAssets?: GlbAsset[];
  objects3d?: any[];
}

interface Step3Props {
  initialData: Partial<BuildingFormData>;
  onNext: (data: Partial<BuildingFormData>) => void;
  onBack: () => void;
}

const Step3: React.FC<Step3Props> = ({ initialData, onNext, onBack }) => {
  // Refs
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const threeContainerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const controlsRef = useRef<any>(null);
  const animationIdRef = useRef<number>(0);
  const tempObjectUrlsRef = useRef<string[]>([]);

  // State
  const [position, setPosition] = useState({
    lat: initialData.latitude ?? 0.874334,
    lng: initialData.longitude ?? 106.80325,
  });

  const [shapes, setShapes] = useState<Shape[]>([]);
  const [glbAssets, setGlbAssets] = useState<GlbAsset[]>([]);
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [threeLoaded, setThreeLoaded] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  // Drawing on map state
  const [drawingMode, setDrawingMode] = useState(!!initialData.enableDraw);
  const [drawPoints, setDrawPoints] = useState<{ lat: number; lng: number }[]>(
    []
  );

  const drawMarkersRef = useRef<any[]>([]);
  const drawPolylineRef = useRef<any>(null);
  const drawPolygonsRef = useRef<Map<string, any>>(new Map());
  const [drawHeight, setDrawHeight] = useState<number>(1);
  const [drawScale, setDrawScale] = useState<number>(1);
  const [drawShapeType, setDrawShapeType] = useState<
    "prism" | "cylinder" | "pyramid" | "cone" | "frustum"
  >("prism");
  const [drawRadius, setDrawRadius] = useState<number>(5);
  const [apexHeight, setApexHeight] = useState<number>(10);
  const [drawYOffset, setDrawYOffset] = useState<number>(0);

  // For cylinder: center point
  const [cylinderCenter, setCylinderCenter] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  // For pyramid: apex point
  const [pyramidApex, setPyramidApex] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  // For cone: center and apex
  const [coneCenter, setConeCenter] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [coneApex, setConeApex] = useState<{ lat: number; lng: number } | null>(
    null
  );
  // For frustum: top polygon
  const [frustumTopPoints, setFrustumTopPoints] = useState<
    { lat: number; lng: number }[]
  >([]);
  // For pyramid: saved base points after finishing base
  const [pyramidBasePoints, setPyramidBasePoints] = useState<
    { lat: number; lng: number }[]
  >([]);
  // Drawing step: 0 = drawing base, 1 = selecting apex (for pyramid)
  const [drawingStep, setDrawingStep] = useState<number>(0);

  // Keep drawingMode in sync if initialData changes
  useEffect(() => {
    setDrawingMode(!!initialData.enableDraw);
  }, [initialData.enableDraw]);

  // If user selected upload in step2 and model stored in localStorage, load a simple asset for preview
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (
      initialData.enableUpload &&
      initialData.modelFileName &&
      glbAssets.length === 0
    ) {
      const key = `model_${initialData.modelFileName}`;
      const data = localStorage.getItem(key);
      const url = data || "";
      const newAsset: GlbAsset = {
        id: `asset_${Date.now()}`,
        name: initialData.modelFileName,
        file: initialData.modelFile as File,
        url,
        instances: [
          {
            id: `instance_${Date.now()}`,
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 0.2, y: 0.2, z: 0.2 },
          },
        ],
      };
      setGlbAssets([newAsset]);
    }
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    import("leaflet").then((L) => {
      if (!mapInstanceRef.current) {
        const map = L.map(mapRef.current!, {
          scrollWheelZoom: true,
        }).setView([position.lat, position.lng], 17);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
        }).addTo(map);

        // ensure map sizing/interaction is correct after render
        setTimeout(() => {
          try {
            map.invalidateSize && map.invalidateSize();
          } catch (e) {}
        }, 200);

        const customIcon = L.divIcon({
          className: "custom-map-marker",
          html: `
            <div style="
              width: 40px; height: 40px; background: #3b82f6;
              border: 3px solid white; border-radius: 50%;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              display: flex; align-items: center; justify-content: center;
              cursor: move;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 40],
        });

        const marker = L.marker([position.lat, position.lng], {
          draggable: !drawingMode,
          icon: customIcon,
        });

        // only add marker if not in drawing mode
        if (!drawingMode) marker.addTo(map);

        marker.on("dragend", (e: any) => {
          const newPos = e.target.getLatLng();
          setPosition({ lat: newPos.lat, lng: newPos.lng });
          message.success("Đã cập nhật vị trí");
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;
        setMapReady(true);
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        setMapReady(false);
      }
    };
  }, [position.lat, position.lng]);

  // Map drawing handlers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // disable double-click zoom only during drawing mode
    try {
      if (
        drawingMode &&
        map.doubleClickZoom &&
        typeof map.doubleClickZoom.disable === "function"
      ) {
        map.doubleClickZoom.disable();
      } else if (
        !drawingMode &&
        map.doubleClickZoom &&
        typeof map.doubleClickZoom.enable === "function"
      ) {
        map.doubleClickZoom.enable();
      }
    } catch (e) {}

    const handleMapDoubleClick = (e: any) => {
      if (!drawingMode) return;

      const lat = e.latlng.lat;
      const lng = e.latlng.lng;

      // Handle different shape types
      if (drawShapeType === "cylinder") {
        if (!cylinderCenter) {
          setCylinderCenter({ lat, lng });
          import("leaflet").then((L) => {
            const marker = L.marker([lat, lng], {
              icon: L.divIcon({
                className: "custom-marker",
                html: `<div style="width: 20px; height: 20px; background: #1D4ED8; border: 2px solid white; border-radius: 50%;"></div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10],
              }),
            }).addTo(map);
            drawMarkersRef.current.push(marker);
            const circle = L.circle([lat, lng], {
              radius: drawRadius,
              color: "#1D4ED8",
              fillOpacity: 0.12,
            }).addTo(map);
            drawPolygonsRef.current.set("cylinder_preview", circle);
          });
          message.info(
            "Đã chọn tâm. Nhập bán kính và chiều cao, sau đó bấm 'Hoàn thành'."
          );
          return;
        }
        return;
      }

      if (drawShapeType === "cone") {
        if (!coneCenter) {
          setConeCenter({ lat, lng });
          import("leaflet").then((L) => {
            const marker = L.marker([lat, lng], {
              icon: L.divIcon({
                className: "custom-marker",
                html: `<div style="width: 20px; height: 20px; background: #1D4ED8; border: 2px solid white; border-radius: 50%;"></div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10],
              }),
            }).addTo(map);
            drawMarkersRef.current.push(marker);
            const circle = L.circle([lat, lng], {
              radius: drawRadius,
              color: "#1D4ED8",
              fillOpacity: 0.12,
            }).addTo(map);
            drawPolygonsRef.current.set("cone_preview", circle);
          });
          message.info(
            "Đã chọn tâm. Nhập bán kính và chiều cao, sau đó bấm 'Hoàn thành'."
          );
          return;
        }
        return;
      }

      if (drawShapeType === "pyramid") {
        if (drawingStep === 1 && !pyramidApex) {
          setPyramidApex({ lat, lng });
          import("leaflet").then((L) => {
            const marker = L.marker([lat, lng], {
              icon: L.divIcon({
                className: "custom-marker",
                html: `<div style="width: 20px; height: 20px; background: #DC2626; border: 2px solid white; border-radius: 50%;"></div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10],
              }),
            }).addTo(map);
            drawMarkersRef.current.push(marker);
          });
          message.info("Đã chọn đỉnh. Bấm 'Hoàn thành' để tạo hình chóp.");
          return;
        }
      }

      if (drawShapeType === "frustum") {
        if (drawPoints.length >= 3 && frustumTopPoints.length === 0) {
          finishFrustumBase();
          return;
        }
        if (frustumTopPoints.length >= 1) {
          const first = frustumTopPoints[0];
          const latFactor = 111320;
          const lngFactor =
            Math.cos((((lat + first.lat) / 2) * Math.PI) / 180) * 111320;
          const dx = (lng - first.lng) * lngFactor;
          const dy = (lat - first.lat) * latFactor;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 5) {
            finishFrustum();
            return;
          }
        }
        if (frustumTopPoints.length > 0) {
          setFrustumTopPoints((prev) => [...prev, { lat, lng }]);
          import("leaflet").then((L) => {
            const marker = L.circleMarker([lat, lng], {
              radius: 6,
              color: "#DC2626",
              fillColor: "#DC2626",
              fillOpacity: 0.9,
            }).addTo(map);
            drawMarkersRef.current.push(marker);
            if (drawPolylineRef.current) {
              const allPoints = [...frustumTopPoints, { lat, lng }];
              drawPolylineRef.current.setLatLngs(
                allPoints.map((p) => [p.lat, p.lng])
              );
            }
          });
          return;
        }
      }

      // Prism và Pyramid: polygon drawing (đóng đáy khi double-click gần điểm đầu)
      if (
        (drawShapeType === "prism" ||
          (drawShapeType === "pyramid" && drawingStep === 0)) &&
        drawPoints.length >= 1
      ) {
        const first = drawPoints[0];
        const latFactor = 111320;
        const lngFactor =
          Math.cos((((lat + first.lat) / 2) * Math.PI) / 180) * 111320;
        const dx = (lng - first.lng) * lngFactor;
        const dy = (lat - first.lat) * latFactor;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 5 && drawPoints.length >= 3) {
          if (drawShapeType === "prism") {
            finishPrism();
          } else if (drawShapeType === "pyramid") {
            finishPyramidBase();
          }
          return;
        }
      }

      // Bỏ qua xử lý drawPoints nếu đang vẽ cylinder hoặc cone (đã xử lý ở trên)
      // Chỉ xử lý drawPoints cho prism, pyramid, frustum
      if (
        drawShapeType !== "prism" &&
        drawShapeType !== "pyramid" &&
        drawShapeType !== "frustum"
      ) {
        return;
      }

      setDrawPoints((prev) => {
        const next = [...prev, { lat, lng }];
        import("leaflet").then((L) => {
          const marker = L.circleMarker([lat, lng], {
            radius: 6,
            color: "#1D4ED8",
            fillColor: "#1D4ED8",
            fillOpacity: 0.9,
          }).addTo(map);
          drawMarkersRef.current.push(marker);
          if (drawPolylineRef.current) {
            drawPolylineRef.current.setLatLngs(next.map((p) => [p.lat, p.lng]));
          } else {
            drawPolylineRef.current = L.polyline(
              next.map((p) => [p.lat, p.lng]),
              { color: "#1D4ED8" }
            ).addTo(map);
          }
        });
        return next;
      });
    };

    // right-click (contextmenu) to remove last point
    const handleMapRightClick = () => {
      if (!drawingMode) return;
      if (!drawPoints || drawPoints.length === 0) return;
      // remove last point and its marker
      setDrawPoints((prev) => {
        const next = prev.slice(0, -1);
        // remove last marker from map
        const lastMarker = drawMarkersRef.current.pop();
        try {
          if (lastMarker && map.hasLayer && map.hasLayer(lastMarker))
            map.removeLayer(lastMarker);
        } catch (e) {}
        // update polyline or remove if empty
        try {
          if (next.length === 0) {
            if (drawPolylineRef.current) {
              map.removeLayer(drawPolylineRef.current);
              drawPolylineRef.current = null;
            }
          } else {
            if (drawPolylineRef.current)
              drawPolylineRef.current.setLatLngs(
                next.map((p) => [p.lat, p.lng])
              );
          }
        } catch (e) {}
        return next;
      });
    };

    map.on("dblclick", handleMapDoubleClick);
    map.on("contextmenu", handleMapRightClick);

    return () => {
      map.off("dblclick", handleMapDoubleClick);
      map.off("contextmenu", handleMapRightClick);
      try {
        if (
          map.doubleClickZoom &&
          typeof map.doubleClickZoom.enable === "function"
        ) {
          map.doubleClickZoom.enable();
        }
      } catch (e) {}
    };
  }, [
    drawingMode,
    drawPoints,
    drawShapeType,
    cylinderCenter,
    pyramidApex,
    coneCenter,
    coneApex,
    frustumTopPoints,
    mapReady,
    shapes,
  ]);

  // Manage marker: update position, toggle layer and dragging based on drawingMode
  useEffect(() => {
    const map = mapInstanceRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;

    try {
      marker.setLatLng([position.lat, position.lng]);
    } catch (e) {}

    try {
      if (drawingMode) {
        if (map.hasLayer(marker)) map.removeLayer(marker);
        if (marker.dragging && typeof marker.dragging.disable === "function")
          marker.dragging.disable();
      } else {
        if (!map.hasLayer(marker)) marker.addTo(map);
        if (marker.dragging && typeof marker.dragging.enable === "function")
          marker.dragging.enable();
      }
    } catch (e) {}
  }, [position.lat, position.lng, drawingMode, mapReady]);
  const clearDrawLayers = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    drawMarkersRef.current.forEach((m) => {
      try {
        map.removeLayer(m);
      } catch (e) {}
    });
    drawMarkersRef.current = [];
    if (drawPolylineRef.current) {
      try {
        map.removeLayer(drawPolylineRef.current);
      } catch (e) {}
      drawPolylineRef.current = null;
    }
    setDrawPoints([]);
  };

  const finishPrism = () => {
    if (drawPoints.length < 3) {
      message.warning("Vui lòng chọn ít nhất 3 điểm để tạo polygon");
      return;
    }

    const base = drawPoints[0];
    const latFactor = 111320;
    const lngFactor = Math.cos((base.lat * Math.PI) / 180) * 111320;

    const ptsRaw: [number, number][] = drawPoints.map((p) => [
      (p.lng - base.lng) * lngFactor * drawScale,
      (p.lat - base.lat) * latFactor * drawScale,
    ]);

    const centroidX = ptsRaw.reduce((sum, p) => sum + p[0], 0) / ptsRaw.length;
    const centroidZ = ptsRaw.reduce((sum, p) => sum + p[1], 0) / ptsRaw.length;

    const pts: [number, number][] = ptsRaw.map((p) => [
      p[0] - centroidX,
      p[1] - centroidZ,
    ]);

    const prism: PrismShape = {
      id: `shape_${Date.now()}`,
      type: "prism",
      position: { x: centroidX, y: drawYOffset, z: centroidZ },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      color:
        "#" +
        Math.floor(Math.random() * 0xffffff)
          .toString(16)
          .padStart(6, "0"),
      points: pts,
      height: drawHeight,
      baseLatLng: drawPoints,
    };

    setShapes((prev) => [...prev, prism]);
    setSelectedShapeId(prism.id);
    message.success("Đã tạo lăng trụ");
    setDrawingMode(false);

    try {
      const map = mapInstanceRef.current;
      if (map) {
        import("leaflet").then((L) => {
          try {
            const polygon = L.polygon(
              drawPoints.map((p) => [p.lat, p.lng]),
              { color: "#1D4ED8", fillOpacity: 0.12 }
            ).addTo(map);
            drawPolygonsRef.current.set(prism.id, polygon);
          } catch (err) {}
        });
      }
    } catch (e) {}

    clearDrawLayers();
    resetDrawingState();
  };

  const finishCylinder = () => {
    if (!cylinderCenter) {
      message.warning("Vui lòng chọn tâm");
      return;
    }
    if (!drawRadius || drawRadius <= 0) {
      message.warning("Vui lòng nhập bán kính hợp lệ");
      return;
    }
    if (!drawHeight || drawHeight <= 0) {
      message.warning("Vui lòng nhập chiều cao hợp lệ");
      return;
    }

    const cylinder: CylinderShape = {
      id: `shape_${Date.now()}`,
      type: "cylinder",
      position: { x: 0, y: drawYOffset, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      color:
        "#" +
        Math.floor(Math.random() * 0xffffff)
          .toString(16)
          .padStart(6, "0"),
      centerLatLng: cylinderCenter,
      radius: drawRadius,
      height: drawHeight,
    };

    setShapes((prev) => [...prev, cylinder]);
    setSelectedShapeId(cylinder.id);
    message.success("Đã tạo hình trụ");
    setDrawingMode(false);

    try {
      const map = mapInstanceRef.current;
      if (map) {
        import("leaflet").then((L) => {
          try {
            const previewCircle =
              drawPolygonsRef.current.get("cylinder_preview");
            if (previewCircle) {
              map.removeLayer(previewCircle);
              drawPolygonsRef.current.delete("cylinder_preview");
            }
            const circle = L.circle([cylinderCenter.lat, cylinderCenter.lng], {
              radius: drawRadius,
              color: "#1D4ED8",
              fillOpacity: 0.12,
            }).addTo(map);
            drawPolygonsRef.current.set(cylinder.id, circle);
          } catch (err) {}
        });
      }
    } catch (e) {}

    clearDrawLayers();
    resetDrawingState();
  };

  const finishPyramid = () => {
    const basePointsToUse =
      pyramidBasePoints.length > 0 ? pyramidBasePoints : drawPoints;
    if (basePointsToUse.length < 3 || !pyramidApex) {
      message.warning(
        "Vui lòng chọn ít nhất 3 điểm cho đáy và 1 điểm cho đỉnh"
      );
      return;
    }

    const base = basePointsToUse[0];
    const latFactor = 111320;
    const lngFactor = Math.cos((base.lat * Math.PI) / 180) * 111320;

    const basePtsRaw: [number, number][] = basePointsToUse.map((p) => [
      (p.lng - base.lng) * lngFactor * drawScale,
      (p.lat - base.lat) * latFactor * drawScale,
    ]);

    const centroidX =
      basePtsRaw.reduce((sum, p) => sum + p[0], 0) / basePtsRaw.length;
    const centroidZ =
      basePtsRaw.reduce((sum, p) => sum + p[1], 0) / basePtsRaw.length;

    const basePts: [number, number][] = basePtsRaw.map((p) => [
      p[0] - centroidX,
      p[1] - centroidZ,
    ]);

    const pyramid: PyramidShape = {
      id: `shape_${Date.now()}`,
      type: "pyramid",
      position: { x: centroidX, y: drawYOffset, z: centroidZ },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      color:
        "#" +
        Math.floor(Math.random() * 0xffffff)
          .toString(16)
          .padStart(6, "0"),
      basePoints: basePts,
      baseLatLng: basePointsToUse,
      apexLatLng: pyramidApex,
      apexHeight: apexHeight,
    };

    setShapes((prev) => [...prev, pyramid]);
    setSelectedShapeId(pyramid.id);
    message.success("Đã tạo hình chóp");
    setDrawingMode(false);

    try {
      const map = mapInstanceRef.current;
      if (map) {
        import("leaflet").then((L) => {
          try {
            const basePolygon = drawPolygonsRef.current.get("pyramid_base");
            if (basePolygon) {
              map.removeLayer(basePolygon);
              drawPolygonsRef.current.delete("pyramid_base");
            }
            const polygon = L.polygon(
              basePointsToUse.map((p) => [p.lat, p.lng]),
              { color: "#1D4ED8", fillOpacity: 0.12 }
            ).addTo(map);
            drawPolygonsRef.current.set(pyramid.id, polygon);
          } catch (err) {}
        });
      }
    } catch (e) {}

    clearDrawLayers();
    resetDrawingState();
  };

  const finishCone = () => {
    if (!coneCenter) {
      message.warning("Vui lòng chọn tâm");
      return;
    }
    if (!drawRadius || drawRadius <= 0) {
      message.warning("Vui lòng nhập bán kính hợp lệ");
      return;
    }
    if (!apexHeight || apexHeight <= 0) {
      message.warning("Vui lòng nhập chiều cao hợp lệ");
      return;
    }

    const cone: ConeShape = {
      id: `shape_${Date.now()}`,
      type: "cone",
      position: { x: 0, y: drawYOffset, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      color:
        "#" +
        Math.floor(Math.random() * 0xffffff)
          .toString(16)
          .padStart(6, "0"),
      centerLatLng: coneCenter,
      apexLatLng: coneCenter,
      radius: drawRadius,
      apexHeight: apexHeight,
    };

    setShapes((prev) => [...prev, cone]);
    setSelectedShapeId(cone.id);
    message.success("Đã tạo hình nón");
    setDrawingMode(false);

    try {
      const map = mapInstanceRef.current;
      if (map) {
        import("leaflet").then((L) => {
          try {
            const circle = L.circle([coneCenter.lat, coneCenter.lng], {
              radius: drawRadius,
              color: "#1D4ED8",
              fillOpacity: 0.12,
            }).addTo(map);
            drawPolygonsRef.current.set(cone.id, circle);
          } catch (err) {}
        });
      }
    } catch (e) {}

    clearDrawLayers();
    resetDrawingState();
  };

  const finishPyramidBase = () => {
    if (drawPoints.length < 3) {
      message.warning("Vui lòng chọn ít nhất 3 điểm cho đáy");
      return;
    }

    try {
      const map = mapInstanceRef.current;
      if (map) {
        import("leaflet").then((L) => {
          try {
            const polygon = L.polygon(
              drawPoints.map((p) => [p.lat, p.lng]),
              { color: "#1D4ED8", fillOpacity: 0.12 }
            ).addTo(map);
            drawPolygonsRef.current.set("pyramid_base", polygon);
          } catch (err) {}
        });
      }
    } catch (e) {}

    setPyramidBasePoints([...drawPoints]);
    const map = mapInstanceRef.current;
    if (map) {
      drawMarkersRef.current.forEach((m) => {
        try {
          map.removeLayer(m);
        } catch (e) {}
      });
      drawMarkersRef.current = [];
      if (drawPolylineRef.current) {
        try {
          map.removeLayer(drawPolylineRef.current);
        } catch (e) {}
        drawPolylineRef.current = null;
      }
    }
    setDrawPoints([]);
    setDrawingStep(1);
    message.info(
      "Đã hoàn thành đáy. Bây giờ double-click để chọn đỉnh, sau đó bấm 'Hoàn thành'."
    );
  };

  const finishFrustumBase = () => {
    if (drawPoints.length < 3) {
      message.warning("Vui lòng chọn ít nhất 3 điểm cho đáy");
      return;
    }

    try {
      const map = mapInstanceRef.current;
      if (map) {
        import("leaflet").then((L) => {
          try {
            const polygon = L.polygon(
              drawPoints.map((p) => [p.lat, p.lng]),
              { color: "#1D4ED8", fillOpacity: 0.12 }
            ).addTo(map);
            drawPolygonsRef.current.set("frustum_base", polygon);
          } catch (err) {}
        });
      }
    } catch (e) {}

    clearDrawLayers();
    message.info("Đã hoàn thành đáy. Bây giờ vẽ mặt trên (top face).");
  };

  const finishFrustum = () => {
    if (drawPoints.length < 3 || frustumTopPoints.length < 3) {
      message.warning("Vui lòng chọn ít nhất 3 điểm cho cả đáy và mặt trên");
      return;
    }

    const base = drawPoints[0];
    const latFactor = 111320;
    const lngFactor = Math.cos((base.lat * Math.PI) / 180) * 111320;

    const basePtsRaw: [number, number][] = drawPoints.map((p) => [
      (p.lng - base.lng) * lngFactor * drawScale,
      (p.lat - base.lat) * latFactor * drawScale,
    ]);

    const topPtsRaw: [number, number][] = frustumTopPoints.map((p) => [
      (p.lng - base.lng) * lngFactor * drawScale,
      (p.lat - base.lat) * latFactor * drawScale,
    ]);

    const centroidX =
      basePtsRaw.reduce((sum, p) => sum + p[0], 0) / basePtsRaw.length;
    const centroidZ =
      basePtsRaw.reduce((sum, p) => sum + p[1], 0) / basePtsRaw.length;

    const basePts: [number, number][] = basePtsRaw.map((p) => [
      p[0] - centroidX,
      p[1] - centroidZ,
    ]);

    const topPts: [number, number][] = topPtsRaw.map((p) => [
      p[0] - centroidX,
      p[1] - centroidZ,
    ]);

    const frustum: FrustumShape = {
      id: `shape_${Date.now()}`,
      type: "frustum",
      position: { x: centroidX, y: drawYOffset, z: centroidZ },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      color:
        "#" +
        Math.floor(Math.random() * 0xffffff)
          .toString(16)
          .padStart(6, "0"),
      basePoints: basePts,
      topPoints: topPts,
      baseLatLng: drawPoints,
      topLatLng: frustumTopPoints,
      topHeight: apexHeight,
    };

    setShapes((prev) => [...prev, frustum]);
    setSelectedShapeId(frustum.id);
    message.success("Đã tạo hình cụt");
    setDrawingMode(false);

    try {
      const map = mapInstanceRef.current;
      if (map) {
        import("leaflet").then((L) => {
          try {
            const topPolygon = L.polygon(
              frustumTopPoints.map((p) => [p.lat, p.lng]),
              { color: "#DC2626", fillOpacity: 0.12 }
            ).addTo(map);
            drawPolygonsRef.current.set(frustum.id, topPolygon);
            const basePolygon = drawPolygonsRef.current.get("frustum_base");
            if (basePolygon) {
              drawPolygonsRef.current.delete("frustum_base");
            }
          } catch (err) {}
        });
      }
    } catch (e) {}

    clearDrawLayers();
    resetDrawingState();
  };

  const resetDrawingState = () => {
    setDrawPoints([]);
    setCylinderCenter(null);
    setPyramidApex(null);
    setConeCenter(null);
    setConeApex(null);
    setFrustumTopPoints([]);
    setPyramidBasePoints([]);
    setDrawingStep(0);
    setDrawYOffset(0);
  };

  useEffect(() => {
    if (drawShapeType === "cone" && coneCenter) {
      const map = mapInstanceRef.current;
      if (map) {
        import("leaflet").then((L) => {
          try {
            const previewCircle = drawPolygonsRef.current.get("cone_preview");
            if (previewCircle) {
              map.removeLayer(previewCircle);
            }
            const circle = L.circle([coneCenter.lat, coneCenter.lng], {
              radius: drawRadius,
              color: "#1D4ED8",
              fillOpacity: 0.12,
            }).addTo(map);
            drawPolygonsRef.current.set("cone_preview", circle);
          } catch (err) {}
        });
      }
    }
  }, [drawRadius, coneCenter, drawShapeType]);

  useEffect(() => {
    if (drawShapeType === "cylinder" && cylinderCenter) {
      const map = mapInstanceRef.current;
      if (map) {
        import("leaflet").then((L) => {
          try {
            const previewCircle =
              drawPolygonsRef.current.get("cylinder_preview");
            if (previewCircle) {
              map.removeLayer(previewCircle);
            }
            const circle = L.circle([cylinderCenter.lat, cylinderCenter.lng], {
              radius: drawRadius,
              color: "#1D4ED8",
              fillOpacity: 0.12,
            }).addTo(map);
            drawPolygonsRef.current.set("cylinder_preview", circle);
          } catch (err) {}
        });
      }
    }
  }, [drawRadius, cylinderCenter, drawShapeType]);

  // Update marker position and disable dragging in drawing mode
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLatLng([position.lat, position.lng]);
      try {
        markerRef.current.dragging[drawingMode ? "disable" : "enable"]();
      } catch (e) {}
    }
  }, [position.lat, position.lng, drawingMode]);

  // Initialize Three.js Scene
  useEffect(() => {
    if (!threeContainerRef.current) return;
    if (rendererRef.current) return;

    // // If already initialized and canvas still present, skip
    // if (threeLoaded && rendererRef.current && threeContainerRef.current.contains(rendererRef.current.domElement)) return

    // // If there's an existing renderer but its canvas is gone (container re-mounted), dispose it first
    // if (rendererRef.current) {
    //   try {
    //     if (rendererRef.current.domElement && rendererRef.current.domElement.parentElement) {
    //       rendererRef.current.domElement.parentElement.removeChild(rendererRef.current.domElement)
    //     }
    //   } catch (e) {}
    //   try {
    //     // properly lose the WebGL context to avoid accumulating contexts
    //     if (typeof rendererRef.current.forceContextLoss === 'function') {
    //       try { rendererRef.current.forceContextLoss() } catch(e) {}
    //     }
    //   } catch(e) {}
    //   try { rendererRef.current.dispose() } catch (e) {}
    //   try { if (rendererRef.current.domElement) { rendererRef.current.domElement.width = 1; rendererRef.current.domElement.height = 1 } } catch (e) {}
    //   rendererRef.current = null
    //   sceneRef.current = null
    //   cameraRef.current = null
    //   controlsRef.current = null
    //   setThreeLoaded(false)
    // }

    const initThreeJS = async () => {
      try {
        const THREE = await import("three");
        const { OrbitControls } = await import(
          "three/examples/jsm/controls/OrbitControls.js"
        );

        // Make THREE available globally for shape updates
        const w = window as any;
        w.THREE = THREE;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f0f0);

        const camera = new THREE.PerspectiveCamera(
          50,
          threeContainerRef.current!.clientWidth /
            threeContainerRef.current!.clientHeight,
          0.1,
          1000
        );
        camera.position.set(15, 15, 15);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(
          threeContainerRef.current!.clientWidth,
          threeContainerRef.current!.clientHeight
        );
        renderer.shadowMap.enabled = true;
        // Attach renderer canvas to current container
        threeContainerRef.current!.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enableRotate = true;
        controls.enableZoom = true;
        controls.enablePan = true;
        controls.enabled = true;

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(10, 20, 10);
        dirLight.castShadow = true;
        scene.add(dirLight);

        const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
        dirLight2.position.set(-10, 10, -10);
        scene.add(dirLight2);

        // Grid & Axes
        const gridHelper = new THREE.GridHelper(30, 30, 0x888888, 0xcccccc);
        scene.add(gridHelper);

        const axesHelper = new THREE.AxesHelper(5);
        scene.add(axesHelper);

        sceneRef.current = scene;
        rendererRef.current = renderer;
        cameraRef.current = camera;
        controlsRef.current = controls;

        // Animation loop
        const animate = () => {
          animationIdRef.current = requestAnimationFrame(animate);
          controls.update();
          renderer.render(scene, camera);
        };
        animate();

        // Handle window resize
        const handleResize = () => {
          if (!threeContainerRef.current || !camera || !renderer) return;
          const width = threeContainerRef.current.clientWidth;
          const height = threeContainerRef.current.clientHeight;
          if (width > 0 && height > 0) {
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
          }
        };
        window.addEventListener("resize", handleResize);

        // Initial resize check
        setTimeout(() => {
          handleResize();
        }, 100);

        // Ensure canvas can receive events
        renderer.domElement.style.touchAction = "none";
        renderer.domElement.style.userSelect = "none";

        setThreeLoaded(true);
        message.success("Khởi tạo 3D thành công");
      } catch (error) {
        message.error("Không thể khởi tạo 3D viewer");
      }
    };

    initThreeJS();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      // if (rendererRef.current && threeContainerRef.current && threeContainerRef.current.contains(rendererRef.current.domElement)) {
      //   try { threeContainerRef.current.removeChild(rendererRef.current.domElement) } catch(e) {}
      //   try { if (typeof rendererRef.current.forceContextLoss === 'function') rendererRef.current.forceContextLoss() } catch(e) {}
      //   try { rendererRef.current.dispose() } catch(e) {}
      // }
    };
  }, []);

  // Update scene when shapes change
  useEffect(() => {
    if (!sceneRef.current || !threeLoaded) {
      console.log("Scene not ready:", {
        scene: !!sceneRef.current,
        threeLoaded,
      });
      return;
    }

    const THREE = (window as any).THREE;
    if (!THREE) {
      console.log("THREE.js not loaded");
      return;
    }

    const shapesArr = Array.isArray(shapes) ? shapes : [];
    console.log("Rendering shapes:", shapesArr.length);

    // Clear previous shapes
    const objectsToRemove: any[] = [];
    sceneRef.current.children.forEach((child: any) => {
      if (
        child.userData.isShape ||
        child.userData.isGlbInstance ||
        child.userData.tempDebugMarker
      ) {
        objectsToRemove.push(child);
      }
    });
    objectsToRemove.forEach((obj) => {
      try {
        sceneRef.current.remove(obj);
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m: any) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      } catch (e) {}
    });

    // Calculate reference point from first shape or average of all shapes
    // Use centroid for shapes that are centered at origin in geometry
    let refLat = 0;
    let refLng = 0;
    if (shapesArr.length > 0) {
      const firstShape = shapesArr[0];
      if (
        firstShape.type === "prism" &&
        firstShape.baseLatLng &&
        firstShape.baseLatLng.length > 0
      ) {
        refLat =
          firstShape.baseLatLng.reduce((sum, p) => sum + p.lat, 0) /
          firstShape.baseLatLng.length;
        refLng =
          firstShape.baseLatLng.reduce((sum, p) => sum + p.lng, 0) /
          firstShape.baseLatLng.length;
      } else if (firstShape.type === "cylinder" && firstShape.centerLatLng) {
        refLat = firstShape.centerLatLng.lat;
        refLng = firstShape.centerLatLng.lng;
      } else if (
        firstShape.type === "pyramid" &&
        firstShape.baseLatLng &&
        firstShape.baseLatLng.length > 0
      ) {
        refLat =
          firstShape.baseLatLng.reduce((sum, p) => sum + p.lat, 0) /
          firstShape.baseLatLng.length;
        refLng =
          firstShape.baseLatLng.reduce((sum, p) => sum + p.lng, 0) /
          firstShape.baseLatLng.length;
      } else if (firstShape.type === "cone" && firstShape.centerLatLng) {
        refLat = firstShape.centerLatLng.lat;
        refLng = firstShape.centerLatLng.lng;
      } else if (
        firstShape.type === "frustum" &&
        firstShape.baseLatLng &&
        firstShape.baseLatLng.length > 0
      ) {
        refLat =
          firstShape.baseLatLng.reduce((sum, p) => sum + p.lat, 0) /
          firstShape.baseLatLng.length;
        refLng =
          firstShape.baseLatLng.reduce((sum, p) => sum + p.lng, 0) /
          firstShape.baseLatLng.length;
      }
    }
    const latFactor = 111320;
    const refLngFactor = Math.cos((refLat * Math.PI) / 180) * 111320;

    // Add shapes (use safe index loop to avoid calling .forEach on unexpected values)
    for (let i = 0; i < shapesArr.length; i++) {
      const shape = shapesArr[i];
      let geometry: any = null;
      let shapeWorldX = 0;
      let shapeWorldZ = 0;

      // Calculate world position relative to reference point
      // Use centroid for shapes that are centered at origin in geometry
      if (
        shape.type === "prism" &&
        shape.baseLatLng &&
        shape.baseLatLng.length > 0
      ) {
        // Calculate centroid of baseLatLng
        const centroidLat =
          shape.baseLatLng.reduce((sum, p) => sum + p.lat, 0) /
          shape.baseLatLng.length;
        const centroidLng =
          shape.baseLatLng.reduce((sum, p) => sum + p.lng, 0) /
          shape.baseLatLng.length;
        shapeWorldX = (centroidLng - refLng) * refLngFactor * PREVIEW_SCALE;
        shapeWorldZ = (centroidLat - refLat) * latFactor * PREVIEW_SCALE;
      } else if (shape.type === "cylinder" && shape.centerLatLng) {
        shapeWorldX =
          (shape.centerLatLng.lng - refLng) * refLngFactor * PREVIEW_SCALE;
        shapeWorldZ =
          (shape.centerLatLng.lat - refLat) * latFactor * PREVIEW_SCALE;
      } else if (
        shape.type === "pyramid" &&
        shape.baseLatLng &&
        shape.baseLatLng.length > 0
      ) {
        // Calculate centroid of baseLatLng
        const centroidLat =
          shape.baseLatLng.reduce((sum, p) => sum + p.lat, 0) /
          shape.baseLatLng.length;
        const centroidLng =
          shape.baseLatLng.reduce((sum, p) => sum + p.lng, 0) /
          shape.baseLatLng.length;
        shapeWorldX = (centroidLng - refLng) * refLngFactor * PREVIEW_SCALE;
        shapeWorldZ = (centroidLat - refLat) * latFactor * PREVIEW_SCALE;
      } else if (shape.type === "cone" && shape.centerLatLng) {
        shapeWorldX =
          (shape.centerLatLng.lng - refLng) * refLngFactor * PREVIEW_SCALE;
        shapeWorldZ =
          (shape.centerLatLng.lat - refLat) * latFactor * PREVIEW_SCALE;
      } else if (
        shape.type === "frustum" &&
        shape.baseLatLng &&
        shape.baseLatLng.length > 0
      ) {
        // Calculate centroid of baseLatLng
        const centroidLat =
          shape.baseLatLng.reduce((sum, p) => sum + p.lat, 0) /
          shape.baseLatLng.length;
        const centroidLng =
          shape.baseLatLng.reduce((sum, p) => sum + p.lng, 0) /
          shape.baseLatLng.length;
        shapeWorldX = (centroidLng - refLng) * refLngFactor * PREVIEW_SCALE;
        shapeWorldZ = (centroidLat - refLat) * latFactor * PREVIEW_SCALE;
      }

      const material = new THREE.MeshPhongMaterial({
        color: shape.color || "#1D4ED8",
        transparent: false,
        opacity: 1.0,
      });

      if (shape.type === "prism") {
        try {
          if (!shape.points || shape.points.length < 3) {
            console.warn("Prism has invalid points:", shape);
            continue;
          }
          const prismShape = new THREE.Shape();
          for (let j = 0; j < shape.points.length; j++) {
            const pt = shape.points[j];
            if (j === 0)
              prismShape.moveTo(pt[0] * PREVIEW_SCALE, pt[1] * PREVIEW_SCALE);
            else
              prismShape.lineTo(pt[0] * PREVIEW_SCALE, pt[1] * PREVIEW_SCALE);
          }
          prismShape.closePath();
          geometry = new THREE.ExtrudeGeometry(prismShape, {
            depth: shape.height * PREVIEW_SCALE,
            bevelEnabled: false,
          });
          geometry.rotateX(-Math.PI / 2);
          geometry.translate(0, (shape.height * PREVIEW_SCALE) / 2, 0);
          console.log("Created prism geometry:", {
            points: shape.points.length,
            height: shape.height,
          });
        } catch (e) {
          console.error("Error creating prism:", e);
        }
      } else if (shape.type === "cylinder") {
        try {
          if (!shape.radius || !shape.height) {
            console.warn("Cylinder has invalid dimensions:", shape);
            continue;
          }
          geometry = new THREE.CylinderGeometry(
            shape.radius * PREVIEW_SCALE,
            shape.radius * PREVIEW_SCALE,
            shape.height * PREVIEW_SCALE,
            32
          );
          geometry.translate(0, (shape.height * PREVIEW_SCALE) / 2, 0);
          console.log("Created cylinder geometry:", {
            radius: shape.radius,
            height: shape.height,
          });
        } catch (e) {
          console.error("Error creating cylinder:", e);
        }
      } else if (shape.type === "pyramid") {
        const baseShape = new THREE.Shape();
        const centroidX =
          shape.basePoints.reduce((sum, p) => sum + p[0], 0) /
          shape.basePoints.length;
        const centroidZ =
          shape.basePoints.reduce((sum, p) => sum + p[1], 0) /
          shape.basePoints.length;
        for (let j = 0; j < shape.basePoints.length; j++) {
          const pt = shape.basePoints[j];
          const x = (pt[0] - centroidX) * PREVIEW_SCALE;
          const z = (pt[1] - centroidZ) * PREVIEW_SCALE;
          if (j === 0) baseShape.moveTo(x, z);
          else baseShape.lineTo(x, z);
        }
        baseShape.closePath();

        const base = shape.baseLatLng[0];
        const latFactor = 111320;
        const lngFactor = Math.cos((base.lat * Math.PI) / 180) * 111320;
        const apexXRaw = (shape.apexLatLng.lng - base.lng) * lngFactor;
        const apexZRaw = (shape.apexLatLng.lat - base.lat) * latFactor;
        const apexRelX = (apexXRaw - centroidX) * PREVIEW_SCALE;
        const apexRelZ = (apexZRaw - centroidZ) * PREVIEW_SCALE;
        const apexY = (shape.apexHeight || 10) * PREVIEW_SCALE;

        const vertices: number[] = [];
        const indices: number[] = [];

        const basePoints3D: any[] = [];
        for (let j = 0; j < shape.basePoints.length; j++) {
          const pt = shape.basePoints[j];
          const x = (pt[0] - centroidX) * PREVIEW_SCALE;
          const z = (pt[1] - centroidZ) * PREVIEW_SCALE;
          basePoints3D.push(new THREE.Vector3(x, 0, z));
        }

        const apexPoint = new THREE.Vector3(apexRelX, apexY, apexRelZ);

        for (let i = 0; i < basePoints3D.length; i++) {
          const v0 = basePoints3D[i];
          const v1 = basePoints3D[(i + 1) % basePoints3D.length];

          const baseIndex = vertices.length / 3;
          vertices.push(v0.x, v0.y, v0.z);
          vertices.push(v1.x, v1.y, v1.z);
          vertices.push(apexPoint.x, apexPoint.y, apexPoint.z);

          indices.push(baseIndex, baseIndex + 1, baseIndex + 2);
        }

        for (let i = 1; i < basePoints3D.length - 1; i++) {
          const v0 = basePoints3D[0];
          const v1 = basePoints3D[i];
          const v2 = basePoints3D[i + 1];

          const baseIndex = vertices.length / 3;
          vertices.push(v0.x, v0.y, v0.z);
          vertices.push(v1.x, v1.y, v1.z);
          vertices.push(v2.x, v2.y, v2.z);

          indices.push(baseIndex, baseIndex + 1, baseIndex + 2);
        }

        geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(vertices, 3)
        );
        geometry.setIndex(indices);
        geometry.computeVertexNormals();
      } else if (shape.type === "cone") {
        try {
          if (!shape.radius || !shape.apexHeight) {
            console.warn("Cone has invalid dimensions:", shape);
            continue;
          }
          const height = (shape.apexHeight || 10) * PREVIEW_SCALE;
          geometry = new THREE.ConeGeometry(
            shape.radius * PREVIEW_SCALE,
            height,
            32
          );
          geometry.translate(0, height / 2, 0);
          console.log("Created cone geometry:", {
            radius: shape.radius,
            height: shape.apexHeight,
          });
        } catch (e) {
          console.error("Error creating cone:", e);
        }
      } else if (shape.type === "frustum") {
        const baseShape = new THREE.Shape();
        const baseCentroidX =
          shape.basePoints.reduce((sum, p) => sum + p[0], 0) /
          shape.basePoints.length;
        const baseCentroidZ =
          shape.basePoints.reduce((sum, p) => sum + p[1], 0) /
          shape.basePoints.length;
        for (let j = 0; j < shape.basePoints.length; j++) {
          const pt = shape.basePoints[j];
          const x = (pt[0] - baseCentroidX) * PREVIEW_SCALE;
          const z = (pt[1] - baseCentroidZ) * PREVIEW_SCALE;
          if (j === 0) baseShape.moveTo(x, z);
          else baseShape.lineTo(x, z);
        }
        baseShape.closePath();
        const topShape = new THREE.Shape();
        const topCentroidX =
          shape.topPoints.reduce((sum, p) => sum + p[0], 0) /
          shape.topPoints.length;
        const topCentroidZ =
          shape.topPoints.reduce((sum, p) => sum + p[1], 0) /
          shape.topPoints.length;
        for (let j = 0; j < shape.topPoints.length; j++) {
          const pt = shape.topPoints[j];
          const x = (pt[0] - topCentroidX) * PREVIEW_SCALE;
          const z = (pt[1] - topCentroidZ) * PREVIEW_SCALE;
          if (j === 0) topShape.moveTo(x, z);
          else topShape.lineTo(x, z);
        }
        topShape.closePath();
        const height = (shape.topHeight || 10) * PREVIEW_SCALE;

        const vertices: number[] = [];
        const indices: number[] = [];

        const basePoints3D: any[] = [];
        for (let j = 0; j < shape.basePoints.length; j++) {
          const pt = shape.basePoints[j];
          const x = (pt[0] - baseCentroidX) * PREVIEW_SCALE;
          const z = (pt[1] - baseCentroidZ) * PREVIEW_SCALE;
          basePoints3D.push(new THREE.Vector3(x, 0, z));
        }

        const topPoints3D: any[] = [];
        const topOffsetX = (topCentroidX - baseCentroidX) * PREVIEW_SCALE;
        const topOffsetZ = (topCentroidZ - baseCentroidZ) * PREVIEW_SCALE;
        for (let j = 0; j < shape.topPoints.length; j++) {
          const pt = shape.topPoints[j];
          const x = (pt[0] - topCentroidX) * PREVIEW_SCALE + topOffsetX;
          const z = (pt[1] - topCentroidZ) * PREVIEW_SCALE + topOffsetZ;
          topPoints3D.push(new THREE.Vector3(x, height, z));
        }

        for (let i = 0; i < basePoints3D.length; i++) {
          const baseV0 = basePoints3D[i];
          const baseV1 = basePoints3D[(i + 1) % basePoints3D.length];
          const topV0 = topPoints3D[i];
          const topV1 = topPoints3D[(i + 1) % topPoints3D.length];

          const baseIndex = vertices.length / 3;
          vertices.push(baseV0.x, baseV0.y, baseV0.z);
          vertices.push(baseV1.x, baseV1.y, baseV1.z);
          vertices.push(topV0.x, topV0.y, topV0.z);
          vertices.push(topV1.x, topV1.y, topV1.z);

          indices.push(baseIndex, baseIndex + 1, baseIndex + 2);
          indices.push(baseIndex + 1, baseIndex + 3, baseIndex + 2);
        }

        for (let i = 1; i < basePoints3D.length - 1; i++) {
          const v0 = basePoints3D[0];
          const v1 = basePoints3D[i];
          const v2 = basePoints3D[i + 1];

          const baseIndex = vertices.length / 3;
          vertices.push(v0.x, v0.y, v0.z);
          vertices.push(v1.x, v1.y, v1.z);
          vertices.push(v2.x, v2.y, v2.z);

          indices.push(baseIndex, baseIndex + 1, baseIndex + 2);
        }

        for (let i = 1; i < topPoints3D.length - 1; i++) {
          const v0 = topPoints3D[0];
          const v1 = topPoints3D[i];
          const v2 = topPoints3D[i + 1];

          const baseIndex = vertices.length / 3;
          vertices.push(v0.x, v0.y, v0.z);
          vertices.push(v1.x, v1.y, v1.z);
          vertices.push(v2.x, v2.y, v2.z);

          indices.push(baseIndex, baseIndex + 2, baseIndex + 1);
        }

        geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(vertices, 3)
        );
        geometry.setIndex(indices);
        geometry.computeVertexNormals();
      }

      if (geometry) {
        try {
          material.side = THREE.DoubleSide;
          material.needsUpdate = true;
          const mesh = new THREE.Mesh(geometry, material);
          const yOffset = (shape.position.y || 0) * PREVIEW_SCALE;
          mesh.position.set(shapeWorldX, yOffset, shapeWorldZ);
          mesh.rotation.set(
            shape.rotation.x,
            shape.rotation.y,
            shape.rotation.z
          );
          mesh.scale.set(shape.scale.x, shape.scale.y, shape.scale.z);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          mesh.visible = true;
          mesh.frustumCulled = false;
          mesh.userData = { isShape: true, shapeId: shape.id };
          geometry.computeBoundingBox();
          geometry.computeVertexNormals();
          const bbox = geometry.boundingBox;
          console.log(
            "Geometry bbox:",
            bbox,
            "min:",
            bbox.min,
            "max:",
            bbox.max,
            "mesh position:",
            mesh.position,
            "color:",
            shape.color,
            "vertices:",
            geometry.attributes.position?.count || 0
          );
          sceneRef.current.add(mesh);
          console.log("Added shape to scene:", shape.type, mesh);

          // Force render update
          if (rendererRef.current && cameraRef.current) {
            rendererRef.current.render(sceneRef.current, cameraRef.current);
          }
        } catch (error) {
          console.error("Error rendering shape:", shape.type, error, shape);
        }
      } else {
        console.warn("No geometry created for shape:", shape.type, shape);
      }
    }

    // Add GLB instances using GLTFLoader (real model preview)
    (async () => {
      try {
        const mod = await import("three/examples/jsm/loaders/GLTFLoader.js");
        const { GLTFLoader } = mod as any;
        const loader = new GLTFLoader();

        for (const asset of glbAssets) {
          // determine URL: prefer asset.url (could be data URL), otherwise create object URL from file
          let assetUrl = asset.url;
          if ((!assetUrl || assetUrl.length === 0) && asset.file) {
            const objUrl = URL.createObjectURL(asset.file);
            tempObjectUrlsRef.current.push(objUrl);
            assetUrl = objUrl;
          }

          if (!assetUrl) continue;

          // load glb once, then clone for instances
          await new Promise<void>((resolveLoad) => {
            loader.load(
              assetUrl,
              (gltf: any) => {
                asset.instances.forEach((instance: any) => {
                  const root = gltf.scene.clone(true);
                  // For preview center the model horizontally at origin; keep Y offset
                  root.position.set(0, instance.position.y, 0);
                  root.rotation.set(
                    instance.rotation.x,
                    instance.rotation.y,
                    instance.rotation.z
                  );
                  // Only scale the model for preview
                  root.scale.set(
                    instance.scale.x * PREVIEW_SCALE,
                    instance.scale.y * PREVIEW_SCALE,
                    instance.scale.z * PREVIEW_SCALE
                  );
                  root.traverse((child: any) => {
                    if (child.isMesh) {
                      child.castShadow = true;
                      child.receiveShadow = true;
                    }
                  });
                  root.userData = {
                    isGlbInstance: true,
                    instanceId: instance.id,
                    assetId: asset.id,
                  };
                  sceneRef.current.add(root);
                });
                resolveLoad();
              },
              undefined,
              () => {
                resolveLoad();
              }
            );
          });
        }
      } catch (err) {
        // GLTFLoader not available
      }
    })();

    // auto-frame camera to fit new content (shapes + glbs)
    try {
      // compute bounding box only from shapes and GLB instances to avoid grid/other helpers inflating bounds
      const box = new THREE.Box3();
      let hasObjects = false;
      sceneRef.current.children.forEach((child: any) => {
        if (
          child.userData &&
          (child.userData.isShape || child.userData.isGlbInstance)
        ) {
          try {
            box.expandByObject(child);
            hasObjects = true;
          } catch (e) {
            console.warn("Error expanding box:", e);
          }
        }
      });
      console.log("Bounding box:", {
        hasObjects,
        box: box.isEmpty() ? "empty" : box,
      });
      if (!hasObjects || box.isEmpty()) {
        // nothing to frame - set default camera position
        const cam = cameraRef.current;
        const controls = controlsRef.current;
        if (cam && controls) {
          cam.position.set(15, 15, 15);
          if (typeof controls.target?.set === "function") {
            controls.target.set(0, 0, 0);
          }
          controls.update();
        }
      } else {
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxSize = Math.max(size.x, size.y, size.z);
        console.log("Framing camera:", { center, size, maxSize });
        // clamp fit distance to avoid extreme camera positions
        const fitDistance = Math.max(maxSize * 2.5, 10);
        const cam = cameraRef.current;
        const controls = controlsRef.current;
        if (cam && controls) {
          // position camera to look at center from diagonal angle
          const distance = fitDistance;
          cam.position.set(
            center.x + distance * 0.7,
            center.y + distance * 0.8,
            center.z + distance * 0.7
          );
          cam.lookAt(center.x, center.y, center.z);
          if (typeof controls.target?.copy === "function") {
            controls.target.copy(center);
          } else if (
            controls.target &&
            typeof controls.target.set === "function"
          ) {
            controls.target.set(center.x, center.y, center.z);
          } else if (controls.target) {
            controls.target = { x: center.x, y: center.y, z: center.z };
          }
          controls.update();
          console.log(
            "Camera positioned:",
            cam.position,
            "target:",
            controls.target,
            "distance:",
            distance
          );

          // ensure renderer size matches container
          try {
            const renderer = rendererRef.current;
            if (renderer && threeContainerRef.current) {
              const w = threeContainerRef.current.clientWidth;
              const h = threeContainerRef.current.clientHeight;
              renderer.setSize(w, h);
            }
          } catch (e) {
            // renderer resize failed
          }
        }
      }
    } catch (e) {
      // Framing error
    }

    // revoke any temp object URLs on next scene update
    tempObjectUrlsRef.current.forEach((u) => {
      try {
        URL.revokeObjectURL(u);
      } catch (e) {}
    });
    tempObjectUrlsRef.current = [];
  }, [shapes, glbAssets, selectedShapeId, threeLoaded]);

  // Sync drawHeight and drawRadius edits to the selected shape
  useEffect(() => {
    if (!Array.isArray(shapes) || shapes.length === 0) return;
    if (!selectedShapeId) return;
    const s = shapes.find((shape) => shape.id === selectedShapeId);
    if (!s) return;

    if (
      (s.type === "prism" || s.type === "cylinder") &&
      s.height !== drawHeight
    ) {
      if (s.type === "prism") {
        const updated: PrismShape = {
          ...(s as PrismShape),
          height: drawHeight,
          position: { x: s.position.x, y: 0, z: s.position.z },
        };
        setShapes((prev) =>
          prev.map((shape) => (shape.id === selectedShapeId ? updated : shape))
        );
      } else if (s.type === "cylinder") {
        const updated: CylinderShape = {
          ...(s as CylinderShape),
          height: drawHeight,
        };
        setShapes((prev) =>
          prev.map((shape) => (shape.id === selectedShapeId ? updated : shape))
        );
      }
    }

    if (
      (s.type === "cylinder" || s.type === "cone") &&
      "radius" in s &&
      s.radius !== drawRadius
    ) {
      if (s.type === "cylinder") {
        const updated: CylinderShape = {
          ...(s as CylinderShape),
          radius: drawRadius,
        };
        setShapes((prev) =>
          prev.map((shape) => (shape.id === selectedShapeId ? updated : shape))
        );
      } else if (s.type === "cone") {
        const updated: ConeShape = {
          ...(s as ConeShape),
          radius: drawRadius,
        };
        setShapes((prev) =>
          prev.map((shape) => (shape.id === selectedShapeId ? updated : shape))
        );
      }
    }
  }, [drawHeight, drawRadius, apexHeight, selectedShapeId]);

  useEffect(() => {
    if (drawShapeType === "cone" && coneCenter) {
      const map = mapInstanceRef.current;
      if (map) {
        import("leaflet").then((L) => {
          try {
            const previewCircle = drawPolygonsRef.current.get("cone_preview");
            if (previewCircle) {
              map.removeLayer(previewCircle);
            }
            const circle = L.circle([coneCenter.lat, coneCenter.lng], {
              radius: drawRadius,
              color: "#1D4ED8",
              fillOpacity: 0.12,
            }).addTo(map);
            drawPolygonsRef.current.set("cone_preview", circle);
          } catch (err) {}
        });
      }
    }
  }, [drawRadius, coneCenter, drawShapeType]);

  useEffect(() => {
    if (drawShapeType === "cylinder" && cylinderCenter) {
      const map = mapInstanceRef.current;
      if (map) {
        import("leaflet").then((L) => {
          try {
            const previewCircle =
              drawPolygonsRef.current.get("cylinder_preview");
            if (previewCircle) {
              map.removeLayer(previewCircle);
            }
            const circle = L.circle([cylinderCenter.lat, cylinderCenter.lng], {
              radius: drawRadius,
              color: "#1D4ED8",
              fillOpacity: 0.12,
            }).addTo(map);
            drawPolygonsRef.current.set("cylinder_preview", circle);
          } catch (err) {}
        });
      }
    }
  }, [drawRadius, cylinderCenter, drawShapeType]);

  const handleSubmit = () => {
    const shapesCount = Array.isArray(shapes) ? shapes.length : 0;
    if (initialData.enableDraw && shapesCount === 0) {
      message.warning("Vui lòng vẽ ít nhất 1 khối hình");
      return;
    }

    // Build API payload matching backend schema
    const objects3d: any[] = [];

    // Add GLB models - use marker position (map coordinates) not 3D local position
    for (const asset of glbAssets) {
      asset.instances.forEach((instance) => {
        objects3d.push({
          objectType: 0, // IMPORTED_MODEL
          meshes: [
            {
              meshUrl: asset.url,
              point: {
                type: "Point",
                coordinates: [position.lng, position.lat, 0], // [lng, lat, elevation]
              },
              rotate: instance.rotation.y || 0,
              scale: instance.scale.x || 1,
            },
          ],
        });
      });
    }

    // Add drawn shapes - group by type, each type becomes one object3d
    if (Array.isArray(shapes) && shapes.length > 0) {
      // Group shapes by type
      const shapesByType: Record<string, Shape[]> = {
        prism: [],
        cylinder: [],
        pyramid: [],
        cone: [],
        frustum: [],
      };

      shapes.forEach((shape) => {
        if (!shape || !shape.type) {
          console.warn("Invalid shape found (no type):", shape);
          return;
        }

        // Validate shape type
        const validTypes = ["prism", "cylinder", "pyramid", "cone", "frustum"];
        if (!validTypes.includes(shape.type)) {
          console.warn(`Invalid shape type: ${shape.type}`, shape);
          return;
        }

        // Additional validation based on type
        if (shape.type === "prism") {
          if (
            !shape.baseLatLng ||
            !Array.isArray(shape.baseLatLng) ||
            shape.baseLatLng.length < 3
          ) {
            console.warn("Invalid prism: missing or invalid baseLatLng", shape);
            return;
          }
        } else if (shape.type === "cylinder") {
          if (
            !shape.centerLatLng ||
            typeof shape.centerLatLng.lng !== "number" ||
            typeof shape.centerLatLng.lat !== "number"
          ) {
            console.warn(
              "Invalid cylinder: missing or invalid centerLatLng",
              shape
            );
            return;
          }
        } else if (shape.type === "cone") {
          if (
            !shape.centerLatLng ||
            typeof shape.centerLatLng.lng !== "number" ||
            typeof shape.centerLatLng.lat !== "number"
          ) {
            console.warn(
              "Invalid cone: missing or invalid centerLatLng",
              shape
            );
            return;
          }
        } else if (shape.type === "pyramid") {
          if (
            !shape.baseLatLng ||
            !Array.isArray(shape.baseLatLng) ||
            shape.baseLatLng.length < 3
          ) {
            console.warn(
              "Invalid pyramid: missing or invalid baseLatLng",
              shape
            );
            return;
          }
        } else if (shape.type === "frustum") {
          if (
            !shape.baseLatLng ||
            !Array.isArray(shape.baseLatLng) ||
            shape.baseLatLng.length < 3
          ) {
            console.warn(
              "Invalid frustum: missing or invalid baseLatLng",
              shape
            );
            return;
          }
        }

        if (shapesByType[shape.type]) {
          shapesByType[shape.type].push(shape);
        } else {
          console.warn(`Shape type not in shapesByType: ${shape.type}`, shape);
        }
      });

      console.log("Shapes grouped by type:", {
        prism: shapesByType.prism.length,
        cylinder: shapesByType.cylinder.length,
        pyramid: shapesByType.pyramid.length,
        cone: shapesByType.cone.length,
        frustum: shapesByType.frustum.length,
        allShapes: shapes.map((s) => ({ id: s.id, type: s.type })),
      });

      // Create object3d for each type
      if (shapesByType.prism.length > 0) {
        console.log(`Processing ${shapesByType.prism.length} prisms`);
        const prisms: any[] = [];
        shapesByType.prism.forEach((shape) => {
          const prismShape = shape as PrismShape;
          console.log("Processing prism shape:", {
            id: prismShape.id,
            type: prismShape.type,
            baseLatLng: prismShape.baseLatLng?.length,
          });
          if (
            shape.type === "prism" &&
            shape.baseLatLng &&
            Array.isArray(shape.baseLatLng) &&
            shape.baseLatLng.length >= 3 &&
            shape.height &&
            shape.height > 0
          ) {
            const yOffset = shape.position.y || 0;
            const coordinates = [
              shape.baseLatLng
                .filter(
                  (p) =>
                    p && typeof p.lat === "number" && typeof p.lng === "number"
                )
                .map((p) => [p.lng, p.lat, yOffset]),
            ];

            // Only add if coordinates are valid
            if (coordinates[0] && coordinates[0].length >= 3) {
              if (
                JSON.stringify(coordinates[0][0]) !==
                JSON.stringify(coordinates[0][coordinates[0].length - 1])
              ) {
                coordinates[0].push(coordinates[0][0]);
              }
              prisms.push({
                baseFace: {
                  type: "Polygon",
                  coordinates: coordinates,
                },
                height: shape.height,
              });
            }
          }
        });
        // Filter out any invalid prisms before adding to payload
        const validPrisms = prisms.filter(
          (p) =>
            p.baseFace &&
            p.baseFace.coordinates &&
            Array.isArray(p.baseFace.coordinates) &&
            p.baseFace.coordinates.length > 0 &&
            Array.isArray(p.baseFace.coordinates[0]) &&
            p.baseFace.coordinates[0].length >= 3 &&
            p.height &&
            p.height > 0
        );
        if (validPrisms.length > 0) {
          objects3d.push({
            objectType: 1,
            body: {
              name: `Prisms (${validPrisms.length})`,
              prisms: validPrisms,
            },
          });
        }
      }

      if (shapesByType.cylinder.length > 0) {
        console.log(`Processing ${shapesByType.cylinder.length} cylinders`);
        const cylinders: any[] = [];
        shapesByType.cylinder.forEach((shape) => {
          const cylinderShape = shape as CylinderShape;
          console.log("Processing cylinder shape:", {
            id: cylinderShape.id,
            type: cylinderShape.type,
            centerLatLng: cylinderShape.centerLatLng,
          });
          if (
            shape.type === "cylinder" &&
            shape.centerLatLng &&
            typeof shape.centerLatLng.lng === "number" &&
            typeof shape.centerLatLng.lat === "number" &&
            shape.radius &&
            shape.radius > 0 &&
            shape.height &&
            shape.height > 0
          ) {
            cylinders.push({
              center: {
                point: {
                  type: "Point",
                  coordinates: [
                    shape.centerLatLng.lng,
                    shape.centerLatLng.lat,
                    shape.position.y || 0,
                  ],
                },
              },
              radius: shape.radius,
              height: shape.height,
            });
          }
        });
        // Filter out any invalid cylinders before adding to payload
        const validCylinders = cylinders.filter(
          (c) =>
            c.center &&
            c.center.point &&
            Array.isArray(c.center.point.coordinates) &&
            c.center.point.coordinates.length >= 2 &&
            c.radius &&
            c.radius > 0 &&
            c.height &&
            c.height > 0
        );
        if (validCylinders.length > 0) {
          objects3d.push({
            objectType: 1,
            body: {
              name: `Cylinders (${validCylinders.length})`,
              cylinders: validCylinders,
            },
          });
        }
      }

      if (shapesByType.pyramid.length > 0) {
        const pyramids: any[] = [];
        shapesByType.pyramid.forEach((shape) => {
          if (
            shape.type === "pyramid" &&
            shape.baseLatLng &&
            Array.isArray(shape.baseLatLng) &&
            shape.baseLatLng.length >= 3 &&
            shape.apexLatLng &&
            typeof shape.apexLatLng.lng === "number" &&
            typeof shape.apexLatLng.lat === "number" &&
            shape.apexHeight &&
            shape.apexHeight > 0
          ) {
            const yOffset = shape.position.y || 0;
            const baseCoordinates = [
              shape.baseLatLng
                .filter(
                  (p) =>
                    p && typeof p.lat === "number" && typeof p.lng === "number"
                )
                .map((p) => [p.lng, p.lat, yOffset]),
            ];

            if (baseCoordinates[0] && baseCoordinates[0].length >= 3) {
              if (
                JSON.stringify(baseCoordinates[0][0]) !==
                JSON.stringify(
                  baseCoordinates[0][baseCoordinates[0].length - 1]
                )
              ) {
                baseCoordinates[0].push(baseCoordinates[0][0]);
              }
              pyramids.push({
                baseFace: {
                  type: "Polygon",
                  coordinates: baseCoordinates,
                },
                apex: {
                  point: {
                    type: "Point",
                    coordinates: [
                      shape.apexLatLng.lng,
                      shape.apexLatLng.lat,
                      yOffset + (shape.apexHeight || 10),
                    ],
                  },
                },
              });
            }
          }
        });
        // Filter out any invalid pyramids before adding to payload
        const validPyramids = pyramids.filter(
          (p) =>
            p.baseFace &&
            p.baseFace.coordinates &&
            Array.isArray(p.baseFace.coordinates) &&
            p.baseFace.coordinates.length > 0 &&
            Array.isArray(p.baseFace.coordinates[0]) &&
            p.baseFace.coordinates[0].length >= 3 &&
            p.apex &&
            p.apex.point &&
            Array.isArray(p.apex.point.coordinates) &&
            p.apex.point.coordinates.length >= 2
        );
        if (validPyramids.length > 0) {
          objects3d.push({
            objectType: 1,
            body: {
              name: `Pyramids (${validPyramids.length})`,
              pyramids: validPyramids,
            },
          });
        }
      }

      if (shapesByType.cone.length > 0) {
        console.log(`Processing ${shapesByType.cone.length} cones`);
        const cones: any[] = [];
        shapesByType.cone.forEach((shape) => {
          const coneShape = shape as ConeShape;
          console.log("Processing cone shape:", {
            id: coneShape.id,
            type: coneShape.type,
            centerLatLng: coneShape.centerLatLng,
          });
          if (
            shape.type === "cone" &&
            shape.centerLatLng &&
            typeof shape.centerLatLng.lng === "number" &&
            typeof shape.centerLatLng.lat === "number" &&
            shape.apexLatLng &&
            typeof shape.apexLatLng.lng === "number" &&
            typeof shape.apexLatLng.lat === "number" &&
            shape.radius &&
            shape.radius > 0 &&
            shape.apexHeight &&
            shape.apexHeight > 0
          ) {
            const yOffset = shape.position.y || 0;
            cones.push({
              center: {
                point: {
                  type: "Point",
                  coordinates: [
                    shape.centerLatLng.lng,
                    shape.centerLatLng.lat,
                    yOffset,
                  ],
                },
              },
              radius: shape.radius,
              apex: {
                point: {
                  type: "Point",
                  coordinates: [
                    shape.apexLatLng.lng,
                    shape.apexLatLng.lat,
                    yOffset + (shape.apexHeight || 10),
                  ],
                },
              },
            });
          }
        });
        // Filter out any invalid cones before adding to payload
        const validCones = cones.filter(
          (c) =>
            c.center &&
            c.center.point &&
            Array.isArray(c.center.point.coordinates) &&
            c.center.point.coordinates.length >= 2 &&
            c.apex &&
            c.apex.point &&
            Array.isArray(c.apex.point.coordinates) &&
            c.apex.point.coordinates.length >= 2 &&
            c.radius &&
            c.radius > 0
        );
        if (validCones.length > 0) {
          objects3d.push({
            objectType: 1,
            body: {
              name: `Cones (${validCones.length})`,
              cones: validCones,
            },
          });
        }
      }

      if (shapesByType.frustum.length > 0) {
        const frustums: any[] = [];
        shapesByType.frustum.forEach((shape) => {
          if (
            shape.type === "frustum" &&
            shape.baseLatLng &&
            Array.isArray(shape.baseLatLng) &&
            shape.baseLatLng.length >= 3 &&
            shape.topLatLng &&
            Array.isArray(shape.topLatLng) &&
            shape.topLatLng.length >= 3 &&
            shape.topHeight &&
            shape.topHeight > 0
          ) {
            const yOffset = shape.position.y || 0;
            const baseCoordinates = [
              shape.baseLatLng
                .filter(
                  (p) =>
                    p && typeof p.lat === "number" && typeof p.lng === "number"
                )
                .map((p) => [p.lng, p.lat, yOffset]),
            ];
            const topCoordinates = [
              shape.topLatLng
                .filter(
                  (p) =>
                    p && typeof p.lat === "number" && typeof p.lng === "number"
                )
                .map((p) => [p.lng, p.lat, yOffset + (shape.topHeight || 10)]),
            ];

            if (
              baseCoordinates[0] &&
              baseCoordinates[0].length >= 3 &&
              topCoordinates[0] &&
              topCoordinates[0].length >= 3
            ) {
              if (
                JSON.stringify(baseCoordinates[0][0]) !==
                JSON.stringify(
                  baseCoordinates[0][baseCoordinates[0].length - 1]
                )
              ) {
                baseCoordinates[0].push(baseCoordinates[0][0]);
              }
              if (
                JSON.stringify(topCoordinates[0][0]) !==
                JSON.stringify(topCoordinates[0][topCoordinates[0].length - 1])
              ) {
                topCoordinates[0].push(topCoordinates[0][0]);
              }
              frustums.push({
                baseFace: {
                  type: "Polygon",
                  coordinates: baseCoordinates,
                },
                topFace: {
                  type: "Polygon",
                  coordinates: topCoordinates,
                },
              });
            }
          }
        });
        // Filter out any invalid frustums before adding to payload
        const validFrustums = frustums.filter(
          (f) =>
            f.baseFace &&
            f.baseFace.coordinates &&
            Array.isArray(f.baseFace.coordinates) &&
            f.baseFace.coordinates.length > 0 &&
            Array.isArray(f.baseFace.coordinates[0]) &&
            f.baseFace.coordinates[0].length >= 3 &&
            f.topFace &&
            f.topFace.coordinates &&
            Array.isArray(f.topFace.coordinates) &&
            f.topFace.coordinates.length > 0 &&
            Array.isArray(f.topFace.coordinates[0]) &&
            f.topFace.coordinates[0].length >= 3
        );
        if (validFrustums.length > 0) {
          objects3d.push({
            objectType: 1,
            body: {
              name: `Frustums (${validFrustums.length})`,
              frustums: validFrustums,
            },
          });
        }
      }
    }

    console.log("Final objects3d payload:", JSON.stringify(objects3d, null, 2));

    onNext({
      ...initialData,
      latitude: position.lat,
      longitude: position.lng,
      shapes,
      glbAssets,
      objects3d, // API payload
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Center/Right - 3D Preview & Map */}
          <div className="space-y-4 col-span-2">
            {/* Map */}
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <div className="bg-white px-4 py-2 border-b border-gray-300">
                <h3 className="font-semibold text-md text-primary">
                  Vị trí trên bản đồ
                </h3>
              </div>
              <div
                ref={mapRef}
                style={{ height: "400px", width: "100%", zIndex: 1 }}
              />
            </div>

            {/* 3D Preview */}
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <div className="bg-white px-4 py-2 border-b border-gray-300 flex justify-between items-center">
                <h3 className="font-semibold text-md text-primary">
                  Preview 3D
                </h3>
              </div>
              <div
                ref={threeContainerRef}
                style={{ height: "400px", width: "100%", cursor: "grab" }}
                onMouseDown={(e) => e.stopPropagation()}
                onMouseMove={(e) => e.stopPropagation()}
                onMouseUp={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="border border-gray-300 rounded-lg p-4">
              <h3 className="text-md text-center font-semibold mb-5 text-primary">
                Điều chỉnh thuộc tính
              </h3>

              {drawingMode && (
                <div className="mb-4">
                  <label className="text-sm font-medium block mb-2">
                    Loại hình
                  </label>
                  <Select
                    value={drawShapeType}
                    onChange={(v) => {
                      setDrawShapeType(v);
                      resetDrawingState();
                      clearDrawLayers();
                    }}
                    className="w-full"
                    options={[
                      { label: "Lăng trụ (Prism)", value: "prism" },
                      { label: "Hình trụ (Cylinder)", value: "cylinder" },
                      { label: "Hình chóp (Pyramid)", value: "pyramid" },
                      { label: "Hình nón (Cone)", value: "cone" },
                      { label: "Hình cụt (Frustum)", value: "frustum" },
                    ]}
                  />
                </div>
              )}

              <div className="mb-3 text-sm space-y-3">
                {(drawShapeType === "prism" ||
                  drawShapeType === "cylinder") && (
                  <div className="flex flex-row items-center justify-between gap-2">
                    <label className="text-sm font-medium">Chiều cao (m)</label>
                    <InputNumber
                      size="large"
                      value={drawHeight}
                      onChange={(v) => {
                        setDrawHeight(v || 1);
                      }}
                      min={0.1}
                      step={0.5}
                      disabled={!drawingMode}
                    />
                  </div>
                )}

                {(drawShapeType === "cylinder" || drawShapeType === "cone") && (
                  <div className="flex flex-row items-center justify-between gap-2">
                    <label className="text-sm font-medium">Bán kính (m)</label>
                    <InputNumber
                      size="large"
                      value={drawRadius}
                      onChange={(v) => {
                        setDrawRadius(v || 5);
                      }}
                      min={0.1}
                      step={0.5}
                      disabled={!drawingMode}
                    />
                  </div>
                )}

                {(drawShapeType === "pyramid" ||
                  drawShapeType === "cone" ||
                  drawShapeType === "frustum") && (
                  <div className="flex flex-row items-center justify-between gap-2">
                    <label className="text-sm font-medium">
                      Độ cao đỉnh/top (m)
                    </label>
                    <InputNumber
                      size="large"
                      value={apexHeight}
                      onChange={(v) => {
                        setApexHeight(v || 10);
                      }}
                      min={0.1}
                      step={0.5}
                      disabled={!drawingMode}
                    />
                  </div>
                )}

                <div className="flex flex-row items-center justify-between gap-2">
                  <label className="text-sm font-medium">Độ cao Z (m)</label>
                  <InputNumber
                    size="large"
                    value={drawYOffset}
                    onChange={(v) => {
                      setDrawYOffset(v || 0);
                    }}
                    min={0}
                    step={0.5}
                    disabled={!drawingMode}
                  />
                </div>

                <div className="flex flex-row items-center justify-between gap-2">
                  <label className="text-md font-medium">Tỷ lệ</label>
                  <InputNumber
                    size="large"
                    value={drawScale}
                    onChange={(v) => setDrawScale(v || 1)}
                    min={0.01}
                    step={0.1}
                    disabled={!drawingMode}
                  />
                </div>
              </div>
            </div>

            {!drawingMode && initialData.enableDraw && (
              <div className="border border-gray-300 rounded-lg p-4">
                <button
                  onClick={() => {
                    setDrawingMode(true);
                    resetDrawingState();
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition"
                >
                  Vẽ hình mới
                </button>
              </div>
            )}

            {Array.isArray(shapes) && shapes.length > 0 && (
              <div className="border border-gray-300 rounded-lg p-4">
                <h3 className="text-md text-center font-semibold mb-3 text-primary">
                  Danh sách đối tượng ({shapes.length})
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {shapes.map((shape, index) => (
                    <div
                      key={shape.id}
                      className={`p-2 rounded border cursor-pointer transition ${
                        selectedShapeId === shape.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => {
                        setSelectedShapeId(shape.id);
                        if (
                          shape.type === "prism" ||
                          shape.type === "cylinder"
                        ) {
                          setDrawHeight(shape.height);
                        }
                        if (
                          shape.type === "cylinder" ||
                          shape.type === "cone"
                        ) {
                          setDrawRadius(shape.radius);
                        }
                        if (
                          shape.type === "pyramid" ||
                          shape.type === "cone" ||
                          shape.type === "frustum"
                        ) {
                          if (shape.type === "pyramid") {
                            setApexHeight(
                              (shape as PyramidShape).apexHeight || 10
                            );
                          } else if (shape.type === "cone") {
                            setApexHeight(
                              (shape as ConeShape).apexHeight || 10
                            );
                          } else if (shape.type === "frustum") {
                            setApexHeight(
                              (shape as FrustumShape).topHeight || 10
                            );
                          }
                        }
                        setDrawYOffset(shape.position.y || 0);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Đối tượng {index + 1} ({shape.type})
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShapes((prev) =>
                              prev.filter((s) => s.id !== shape.id)
                            );
                            if (selectedShapeId === shape.id) {
                              setSelectedShapeId(null);
                            }
                            const map = mapInstanceRef.current;
                            if (map) {
                              const polygon = drawPolygonsRef.current.get(
                                shape.id
                              );
                              if (polygon) {
                                try {
                                  map.removeLayer(polygon);
                                  drawPolygonsRef.current.delete(shape.id);
                                } catch (e) {}
                              }
                            }
                            message.success("Đã xóa đối tượng");
                          }}
                          className="text-red-500 hover:text-red-700 text-xs px-2 py-1"
                        >
                          Xóa
                        </button>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {shape.type === "prism" &&
                          `Chiều cao: ${shape.height}m`}
                        {shape.type === "cylinder" &&
                          `Chiều cao: ${shape.height}m, Bán kính: ${shape.radius}m`}
                        {shape.type === "pyramid" &&
                          `Độ cao đỉnh: ${
                            (shape as PyramidShape).apexHeight || 10
                          }m`}
                        {shape.type === "cone" &&
                          `Bán kính: ${shape.radius}m, Độ cao đỉnh: ${
                            (shape as ConeShape).apexHeight || 10
                          }m`}
                        {shape.type === "frustum" &&
                          `Độ cao top: ${
                            (shape as FrustumShape).topHeight || 10
                          }m`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {drawingMode && (
              <div className="flex flex-col gap-5 mt-2">
                <div className="flex gap-2">
                  <img
                    src={leftClickIcon}
                    alt="Left click"
                    className="w-6 h-6"
                  />
                  <span className="font-medium text-sm">
                    {drawShapeType === "prism"
                      ? "Double-click để chọn điểm, double-click gần điểm đầu để đóng đáy"
                      : drawShapeType === "pyramid" && drawingStep === 0
                      ? "Double-click để chọn điểm đáy, double-click gần điểm đầu để hoàn thành đáy"
                      : drawShapeType === "pyramid" && drawingStep === 1
                      ? "Double-click để chọn đỉnh, sau đó bấm 'Hoàn thành'"
                      : drawShapeType === "frustum"
                      ? "Double-click để chọn điểm"
                      : drawShapeType === "cylinder"
                      ? "Double-click để chọn tâm, sau đó bấm 'Hoàn thành'"
                      : drawShapeType === "cone"
                      ? "Double-click để chọn tâm, nhập bán kính và chiều cao, sau đó bấm 'Hoàn thành'"
                      : "Double-click để chọn điểm"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <img
                    src={rightClickIcon}
                    alt="Right click"
                    className="w-6 h-6"
                  />
                  <span className="font-medium text-sm">
                    Click chuột phải để xóa điểm cuối
                  </span>
                </div>
                {(drawShapeType === "cylinder" && cylinderCenter) ||
                (drawShapeType === "cone" && coneCenter) ||
                (drawShapeType === "prism" && drawPoints.length >= 3) ||
                (drawShapeType === "pyramid" &&
                  drawingStep === 1 &&
                  pyramidApex) ||
                (drawShapeType === "frustum" &&
                  drawPoints.length >= 3 &&
                  frustumTopPoints.length >= 3) ? (
                  <button
                    onClick={() => {
                      if (drawShapeType === "cylinder") {
                        finishCylinder();
                      } else if (drawShapeType === "cone") {
                        finishCone();
                      } else if (drawShapeType === "prism") {
                        finishPrism();
                      } else if (drawShapeType === "pyramid") {
                        finishPyramid();
                      } else if (drawShapeType === "frustum") {
                        finishFrustum();
                      }
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-md transition"
                  >
                    Hoàn thành
                  </button>
                ) : null}
                <button
                  onClick={() => {
                    setDrawingMode(false);
                    resetDrawingState();
                    clearDrawLayers();
                  }}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium px-4 py-2 rounded-md transition"
                >
                  Hủy vẽ
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between mt-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-5 py-2 rounded-md transition"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span>Quay lại</span>
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 bg-primary hover:bg-primary-light hover:cursor-pointer text-white font-medium px-5 py-2 rounded-md transition"
          >
            <span>Hoàn thành</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step3;
