import React, { useState, useEffect, useRef } from "react";
import { message, InputNumber } from "antd";
import leftClickIcon from "../../../../../assets/icons/left-click.png";
import rightClickIcon from "../../../../../assets/icons/right-click.png";

// Preview scale constant: 1 unit ThreeJS = 1 meter, but scale down for better visuals
const PREVIEW_SCALE = 0.1;

// Types
interface Vector3 {
  x: number;
  y: number;
  z: number;
}

interface ShapeBase {
  id: string;
  type: "box" | "cylinder" | "prism";
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
  color: string;
}

interface BoxShape extends ShapeBase {
  type: "box";
  width: number;
  height: number;
  depth: number;
}

interface CylinderShape extends ShapeBase {
  type: "cylinder";
  radius: number;
  height: number;
}

interface PrismShape extends ShapeBase {
  type: "prism";
  points: [number, number][];
  height: number;
  baseLatLng?: { lat: number; lng: number }[]; // store original lat/lng for API
}

type Shape = BoxShape | CylinderShape | PrismShape;

interface GlbAsset {
  id: string;
  name: string;
  file: File;
  url: string;
  instances: {
    id: string;
    position: Vector3;
    rotation: Vector3;
    scale: Vector3;
  }[];
}

interface BuildingFormData {
  name?: string;
  description?: string;
  floors?: number;
  place_id?: number;
  imageFile?: File;
  enableDraw?: boolean;
  enableUpload?: boolean;
  modelFile?: File;
  modelFileName?: string;
  useLocalStorage?: boolean;
  latitude?: number;
  longitude?: number;
  shapes?: Shape[];
  glbAssets?: GlbAsset[];
}

interface Step3Props {
  initialData: Partial<BuildingFormData>;
  onNext: (data: Partial<BuildingFormData>) => void;
  onBack: () => void;
}

