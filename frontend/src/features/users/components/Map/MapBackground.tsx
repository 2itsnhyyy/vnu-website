import React, { useMemo, useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const MapBackground = ({ origin, zoom }: { origin: any, zoom: number }) => {
  const [tiles, setTiles] = useState<any[]>([]);
  const TILE_SIZE = 150; 
  const lastTilePos = useRef({ x: -999, z: -999 });

  const lon2tile = (lon: number, z: number) => Math.floor(((lon + 180) / 360) * Math.pow(2, z));
  const lat2tile = (lat: number, z: number) =>
    Math.floor(((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) * Math.pow(2, z));

  const originTile = useMemo(() => ({
    x: lon2tile(origin.lon, zoom),
    y: lat2tile(origin.lat, zoom)
  }), [origin, zoom]);

  useFrame(({ camera }) => {
    const camX = Math.round(camera.position.x / TILE_SIZE);
    const camZ = Math.round(camera.position.z / TILE_SIZE);

    if (camX !== lastTilePos.current.x || camZ !== lastTilePos.current.z) {
      lastTilePos.current = { x: camX, z: camZ };

      const newTiles = [];
      const renderDistance = 5; // Tải 5 ô xung quanh mỗi chiều (Tổng 11x11 ô)

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
    const tex = new THREE.TextureLoader().load(url);
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