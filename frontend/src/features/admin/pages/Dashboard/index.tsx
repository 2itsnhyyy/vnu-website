import React from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ChevronRight } from "lucide-react";
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { DatePicker } from 'antd';
import { LocationCard } from "../../components/DashboardPage/LocationCard";
import { dashboardService } from "../../services/DashboardService";
import { placeService } from "../../services/PlaceService";

const { RangePicker } = DatePicker;

interface LocationCardProps {
  image: string;
  name: string;
  address: string;
  deadline: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // Get Monday of current week and today
  const getDefaultDateRange = (): [Dayjs, Dayjs] => {
    const today = dayjs();
    const monday = today.startOf('week').add(1, 'day'); 
    return [monday, today];
  };

  const [dateRange, setDateRange] = React.useState<[Dayjs, Dayjs]>(getDefaultDateRange());

  const [overviewData, setOverviewData] = React.useState({
    totalPlaces: 0,
    totalBuildings: 0,
    totalUsers: 0,
  });

  const [newItemsData, setNewItemsData] = React.useState({
    newPosts: 0,
    newUsers: 0,
    newNews: 0,
  });

  const [locations, setLocations] = React.useState<LocationCardProps[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Fetch overview data
  React.useEffect(() => {
    const fetchOverview = async () => {
      try {
        const response = await dashboardService.getOverView();
        setOverviewData({
          totalPlaces: response.data.totalPlaces,
          totalBuildings: response.data.totalBuildings,
          totalUsers: response.data.totalUsers,
        });
      } catch (error) {
        console.error("Error fetching overview:", error);
      }
    };
    fetchOverview();
  }, []);

  // Fetch new items data based on date range
  React.useEffect(() => {
    const fetchNewItems = async () => {
      try {
        const response = await dashboardService.getNewItems({
          startDate: dateRange[0].format('YYYY-MM-DD'),
          endDate: dateRange[1].format('YYYY-MM-DD'),
        });
        setNewItemsData({
          newPosts: response.data.newPosts,
          newUsers: response.data.newIncidents,
          newNews: response.data.newNews,
        });
      } catch (error) {
        console.error("Error fetching new items:", error);
      }
    };
    fetchNewItems();
  }, [dateRange]);

  // Fetch places
  React.useEffect(() => {
    const fetchPlaces = async () => {
      try {
        setLoading(true);
        const response = await placeService.getAll(1, 4);
        const mappedLocations = response.data.map((place: any) => ({
          image: place.image || "https://images.unsplash.com/photo-1562774053-701939374585?w=400&h=300&fit=crop",
          name: place.name,
          address: place.address,
          deadline: place.deadline || dayjs().format('DD/MM/YYYY'),
        }));
        setLocations(mappedLocations);
      } catch (error) {
        console.error("Error fetching places:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaces();
  }, []);

  const handleDateChange = (dates: null | [Dayjs | null, Dayjs | null]) => {
    if (dates && dates[0] && dates[1]) {
      setDateRange([dates[0], dates[1]]);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto">
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
          <div onClick={() => navigate("places")} className="bg-linear-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white cursor-pointer hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-bold mb-1">{overviewData.totalPlaces}</div>
                <div className="text-white text-lg">Tổng số địa điểm</div>
              </div>
              <ChevronRight className="w-6 h-6" />
            </div>
          </div>

          <div  onClick={() => navigate("buildings")} className="bg-linear-to-br from-teal-400 to-teal-500 rounded-xl p-6 text-white cursor-pointer hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-bold mb-1">{overviewData.totalBuildings}</div>
                <div className="text-white text-lg">Tổng số tòa nhà</div>
              </div>
              <ChevronRight className="w-6 h-6" />
            </div>
          </div>

          <div  onClick={() => navigate("users")} className="bg-linear-to-br from-cyan-400 to-cyan-500 rounded-xl p-6 text-white cursor-pointer hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-bold mb-1">{overviewData.totalUsers}</div>
                <div className="text-white text-lg">Tổng số người dùng</div>
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
          <div className="flex flex-col justify-between">
            <div className="bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-primary mb-2">
                Bài đăng
              </h3>
               <div className="flex flex-row gap-2 items-end">
                <p className="text-5xl font-bold text-gray-800">{newItemsData.newPosts}</p>
                <p className="text-md text-gray-500">bài đăng mới</p>
              </div>
            </div>

            <div className="bg-white p-6 shadow-sm">
              <h3 className="text-md font-semibold text-primary mb-2">
                Người dùng
              </h3>
               <div className="flex flex-row gap-2 items-end">
                <p className="text-5xl font-bold text-gray-800">{newItemsData.newUsers}</p>
                <p className="text-md text-gray-500">người dùng mới</p>
              </div>
            </div>

            <div className="bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-primary mb-2">
                Tin tức
              </h3>
              <div className="flex flex-row gap-2 items-end">
                <p className="text-5xl font-bold text-gray-800">{newItemsData.newNews}</p>
                <p className="text-md text-gray-500">tin tức mới</p>
              </div>
            </div>
          </div>
        </div>

        {/* Location Cards */}
        <div className="bg-white rounded-xl p-6 shadow-sm ">
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
