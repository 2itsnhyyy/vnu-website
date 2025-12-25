import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface MapBackgroundProps {
  origin: { lon: number; lat: number };
  zoom: number;
}

export const MapBackground = ({ origin, zoom }: MapBackgroundProps) => {
  const [tiles, setTiles] = useState<any[]>([]);
  const TILE_SIZE = 150; 
  const lastCameraTile = useRef({ x: -999, y: -999 });

  const lon2tile = (lon: number, z: number) => Math.floor(((lon + 180) / 360) * Math.pow(2, z));
  const lat2tile = (lat: number, z: number) =>
    Math.floor(
      ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) *
        Math.pow(2, z)
    );

  const originTile = useMemo(() => {
    if (!origin || typeof origin.lon === 'undefined') return null;
    return {
      x: lon2tile(origin.lon, zoom),
      y: lat2tile(origin.lat, zoom)
    };
  }, [origin, zoom]);

  const updateTiles = (camX: number, camZ: number) => {
    if (!originTile) return;
    const newTiles = [];
    const renderDistance = 6; 

    for (let dx = -renderDistance; dx <= renderDistance; dx++) {
      for (let dz = -renderDistance; dz <= renderDistance; dz++) {
        const targetX = camX + dx;
        const targetZ = camZ + dz;
        const osmX = originTile.x + targetX;
        const osmY = originTile.y + targetZ;

        newTiles.push({
          id: `${osmX}-${osmY}`,
          position: [targetX * TILE_SIZE, -0.6, targetZ * TILE_SIZE],
          url: `https://tile.openstreetmap.org/${zoom}/${osmX}/${osmY}.png`
        });
      }
    }
    setTiles(newTiles);
  };

  useEffect(() => {
    if (originTile) updateTiles(0, 0);
  }, [originTile]);

  useFrame(({ camera }) => {
    if (!originTile) return;
    const camX = Math.round(camera.position.x / TILE_SIZE);
    const camZ = Math.round(camera.position.z / TILE_SIZE);

    if (camX !== lastCameraTile.current.x || camZ !== lastCameraTile.current.y) {
      lastCameraTile.current = { x: camX, y: camZ };
      updateTiles(camX, camZ);
    }
  });

  return (
    <group>
      {tiles.map((tile) => (
        <TilePlane key={tile.id} url={tile.url} position={tile.position} size={TILE_SIZE} />
      ))}
    </group>
  );
};

const TilePlane = React.memo(({ url, position, size }: any) => {
  const texture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const tex = loader.load(url);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [url]);

  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
});