const Step3: React.FC<Step3Props> = ({ initialData, onNext, onBack }) => {
  // Refs
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const threeContainerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const controlsRef = useRef<any>(null);
  const animationIdRef = useRef<number>(0);
  const tempObjectUrlsRef = useRef<string[]>([]);

  // State
  const [position, setPosition] = useState({
    lat: initialData.latitude ?? 0.874334,
    lng: initialData.longitude ?? 106.80325,
  });

  const [shapes, setShapes] = useState<Shape[]>([]);
  const [glbAssets, setGlbAssets] = useState<GlbAsset[]>([]);
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [threeLoaded, setThreeLoaded] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  // Drawing on map state
  const [drawingMode, setDrawingMode] = useState(!!initialData.enableDraw);
  const [drawPoints, setDrawPoints] = useState<{ lat: number; lng: number }[]>(
    []
  );

  const drawMarkersRef = useRef<any[]>([]);
  const drawPolylineRef = useRef<any>(null);
  const drawPolygonsRef = useRef<any[]>([]);
  const [drawHeight, setDrawHeight] = useState<number>(1);
  const [drawScale, setDrawScale] = useState<number>(1);

  // Keep drawingMode in sync if initialData changes
  useEffect(() => {
    setDrawingMode(!!initialData.enableDraw);
  }, [initialData.enableDraw]);

  // If user selected upload in step2 and model stored in localStorage, load a simple asset for preview
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (
      initialData.enableUpload &&
      initialData.modelFileName &&
      glbAssets.length === 0
    ) {
      const key = `model_${initialData.modelFileName}`;
      const data = localStorage.getItem(key);
      const url = data || "";
      const newAsset: GlbAsset = {
        id: `asset_${Date.now()}`,
        name: initialData.modelFileName,
        file: initialData.modelFile as File,
        url,
        instances: [
          {
            id: `instance_${Date.now()}`,
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 0.2, y: 0.2, z: 0.2 },
          },
        ],
      };
      setGlbAssets([newAsset]);
    }
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    import("leaflet").then((L) => {
      if (!mapInstanceRef.current) {
        const map = L.map(mapRef.current!, {
          scrollWheelZoom: true,
        }).setView([position.lat, position.lng], 17);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
        }).addTo(map);

        // ensure map sizing/interaction is correct after render
        setTimeout(() => {
          try {
            map.invalidateSize && map.invalidateSize();
          } catch (e) {}
        }, 200);

        const customIcon = L.divIcon({
          className: "custom-map-marker",
          html: `
            <div style="
              width: 40px; height: 40px; background: #3b82f6;
              border: 3px solid white; border-radius: 50%;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              display: flex; align-items: center; justify-content: center;
              cursor: move;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 40],
        });

        const marker = L.marker([position.lat, position.lng], {
          draggable: !drawingMode,
          icon: customIcon,
        });

        // only add marker if not in drawing mode
        if (!drawingMode) marker.addTo(map);

        marker.on("dragend", (e: any) => {
          const newPos = e.target.getLatLng();
          setPosition({ lat: newPos.lat, lng: newPos.lng });
          message.success("Đã cập nhật vị trí");
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;
        setMapReady(true);
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        setMapReady(false);
      }
    };
  }, [position.lat, position.lng]);

  // Map drawing handlers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // disable double-click zoom only during drawing mode
    try {
      if (
        drawingMode &&
        map.doubleClickZoom &&
        typeof map.doubleClickZoom.disable === "function"
      ) {
        map.doubleClickZoom.disable();
      } else if (
        !drawingMode &&
        map.doubleClickZoom &&
        typeof map.doubleClickZoom.enable === "function"
      ) {
        map.doubleClickZoom.enable();
      }
    } catch (e) {}

    const handleMapDoubleClick = (e: any) => {
      if (!drawingMode) return;
      // only allow drawing when there is no existing prism
      if (Array.isArray(shapes) && shapes.length > 0) {
        try {
          message.info("Chỉ được vẽ 1 khối lăng trụ");
        } catch (e) {}
        return;
      }

      const lat = e.latlng.lat;
      const lng = e.latlng.lng;

      // If there is at least one point, check if click is near the first point -> finalize
      if (drawPoints.length >= 1) {
        const first = drawPoints[0];
        const latFactor = 111320; // meters per degree latitude
        const lngFactor =
          Math.cos((((lat + first.lat) / 2) * Math.PI) / 180) * 111320; // meters per degree longitude (adjusted for latitude)
        const dx = (lng - first.lng) * lngFactor;
        const dy = (lat - first.lat) * latFactor;
        const dist = Math.sqrt(dx * dx + dy * dy);
        // threshold 5 meters
        if (dist < 5) {
          // finalize without adding this click
          finishDrawing();
          return;
        }
      }

      setDrawPoints((prev) => {
        const next = [...prev, { lat, lng }];
        // add marker and update polyline
        import("leaflet").then((L) => {
          const marker = L.circleMarker([lat, lng], {
            radius: 6,
            color: "#1D4ED8",
            fillColor: "#1D4ED8",
            fillOpacity: 0.9,
          }).addTo(map);
          drawMarkersRef.current.push(marker);
          if (drawPolylineRef.current) {
            drawPolylineRef.current.setLatLngs(next.map((p) => [p.lat, p.lng]));
          } else {
            drawPolylineRef.current = L.polyline(
              next.map((p) => [p.lat, p.lng]),
              { color: "#1D4ED8" }
            ).addTo(map);
          }
        });
        return next;
      });
    };

    // right-click (contextmenu) to remove last point
    const handleMapRightClick = (e: any) => {
      if (!drawingMode) return;
      if (!drawPoints || drawPoints.length === 0) return;
      // remove last point and its marker
      setDrawPoints((prev) => {
        const next = prev.slice(0, -1);
        // remove last marker from map
        const lastMarker = drawMarkersRef.current.pop();
        try {
          if (lastMarker && map.hasLayer && map.hasLayer(lastMarker))
            map.removeLayer(lastMarker);
        } catch (e) {}
        // update polyline or remove if empty
        try {
          if (next.length === 0) {
            if (drawPolylineRef.current) {
              map.removeLayer(drawPolylineRef.current);
              drawPolylineRef.current = null;
            }
          } else {
            if (drawPolylineRef.current)
              drawPolylineRef.current.setLatLngs(
                next.map((p) => [p.lat, p.lng])
              );
          }
        } catch (e) {}
        return next;
      });
    };

    map.on("dblclick", handleMapDoubleClick);
    map.on("contextmenu", handleMapRightClick);

    return () => {
      map.off("dblclick", handleMapDoubleClick);
      map.off("contextmenu", handleMapRightClick);
      // re-enable double-click zoom when unmounting or drawing ends
      try {
        if (
          map.doubleClickZoom &&
          typeof map.doubleClickZoom.enable === "function"
        ) {
          map.doubleClickZoom.enable();
        }
      } catch (e) {}
    };
  }, [drawingMode, drawPoints, mapReady, shapes]);

  // Manage marker: update position, toggle layer and dragging based on drawingMode
  useEffect(() => {
    const map = mapInstanceRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;

    try {
      marker.setLatLng([position.lat, position.lng]);
    } catch (e) {}

    try {
      if (drawingMode) {
        if (map.hasLayer(marker)) map.removeLayer(marker);
        if (marker.dragging && typeof marker.dragging.disable === "function")
          marker.dragging.disable();
      } else {
        if (!map.hasLayer(marker)) marker.addTo(map);
        if (marker.dragging && typeof marker.dragging.enable === "function")
          marker.dragging.enable();
      }
    } catch (e) {}
  }, [position.lat, position.lng, drawingMode, mapReady]);
  const clearDrawLayers = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    drawMarkersRef.current.forEach((m) => {
      try {
        map.removeLayer(m);
      } catch (e) {}
    });
    drawMarkersRef.current = [];
    if (drawPolylineRef.current) {
      try {
        map.removeLayer(drawPolylineRef.current);
      } catch (e) {}
      drawPolylineRef.current = null;
    }
    setDrawPoints([]);
  };

  const finishDrawing = () => {
    if (drawPoints.length < 3) {
      message.warning("Vui lòng chọn ít nhất 3 điểm để tạo polygon");
      return;
    }

    // Lấy điểm đầu làm gốc tọa độ
    const base = drawPoints[0];
    const latFactor = 111320; // meters per degree latitude
    const lngFactor = Math.cos((base.lat * Math.PI) / 180) * 111320; // meters per degree longitude

    // Chuyển đổi lat/lng sang meters (X=lng, Z=lat)
    const ptsRaw: [number, number][] = drawPoints.map((p) => [
      (p.lng - base.lng) * lngFactor * drawScale, // X (East-West)
      (p.lat - base.lat) * latFactor * drawScale, // Z (North-South)
    ]);

    // Tính centroid trong không gian XZ
    const centroidX = ptsRaw.reduce((sum, p) => sum + p[0], 0) / ptsRaw.length;
    const centroidZ = ptsRaw.reduce((sum, p) => sum + p[1], 0) / ptsRaw.length;

    // Điểm relative to centroid (để geometry được centered)
    const pts: [number, number][] = ptsRaw.map((p) => [
      p[0] - centroidX, // X offset from centroid
      p[1] - centroidZ, // Z offset from centroid
    ]);

    const prism: PrismShape = {
      id: `shape_${Date.now()}`,
      type: "prism",
      position: {
        x: centroidX, // X position (East-West)
        y: 0, // Y position (bottom touches ground plane)
        z: centroidZ, // Z position (North-South)
      },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      color: "#" + Math.floor(Math.random() * 16777215).toString(16),
      points: pts,
      height: drawHeight,
      baseLatLng: drawPoints, // ✅ Store ORIGINAL clicked lat/lng ONLY
    };

    setShapes([prism]);
    setSelectedShapeId(prism.id);
    message.success("Đã tạo lăng trụ từ polygon");
    setDrawingMode(false);

    // add a persistent polygon to the map (keep it visible) BEFORE clearing temporary markers
    try {
      const map = mapInstanceRef.current;
      if (map) {
        import("leaflet").then((L) => {
          try {
            const polygon = L.polygon(
              drawPoints.map((p) => [p.lat, p.lng]),
              { color: "#1D4ED8", fillOpacity: 0.12 }
            ).addTo(map);
            drawPolygonsRef.current.push(polygon);
          } catch (err) {
            // Failed to add polygon
          }
        });
      }
    } catch (e) {}

    // remove temporary markers and polyline (but keep the polygon)
    clearDrawLayers();

    // Focus camera
    setTimeout(() => {
      const THREE = (window as any).THREE;
      if (!THREE) return;
      const cam = cameraRef.current;
      const controls = controlsRef.current;
      if (cam && controls) {
        const distance = Math.max(15, drawHeight * 3);
        // center the preview on origin (objects touch ground at y=0)
        cam.position.set(distance, drawHeight / 1.5, distance);
        if (typeof controls.target?.set === "function") {
          controls.target.set(0, drawHeight / 2, 0);
        }
        controls.update();
      }
    }, 200);
  };

  // Update marker position and disable dragging in drawing mode
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLatLng([position.lat, position.lng]);
      try {
        markerRef.current.dragging[drawingMode ? "disable" : "enable"]();
      } catch (e) {}
    }
  }, [position.lat, position.lng, drawingMode]);

  // Initialize Three.js Scene
  useEffect(() => {
    if (!threeContainerRef.current) return;
    if (rendererRef.current) return;

    // // If already initialized and canvas still present, skip
    // if (threeLoaded && rendererRef.current && threeContainerRef.current.contains(rendererRef.current.domElement)) return

    // // If there's an existing renderer but its canvas is gone (container re-mounted), dispose it first
    // if (rendererRef.current) {
    //   try {
    //     if (rendererRef.current.domElement && rendererRef.current.domElement.parentElement) {
    //       rendererRef.current.domElement.parentElement.removeChild(rendererRef.current.domElement)
    //     }
    //   } catch (e) {}
    //   try {
    //     // properly lose the WebGL context to avoid accumulating contexts
    //     if (typeof rendererRef.current.forceContextLoss === 'function') {
    //       try { rendererRef.current.forceContextLoss() } catch(e) {}
    //     }
    //   } catch(e) {}
    //   try { rendererRef.current.dispose() } catch (e) {}
    //   try { if (rendererRef.current.domElement) { rendererRef.current.domElement.width = 1; rendererRef.current.domElement.height = 1 } } catch (e) {}
    //   rendererRef.current = null
    //   sceneRef.current = null
    //   cameraRef.current = null
    //   controlsRef.current = null
    //   setThreeLoaded(false)
    // }

    const initThreeJS = async () => {
      try {
        const THREE = await import("three");
        const { OrbitControls } = await import(
          "three/examples/jsm/controls/OrbitControls.js"
        );

        // Make THREE available globally for shape updates
        const w = window as any;
        w.THREE = THREE;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f0f0);

        const camera = new THREE.PerspectiveCamera(
          50,
          threeContainerRef.current!.clientWidth /
            threeContainerRef.current!.clientHeight,
          0.1,
          1000
        );
        camera.position.set(15, 15, 15);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(
          threeContainerRef.current!.clientWidth,
          threeContainerRef.current!.clientHeight
        );
        renderer.shadowMap.enabled = true;
        // Attach renderer canvas to current container
        threeContainerRef.current!.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(10, 20, 10);
        dirLight.castShadow = true;
        scene.add(dirLight);

        const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
        dirLight2.position.set(-10, 10, -10);
        scene.add(dirLight2);

        // Grid & Axes
        const gridHelper = new THREE.GridHelper(30, 30, 0x888888, 0xcccccc);
        scene.add(gridHelper);

        const axesHelper = new THREE.AxesHelper(5);
        scene.add(axesHelper);

        sceneRef.current = scene;
        rendererRef.current = renderer;
        cameraRef.current = camera;
        controlsRef.current = controls;

        // Animation loop
        const animate = () => {
          animationIdRef.current = requestAnimationFrame(animate);
          controls.update();
          renderer.render(scene, camera);
        };
        animate();

        setThreeLoaded(true);
        message.success("Khởi tạo 3D thành công");
      } catch (error) {
        message.error("Không thể khởi tạo 3D viewer");
      }
    };

    initThreeJS();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      // if (rendererRef.current && threeContainerRef.current && threeContainerRef.current.contains(rendererRef.current.domElement)) {
      //   try { threeContainerRef.current.removeChild(rendererRef.current.domElement) } catch(e) {}
      //   try { if (typeof rendererRef.current.forceContextLoss === 'function') rendererRef.current.forceContextLoss() } catch(e) {}
      //   try { rendererRef.current.dispose() } catch(e) {}
      // }
    };
  }, []);

  // Update scene when shapes change
  useEffect(() => {
    if (!sceneRef.current || !threeLoaded) return;

    const THREE = (window as any).THREE;
    if (!THREE) return;

    const shapesArr = Array.isArray(shapes) ? shapes : [];

    // Clear previous shapes
    const objectsToRemove: any[] = [];
    sceneRef.current.children.forEach((child: any) => {
      if (
        child.userData.isShape ||
        child.userData.isGlbInstance ||
        child.userData.tempDebugMarker
      ) {
        objectsToRemove.push(child);
      }
    });
    objectsToRemove.forEach((obj) => sceneRef.current.remove(obj));

    // Add shapes (use safe index loop to avoid calling .forEach on unexpected values)
    for (let i = 0; i < shapesArr.length; i++) {
      const shape = shapesArr[i];
      let geometry: any;
      const material = new THREE.MeshPhongMaterial({
        color: shape.color,
        transparent: true,
        opacity: selectedShapeId === shape.id ? 0.8 : 0.9,
      });

      if (shape.type === "box") {
        geometry = new THREE.BoxGeometry(
          shape.width,
          shape.height,
          shape.depth
        );
      } else if (shape.type === "cylinder") {
        geometry = new THREE.CylinderGeometry(
          shape.radius,
          shape.radius,
          shape.height,
          32
        );
      } else if (shape.type === "prism") {
        const prismShape = new THREE.Shape();
        for (let j = 0; j < shape.points.length; j++) {
          const pt = shape.points[j];
          if (j === 0) prismShape.moveTo(pt[0], pt[1]);
          else prismShape.lineTo(pt[0], pt[1]);
        }
        prismShape.closePath();
        geometry = new THREE.ExtrudeGeometry(prismShape, {
          depth: shape.height,
          bevelEnabled: false,
        });
        // rotate so extrusion (originally along +Z) maps to +Y (up)
        geometry.rotateX(-Math.PI / 2);
      }

      if (geometry) {
        // ensure both sides are visible
        material.side = THREE.DoubleSide;
        const mesh = new THREE.Mesh(geometry, material);
        // Position in preview: center horizontally at origin; use Y for vertical offset
        mesh.position.set(0, shape.position.y, 0);
        mesh.rotation.set(shape.rotation.x, shape.rotation.y, shape.rotation.z);
        // Apply PREVIEW_SCALE only to scale so preview appears smaller but keeps correct position
        mesh.scale.set(
          shape.scale.x * PREVIEW_SCALE,
          shape.scale.y * PREVIEW_SCALE,
          shape.scale.z * PREVIEW_SCALE
        );
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.userData = { isShape: true, shapeId: shape.id };
        try {
          geometry.computeBoundingBox && geometry.computeBoundingBox();
        } catch (e) {}
        sceneRef.current.add(mesh);
      }
    }

    // Add GLB instances using GLTFLoader (real model preview)
    (async () => {
      try {
        const mod = await import("three/examples/jsm/loaders/GLTFLoader.js");
        const { GLTFLoader } = mod as any;
        const loader = new GLTFLoader();

        for (const asset of glbAssets) {
          // determine URL: prefer asset.url (could be data URL), otherwise create object URL from file
          let assetUrl = asset.url;
          if ((!assetUrl || assetUrl.length === 0) && asset.file) {
            const objUrl = URL.createObjectURL(asset.file);
            tempObjectUrlsRef.current.push(objUrl);
            assetUrl = objUrl;
          }

          if (!assetUrl) continue;

          // load glb once, then clone for instances
          await new Promise<void>((resolveLoad) => {
            loader.load(
              assetUrl,
              (gltf: any) => {
                asset.instances.forEach((instance: any) => {
                  const root = gltf.scene.clone(true);
                  // For preview center the model horizontally at origin; keep Y offset
                  root.position.set(0, instance.position.y, 0);
                  root.rotation.set(
                    instance.rotation.x,
                    instance.rotation.y,
                    instance.rotation.z
                  );
                  // Only scale the model for preview
                  root.scale.set(
                    instance.scale.x * PREVIEW_SCALE,
                    instance.scale.y * PREVIEW_SCALE,
                    instance.scale.z * PREVIEW_SCALE
                  );
                  root.traverse((child: any) => {
                    if (child.isMesh) {
                      child.castShadow = true;
                      child.receiveShadow = true;
                    }
                  });
                  root.userData = {
                    isGlbInstance: true,
                    instanceId: instance.id,
                    assetId: asset.id,
                  };
                  sceneRef.current.add(root);
                });
                resolveLoad();
              },
              undefined,
              (err: any) => {
                resolveLoad();
              }
            );
          });
        }
      } catch (err) {
        // GLTFLoader not available
      }
    })();

    // auto-frame camera to fit new content (shapes + glbs)
    try {
      // compute bounding box only from shapes and GLB instances to avoid grid/other helpers inflating bounds
      const box = new THREE.Box3();
      let any = false;
      sceneRef.current.children.forEach((child: any) => {
        if (
          child.userData &&
          (child.userData.isShape || child.userData.isGlbInstance)
        ) {
          try {
            box.expandByObject(child);
            any = true;
          } catch (e) {}
        }
      });
      if (!any) {
        // nothing to frame
      } else {
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxSize = Math.max(size.x, size.y, size.z);
        // clamp fit distance to avoid extreme camera positions
        const fitDistance = Math.min(Math.max(10, maxSize * 1.2), 200);
        const cam = cameraRef.current;
        const controls = controlsRef.current;
        if (cam && controls) {
          console.log(
            "updateScene: camera before",
            cam.position,
            "controls target before",
            controls.target
          );
          // position camera along normalized diagonal (1,1,1)
          const dir = new THREE.Vector3(1, 1, 1)
            .normalize()
            .multiplyScalar(fitDistance);
          const newPos = center.clone().add(dir);
          cam.position.copy(newPos);
          if (typeof controls.target?.copy === "function") {
            controls.target.copy(center);
          } else if (controls.target) {
            controls.target = { x: center.x, y: center.y, z: center.z };
          }
          controls.update();

          // ensure renderer size matches container
          try {
            const renderer = rendererRef.current;
            if (renderer && threeContainerRef.current) {
              const w = threeContainerRef.current.clientWidth;
              const h = threeContainerRef.current.clientHeight;
              renderer.setSize(w, h);
            }
          } catch (e) {
            // renderer resize failed
          }
        }
      }
    } catch (e) {
      // Framing error
    }

    // revoke any temp object URLs on next scene update
    tempObjectUrlsRef.current.forEach((u) => {
      try {
        URL.revokeObjectURL(u);
      } catch (e) {}
    });
    tempObjectUrlsRef.current = [];
  }, [shapes, glbAssets, selectedShapeId, threeLoaded]);

  // Sync drawHeight edits to the single prism height (if present)
  useEffect(() => {
    if (!Array.isArray(shapes) || shapes.length === 0) return;
    const s = shapes[0];
    if (s.type !== "prism") return;
    if (s.height === drawHeight) return;
    const updated: PrismShape = {
      ...s,
      height: drawHeight,
      position: { x: s.position.x, y: 0, z: s.position.z },
    };
    setShapes([updated]);
  }, [drawHeight]);

  const handleSubmit = () => {
    const shapesCount = Array.isArray(shapes) ? shapes.length : 0;
    if (initialData.enableDraw && shapesCount === 0) {
      message.warning("Vui lòng vẽ ít nhất 1 khối hình");
      return;
    }

    // Build API payload matching backend schema
    const objects3d: any[] = [];

    // Add GLB models - use marker position (map coordinates) not 3D local position
    for (const asset of glbAssets) {
      asset.instances.forEach((instance) => {
        objects3d.push({
          objectType: 0, // IMPORTED_MODEL
          meshes: [
            {
              meshUrl: asset.url,
              point: {
                type: "Point",
                coordinates: [position.lng, position.lat, 0], // [lng, lat, elevation]
              },
              rotate: instance.rotation.y || 0,
              scale: instance.scale.x || 1,
            },
          ],
        });
      });
    }

    // Add drawn prisms
    if (Array.isArray(shapes) && shapes.length > 0) {
      const prism = shapes[0];
      if (
        prism.type === "prism" &&
        prism.baseLatLng &&
        prism.baseLatLng.length >= 3
      ) {
        // Convert prism points to GeoJSON Polygon coordinates [lng, lat, 0]
        const coordinates = [prism.baseLatLng.map((p) => [p.lng, p.lat, 0])];
        // Close the polygon by adding first point at end if not already closed
        if (
          JSON.stringify(coordinates[0][0]) !==
          JSON.stringify(coordinates[0][coordinates[0].length - 1])
        ) {
          coordinates[0].push(coordinates[0][0]);
        }

        objects3d.push({
          objectType: 1, // DRAWN_SHAPE
          body: {
            name: "Drawn Structure",
            prisms: [
              {
                baseFace: {
                  type: "Polygon",
                  coordinates: coordinates,
                },
                height: prism.height,
              },
            ],
          },
        });
      }
    }

    onNext({
      ...initialData,
      latitude: position.lat,
      longitude: position.lng,
      shapes,
      glbAssets,
      objects3d, // API payload
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Center/Right - 3D Preview & Map */}
          <div className="space-y-4 col-span-2">
            {/* Map */}
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <div className="bg-white px-4 py-2 border-b border-gray-300">
                <h3 className="font-semibold text-md text-primary">
                  Vị trí trên bản đồ
                </h3>
              </div>
              <div ref={mapRef} style={{ height: "400px", width: "100%" }} />
            </div>

            {/* 3D Preview */}
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <div className="bg-white px-4 py-2 border-b border-gray-300 flex justify-between items-center">
                <h3 className="font-semibold text-md text-primary">
                  Preview 3D
                </h3>
              </div>
              <div
                ref={threeContainerRef}
                style={{ height: "400px", width: "100%" }}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="border border-gray-300 rounded-lg p-4">
              <h3 className="text-md text-center font-semibold mb-5 text-primary">
                Điều chỉnh thuộc tính
              </h3>

              <div className="mb-3 text-sm space-y-2">
                <div className="flex flex-row items-center justify-between gap-2">
                  <label className="text-sm font-medium">Chiều cao (m)</label>
                  <InputNumber
                    size="large"
                    value={drawHeight}
                    onChange={(v) => {
                      setDrawHeight(v || 1);
                    }}
                    min={0.1}
                    step={0.5}
                    disabled={Array.isArray(shapes) && shapes.length === 0}
                  />
                  <label className="text-md font-medium">Tỷ lệ</label>
                  <InputNumber
                    size="large"
                    value={drawScale}
                    onChange={(v) => setDrawScale(v || 1)}
                    min={0.01}
                    step={0.1}
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-5 mt-2">
              <div className="flex gap-2">
                <img src={leftClickIcon} alt="Left click" className="w-6 h-6" />
                <span className="font-medium text-sm">
                  Click chuột trái 2 lần để chọn điểm
                </span>
              </div>
              <div className="flex gap-2">
                <img
                  src={rightClickIcon}
                  alt="Right click"
                  className="w-6 h-6"
                />
                <span className="font-medium text-sm">
                  Click chuột phải để xóa điểm
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between mt-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-5 py-2 rounded-md transition"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span>Quay lại</span>
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 bg-primary hover:bg-primary-light hover:cursor-pointer text-white font-medium px-5 py-2 rounded-md transition"
          >
            <span>Hoàn thành</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step3;
