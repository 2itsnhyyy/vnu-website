import React from 'react';
import { MapPin, Smile, Clock } from 'lucide-react';

// Types
interface InfoItemProps {
    icon: React.ComponentType<{ size?: number }>;
    label: string;
    children: React.ReactNode;
}

interface MapSectionProps {
    lat?: number;
    lng?: number;
    title?: string;
}

interface AddressSectionProps {
    address: string;
}

// Component cho thông tin chi tiết
const InfoItem: React.FC<InfoItemProps> = ({ icon: Icon, label, children }) => (
    <div className="flex gap-3 mb-4">
        <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-gray-500">
            <Icon size={20} />
        </div>
        <div className="flex-1">
            <div className="text-sm text-gray-500 mb-1">{label}</div>
            <div className="text-base">{children}</div>
        </div>
    </div>
);

// Component cho card địa điểm
const LocationCard: React.FC = () => (
    <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-sm">
        <div className="text-sm text-gray-500 mb-3">Địa điểm</div>
        <h2 className="text-2xl font-semibold text-blue-700 mb-6">
            Tòa E Trường Đại học Công Nghệ thông tin
        </h2>

        <div className="space-y-2">
            <InfoItem icon={MapPin} label="Thuộc khu vực:">
                <p className="text-blue-600">
                    Trường Đại học Công nghệ Thông tin - ĐHQG TP.HCM
                </p>
            </InfoItem>

            <InfoItem icon={Smile} label="Tiêu đề">
                <p className="text-blue-600">Cúp điện</p>
            </InfoItem>

            <InfoItem icon={Clock} label="Trạng thái">
                <p className="text-blue-600">Đang xử lý</p>
            </InfoItem>
        </div>
    </div>
);

// Component cho Google Maps
const MapSection: React.FC<MapSectionProps> = ({
    lat = 10.8700,
    lng = 106.8030,
    title = "Vị trí trên bản đồ:"
}) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-xl font-semibold mb-4">{title}</h3>
        <div className="rounded-xl overflow-hidden shadow-lg">
            <iframe
                src={`https://maps.google.com/maps?q=${lat},${lng}&hl=vi&z=17&ie=UTF8&iwloc=&output=embed&markers=${lat},${lng}`}
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
        </div>
    </div>
);

// Component cho địa chỉ chi tiết
const AddressSection: React.FC<AddressSectionProps> = ({ address }) => (
    <div className="bg-gray-50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-3">Nội dung chi tiết:</h3>
        <p className="text-base leading-relaxed">{address}</p>
    </div>
);

// Component chính
const Details: React.FC = () => {
    return (
        <div className="min-h-screen bg-blue-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <h1 className="text-4xl font-bold text-blue-700 mb-8">Chi tiết thông báo</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Location Info */}
                    <div className="space-y-6">
                        <LocationCard />
                    </div>

                    {/* Right Column - Map */}
                    <div className="space-y-6">
                        <MapSection
                            lat={10.8700}
                            lng={106.8030}
                            title="Vị trí trên bản đồ:"
                        />

                        <AddressSection
                            address="Tòa nhà E, Trường Đại học Công nghệ Thông tin, Khu phố 6, Phường Linh Trung, Thành phố Thủ Đức, Thành phố Hồ Chí Minh hiện đang bị cúp điện do sự cố kỹ thuật. Dự kiến thời gian khắc phục là từ 14:00 đến 16:00 ngày 25/12/2025. Chúng tôi xin lỗi vì sự bất tiện này và sẽ cố gắng khắc phục sớm nhất có thể. Vui lòng liên hệ với bộ phận hỗ trợ nếu cần thêm thông tin."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Details;