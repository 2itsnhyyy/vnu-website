import React, { useEffect, useState } from 'react';
import { MapPin, Smile, Clock, AlertCircle, Building2 } from 'lucide-react';
import { useParams } from 'react-router-dom';
import issuesService from '../../api/services/issuesService';
import { INCIDENT_STATUS } from '../../api/types/issues.types';
import type { Incident, Place } from '../../api/types/issues.types';

interface InfoItemProps {
    icon: React.ComponentType<{ size?: number }>;
    label: string;
    children: React.ReactNode;
}

interface MapSectionProps {
    address: string;
    title?: string;
}

interface AddressSectionProps {
    content: string;
}

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

interface LocationCardProps {
    incident: Incident | null;
    place: Place | null;
}

const LocationCard: React.FC<LocationCardProps> = ({ incident, place }) => {
    const getStatusText = (status: number) => {
        return status === INCIDENT_STATUS.PENDING ? "Đang xử lý" : "Đã xử lý";
    };

    const getStatusColor = (status: number) => {
        return status === INCIDENT_STATUS.PENDING ? "text-orange-600" : "text-green-600";
    };

    if (!incident) {
        return (
            <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-sm">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-20 mb-3"></div>
                    <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
                    <div className="space-y-4">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-sm">
            <div className="text-sm text-gray-500 mb-3">Thông tin sự cố</div>
            <h2 className="text-2xl font-semibold text-blue-700 mb-6">
                {incident.title}
            </h2>

            <div className="space-y-2">
                {place && (
                    <>
                        <InfoItem icon={MapPin} label="Vị trí:">
                            <p className="text-blue-600 font-medium">{place.name}</p>
                        </InfoItem>
                    </>
                )}

                <InfoItem icon={Smile} label="Loại sự cố:">
                    <p className="text-blue-600">{incident.title}</p>
                </InfoItem>

                <InfoItem icon={Clock} label="Trạng thái:">
                    <p className={getStatusColor(incident.status)}>
                        {getStatusText(incident.status)}
                    </p>
                </InfoItem>

                <InfoItem icon={AlertCircle} label="Thời gian báo cáo:">
                    <p className="text-gray-600">
                        {new Date(incident.createdAt).toLocaleString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </p>
                </InfoItem>

                {incident.updatedAt !== incident.createdAt && (
                    <InfoItem icon={Clock} label="Cập nhật lần cuối:">
                        <p className="text-gray-600">
                            {new Date(incident.updatedAt).toLocaleString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </InfoItem>
                )}
            </div>
        </div>
    );
};

const MapSection: React.FC<MapSectionProps> = ({ address, title = "Vị trí trên bản đồ:" }) => {
    // Encode địa chỉ để sử dụng trong Google Maps
    const encodedAddress = encodeURIComponent(address);

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-4">{title}</h3>
            <div className="rounded-xl overflow-hidden shadow-lg">
                <iframe
                    src={`https://maps.google.com/maps?q=${encodedAddress}&hl=vi&z=17&ie=UTF8&iwloc=&output=embed`}
                    width="100%"
                    height="450"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
            </div>
            <p className="text-sm text-gray-500 mt-3">
                📍 {address}
            </p>
        </div>
    );
};

const AddressSection: React.FC<AddressSectionProps> = ({ content }) => (
    <div className="bg-gray-50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-3">Nội dung chi tiết:</h3>
        <p className="text-base leading-relaxed whitespace-pre-line">{content}</p>
    </div>
);

const Details: React.FC = () => {
    const { incidentId } = useParams<{ incidentId: string }>();
    const [incident, setIncident] = useState<Incident | null>(null);
    const [place, setPlace] = useState<Place | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchIncidentDetail = async () => {
            if (!incidentId) {
                setError('ID sự cố không hợp lệ');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                // Fetch incident detail
                const incidentResponse = await issuesService.getIncidentById(Number(incidentId));
                setIncident(incidentResponse.incident);

                // Fetch place detail if placeId exists
                if (incidentResponse.incident.placeId) {
                    try {
                        const placeResponse = await issuesService.getPlaceById(incidentResponse.incident.placeId);
                        setPlace(placeResponse);
                    } catch (placeError) {
                        console.error('Error fetching place:', placeError);
                        // Continue without place data if it fails
                    }
                }
            } catch (err: any) {
                console.error('Error fetching incident detail:', err);
                setError(err.message || 'Không thể tải chi tiết sự cố');
            } finally {
                setLoading(false);
            }
        };

        fetchIncidentDetail();
    }, [incidentId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-blue-50 p-6">
                <div className="max-w-7xl mx-auto">
                        <button
                            onClick={() => window.history.back()}
                            className="mb-5 flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors w-fit"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                />
                            </svg>
                            Quay lại
                        </button>
                        <h1 className="text-4xl font-bold text-blue-700 mb-8">Chi tiết thông báo</h1>
                        <div className="flex justify-center items-center py-20">
                            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
                        </div>
                    </div>
                </div>
                );
    }

                if (error || !incident) {
        return (
                <div className="min-h-screen bg-blue-50 p-6">
                    <div className="max-w-7xl mx-auto">
                        <h1 className="text-4xl font-bold text-blue-700 mb-8">Chi tiết thông báo</h1>
                        <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
                            <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
                            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                                Không thể tải chi tiết sự cố
                            </h2>
                            <p className="text-gray-600">{error || 'Vui lòng thử lại sau'}</p>
                            <button
                                onClick={() => window.history.back()}
                                className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Quay lại
                            </button>
                        </div>
                    </div>
                </div>
                );
    }

                return (
                <div className="min-h-screen bg-blue-50 p-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-8">
                            <button
                                onClick={() => window.history.back()}
                                className="mb-5 flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors w-fit"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                    />
                                </svg>
                                Quay lại
                            </button>

                            <h1 className="text-4xl font-bold text-blue-700">
                                Chi tiết thông báo
                            </h1>
                        </div>


                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-6">
                                <LocationCard incident={incident} place={place} />
                            </div>

                            <div className="space-y-6">
                                {place && place.address ? (
                                    <MapSection address={place.address} title="Vị trí trên bản đồ:" />
                                ) : (
                                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                                        <h3 className="text-xl font-semibold mb-4">Vị trí trên bản đồ:</h3>
                                        <div className="bg-gray-100 rounded-xl p-8 text-center">
                                            <MapPin className="mx-auto mb-2 text-gray-400" size={48} />
                                            <p className="text-gray-500">Không có thông tin địa chỉ</p>
                                        </div>
                                    </div>
                                )}

                                <AddressSection content={incident.content} />
                            </div>
                        </div>
                    </div>
                </div>
                );
};

                export default Details;