import { MapPin, Navigation, Clock, Phone } from "lucide-react";

interface BuildingInfoPanelProps {
  building?: any;
  place?: any;
  onClose: () => void;
  onSetAsEnd?: (place: any) => void;
}

export default function BuildingInfoPanel({
  building,
  place,
  onClose,
  onSetAsEnd,
}: BuildingInfoPanelProps) {
  const data = building || place;
  console.log(place);
  if (!data) return null;

  const displayName = data.name || "";
  const displayDescription = data.description || "";
  const displayImage = data.image || data.imageUrl || "";
  const displayFloors = data.floors || 0;
  const displayPlaceName = data.placeName || "";
  const displayAddress = data.address || "";
  const displayOpenTime = data.openTime || "";
  const displayCloseTime = data.closeTime || "";
  const displayPhone = data.phone || "";

  const placeData =
    place ||
    (building?.placeId
      ? { placeId: building.placeId, name: building.name }
      : null);

  const hasActions = placeData && onSetAsEnd;

  return (
    <div className="absolute right-0 top-0 z-[150] h-screen w-[380px] flex flex-col overflow-hidden bg-white shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
      <div className="flex-1 overflow-y-auto">
        <div className="relative h-[180px] w-full bg-[#f0f0f0]">
          {displayImage ? (
            <img
              src={displayImage}
              alt={displayName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[#999]">
              Không có ảnh
            </div>
          )}
          {displayFloors > 0 && (
            <div className="absolute right-2 top-2.5 rounded-[20px] bg-[#1a73e8]/90 px-3 py-1 text-xs font-bold text-white">
              {displayFloors} Tầng
            </div>
          )}
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-2">
              <h2 className="m-0 text-[22px] font-bold text-[#1a73e8]">
                {displayName}
              </h2>
              {displayPlaceName && (
                <p className="mt-1 flex items-center gap-1 text-[13px] text-[#70757a]">
                  <MapPin size={13} />
                  {displayPlaceName}
                </p>
              )}
            </div>

            {hasActions && (
              <div className="flex shrink-0 gap-2 pt-1">
                {onSetAsEnd && (
                  <button
                    onClick={() => {
                      onSetAsEnd(placeData);
                      onClose();
                    }}
                    title="Đường đi"
                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-blue-600 text-blue-600 transition-colors hover:bg-blue-700 hover:text-white"
                  >
                    <Navigation size={18} />
                  </button>
                )}
              </div>
            )}
          </div>
          {displayDescription && (
            <div className="my-[15px] border-t border-[#eee] pt-[15px]">
              <h4 className="mb-2 m-0 text-sm font-semibold text-[#202124]">
                Giới thiệu
              </h4>
              <p className="m-0 text-sm leading-[1.6] text-[#3c4043]">
                {displayDescription}
              </p>
            </div>
          )}

          {displayAddress && (
            <div className="my-[15px] border-t border-[#eee] pt-[15px]">
              <h4 className="mb-2 m-0 text-sm font-semibold text-[#202124]">
                Địa chỉ
              </h4>
              <p className="m-0 flex items-start gap-2 text-sm leading-[1.6] text-[#3c4043]">
                <MapPin size={16} className="mt-0.5 shrink-0 text-[#70757a]" />
                <span>{displayAddress}</span>
              </p>
            </div>
          )}

          {(displayOpenTime || displayCloseTime) && (
            <div className="my-[15px] border-t border-[#eee] pt-[15px]">
              <h4 className="mb-2 m-0 text-sm font-semibold text-[#202124]">
                Giờ hoạt động
              </h4>
              <p className="m-0 flex items-center gap-2 text-sm leading-[1.6] text-[#3c4043]">
                <Clock size={16} className="shrink-0 text-[#70757a]" />
                <span>
                  {displayOpenTime && displayCloseTime
                    ? `${displayOpenTime} - ${displayCloseTime}`
                    : displayOpenTime || displayCloseTime}
                </span>
              </p>
            </div>
          )}

          {displayPhone && (
            <div className="my-[15px] border-t border-[#eee] pt-[15px]">
              <h4 className="mb-2 m-0 text-sm font-semibold text-[#202124]">
                Liên hệ
              </h4>
              <p className="m-0 flex items-center gap-2 text-sm leading-[1.6] text-[#3c4043]">
                <Phone size={16} className="shrink-0 text-[#70757a]" />
                <a
                  href={`tel:${displayPhone}`}
                  className="text-[#1a73e8] hover:underline"
                >
                  {displayPhone}
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
