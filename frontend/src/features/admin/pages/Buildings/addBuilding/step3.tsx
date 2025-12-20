import React, { useState, useEffect, useRef } from "react"
import * as THREE from "three"



interface Step3Props {
  initialData: {
    latitude?: number
    longitude?: number
    modelScale?: number
    modelRotation?: number
    modelFileName?: string
    modelFile?: File
  }
  onNext: (data: any) => void
  onBack: () => void
}

const Step3: React.FC<Step3Props> = ({ initialData, onNext, onBack }) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const threeContainerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<any>(null)
  const rendererRef = useRef<any>(null)
  const modelRef = useRef<any>(null)

  const [position, setPosition] = useState({
    lat: initialData.latitude || 10.8231,
    lng: initialData.longitude || 106.6297,
  })

  const [modelScale, setModelScale] = useState(initialData.modelScale || 1)
  const [modelRotation, setModelRotation] = useState(initialData.modelRotation || 0)
  const [show3D, setShow3D] = useState(false)

  // Initialize Leaflet map
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return

    import("leaflet").then((L) => {
      if (!mapInstanceRef.current) {
        const map = L.map(mapRef.current).setView([position.lat, position.lng], 16)

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map)

        const customIcon = L.divIcon({
          className: "custom-map-marker",
          html: `
            <div style="
              width: 40px;
              height: 40px;
              background: #3b82f6;
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 40],
        })

        const marker = L.marker([position.lat, position.lng], {
          draggable: true,
          icon: customIcon,
        }).addTo(map)

        marker.on("dragend", (e: any) => {
          const newPos = e.target.getLatLng()
          setPosition({ lat: newPos.lat, lng: newPos.lng })
        })

        mapInstanceRef.current = map
        markerRef.current = marker
      }
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Update marker position
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLatLng([position.lat, position.lng])
    }
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([position.lat, position.lng])
    }
  }, [position.lat, position.lng])

  // Initialize Three.js scene for 3D preview
  useEffect(() => {
    if (!show3D || !threeContainerRef.current) return

    const initThreeJS = async () => {
      const THREE = await import("three")
      const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js")
      const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js")

      // Scene setup
      const scene = new THREE.Scene()
      scene.background = new THREE.Color(0xf0f0f0)
      
      // Camera
      const camera = new THREE.PerspectiveCamera(
        50,
        threeContainerRef.current!.clientWidth / threeContainerRef.current!.clientHeight,
        0.1,
        1000
      )
      camera.position.set(5, 5, 5)

      // Renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true })
      renderer.setSize(threeContainerRef.current!.clientWidth, threeContainerRef.current!.clientHeight)
      renderer.shadowMap.enabled = true
      threeContainerRef.current!.appendChild(renderer.domElement)

      // Controls
      const controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true

      // Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
      scene.add(ambientLight)

      const dirLight = new THREE.DirectionalLight(0xffffff, 0.8)
      dirLight.position.set(10, 20, 10)
      dirLight.castShadow = true
      scene.add(dirLight)

      // Grid helper
      const gridHelper = new THREE.GridHelper(20, 20, 0x888888, 0xcccccc)
      scene.add(gridHelper)

      // Load model if available
      if (initialData.modelFile) {
        const loader = new GLTFLoader()
        const url = URL.createObjectURL(initialData.modelFile)
        
        loader.load(
          url,
          (gltf) => {
            const model = gltf.scene
            
            // Apply scale and rotation
            model.scale.set(modelScale, modelScale, modelScale)
            model.rotation.y = (modelRotation * Math.PI) / 180

            // Center model
            const box = new THREE.Box3().setFromObject(model)
            const center = box.getCenter(new THREE.Vector3())
            model.position.sub(center)

            scene.add(model)
            modelRef.current = model

            // Adjust camera to fit model
            const size = box.getSize(new THREE.Vector3())
            const maxDim = Math.max(size.x, size.y, size.z)
            camera.position.set(maxDim * 1.5, maxDim * 1.5, maxDim * 1.5)
            camera.lookAt(0, 0, 0)
          },
          undefined,
          (error) => {
            console.error("Error loading model:", error)
          }
        )
      } else {
        // Demo building if no model
        const geometry = new THREE.BoxGeometry(2, 3, 2)
        const material = new THREE.MeshPhongMaterial({ color: 0x3b82f6 })
        const cube = new THREE.Mesh(geometry, material)
        cube.scale.set(modelScale, modelScale, modelScale)
        cube.rotation.y = (modelRotation * Math.PI) / 180
        scene.add(cube)
        modelRef.current = cube
      }

      sceneRef.current = scene
      rendererRef.current = renderer

      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate)
        controls.update()
        renderer.render(scene, camera)
      }
      animate()
    }

    initThreeJS()

    return () => {
      if (rendererRef.current && threeContainerRef.current) {
        threeContainerRef.current.removeChild(rendererRef.current.domElement)
        rendererRef.current.dispose()
      }
    }
  }, [show3D])

  // Update model scale and rotation
  useEffect(() => {
    if (modelRef.current && show3D) {
      modelRef.current.scale.set(modelScale, modelScale, modelScale)
      modelRef.current.rotation.y = (modelRotation * Math.PI) / 180
    }
  }, [modelScale, modelRotation, show3D])

  const handleSubmit = () => {
    onNext({
      ...initialData,
      latitude: position.lat,
      longitude: position.lng,
      modelScale,
      modelRotation,
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Điều chỉnh vị trí mô hình 3D</h2>
          <p className="text-gray-500">Kéo thả marker trên bản đồ để chọn vị trí hiển thị mô hình 3D của tòa nhà</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <div ref={mapRef} style={{ height: "500px", width: "100%" }} />
            </div>
            <p className="text-sm text-gray-500 mt-2">💡 Kéo marker để thay đổi vị trí hiển thị mô hình 3D</p>
          </div>

          {/* Control Panel */}
          <div className="space-y-6">
            {/* Position Info */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Tọa độ</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Vĩ độ (Latitude)</label>
                  <input
                    type="number"
                    value={position.lat.toFixed(6)}
                    onChange={(e) => setPosition({ ...position, lat: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    step="0.000001"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Kinh độ (Longitude)</label>
                  <input
                    type="number"
                    value={position.lng.toFixed(6)}
                    onChange={(e) => setPosition({ ...position, lng: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    step="0.000001"
                  />
                </div>
              </div>
            </div>

            {/* Model Settings */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Cài đặt mô hình</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Kích thước (Scale)</label>
                  <input
                    type="number"
                    min="0.1"
                    max="10"
                    step="0.1"
                    value={modelScale}
                    onChange={(e) => setModelScale(parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Góc xoay (°)</label>
                  <input
                    type="number"
                    min="0"
                    max="360"
                    step="15"
                    value={modelRotation}
                    onChange={(e) => setModelRotation(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-5 py-2 rounded-md transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
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
  )
}

export default Step3