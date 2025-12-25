import React, { useState, useEffect, Suspense, useMemo, useRef } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { MapControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { mapService } from "../../../api/services/mapService";
import { BuildingModel } from "../../../components/Map/BuildingModel";
import { MapBackground } from "../../../components/Map/MapBackground";

const Map = () => {
  const [buildings, setBuildings] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const mapOrigin = useMemo(() => ({ lon: 106.8024, lat: 10.8697 }), []);

  const loadBuildingsData = async (lat: number, lon: number) => {
    try {
      const data = await mapService.getBuildings(lat, lon, 18);
      setBuildings(prev => {
        const existingIds = new Set(prev.map(b => b.buildingId));
        const uniqueNew = data.filter((b: any) => !existingIds.has(b.buildingId));
        return [...prev, ...uniqueNew];
      });
    } catch (error) {
      console.error("Lỗi nạp tòa nhà:", error);
    }
  };

  useEffect(() => {
    loadBuildingsData(mapOrigin.lat, mapOrigin.lon);
  }, [mapOrigin]);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <Canvas 
        shadows 
        onCreated={({ scene }) => { 
          scene.fog = new THREE.Fog("#e0e0e0", 1000, 5000); 
        }}
      >
        <PerspectiveCamera makeDefault position={[300, 300, 300]} far={20000} />
        
        {/* Cấu hình để xoay tự do các góc */}
        <MapControls 
          makeDefault 
          enableRotate={true}       // Cho phép xoay
          maxPolarAngle={Math.PI / 2.1} // Cho phép nghiêng camera sát mặt đất (hơn 90 độ)
          minDistance={10}          // Khoảng cách zoom tối thiểu
          maxDistance={5000}        // Khoảng cách zoom tối đa
          onEnd={(e: any) => {
            const target = e.target.target;
            const SCALE_GIS = 100000;
            const currentLon = mapOrigin.lon + target.x / SCALE_GIS;
            const currentLat = mapOrigin.lat - target.z / SCALE_GIS;
            loadBuildingsData(currentLat, currentLon);
          }}
        />
        
        <ambientLight intensity={1.5} />
        <directionalLight position={[100, 200, 100]} intensity={1.5} castShadow />

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
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Map;