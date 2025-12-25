import React, { useState, useEffect, Suspense, useMemo, useRef } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { MapControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { mapService } from "../../../api/services/mapService";
import { BuildingModel } from "../../../components/Map/BuildingModel";
import { MapBackground } from "../../../components/Map/MapBackground";

const CameraController = ({ targetPosition }: { targetPosition: THREE.Vector3 | null }) => {
  const { controls } = useThree();
  const targetVec = new THREE.Vector3();

  useFrame((state) => {
    if (targetPosition && controls) {
      controls.target.lerp(targetPosition, 0.1);
      controls.update();
    }
  });

  return null;
};

const Map = () => {
  const [buildings, setBuildings] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [targetPos, setTargetPos] = useState<THREE.Vector3 | null>(null);

  const worldOrigin = useMemo(() => {
    if (buildings.length === 0) return null;
    const firstMesh = buildings[0].objects3d?.[0]?.meshes?.[0];
    if (firstMesh) {
      const [lon, lat] = firstMesh.pointGeometry.coordinates;
      return { lon, lat };
    }
    return null;
  }, [buildings]);

  const handleSelectBuilding = (building: any) => {
    setSelected(building);
    
    const mesh = building.objects3d?.[0]?.meshes?.[0];
    if (mesh && worldOrigin) {
      const SCALE_GIS = 100000;
      const [lon, lat, alt] = mesh.pointGeometry.coordinates;
      const x = (lon - worldOrigin.lon) * SCALE_GIS;
      const z = (lat - worldOrigin.lat) * SCALE_GIS * -1;
      setTargetPos(new THREE.Vector3(x, alt, z));
    }
  };

  useEffect(() => {
    mapService.getBuildings(10.8697, 106.8024, 18).then(setBuildings);
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      {selected && (
        <div style={{ position: "absolute", top: 20, left: 20, zIndex: 10, background: "white", padding: 15, borderRadius: 8 }}>
          <h3>{selected.name}</h3>
          <p>{selected.description}</p>
          <button onClick={() => { setSelected(null); setTargetPos(new THREE.Vector3(0,0,0)); }}>Reset Camera</button>
        </div>
      )}

      <Canvas shadows onCreated={({ scene }) => { scene.fog = new THREE.Fog("#e0e0e0", 500, 2000); }}>
        <PerspectiveCamera makeDefault position={[100, 100, 100]} far={10000} />
        <MapControls makeDefault />
        
        <CameraController targetPosition={targetPos} />
        
        <ambientLight intensity={1.5} />
        <directionalLight position={[50, 100, 50]} intensity={1.5} castShadow />

        <Suspense fallback={null}>
          {worldOrigin && <MapBackground origin={worldOrigin} zoom={18} />}
          {worldOrigin && buildings.map((b) => (
            <BuildingModel key={b.buildingId} building={b} origin={worldOrigin} onClick={() => handleSelectBuilding(b)} />
          ))}
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Map;