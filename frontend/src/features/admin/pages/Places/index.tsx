import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../components/Common/PageMeta";
import { Table, Button, Input, Typography, Space, Tooltip } from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { Plus } from "lucide-react";
import type { ColumnsType } from "antd/es/table";
import type { Place } from "../../types/place";
import { placeService } from "../../services/PlaceService";
import DeleteConfirmModal from "../../components/Common/DeleteConfirmModal";

const PAGE_SIZE = 10;
const { Text } = Typography;

const Places: React.FC = () => {
  const [place, setPlace] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setModalOpen] = useState(false);
  const [placeToDelete, setPlaceToDelete] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  function handleEdit(placeId: number) {
    navigate(`/admin/places/edit/${placeId}`);
  }

  function handleAdd() {
    navigate("/admin/places/add");
  }

  function handleDelete(placeId: number) {
    setPlaceToDelete(placeId);
    setModalOpen(true);
  }

  async function handleConfirmDelete() {
    if (!placeToDelete) return;

    setDeleteLoading(true);
    try {
      await placeService.delete(placeToDelete);
      setPlace((prev) => prev.filter((n) => n.placeId !== placeToDelete));
      setModalOpen(false);
      setPlaceToDelete(null);
    } finally {
      setDeleteLoading(false);
    }
  }

  function handleCancelDelete() {
    setModalOpen(false);
    setPlaceToDelete(null);
  }

  const totalItems = place.length;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);

  const paginatedData = place.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Helper function to display "./" for empty fields
  const displayValue = (value: any) => {
    if (value === null || value === undefined || value === "") {
      return "./";
    }
    return value;
  };

  const columns: ColumnsType<Place> = [
    {
      title: "ID",
      dataIndex: "placeId",
      key: "place_id",
      width: 60,
      align: "center",
      render: (value) => displayValue(value),
    },
    {
      title: "Tên địa điểm",
      dataIndex: "name",
      key: "name",
      width: 350,
      render: (text: string, record: Place) => {
        const displayText = displayValue(text);

        if (displayText === "./") {
          return <span className="text-gray-400">./</span>;
        }

        return (
          <div className="flex items-center gap-3">
            {record.image ? (
              <img
                src={record.image}
                alt={text}
                className="w-12 h-12 rounded object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center flex-shrink-0">
                <span className="text-gray-400 text-xs">N/A</span>
              </div>
            )}

            <Tooltip title={displayText}>
              <Text ellipsis>{displayText}</Text>
            </Tooltip>
          </div>
        );
      },
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      align: "center",
      ellipsis: {
        showTitle: false,
      },
      render: (address) => {
        const displayAddr = displayValue(address);
        return (
          <Tooltip placement="topLeft" title={displayAddr}>
            <span className={!address ? "text-gray-400" : ""}>
              {displayAddr}
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: "Giờ mở cửa",
      dataIndex: "openTime",
      key: "open_time",
      align: "center",
      width: 110,
      render: (value) => (
        <span className={!value ? "text-gray-400" : ""}>
          {displayValue(value)}
        </span>
      ),
    },
    {
      title: "Giờ đóng cửa",
      dataIndex: "closeTime",
      key: "close_time",
      align: "center",
      width: 120,
      render: (value) => (
        <span className={!value ? "text-gray-400" : ""}>
          {displayValue(value)}
        </span>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 200,
      render: (record: Place) => (
        <Space size="middle">
          <Button
            onClick={() => handleEdit(record.placeId)}
            type="text"
            icon={<EditOutlined />}
          />
          <Button
            onClick={() => handleDelete(record.placeId)}
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
                placeholder="Tìm kiếm địa điểm..."
                prefix={<SearchOutlined style={{ color: "#99a1af" }} />}
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
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 bg-primary hover:bg-primary-light hover:cursor-pointer text-white font-medium px-5 py-2 rounded-md transition"
              >
                <Plus size={18} />
                <span>Tạo điạ điểm</span>
              </button>
            </div>
          </div>

          <div className="relative">
            <Table
              columns={columns}
              dataSource={paginatedData}
              rowKey="place_id"
              pagination={{
                current: currentPage,
                pageSize: PAGE_SIZE,
                total: totalItems,
                showLessItems: true,
                showSizeChanger: false,
                placement: ["bottomCenter"],
                onChange: (page) => setCurrentPage(page),
              }}
            />

            {loading && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-gray-600">Đang tải dữ liệu...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        open={isModalOpen}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        loading={deleteLoading}
        title="Xóa địa điểm này?"
        description="Hành động này sẽ xóa vĩnh viễn địa điểm này ra khỏi hệ thống và không thể khôi phục lại được."
        successMessage="Xóa địa điểm thành công!"
        errorMessage="Xóa địa điểm thất bại. Vui lòng thử lại!"
      />
    </div>
  );
};

export default Places;
