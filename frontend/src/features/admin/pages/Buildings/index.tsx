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
import type {
  Building,
  GetAllBuildingParams,
  GetAllBuildingResponse,
} from "../../types/building";
import { buildingService } from "../../services/BuildingService";
import DeleteConfirmModal from "../../components/Common/DeleteConfirmModal";

const PAGE_SIZE = 10;

const Buildings: React.FC = () => {
  const [filter, setFilter] = useState<string>("all");
  const [minFloors, setMinFloors] = useState<number | undefined>();
  const [maxFloors, setMaxFloors] = useState<number | undefined>();

  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 0,
  });

  const [building, setBuilding] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setModalOpen] = useState(false);
  const [buildingToDelete, setBuildingToDelete] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    loadBuilding(1);
  }, [searchTerm, minFloors, maxFloors]);

  const loadBuilding = async (page = 1) => {
    try {
      setLoading(true);

      const params: GetAllBuildingParams = {
        page,
        limit: PAGE_SIZE,
        search: searchTerm || undefined,
        minFloors,
        maxFloors,
      };

      const res = await buildingService.getAll(params);

      setBuilding(res.buildings);
      setPagination(res.pagination);
      setCurrentPage(page);
    } finally {
      setLoading(false);
    }
  };

  function handleEdit(buildingId: number) {
    navigate(`/admin/buildings/edit/${buildingId}`);
  }

  function handleAdd() {
    navigate("/admin/buildings/add");
  }

  function handleDelete(buildingId: number) {
    setBuildingToDelete(buildingId);
    setModalOpen(true);
  }

  async function handleConfirmDelete() {
    if (!buildingToDelete) return;

    setDeleteLoading(true);
    try {
      await buildingService.delete(buildingToDelete);
      setBuilding((prev) =>
        prev.filter((n) => n.buildingId !== buildingToDelete)
      );
      setModalOpen(false);
      setBuildingToDelete(null);
    } finally {
      setDeleteLoading(false);
    }
  }

  function handleCancelDelete() {
    setModalOpen(false);
    setBuildingToDelete(null);
  }

  const columns: ColumnsType<Building> = [
    {
      title: "ID",
      dataIndex: "buildingId",
      key: "buildingId",
      width: 60,
      align: "center",
    },
    {
      title: "Tên tòa nhà",
      dataIndex: "name",
      key: "name",
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (text: string, record: Building) => (
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
      title: "Số tầng",
      dataIndex: "floors",
      key: "floors",
      align: "center",
      width: 110,
    },
    {
      title: "Trực thuộc địa điểm",
      dataIndex: "placeName",
      key: "placeName",
      align: "left",
      width: 300,
      ellipsis: {
        showTitle: false,
      },
      render: (placeName) => (
        <Tooltip placement="topLeft" title={placeName}>
          {placeName}
        </Tooltip>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      align: "center",
      ellipsis: {
        showTitle: false,
      },
      render: (floors) => (
        <Tooltip placement="topLeft" title={floors}>
          {floors}
        </Tooltip>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 200,
      render: (record: Building) => (
        <Space size="middle">
          <Button
            onClick={() => handleEdit(record.buildingId)}
            type="text"
            icon={<EditOutlined />}
          />
          <Button
            onClick={() => handleDelete(record.buildingId)}
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
        title="Buildings | Admin Dashboard"
        description="This is Buildings Dashboard"
      />
      <div className="max-w-7xl mx-auto">
        {/* Table Card */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold">Danh sách tòa nhà</h2>
              <span className="text-sm bg-[#D1F2FF] text-[#2F73F2] py-1 px-4 rounded-full font-medium">
                {pagination.totalItems} tòa nhà
              </span>
            </div>
            <div className="flex flex-row items-center gap-3">
              {/* Search and Filters */}

              <Input
                placeholder="Tìm kiếm tòa nhà..."
                prefix={<SearchOutlined style={{ color: "#99a1af" }} />}
                value={searchInput}
                size="large"
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setSearchTerm(searchInput);
                  }
                }}
                style={{ width: 300 }}
              />
              <Input
                type="number"
                placeholder="Số tầng tối thiểu"
                size="large"
                min={0}
                value={minFloors}
                onChange={(e) =>
                  setMinFloors(
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                style={{ width: 160 }}
              />

              <Input
                type="number"
                placeholder="Số tầng tối đa"
                size="large"
                min={0}
                value={maxFloors}
                onChange={(e) =>
                  setMaxFloors(
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                style={{ width: 160 }}
              />

              <button
                onClick={handleAdd}
                className="flex items-center gap-2 bg-primary hover:bg-primary-light hover:cursor-pointer text-white font-medium p-2 rounded-md transition"
              >
                <Plus size={18} />
                <span>Tạo tòa nhà</span>
              </button>
            </div>
          </div>

          <div className="relative">
            <Table
              rowKey="buildingId"
              columns={columns}
              dataSource={building}
              pagination={{
                current: currentPage,
                pageSize: PAGE_SIZE,
                total: pagination.totalItems,
                showSizeChanger: false,
                placement: ["bottomCenter"],
                showLessItems: true,
                onChange: (page) => loadBuilding(page),
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
        title="Xóa tòa nhà này?"
        description="Hành động này sẽ xóa vĩnh viễn tòa nhà này ra khỏi hệ thống và không thể khôi phục lại được."
        successMessage="Xóa tòa nhà thành công!"
        errorMessage="Xóa tòa nhà thất bại. Vui lòng thử lại!"
      />
    </div>
  );
};

export default Buildings;
