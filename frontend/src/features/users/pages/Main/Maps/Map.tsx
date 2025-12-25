import React, { useState, useEffect, Suspense, useMemo, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { MapControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { mapService } from "../../../api/services/mapService";
import { BuildingModel } from "../../../components/Map/BuildingModel";
import { MapBackground } from "../../../components/Map/MapBackground";
import { PathRenderer } from "../../../components/Map/PathRenderer";

const Map = () => {
  const [buildings, setBuildings] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const mapOrigin = useMemo(() => ({ lon: 106.8024, lat: 10.8697 }), []);

  const [inputFrom, setInputFrom] = useState("");
  const [inputTo, setInputTo] = useState("");
  const [idFrom, setIdFrom] = useState<number | null>(null);
  const [idTo, setIdTo] = useState<number | null>(null);
  const [suggestionsFrom, setSuggestionsFrom] = useState<any[]>([]);
  const [suggestionsTo, setSuggestionsTo] = useState<any[]>([]);
  const [pathData, setPathData] = useState<any>(null);

  const cameraRef = useRef<any>();
  const controlsRef = useRef<any>();

  const loadBuildingsData = async (lat: number, lon: number) => {
    try {
      const data = await mapService.getBuildings(lat, lon, 18);
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

  const handleSearchInput = async (val: string, type: "from" | "to") => {
    if (type === "from") {
      setInputFrom(val);
      setIdFrom(null);
      if (val.length >= 1) {
        const response = await mapService.searchPlaces(val);
        setSuggestionsFrom(response);
      } else setSuggestionsFrom([]);
    } else {
      setInputTo(val);
      setIdTo(null);
      if (val.length >= 1) {
        const response = await mapService.searchPlaces(val);
        setSuggestionsTo(response);
      } else setSuggestionsTo([]);
    }
  };

  const flyToPath = (geometry: any) => {
    if (!geometry || !controlsRef.current) return;
    const SCALE_GIS = 100000;
    const bounds = new THREE.Box3();

    geometry.coordinates.forEach((line: any) => {
      line.forEach((coord: number[]) => {
        const x = (coord[0] - mapOrigin.lon) * SCALE_GIS;
        const z = (coord[1] - mapOrigin.lat) * SCALE_GIS * -1;
        bounds.expandByPoint(new THREE.Vector3(x, 0, z));
      });
    });

    const center = new THREE.Vector3();
    bounds.getCenter(center);
    controlsRef.current.target.lerp(center, 1);
    cameraRef.current.position.set(center.x + 200, 400, center.z + 200);
    controlsRef.current.update();
  };

  const handleFindPath = async () => {
    if (!idFrom || !idTo) {
      alert("Vui lòng chọn địa điểm từ gợi ý!");
      return;
    }
    try {
      const response = await mapService.findPath(idFrom, idTo);
      setPathData(response.path);
      if (response.path.pathGeometry) {
        flyToPath(response.path.pathGeometry);
      }
    } catch (error) {
      alert("Không tìm thấy đường đi!");
    }
  };

  useEffect(() => {
    loadBuildingsData(mapOrigin.lat, mapOrigin.lon);
  }, [mapOrigin]);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      {/* SIDEBAR TÌM ĐƯỜNG */}
      <div style={sidebarStyle}>
        <h2 style={{ margin: "0 0 15px 0", fontSize: "18px" }}>Chỉ đường</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ position: "relative" }}>
            <input
              placeholder="Điểm đi..."
              value={inputFrom}
              onChange={(e) => handleSearchInput(e.target.value, "from")}
              style={inputStyle}
            />
            {suggestionsFrom.length > 0 && (
              <div style={suggestionWrapper}>
                {suggestionsFrom.map((p) => (
                  <div
                    key={p.placeId}
                    onClick={() => {
                      setInputFrom(p.name);
                      setIdFrom(p.placeId);
                      setSuggestionsFrom([]);
                    }}
                    style={suggestionItem}
                  >
                    {p.name}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ position: "relative" }}>
            <input
              placeholder="Điểm đến..."
              value={inputTo}
              onChange={(e) => handleSearchInput(e.target.value, "to")}
              style={inputStyle}
            />
            {suggestionsTo.length > 0 && (
              <div style={suggestionWrapper}>
                {suggestionsTo.map((p) => (
                  <div
                    key={p.placeId}
                    onClick={() => {
                      setInputTo(p.name);
                      setIdTo(p.placeId);
                      setSuggestionsTo([]);
                    }}
                    style={suggestionItem}
                  >
                    {p.name}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button onClick={handleFindPath} style={buttonStyle}>
            Tìm đường
          </button>
        </div>
      </div>

      {/* INFO PANEL (POPUP CHI TIẾT) - Thêm lại đoạn này */}
      {selected && (
        <div style={infoPanelStyle}>
          {/* Hình ảnh tòa nhà từ URL backend */}
          <div
            style={{
              width: "100%",
              height: "180px",
              background: "#f0f0f0",
              position: "relative",
            }}
          >
            {selected.image ? (
              <img
                src={selected.image}
                alt={selected.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  color: "#999",
                }}
              >
                Không có ảnh tòa nhà
              </div>
            )}
            {/* Badge hiển thị số tầng */}
            <div
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "rgba(26, 115, 232, 0.9)",
                color: "white",
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              {selected.floors} Tầng
            </div>
          </div>

          <div style={{ padding: "20px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div style={{ flex: 1 }}>
                {/* Tên tòa nhà */}
                <h2
                  style={{
                    margin: 0,
                    fontSize: "22px",
                    color: "#1a73e8",
                    fontWeight: 700,
                  }}
                >
                  {selected.name}
                </h2>
                {/* Tên cơ sở/Trường */}
                <p
                  style={{
                    margin: "4px 0 0 0",
                    fontSize: "13px",
                    color: "#70757a",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                  </svg>
                  {selected.placeName}
                </p>
              </div>
            </div>

            {/* Phần mô tả chi tiết */}
            <div
              style={{
                margin: "15px 0",
                borderTop: "1px solid #eee",
                paddingTop: "15px",
              }}
            >
              <h4
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "14px",
                  color: "#202124",
                }}
              >
                Giới thiệu
              </h4>
              <p
                style={{
                  margin: 0,
                  color: "#3c4043",
                  fontSize: "14px",
                  lineHeight: "1.6",
                }}
              >
                {selected.description}
              </p>
            </div>

            {/* Các nút tương tác tìm đường */}
            <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
              <button
                onClick={() => {
                  setInputFrom(selected.name);
                  setIdFrom(selected.placeId);
                }}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "25px",
                  border: "1px solid #1a73e8",
                  color: "#1a73e8",
                  background: "white",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "0.2s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = "#f8f9fa")
                }
                onMouseOut={(e) => (e.currentTarget.style.background = "white")}
              >
                Từ đây
              </button>
              <button
                onClick={() => {
                  setInputTo(selected.name);
                  setIdTo(selected.placeId);
                }}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "25px",
                  background: "#1a73e8",
                  color: "white",
                  border: "none",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "0.2s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = "#1765cc")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.background = "#1a73e8")
                }
              >
                Đến đây
              </button>
            </div>
          </div>
        </div>
      )}

      <Canvas
        shadows
        onPointerMissed={() => setSelected(null)}
        onCreated={({ scene }) => {
          scene.fog = new THREE.Fog("#f0f2f5", 1000, 5000);
        }}
      >
        <PerspectiveCamera
          ref={cameraRef}
          makeDefault
          position={[300, 300, 300]}
          far={20000}
        />
        <MapControls
          ref={controlsRef}
          makeDefault
          enableRotate={true}
          maxPolarAngle={Math.PI / 2.1}
        />
        <ambientLight intensity={1.5} />
        <directionalLight
          position={[100, 200, 100]}
          intensity={1.5}
          castShadow
        />
        <Suspense fallback={null}>
          <MapBackground origin={mapOrigin} zoom={18} />
          {buildings.map((b) => (
            <BuildingModel
              key={b.buildingId}
              building={b}
              origin={mapOrigin}
              onClick={() => setSelected(b)}
            />
          ))}
          {pathData?.pathGeometry && (
            <PathRenderer geometry={pathData.pathGeometry} origin={mapOrigin} />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
};

// Styles Cập Nhật
const sidebarStyle: React.CSSProperties = {
  position: "absolute",
  top: 20,
  left: 20,
  zIndex: 20,
  width: 320,
  background: "white",
  padding: 20,
  borderRadius: 12,
  boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
};

const infoPanelStyle: React.CSSProperties = {
  position: "absolute",
  bottom: 150,
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 150,
  width: 400,
  background: "white",
  borderRadius: 16,
  overflow: "hidden",
  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
};

const inputStyle: React.CSSProperties = {
  width: "93%",
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #ddd",
};
const buttonStyle: React.CSSProperties = {
  padding: "12px",
  background: "#1a73e8",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "bold",
};
const suggestionWrapper: React.CSSProperties = {
  position: "absolute",
  top: "42px",
  left: 0,
  right: 0,
  background: "white",
  zIndex: 1100,
  border: "1px solid #eee",
  maxHeight: "150px",
  overflowY: "auto",
};
const suggestionItem: React.CSSProperties = {
  padding: "10px",
  cursor: "pointer",
  borderBottom: "1px solid #f0f0f0",
};

export default Map;
