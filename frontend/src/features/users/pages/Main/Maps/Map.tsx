import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import mapService from "../../../api/services/mapService";
import type { Building3D, MeshObject } from "../../../api/types/map.types";

const Map = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [searchResults, setSearchResults] = useState<Building3D[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const loadedModels = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [106.7857, 10.8579], // Tọa độ ĐHQG từ backend log
      zoom: 17,
      pitch: 60,
      antialias: true,
    });

    map.current.on("load", () => {
      if (!map.current) return;
      const threeLayer = createThreeLayer(map.current);
      map.current.addLayer(threeLayer);
    });

    return () => map.current?.remove();
  }, []);

  const createThreeLayer = (mapInstance: maplibregl.Map): maplibregl.CustomLayerInterface => {
    const scene = new THREE.Scene();
    const camera = new THREE.Camera();
    const loader = new GLTFLoader();

    return {
      id: "3d-buildings-layer",
      type: "custom",
      renderingMode: "3d",
      onAdd: function (map, gl) {
        this.renderer = new THREE.WebGLRenderer({
          canvas: map.getCanvas(),
          context: gl,
          antialias: true,
        });
        this.renderer.autoClear = false;

        scene.add(new THREE.DirectionalLight(0xffffff, 1).linkPosition(0, -70, 100));
        scene.add(new THREE.AmbientLight(0xffffff, 0.8));

        this.updateModels();
      },

      render: function (gl, matrix) {
        const m = new THREE.Matrix4().fromArray(matrix);
        camera.projectionMatrix = m;
        this.renderer.resetState();
        this.renderer.render(scene, camera);
        mapInstance.triggerRepaint();
      },

      updateModels: async function () {
        const center = mapInstance.getCenter();
        const response = await mapService.getBuildingsForMap({
          lat: center.lat,
          lon: center.lng,
          zoom: mapInstance.getZoom(),
          heading: mapInstance.getBearing(),
          tilt: mapInstance.getPitch(),
        });

        response.buildings?.forEach((building: Building3D) => {
          building.objects3d?.forEach((obj) => {
            if (obj.objectType === 0) { // MeshObject
              obj.meshes?.forEach((mesh) => this.loadGLB(mesh, scene));
            }
          });
        });
      },

      loadGLB: function (mesh: MeshObject, scene: THREE.Scene) {
        if (loadedModels.current.has(mesh.meshId)) return;
        
        const fullUrl = mesh.meshUrl.startsWith('http') ? mesh.meshUrl : `http://localhost:3000${mesh.meshUrl}`;

        loader.load(fullUrl, (gltf) => {
          const model = gltf.scene;
          const coords = mesh.pointGeometry?.coordinates;
          if (!coords) return;

          const mercator = maplibregl.MercatorCoordinate.fromLngLat([coords[0], coords[1]], coords[2] || 0);
          model.scale.set(mesh.scale[0], mesh.scale[1], mesh.scale[2]);
          model.rotation.set(Math.PI / 2, THREE.MathUtils.degToRad(mesh.rotate[1]), 0);
          model.position.set(mercator.x, mercator.y, mercator.z || 0);

          scene.add(model);
          loadedModels.current.add(mesh.meshId);
        });
      }
    };
  };

  // CHỨC NĂNG CHỈ ĐƯỜNG [OSRM API]
  const handleRouting = async (destCoords: [number, number]) => {
    const start: [number, number] = [106.7857, 10.8579]; // Tọa độ giả lập vị trí người dùng
    const url = `https://router.project-osrm.org/route/v1/foot/${start[0]},${start[1]};${destCoords[0]},${destCoords[1]}?overview=full&geometries=geojson`;
    
    const res = await fetch(url);
    const data = await res.json();
    if (data.routes?.length) {
      const geojson = data.routes[0].geometry;
      if (map.current?.getSource('route')) {
        (map.current.getSource('route') as maplibregl.GeoJSONSource).setData(geojson);
      } else {
        map.current?.addSource('route', { type: 'geojson', data: geojson });
        map.current?.addLayer({
          id: 'route-line',
          type: 'line',
          source: 'route',
          paint: { 'line-color': '#3b82f6', 'line-width': 5 }
        });
      }
    }
  };

  return (
    <div className="relative w-full h-screen">
      <div className="absolute top-4 left-4 z-10 w-80">
        <input
          className="w-full p-3 rounded-lg shadow-lg border border-gray-200 focus:outline-none"
          placeholder="Tìm tòa nhà..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (e.target.value.length > 2) mapService.searchBuildings(e.target.value).then(setSearchResults);
          }}
        />
        {searchResults.length > 0 && (
          <div className="mt-2 bg-white rounded-lg shadow-xl max-h-60 overflow-y-auto">
            {searchResults.map((b) => (
              <div key={b.buildingId} className="p-3 hover:bg-gray-100 cursor-pointer border-b flex justify-between items-center"
                onClick={() => {
                  mapService.getBuildingById(b.buildingId).then(res => {
                    const coords = res.building.objects3d[0]?.meshes[0]?.pointGeometry?.coordinates;
                    if (coords) map.current?.flyTo({ center: [coords[0], coords[1]], zoom: 19, pitch: 70 });
                  });
                  setSearchResults([]);
                }}>
                <div>
                  <p className="font-bold">{b.name}</p>
                  <p className="text-xs text-gray-500">{b.description}</p>
                </div>
                <button 
                  className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    const coords = b.objects3d?.[0]?.meshes?.[0]?.pointGeometry?.coordinates;
                    if (coords) handleRouting([coords[0], coords[1]]);
                  }}
                >Chỉ đường</button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};

export default Map;
