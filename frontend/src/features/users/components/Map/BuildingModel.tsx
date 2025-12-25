import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export const BuildingModel = ({ building, origin, onClick }: any) => {
  const SCALE_GIS = 100000;

  return (
    <group>
      {building.objects3d.map((obj: any) => (
        <group key={obj.objectId}>
          {obj.objectType === 0 && obj.meshes.map((mesh: any) => (
            <SingleMesh 
              key={mesh.meshId} 
              data={mesh} 
              origin={origin} 
              scaleGis={SCALE_GIS} 
              onSelect={() => onClick(building)} 
            />
          ))}

          {obj.objectType === 1 && obj.bodies.map((body: any) => (
            <group key={body.bodyId}>
              {body.prisms?.map((prism: any) => (
                <PrismMesh key={prism.prismId} data={prism} origin={origin} scaleGis={SCALE_GIS} />
              ))}
              {body.cones?.map((cone: any) => (
                <ConeMesh key={cone.coneId} data={cone} origin={origin} scaleGis={SCALE_GIS} />
              ))}
            </group>
          ))}
        </group>
      ))}
    </group>
  );
};

const PrismMesh = ({ data, origin, scaleGis }: any) => {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    const coords = data.baseFaceGeometry.coordinates[0];
    coords.forEach((c: any, i: number) => {
      const x = (c[0] - origin.lon) * scaleGis;
      const y = (c[1] - origin.lat) * scaleGis * -1;
      if (i === 0) s.moveTo(x, y); else s.lineTo(x, y);
    });
    return s;
  }, [data, origin, scaleGis]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <extrudeGeometry args={[shape, { depth: data.height || 5, bevelEnabled: false }]} />
      <meshStandardMaterial color="#cccccc" />
    </mesh>
  );
};

const SingleMesh = ({ data, origin, scaleGis, onSelect }: any) => {
  const { scene } = useGLTF(data.meshUrl);
  const position = useMemo(() => [
    (data.pointGeometry.coordinates[0] - origin.lon) * scaleGis,
    data.pointGeometry.coordinates[2] || 0,
    (data.pointGeometry.coordinates[1] - origin.lat) * scaleGis * -1
  ], [data, origin, scaleGis]);

  return (
    <primitive object={scene.clone()} position={position} scale={data.scale} onClick={onSelect} />
  );
};