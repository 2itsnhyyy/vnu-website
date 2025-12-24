import React, { useState, useEffect, useRef } from "react"
import { message, Switch } from "antd"
import type { BuildingFormData } from "../../../types/building"

interface Step3Props {
  initialData: Partial<BuildingFormData>
  onNext: (data: Partial<BuildingFormData>) => void
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
  const controlsRef = useRef<any>(null)
  const animationIdRef = useRef<number>(0)

  const [position, setPosition] = useState({
    lat: initialData.latitude || 10.8231,
    lng: initialData.longitude || 106.6297,
  })

  const [modelScale, setModelScale] = useState(initialData.modelScale || 1)
  const [modelRotation, setModelRotation] = useState(initialData.modelRotation || 0)
  const [show3D, setShow3D] = useState(true)
  const [modelLoading, setModelLoading] = useState(false)

  // Initialize Leaflet map
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return

    import("leaflet").then((L) => {
      if (!mapInstanceRef.current) {
        const map = L.map(mapRef.current).setView([position.lat, position.lng], 17)

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
              cursor: move;
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
          message.success("Đã cập nhật vị trí mới")
        })

        marker.on("dragstart", () => {
          message.info("Đang di chuyển marker...")
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

  // Update marker position when coordinates change
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLatLng([position.lat, position.lng])
    }
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([position.lat, position.lng], undefined, { animate: true })
    }
  }, [position.lat, position.lng])

  // Initialize Three.js scene for 3D preview
  useEffect(() => {
    if (!show3D || !threeContainerRef.current) return

    const initThreeJS = async () => {
      setModelLoading(true)
      
      try {
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
        controls.dampingFactor = 0.05
        controlsRef.current = controls

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
        scene.add(ambientLight)

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8)
        dirLight.position.set(10, 20, 10)
        dirLight.castShadow = true
        scene.add(dirLight)

        const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.4)
        dirLight2.position.set(-10, 10, -10)
        scene.add(dirLight2)

        // Grid helper
        const gridHelper = new THREE.GridHelper(20, 20, 0x888888, 0xcccccc)
        scene.add(gridHelper)

        // Axes helper
        const axesHelper = new THREE.AxesHelper(5)
        scene.add(axesHelper)

        sceneRef.current = scene
        rendererRef.current = renderer

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

              // Enable shadows
              model.traverse((child) => {
                if ((child as any).isMesh) {
                  child.castShadow = true
                  child.receiveShadow = true
                }
              })

              scene.add(model)
              modelRef.current = model

              // Adjust camera to fit model
              const size = box.getSize(new THREE.Vector3())
              const maxDim = Math.max(size.x, size.y, size.z)
              camera.position.set(maxDim * 1.5, maxDim * 1.5, maxDim * 1.5)
              camera.lookAt(0, 0, 0)
              
              setModelLoading(false)
              message.success("Tải mô hình 3D thành công")
            },
            (progress) => {
              const percent = (progress.loaded / progress.total) * 100
              console.log(`Loading model: ${percent.toFixed(0)}%`)
            },
            (error) => {
              console.error("Error loading model:", error)
              setModelLoading(false)
              message.error("Không thể tải mô hình 3D")
            }
          )
        } else {
          // Demo cube if no model
          const geometry = new THREE.BoxGeometry(2, 3, 2)
          const material = new THREE.MeshPhongMaterial({ color: 0x3b82f6 })
          const cube = new THREE.Mesh(geometry, material)
          cube.scale.set(modelScale, modelScale, modelScale)
          cube.rotation.y = (modelRotation * Math.PI) / 180
          cube.castShadow = true
          cube.receiveShadow = true
          scene.add(cube)
          modelRef.current = cube
          setModelLoading(false)
        }

        // Animation loop
        const animate = () => {
          animationIdRef.current = requestAnimationFrame(animate)
          controls.update()
          renderer.render(scene, camera)
        }
        animate()

      } catch (error) {
        console.error("Error initializing Three.js:", error)
        setModelLoading(false)
        message.error("Không thể khởi tạo trình xem 3D")
      }
    }

    initThreeJS()

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
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
    if (!position.lat || !position.lng) {
      message.warning("Vui lòng chọn vị trí trên bản đồ")
      return
    }

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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Điều chỉnh vị trí và hiển thị 3D</h2>
          <p className="text-gray-500">Kéo thả marker trên bản đồ để chọn vị trí chính xác cho mô hình 3D của tòa nhà</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2 space-y-4">
            {/* Map */}
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <div ref={mapRef} style={{ height: "500px", width: "100%" }} />
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>💡 Kéo marker màu xanh để thay đổi vị trí hiển thị mô hình 3D</span>
            </div>

            {/* 3D Preview */}
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <div className="bg-gray-100 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
                <h3 className="font-medium text-gray-900">Xem trước mô hình 3D</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Hiển thị:</span>
                  <Switch checked={show3D} onChange={setShow3D} />
                </div>
              </div>
              {show3D && (
                <div className="relative">
                  <div ref={threeContainerRef} style={{ height: "400px", width: "100%" }} />
                  {modelLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
                      <div className="text-white text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2"></div>
                        <p>Đang tải mô hình 3D...</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {!show3D && (
                <div className="h-[400px] flex items-center justify-center bg-gray-50 text-gray-500">
                  Bật công tắc để xem preview 3D
                </div>
              )}
            </div>
          </div>

          {/* Control Panel */}
          <div className="space-y-4">
            {/* Position Info */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Tọa độ
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Vĩ độ (Latitude)</label>
                  <input
                    type="number"
                    value={position.lat.toFixed(6)}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value)
                      if (!isNaN(val)) setPosition({ ...position, lat: val })
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    step="0.000001"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Kinh độ (Longitude)</label>
                  <input
                    type="number"
                    value={position.lng.toFixed(6)}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value)
                      if (!isNaN(val)) setPosition({ ...position, lng: val })
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    step="0.000001"
                  />
                </div>
              </div>
            </div>

            {/* Model Settings */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Cài đặt mô hình
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm text-gray-600">Kích thước (Scale)</label>
                    <span className="text-sm font-medium text-gray-900">{modelScale.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="5"
                    step="0.1"
                    value={modelScale}
                    onChange={(e) => setModelScale(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0.1x</span>
                    <span>5x</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm text-gray-600">Góc xoay (Rotation)</label>
                    <span className="text-sm font-medium text-gray-900">{modelRotation}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="15"
                    value={modelRotation}
                    onChange={(e) => setModelRotation(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0°</span>
                    <span>180°</span>
                    <span>360°</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">📋 Tóm tắt</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Tên:</strong> {initialData.name || 'N/A'}</p>
                <p><strong>Số tầng:</strong> {initialData.floors || 'N/A'}</p>
                <p><strong>Model:</strong> {initialData.modelFileName || 'N/A'}</p>
                <p><strong>Vị trí:</strong> ({position.lat.toFixed(4)}, {position.lng.toFixed(4)})</p>
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
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2 rounded-md transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Hoàn thành và Tạo tòa nhà</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Step3