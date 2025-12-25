import { useEffect, useRef, useState } from "react";

import Map from "@arcgis/core/Map";
import SceneView from "@arcgis/core/views/SceneView";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from "@arcgis/core/Graphic";

import Point from "@arcgis/core/geometry/Point";
import Polygon from "@arcgis/core/geometry/Polygon";
import Polyline from "@arcgis/core/geometry/Polyline"; // Thêm để vẽ đường đi
import Mesh from "@arcgis/core/geometry/Mesh";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils";
import Search from "@arcgis/core/widgets/Search";
import "@arcgis/core/assets/esri/themes/light/main.css";

import { mapService } from "../../../api/services/mapService";

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
  const routeLayerRef = useRef<GraphicsLayer | null>(null); // Layer riêng cho đường đi
  const placesCacheRef = useRef<Map<string, any>>(new Map());

  const [buildings, setBuildings] = useState<any[]>([]);
  const [mapCenter, setMapCenter] = useState({ lat: 10.8709, lon: 106.8023 });
  const [mapZoom, setMapZoom] = useState(18);
  const [mapHeading, setMapHeading] = useState(0);
  const [mapTilt, setMapTilt] = useState(65);

  // State cho chức năng tìm đường mới
  const [startQuery, setStartQuery] = useState("");
  const [endQuery, setEndQuery] = useState("");
  const [suggestions, setSuggestions] = useState<{ type: 'start' | 'end', list: any[] } | null>(null);
  const [selectedStart, setSelectedStart] = useState<any>(null);
  const [selectedEnd, setSelectedEnd] = useState<any>(null);

  const debouncedCenter = useDebounce(mapCenter, 500);
  const debouncedZoom = useDebounce(mapZoom, 500);
  const debouncedHeading = useDebounce(mapHeading, 500);
  const debouncedTilt = useDebounce(mapTilt, 500);

  const renderedBuildingIdsRef = useRef<Set<number>>(new Set());

  /* ================= NEW: ROUTING LOGIC ================= */
