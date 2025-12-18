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
import type { Building } from "../../types/building";
import { mockBuilding } from "../../types/building";

const PAGE_SIZE = 10;


const Buildings: React.FC = () => {
  const [filter, setFilter] = useState<string>("all");

  const [building, setBuilding] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setModalOpen] = useState(false);
  const [buildingToDelete, setBuildingToDelete] = useState<number | null>(null);


   const navigate = useNavigate();
  
    useEffect(() => {
      loadBuilding();
    }, []);
  
    function loadBuilding() {
      setLoading(true);
      setTimeout(() => {
        setBuilding(mockBuilding);
        setLoading(false);
      }, 300);
    }
  
    function handleSearch() {
      setLoading(true);
      setTimeout(() => {
        const filtered = mockBuilding.filter((n) =>
          n.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setBuilding(filtered);
        setCurrentPage(1);
        setLoading(false);
      }, 200);
    }
  
    function handleView(building_id: number) {
      navigate(`/admin/building/${building_id}`);
    }
  
    function handleEdit(building_id: number) {
      navigate(`/admin/building/edit/${building_id}`);
    }
  
    function handleAdd() {
      navigate("/admin/buildings/add");
    }
  
    function handleDelete(building_id: number) {
      setBuildingToDelete(building_id);
      setModalOpen(true);
    }
  
    function handleConfirmDelete() {
      if (!buildingToDelete) return;
      setBuilding((prev) => prev.filter((n) => n.building_id !== buildingToDelete));
      setModalOpen(false);
    }

    const totalItems = building.length;
    const totalPages = Math.ceil(totalItems / PAGE_SIZE);

    const paginatedData = building.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const columns: ColumnsType<Building> = [
    {
      title: "ID",
      dataIndex: "building_id",
      key: "building_id",
      width: 60,
      align: "center",
    },
    {
      title: "Tên tòa nhà",
      dataIndex: "name",
      key: "name",
      width: 250,
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
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      align: "center",
      width: 110,
    },
    {
      title: "Số tầng",
      dataIndex: "floors",
      key: "floors",
      align: "center",
      width: 110,
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
      title: "Trực thuộc địa điểm",
      dataIndex: "place_belong_to",
      key: "place_belong_to",
      align: "center",
      width: 200,
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
          <Button onClick={() => handleView(record.building_id)} type="text" icon={<EyeOutlined />} />
          <Button onClick={() => handleEdit(record.building_id)} type="text" icon={<EditOutlined />} />
          <Button onClick={() => handleDelete(record.building_id)} type="text" danger icon={<DeleteOutlined />} />
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
                {totalItems} tòa nhà
              </span>
            </div>
            <div className="flex flex-row items-center gap-3">
              {/* Search and Filters */}

              <Input
                placeholder="Tìm tòa nhà..."
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

              <button onClick={handleAdd} className="flex items-center gap-2 bg-primary hover:bg-primary-light hover:cursor-pointer text-white font-medium p-2 rounded-md transition">
                <Plus size={18} />
                <span>Tạo tòa nhà</span>
              </button>
            </div>
          </div>

          <Table
            columns={columns}
            dataSource={building}
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

export default Buildings;
