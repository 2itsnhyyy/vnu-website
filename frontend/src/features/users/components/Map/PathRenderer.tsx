import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { Geometry } from '../../api/types/map.types';

export const PathRenderer = ({ geometry, origin }: { geometry: Geometry, origin: { lon: number, lat: number } }) => {
  const SCALE_GIS = 100000;

  if (!geometry || geometry.type !== 'MultiLineString') return null;

  return (
    <group>
      {geometry.coordinates.map((line: any, index: number) => {
        const points = line.map((coord: number[]) => {
          const x = (coord[0] - origin.lon) * SCALE_GIS;
          const y = coord[2] || 0.2;
          const z = (coord[1] - origin.lat) * SCALE_GIS * -1;
          return new THREE.Vector3(x, y, z);
        });

        const curve = new THREE.CatmullRomCurve3(points);
        const tubeGeometry = new THREE.TubeGeometry(curve, 128, 0.1, 8, false);

        return (
          <mesh key={index} geometry={tubeGeometry}>
            <meshStandardMaterial color="#ffdf00" emissive="#ffdf00" emissiveIntensity={2} />
          </mesh>
        );
      })}
    </group>
  );
};