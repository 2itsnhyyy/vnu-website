import type React from "react";
import { useState, useEffect } from "react";
import { Button, Input, InputNumber, Modal, message } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import leftClickIcon from "../../../../../assets/icons/left-click.png";
import rightClickIcon from "../../../../../assets/icons/right-click.png";
import type { PlaceCreateRequest } from "../../../types/place";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Step2Props {
  data: Partial<PlaceCreateRequest>;
  onNext: (data: Partial<PlaceCreateRequest>) => void;
  onBack: () => void;
}

function MapClickHandler({
  onDoubleClick,
  onRightClick,
}: {
  onDoubleClick: (lat: number, lng: number) => void;
  onRightClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    dblclick: (e) => {
      onDoubleClick(e.latlng.lat, e.latlng.lng);
    },
    contextmenu: (e) => {
      onRightClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

const Step2: React.FC<Step2Props> = ({ data, onNext, onBack }) => {
  const [coordinates, setCoordinates] = useState<string>("");
  const [selectedPoints, setSelectedPoints] = useState<number[][]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [manualLng, setManualLng] = useState<number | null>(null);
  const [manualLat, setManualLat] = useState<number | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    import("leaflet/dist/leaflet.css");
  }, []);

  const handleCoordinateInput = (value: string) => {
    setCoordinates(value);
    const lines = value.split("\n").filter((line) => line.trim());
    const points: number[][] = [];

    lines.forEach((line) => {
      const parts = line.split(",").map((p) => Number.parseFloat(p.trim()));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        points.push([parts[0], parts[1]]);
      }
    });

    setSelectedPoints(points);
  };

  const handleMapDoubleClick = (lat: number, lng: number) => {
    const newPoints = [...selectedPoints, [lng, lat]];
    setSelectedPoints(newPoints);
    setCoordinates(
      newPoints
        .map((coord) => coord[0].toFixed(6) + "," + coord[1].toFixed(6))
        .join("\n")
    );
  };

  const handleMapRightClick = (lat: number, lng: number) => {
    if (selectedPoints.length === 0) return;

    // Find nearest point
    let nearestIndex = 0;
    let minDistance = Number.POSITIVE_INFINITY;

    selectedPoints.forEach((point, index) => {
      const distance = Math.sqrt((lng - point[0]) ** 2 + (lat - point[1]) ** 2);
      if (distance < minDistance) {
        minDistance = distance;
        nearestIndex = index;
      }
    });

    // Remove if click is close enough (within ~0.001 degrees, approximately 100m)
    if (minDistance < 0.001) {
      const newPoints = selectedPoints.filter(
        (_, index) => index !== nearestIndex
      );
      setSelectedPoints(newPoints);
      setCoordinates(
        newPoints
          .map((coord) => coord[0].toFixed(6) + "," + coord[1].toFixed(6))
          .join("\n")
      );
    }
  };

  const handleManualInput = () => {
    setIsModalVisible(true);
  };

  const handleModalOk = () => {
    if (manualLng !== null && manualLat !== null) {
      const newPoints = [...selectedPoints, [manualLng, manualLat]];
      setSelectedPoints(newPoints);
      setCoordinates(
        newPoints
          .map((coord) => coord[0].toFixed(6) + "," + coord[1].toFixed(6))
          .join("\n")
      );
      setIsModalVisible(false);
      setManualLng(null);
      setManualLat(null);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setManualLng(null);
    setManualLat(null);
  };

  const handleRemovePoint = () => {
    if (selectedPoints.length > 0) {
      const newPoints = selectedPoints.slice(0, -1);
      setSelectedPoints(newPoints);
      setCoordinates(
        newPoints
          .map((coord) => coord[0].toFixed(6) + "," + coord[1].toFixed(6))
          .join("\n")
      );
    }
  };

  const handleNext = () => {
    if (selectedPoints.length < 3) {
      message.error("Vui lòng chọn tối thiểu 3 điểm tọa độ");
      return;
    }

    onNext({
      boundaryGeom: {
        type: "Polygon",
        coordinates: [selectedPoints],
      },
    });
  };

  const latLngPoints = selectedPoints.map(
    (point) => [point[1], point[0]] as [number, number]
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <div className="grid grid-cols-2 gap-8">
        {/* Left Column - Coordinate Input */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Nhập danh sách tọa độ</h3>
          <p className="text-sm text-gray-600 mb-2">
            Chọn trên bản đồ hoặc điền tọa độ vào ô bên dưới
          </p>
          <p className="text-sm text-gray-600 mb-2">
            Mỗi tọa độ viết trên 1 dòng
          </p>
          <p className="text-sm text-gray-600 mb-2">
            Chọn tối thiểu 3 điểm tọa độ
          </p>

          <Input.TextArea
            value={coordinates}
            onChange={(e) => handleCoordinateInput(e.target.value)}
            placeholder="Ví dụ:&#10;106.8012345,10.8023456&#10;106.8023456,10.8034567&#10;106.8034567,10.8045678"
            rows={10}
            className="mb-4 font-mono text-sm"
          />

          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-600">
              Số điểm đã chọn: <strong>{selectedPoints.length}</strong>
            </span>
          </div>

          <div className="flex">
            <Button
              icon={<DeleteOutlined />}
              onClick={handleRemovePoint}
              disabled={selectedPoints.length === 0}
              className="flex-1"
            >
              Xóa điểm cuối
            </Button>
          </div>
        </div>

        {/* Right Column - Map */}
        <div>
          <div className="w-full h-full bg-gray-200 rounded-lg border border-gray-300 overflow-hidden">
            <MapContainer
              center={[10.874352, 106.802682]}
              zoom={16}
              style={{ height: "100%", width: "100%" }}
              doubleClickZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapClickHandler
                onDoubleClick={handleMapDoubleClick}
                onRightClick={handleMapRightClick}
              />
              {latLngPoints.map((point, index) => (
                <Marker key={index} position={point} />
              ))}
            </MapContainer>
          </div>
          <div className="flex flex-row gap-2 mt-2">
            <img src={leftClickIcon} alt="Left click" className="w-6 h-6" />
            <span className="font-medium text-sm">
              Click chuột trái 2 lần để chọn điểm
            </span>
            <img src={rightClickIcon} alt="Right click" className="w-6 h-6" />
            <span className="font-medium text-sm">
              Click chuột phải để xóa điểm
            </span>
          </div>
        </div>
      </div>

      <Modal
        title="Nhập tọa độ thủ công"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Thêm"
        cancelText="Hủy"
        okButtonProps={{ disabled: manualLng === null || manualLat === null }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Kinh độ (Longitude)
            </label>
            <InputNumber
              value={manualLng}
              onChange={(value) => setManualLng(value)}
              placeholder="Ví dụ: 106.801234"
              className="w-full"
              step={0.000001}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Vĩ độ (Latitude)
            </label>
            <InputNumber
              value={manualLat}
              onChange={(value) => setManualLat(value)}
              placeholder="Ví dụ: 10.802345"
              className="w-full"
              step={0.000001}
            />
          </div>
        </div>
      </Modal>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mt-15">
        <Button size="large" onClick={onBack}>
          Quay lại
        </Button>
        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={selectedPoints.length < 3}
          className="flex items-center gap-2 bg-primary hover:bg-primary-light hover:cursor-pointer text-white font-medium px-5 py-2 rounded-md transition"
        >
          <span>Bước tiếp theo</span>
        </button>
      </div>
    </div>
  );
};

export default Step2;