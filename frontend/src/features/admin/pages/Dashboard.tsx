import React from "react";
import { Bell, ChevronRight } from "lucide-react";
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { DatePicker } from 'antd';
import { LocationCard } from "../components/DashboardPage/LocationCard";

const { RangePicker } = DatePicker;

interface LocationCardProps {
  image: string;
  name: string;
  address: string;
  deadline: string;
}

const Dashboard: React.FC = () => {
  const [dateRange, setDateRange] = React.useState<[Dayjs, Dayjs]>([
    dayjs('2024-07-19'),
    dayjs('2024-07-25')
  ]);

  const handleDateChange = (dates: null | [Dayjs | null, Dayjs | null]) => {
    if (dates && dates[0] && dates[1]) {
      setDateRange([dates[0], dates[1]]);
    }
  };

  const locations: LocationCardProps[] = [
    {
      image:
        "https://images.unsplash.com/photo-1562774053-701939374585?w=400&h=300&fit=crop",
      name: "UIT - ĐHQG TP.HCM",
      address: "Khu phố 6 P, Thủ Đức",
      deadline: "9-10-2025",
    },
    {
      image:
        "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=300&fit=crop",
      name: "KTX Khu B",
      address: "Đông Hòa, Dĩ An, Bình Dương",
      deadline: "09/10/2025",
    },
    {
      image:
        "https://images.unsplash.com/photo-1519452575417-564c1401ecc0?w=400&h=300&fit=crop",
      name: "USSH - ĐHQG TP.HCM",
      address: "Công viên phần mềm Quang Trung",
      deadline: "09/10/2025",
    },
    {
      image:
        "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&h=300&fit=crop",
      name: "UT- ĐHQG TP.HCM",
      address: "268 Lý Thường Kiệt, P.14, Q.10",
      deadline: "09/10/2025",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
              alt="Avatar"
              className="w-12 h-12 rounded-full"
            />
            <div>
              <p className="text-sm text-gray-600">
                Đại học Quốc Gia Thành phố Hồ Chí Minh
              </p>
              <div className="flex items-center gap-2">
                <h1 className="font-semibold text-gray-800">Quản trị viên</h1>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Bell className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-6 flex flex-col-2 justify-between">
            <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Xin chào Quản trị viên !</h2>
          <p className="text-sm text-gray-600 mb-3">Đây là bảng của trường đề điều hành và thư của Đại học Quốc gia Thành phố Hồ Chí Minh trong tuần vừa qua</p>
          </div>
          <div className="flex items-center gap-2">
            <RangePicker 
              value={dateRange}
              onChange={handleDateChange}
              format="DD/MM/YYYY"
              className="shadow-sm"
              size="large"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-linear-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white cursor-pointer hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-bold mb-1">76</div>
                <div className="text-white text-lg">Tòa nhà</div>
              </div>
              <ChevronRight className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-linear-to-br from-teal-400 to-teal-500 rounded-xl p-6 text-white cursor-pointer hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-bold mb-1">3</div>
                <div className="text-white text-lg">Tòa nhà đang xây dựng</div>
              </div>
              <ChevronRight className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-linear-to-br from-cyan-400 to-cyan-500 rounded-xl p-6 text-white cursor-pointer hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-bold mb-1">24</div>
                <div className="text-white text-lg">Tòa nhà đang tu sửa</div>
              </div>
              <ChevronRight className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Map and Stats Section */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* Map */}
          <div className="lg:col-span-2 bg-white pt-4 shadow-sm">
            <h3 className="font-semibold text-xl text-center text-primary mb-1">
              Bản đồ Đại Học Quốc Gia
            </h3>
            <p className="text-sm text-center text-gray-500 mb-4">
              Thành phố Hồ Chí Minh
            </p>
            <div className="bg-gray-200 overflow-hidden">
              <iframe
                width="100%"
                height="380"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3760.0096551626675!2d106.79996419067535!3d10.875071555090019!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3174d8a6b19d6763%3A0x143c54525028b2e!2zTmjDoCBWxINuIGjDs2EgU2luaCB2acOqbiBUUC5IQ00!5e1!3m2!1svi!2s!4v1765193485201!5m2!1svi!2s"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-6">
            <div className="bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-primary mb-2">
                Bài đăng
              </h3>
              <div className="text-4xl font-bold text-gray-800 mb-1">12</div>
              <p className="text-sm text-gray-500">bài đăng mới</p>
            </div>

            <div className="bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-primary mb-2">
                Người dùng
              </h3>
              <div className="text-4xl font-bold text-gray-800 mb-1">67</div>
              <p className="text-lg text-gray-500">người dùng mới</p>
            </div>

            <div className="bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-primary mb-2">
                Tin tức
              </h3>
              <div className="text-4xl font-bold text-gray-800 mb-1">67</div>
              <p className="text-sm text-gray-500">tin tức mới</p>
            </div>
          </div>
        </div>

        {/* Location Cards */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-800">
              Các địa điểm mới được cập nhật
            </h3>
            <button className="flex items-center gap-1 text-sm text-primary hover:cursor-pointer hover:text-primary-light">
              Xem tất cả
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {locations.map((location, index) => (
              <LocationCard key={index} {...location} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
