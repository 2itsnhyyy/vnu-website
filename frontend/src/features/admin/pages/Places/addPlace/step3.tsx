import type React from "react";
import { Button } from "antd";
import type { PlaceCreateRequest } from "../../../types/place";
import { MapContainer, TileLayer, Polygon, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Step3Props {
  data: Partial<PlaceCreateRequest>;
  onSubmit: (data: PlaceCreateRequest) => void;
  onBack: () => void;
  loading?: boolean;
}

const Step3: React.FC<Step3Props> = ({ data, onSubmit, onBack, loading = false }) => {
  const coordinates = data.boundaryGeom?.coordinates?.[0] || [];
  const coordinateCount = coordinates.length;
  const latLngPoints = coordinates.map(
    (coord: number[]) => [coord[1], coord[0]] as [number, number]
  );

  const mapCenter: [number, number] =
    latLngPoints.length > 0
      ? [
          latLngPoints.reduce(
            (sum: number, point: [number, number]) => sum + point[0],
            0
          ) / latLngPoints.length,
          latLngPoints.reduce(
            (sum: number, point: [number, number]) => sum + point[1],
            0
          ) / latLngPoints.length,
        ]
      : [10.762622, 106.660172];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <div className="grid grid-cols-2 gap-8">
        {/* Left Column - Place Details */}
        <div>
          {/* Image */}
          {data.image && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-3">Hình ảnh địa điểm</h3>
              <img
                src={data.image}
                alt={data.name}
                className="w-32 h-32 rounded-lg object-cover"
              />
            </div>
          )}

          {/* Place Name */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-2">Tên địa điểm</h3>
            <div className="border border-gray-300 p-2">
              <p className="text-gray-900">{data.name}</p>
            </div>
          </div>

          {/* Address */}
          {data.address && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-2">Địa chỉ</h3>
              <div className="border border-gray-300 p-2">
                <p className="text-gray-700">{data.address}</p>
              </div>
            </div>
          )}

          {/* Opening Hours */}
          {(data.openTime || data.closeTime) && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-2">Giờ hoạt động</h3>
              <div className="border border-gray-300 p-2">
                <p className="text-gray-700">
                  {data.openTime} - {data.closeTime}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Map Preview with Polygon */}
        <div>
          {/* Coordinates Summary */}
          {coordinateCount > 0 && (
            <div className="flex flex-row gap-1">
              <p className="text-sm font-semibold mb-2">Vị trí ranh giới:</p>
              <p className="text-gray-700 text-sm">
                Đã chọn {coordinateCount} điểm tọa độ
              </p>
            </div>
          )}
          {latLngPoints.length > 0 ? (
            <div className="w-full h-full min-h-80 bg-gray-200 rounded-lg border border-gray-300 overflow-hidden">
              <MapContainer
                center={mapCenter}
                zoom={15}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {latLngPoints.length >= 3 && (
                  <Polygon
                    positions={latLngPoints}
                    pathOptions={{
                      color: "blue",
                      fillColor: "blue",
                      fillOpacity: 0.3,
                      weight: 2,
                    }}
                  />
                )}
                {latLngPoints.map((point: [number, number], index: number) => (
                  <Marker key={index} position={point} />
                ))}
              </MapContainer>
            </div>
          ) : (
            <div className="w-full h-[500px] bg-gray-200 rounded-lg border border-gray-300 flex items-center justify-center">
              <span className="text-gray-500">Chưa có dữ liệu tọa độ</span>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="col-span-2 mt-5">
        {data.description && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-2">Mô tả</h3>
            <div className="border border-gray-300 p-2 min-h-10 max-h-100 overflow-y-auto">
              <p className="text-gray-700 text-md leading-relaxed whitespace-pre-wrap">
                {data.description}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mt-15">
        <Button size="large" onClick={onBack} disabled={loading}>
          Quay lại
        </Button>
        {/* Submit Button */}
        <button
          onClick={() => onSubmit(data as PlaceCreateRequest)}
          disabled={loading}
          className="flex items-center gap-2 bg-primary hover:bg-primary-light hover:cursor-pointer text-white font-medium px-5 py-2 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{loading ? "Đang xử lý..." : "Hoàn tất"}</span>
        </button>
      </div>
    </div>
  );
};

export default Step3;