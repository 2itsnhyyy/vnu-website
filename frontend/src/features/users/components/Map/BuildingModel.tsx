import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export const BuildingModel = ({ building, origin, onClick }: any) => {
  const SCALE_GIS = 100000;

  return (
    <group>
      {building.objects3d.map((obj: any) => (
        <group key={obj.objectId}>
          {/* Render Mesh (.glb) */}
          {obj.objectType === 0 && obj.meshes.map((mesh: any) => {
            const [lon, lat, alt] = mesh.pointGeometry.coordinates;
            const pos = [
              (lon - origin.lon) * SCALE_GIS,
              alt,
              (lat - origin.lat) * SCALE_GIS * -1
            ];
            return (
              <SingleMesh 
                key={mesh.meshId} 
                url={mesh.meshUrl}
                position={pos as [number, number, number]}
                rotation={[0, (mesh.rotate * Math.PI) / 180, 0]}
                scale={mesh.scale}
                onSelect={onClick} 
              />
            );
          })}

          {/* Render Khối lăng trụ (Body Type 1) */}
          {obj.objectType === 1 && obj.bodies.map((body: any) => (
            body.prisms?.map((prism: any) => {
              const shape = new THREE.Shape();
              const coords = prism.baseFaceGeometry.coordinates[0];
              coords.forEach((c: any, i: number) => {
                const x = (c[0] - origin.lon) * SCALE_GIS;
                const z = (c[1] - origin.lat) * SCALE_GIS * -1;
                if (i === 0) shape.moveTo(x, z); else shape.lineTo(x, z);
              });

              return (
                <mesh key={prism.prismId} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow onClick={onClick}>
                  <extrudeGeometry args={[shape, { depth: prism.height || 5, bevelEnabled: false }]} />
                  <meshStandardMaterial color="#cccccc" roughness={0.5} metalness={0.2} />
                </mesh>
              );
            })
          ))}
        </group>
      ))}
    </group>
  );
};

const SingleMesh = ({ url, position, rotation, scale, onSelect }: any) => {
  const { scene } = useGLTF(url);
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  return (
    <primitive 
      object={clonedScene} 
      position={position} 
      rotation={rotation}
      scale={[scale, scale, scale]}
      castShadow
      receiveShadow
      onClick={(e: any) => {
        e.stopPropagation();
        onSelect();
      }}
    />
  );
};