const handleSearchInputChange = async (text: string, type: "start" | "end") => {
    if (type === "start") { setStartQuery(text); setSelectedStart(null); } 
    else { setEndQuery(text); setSelectedEnd(null); }

    if (text.length > 1) {
      try {
        const results = await mapService.searchPlaces(text);
        setSuggestions({ type, list: results });
      } catch (e) { console.error(e); }
    } else {
      setSuggestions(null);
    }
  };

  const selectPlace = (place: any, type: "start" | "end") => {
    if (type === "start") { setStartQuery(place.name); setSelectedStart(place); } 
    else { setEndQuery(place.name); setSelectedEnd(place); }
    setSuggestions(null);
  };

  const findRoute = async () => {
    if (!selectedStart || !selectedEnd) return;
    try {
      const response = await mapService.findPath(selectedStart.placeId, selectedEnd.placeId);
      
      // Lấy tọa độ từ path.pathGeometry.coordinates theo JSON bạn cung cấp
      const coords = response?.path?.pathGeometry?.coordinates;

      if (coords && routeLayerRef.current) {
        routeLayerRef.current.removeAll();

        const polyline = new Polyline({
          paths: coords, // MultiLineString format [[[lon, lat],...]]
          spatialReference: { wkid: 4326 }
        });

        const routeGraphic = new Graphic({
          geometry: polyline,
          symbol: {
            type: "simple-line",
            color: [0, 122, 255, 0.9],
            width: 5,
            cap: "round",
            join: "round"
          } as any
        });

        routeLayerRef.current.add(routeGraphic);
        viewRef.current?.goTo({ target: polyline.extent.expand(1.5), tilt: 45 }, { duration: 1000 });
      }
    } catch (e) {
      console.error("Lỗi tìm đường:", e);
      alert("Không tìm thấy dữ liệu đường đi.");
    }
  };

  /* ================= POPUP TEMPLATE CONFIG (GIỮ NGUYÊN) ================= */
  const buildingPopupTemplate = {
    title: `<div style="font-size: 1.2em; font-weight: bold; color: #1a5276;">{name}</div>`,
    content: [
      { type: "text", text: `<b>Mô tả:</b> {description}<br><b>Vị trí:</b> {placeName}<br><b>Số tầng:</b> {floors} tầng` },
      { type: "media", mediaInfos: [{ title: "Hình ảnh thực tế", type: "image", value: { sourceURL: "{imageUrl}" } }] },
      { type: "fields", fieldInfos: [{ fieldName: "buildingId", label: "ID Tòa nhà" }, { fieldName: "height", label: "Chiều cao (m)" }, { fieldName: "objectType", label: "Loại mô hình" }] }
    ]
  };

  /* ================= UTILITY: ADD PRISM & GLTF (GIỮ NGUYÊN) ================= */
  const addPrism = (prism: any, building: any) => {
    const polygon = new Polygon({ rings: prism.baseFaceGeometry.coordinates[0], spatialReference: { wkid: 4326 } });
    const graphic = new Graphic({
      geometry: polygon,
      symbol: { type: "polygon-3d", symbolLayers: [{ type: "extrude", size: prism.height, material: { color: "#4E79A7" }, edges: { type: "solid", color: "white", size: 1 } as any }] } as any,
      attributes: { name: building.name, description: building.description || "N/A", floors: building.floors || 0, placeName: building.placeName || "N/A", imageUrl: building.image, buildingId: building.buildingId, height: prism.height, objectType: "Khối lăng trụ (Extrude)" },
      popupTemplate: buildingPopupTemplate
    });
    graphicsLayerRef.current?.add(graphic);
  };

  const addMeshFromGLTF = async (mesh: any, building: any) => {
    try {
      const point = new Point({ longitude: mesh.pointGeometry.coordinates[0], latitude: mesh.pointGeometry.coordinates[1], z: mesh.pointGeometry.coordinates[2] || 0, spatialReference: { wkid: 4326 } });
      const gltfMesh = await Mesh.createFromGLTF(point, mesh.meshUrl);
      const rotationZ = Array.isArray(mesh.rotate) ? mesh.rotate[2] : (mesh.rotate || 0);
      const scaleValue = Array.isArray(mesh.scale) ? mesh.scale[0] : (mesh.scale || 1);
      gltfMesh.rotate(0, 0, rotationZ);
      gltfMesh.scale(scaleValue);
      const graphic = new Graphic({
        geometry: gltfMesh,
        symbol: { type: "mesh-3d", symbolLayers: [{ type: "fill", material: { color: "white" } }] } as any,
        attributes: { name: building.name, description: building.description || "N/A", floors: building.floors || 0, placeName: building.placeName || "N/A", imageUrl: building.image, buildingId: building.buildingId, height: "Theo mô hình 3D", objectType: "Mô hình chi tiết (GLB)" },
        popupTemplate: buildingPopupTemplate
      });
      graphicsLayerRef.current?.add(graphic);
    } catch (error) { console.error(error); }
  };

  /* ================= API DATA LOADING (GIỮ NGUYÊN) ================= */
  useEffect(() => {
    const loadBuildings = async () => {
      try {
        const data = await mapService.getBuildings(debouncedCenter.lat, debouncedCenter.lon, Math.floor(debouncedZoom), debouncedHeading ?? 0, debouncedTilt ?? 0);
        setBuildings((prev) => {
          const existingIds = new Set(prev.map((b) => b.buildingId));
          const uniqueNew = data.filter((b: any) => !existingIds.has(b.buildingId));
          return [...prev, ...uniqueNew];
        });
      } catch (error) { console.error("Lỗi nạp tòa nhà:", error); }
    };
    loadBuildings();
  }, [debouncedCenter, debouncedZoom, debouncedHeading, debouncedTilt]);

  /* ================= VIEW INITIALIZATION (GIỮ NGUYÊN TOÀN BỘ LOGIC CŨ) ================= */
  useEffect(() => {
    if (!mapDiv.current) return;
    const map = new Map({ basemap: "osm", ground: "world-elevation" });
    const view = new SceneView({
      container: mapDiv.current,
      map,
      camera: { position: { longitude: 106.8023, latitude: 10.8709, z: 300 }, tilt: 65 },
      environment: { lighting: { directShadowsEnabled: true } as any },
    });

    const graphicsLayer = new GraphicsLayer({ elevationInfo: { mode: "relative-to-ground" } });
    const routeLayer = new GraphicsLayer({ elevationInfo: { mode: "on-the-ground" } });
    map.addMany([graphicsLayer, routeLayer]);

    viewRef.current = view;
    graphicsLayerRef.current = graphicsLayer;
    routeLayerRef.current = routeLayer;

    // Logic resolveLonLat gốc của bạn
    const resolveLonLat = (p: any): { lon: number; lat: number } | null => {
      const pickNum = (v: any) => (typeof v === "string" ? parseFloat(v) : v);
      const tryPairs: Array<[any, any]> = [[p?.longitude, p?.latitude], [p?.lon, p?.lat], [p?.lng, p?.lat], [p?.x, p?.y], [p?.location?.lon, p?.location?.lat], [p?.center?.lon, p?.center?.lat]];
      for (const [lo, la] of tryPairs) {
        const lon = pickNum(lo); const lat = pickNum(la);
        if (typeof lon === "number" && typeof lat === "number") return { lon, lat };
      }
      const arrays: any[] = [p?.coordinates, p?.location?.coordinates, p?.center, p?.geometry?.coordinates, p?.geom?.coordinates, p?.point?.coordinates, p?.geoJSON?.coordinates];
      for (const arr of arrays) {
        if (Array.isArray(arr) && arr.length >= 2) {
          const lon = pickNum(arr[0]); const lat = pickNum(arr[1]);
          if (typeof lon === "number" && typeof lat === "number") return { lon, lat };
        }
      }
      return null;
    };

    const placeSource: any = {
      name: "Địa điểm nội bộ",
      placeholder: "Tìm địa điểm nội bộ...",
      getSuggestions: async (params: any) => {
        const term = params?.suggestTerm ?? params?.searchTerm ?? "";
        if (!term || term.trim().length === 0) return [];
        try {
          const places = await mapService.searchPlaces(term.trim());
          return places.map((p: any) => {
            const id = String(p.placeId ?? p.id ?? p._id ?? p.uuid ?? p.code ?? p.name);
            placesCacheRef.current.set(id, p);
            return { key: id, text: p.name || p.placeName || "(không tên)" };
          });
        } catch (e) { return []; }
      },
      getResults: async (params: any) => {
        const key = String(params?.suggestResult?.key ?? params?.searchTerm ?? "");
        let p = placesCacheRef.current.get(key);
        if (!p && params?.searchTerm) { try { const list = await mapService.searchPlaces(String(params.searchTerm)); p = list?.[0]; } catch {} }
        if (!p) return [];
        const ll = resolveLonLat(p);
        if (!ll) return [];
        const point = new Point({ longitude: ll.lon, latitude: ll.lat, spatialReference: { wkid: 4326 } });
        const feature = new Graphic({
          geometry: point,
          attributes: { name: p.name || p.placeName || key },
          symbol: { type: "simple-marker", color: [0, 122, 255, 0.9], size: 10, outline: { color: "white", width: 1 } } as any,
          popupTemplate: { title: "{name}", content: p.description ? `<div>${p.description}</div>` : undefined },
        });
        return [{ feature, name: p.name || p.placeName || key }];
      },
    };

    const searchWidget = new Search({
      view,
      includeDefaultSources: false,
      sources: [placeSource],
      container: "search-container" // Đặt vào container riêng bên phải
    });

    searchWidget.on("select-result", (event: any) => {
      const geom = event?.result?.feature?.geometry;
      if (geom) view.goTo({ target: geom, zoom: 19, tilt: 65 });
    });

    const handle = reactiveUtils.watch(() => [view.center, view.zoom, view.camera], () => {
      if (view.center) setMapCenter({ lat: view.center.latitude, lon: view.center.longitude });
      setMapZoom(view.zoom);
      setMapHeading(view.camera.heading);
      setMapTilt(view.camera.tilt);
    });

    view.on("pointer-move", async (event) => {
      const response = await view.hitTest(event);
      const hit = response.results.some((res) => res.type === "graphic");
      if (mapDiv.current) mapDiv.current.style.cursor = hit ? "pointer" : "default";
    });

    return () => { handle.remove(); searchWidget.destroy(); view.destroy(); };
  }, []);

  /* ================= RENDER BUILDINGS (GIỮ NGUYÊN) ================= */
  useEffect(() => {
    if (!graphicsLayerRef.current || buildings.length === 0) return;
    const newBuildings = buildings.filter(b => !renderedBuildingIdsRef.current.has(b.buildingId));
    newBuildings.forEach((building) => {
      building.objects3d?.forEach((obj: any) => {
        if (obj.objectType === 0 && obj.meshes) obj.meshes.forEach((mesh: any) => addMeshFromGLTF(mesh, building));
        if (obj.objectType === 1 && obj.bodies) obj.bodies.forEach((body: any) => body.prisms?.forEach((p: any) => addPrism(p, building)));
      });
      renderedBuildingIdsRef.current.add(building.buildingId);
    });
  }, [buildings]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh", overflow: "hidden" }}>
      
      {/* Panel bên phải tích hợp Search và Chỉ đường */}
      <div style={{
        position: "absolute", top: "15px", right: "15px", zIndex: 100,
        width: "320px", display: "flex", flexDirection: "column", gap: "10px"
      }}>
        {/* Container cho ArcGIS Search Widget */}
        <div id="search-container" style={{ width: "100%" }} />

        {/* Panel Chỉ đường */}
        <div style={{
          background: "white", padding: "15px", borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)", fontFamily: "Arial, sans-serif"
        }}>
          <div style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "10px", color: "#1a5276" }}>Chỉ đường</div>
          
          <div style={{ marginBottom: "10px", position: "relative" }}>
            <input
              placeholder="Chọn điểm đi..."
              value={startQuery}
              onChange={(e) => handleSearchInputChange(e.target.value, 'start')}
              style={inputStyle}
            />
            {suggestions?.type === 'start' && (
              <div style={suggestionBoxStyle}>
                {suggestions.list.map(p => <div key={p.placeId} onClick={() => selectPlace(p, 'start')} style={itemStyle}>{p.name}</div>)}
              </div>
            )}
          </div>

          <div style={{ marginBottom: "15px", position: "relative" }}>
            <input
              placeholder="Chọn điểm đến..."
              value={endQuery}
              onChange={(e) => handleSearchInputChange(e.target.value, 'end')}
              style={inputStyle}
            />
            {suggestions?.type === 'end' && (
              <div style={suggestionBoxStyle}>
                {suggestions.list.map(p => <div key={p.placeId} onClick={() => selectPlace(p, 'end')} style={itemStyle}>{p.name}</div>)}
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button 
              onClick={findRoute}
              disabled={!selectedStart || !selectedEnd}
              style={{ flex: 2, padding: "10px", backgroundColor: (selectedStart && selectedEnd) ? "#007aff" : "#ccc", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
            >
              Tìm đường
            </button>
            <button 
              onClick={() => { routeLayerRef.current?.removeAll(); setStartQuery(""); setEndQuery(""); setSelectedStart(null); setSelectedEnd(null); }}
              style={{ flex: 1, padding: "10px", background: "#f0f0f0", border: "1px solid #ccc", borderRadius: "4px", cursor: "pointer" }}
            >
              Xóa
            </button>
          </div>
        </div>
      </div>

      <div ref={mapDiv} style={{ width: "100%", height: "100%", outline: "none" }} />
    </div>
  );
}

const inputStyle = { width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ddd", boxSizing: "border-box" as any };
const suggestionBoxStyle = { position: "absolute" as any, top: "40px", left: 0, right: 0, background: "white", border: "1px solid #ddd", zIndex: 101, maxHeight: "150px", overflowY: "auto" as any, boxShadow: "0 4px 6px rgba(0,0,0,0.1)" };
const itemStyle = { padding: "10px", cursor: "pointer", borderBottom: "1px solid #eee", fontSize: "13px" };