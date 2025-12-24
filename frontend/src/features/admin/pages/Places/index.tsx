import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../components/Common/PageMeta";
import { Table, Button, Input, Select, Space, Tooltip } from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { Plus } from "lucide-react";
import type { ColumnsType } from "antd/es/table";
import type { Place } from "../../types/place";
import { mockPlace } from "../../types/place";
import { placeService } from "../../services/PlaceService";

const PAGE_SIZE = 10;

const Places: React.FC = () => {
  const [filter, setFilter] = useState<string>("all");

  const [place, setPlace] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setModalOpen] = useState(false);
  const [placeToDelete, setPlaceToDelete] = useState<number | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    placeService
      .getAll(currentPage, PAGE_SIZE)
      .then((res) => {
        console.log("API DATA:", res);
        setPlace(res.data);
      })
      .catch((err) => {
        console.error("API ERROR:", err);
      })
      .finally(() => setLoading(false));
  }, [currentPage]);

  function handleSearch() {
    setLoading(true);

    placeService
      .getAll(1, PAGE_SIZE)
      .then((res) => {
        const filtered = res.data.filter((n) =>
          n.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setPlace(filtered);
        setCurrentPage(1);
      })
      .finally(() => setLoading(false));
  }

  function handleView(place_id: number) {
    navigate(`/admin/places/${place_id}`);
  }

  function handleEdit(place_id: number) {
    navigate(`/admin/places/edit/${place_id}`);
  }

  function handleAdd() {
    navigate("/admin/places/add");
  }

  function handleDelete(place_id: number) {
    setPlaceToDelete(place_id);
    setModalOpen(true);
  }

  function handleConfirmDelete() {
    if (!placeToDelete) return;
    setPlace((prev) => prev.filter((n) => n.place_id !== placeToDelete));
    setModalOpen(false);
  }

  const totalItems = place.length;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);

  const paginatedData = place.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const columns: ColumnsType<Place> = [
    {
      title: "ID",
      dataIndex: "placeId",
      key: "place_id",
      width: 60,
      align: "center",
    },
    {
      title: "Tên địa điểm",
      dataIndex: "name",
      key: "name",
      width: 250,
      ellipsis: {
        showTitle: false,
      },
      render: (text: string, record: Place) => (
        <div className="flex items-center gap-3">
          <img
            src={record.image}
            alt={text}
            className="w-12 h-12 rounded object-cover"
          />
          <div>
            <Tooltip placement="topLeft" title={text}>
              {text}
            </Tooltip>
          </div>
        </div>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      align: "center",
      width: 110,
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      align: "center",
      ellipsis: {
        showTitle: false,
      },
      render: (address) => (
        <Tooltip placement="topLeft" title={address}>
          {address}
        </Tooltip>
      ),
    },
    {
      title: "Giờ mở cửa",
      dataIndex: "openTime",
      key: "open_time",
      align: "center",
      width: 110,
    },
    {
      title: "Giờ đóng cửa",
      dataIndex: "closeTime",
      key: "close_time",
      align: "center",
      width: 120,
    },
    {
      title: "Thao tác",
      key: "action",
      width: 200,
      render: (record: Place) => (
        <Space size="middle">
          <Button
            onClick={() => handleView(record.place_id)}
            type="text"
            icon={<EyeOutlined />}
          />
          <Button
            onClick={() => handleEdit(record.place_id)}
            type="text"
            icon={<EditOutlined />}
          />
          <Button
            onClick={() => handleDelete(record.place_id)}
            type="text"
            danger
            icon={<DeleteOutlined />}
          />
        </Space>
      ),
      align: "center",
    },
  ];

  return (
    <div className="min-h-screen">
      <PageMeta
        title="Locations | Admin Dashboard"
        description="This is Locations Dashboard"
      />
      <div className="max-w-7xl mx-auto">
        {/* Table Card */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold">Danh sách địa điểm</h2>
              <span className="text-sm bg-[#D1F2FF] text-[#2F73F2] py-1 px-4 rounded-full font-medium">
                {totalItems} địa điểm
              </span>
            </div>
            <div className="flex flex-row items-center gap-3">
              {/* Search and Filters */}

              <Input
                placeholder="Tìm địa điểm..."
                prefix={<SearchOutlined />}
                value={searchTerm}
                size="large"
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
                style={{ width: 300 }}
              />
              <Select
                defaultValue="all"
                style={{ width: 150 }}
                size="large"
                onChange={setFilter}
                options={[
                  { value: "all", label: "Sắp xếp theo" },
                  { value: "new-to-old", label: "Ngày tạo gần nhất" },
                  { value: "old-to-new", label: "Ngày tạo xa nhất" },
                ]}
              />

              <button
                onClick={handleAdd}
                className="flex items-center gap-2 bg-primary hover:bg-primary-light hover:cursor-pointer text-white font-medium px-5 py-2 rounded-md transition"
              >
                <Plus size={18} />
                <span>Tạo điạ điểm</span>
              </button>
            </div>
          </div>
          

          <Table
            columns={columns}
            dataSource={paginatedData}
            pagination={{
              current: currentPage,
              pageSize: PAGE_SIZE,
              total: totalPages,
              showSizeChanger: false,
              placement: ["bottomCenter"],
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Places;
