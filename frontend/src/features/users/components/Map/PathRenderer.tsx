import React, { useMemo } from "react";
import * as THREE from "three";
import type { Geometry } from "../../api/types/map.types";

export const PathRenderer = ({
  geometry,
  origin,
}: {
  geometry: Geometry;
  origin: { lon: number; lat: number };
}) => {
  const SCALE_GIS = 100000;

  // Kiểm tra loại dữ liệu trả về từ API find-path
  if (!geometry || geometry.type !== "MultiLineString") return null;

  return (
    <group>
      {geometry.coordinates.map((line: any, index: number) => {
        // Chuyển đổi tọa độ GIS sang Vector3 3D
        const points = line.map((coord: number[]) => {
          const x = (coord[0] - origin.lon) * SCALE_GIS;
          const y = 0.5; // Độ cao cố định để đường nổi trên mặt map
          const z = (coord[1] - origin.lat) * SCALE_GIS * -1;
          return new THREE.Vector3(x, y, z);
        });

        // Tạo đường cong mượt mà qua các điểm
        const curve = new THREE.CatmullRomCurve3(points);
        
        // TubeGeometry: Tạo hình ống bao quanh đường cong (radius: 0.2)
        const tubeGeometry = new THREE.TubeGeometry(curve, 128, 0.2, 8, false);

        return (
          <mesh key={index} geometry={tubeGeometry}>
            <meshStandardMaterial
              color="#4285F4" // Màu xanh đặc trưng của Google Maps
              emissive="#1a73e8" // Hiệu ứng phát sáng
              emissiveIntensity={1.2}
              transparent={true}
              opacity={0.9}
            />
          </mesh>
        );
      })}
    </group>
  );
};