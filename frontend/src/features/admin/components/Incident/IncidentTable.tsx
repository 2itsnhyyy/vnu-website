import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import type { Incident } from "../../types/incident";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../UI/Table";
import Pagination from "../Common/Pagination";
import SearchInput from "../Common/SearchInput";
import { FaPlus } from "react-icons/fa6";
import { incidentService } from "../../services/IncidentService";
import dayjs from "dayjs";
import { DeleteConfirmationModal } from "../Common/DeleteConfirmationModal";

export default function IncidentTable() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const PAGE_SIZE = 5;

  const [isModalOpen, setModalOpen] = useState(false);
  const [incidentToDelete, setIncidentToDelete] = useState<number | null>(null);

  const markdownToPlainText = (markdown?: string) => {
    if (!markdown) return "";

    return markdown
      .replace(/[#_*`>~-]/g, "")
      .replace(/\[(.*?)\]\(.*?\)/g, "$1")
      .replace(/\r?\n|\r/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);

    incidentService
      .getAll({ page: currentPage, limit: PAGE_SIZE })
      .then((res) => {
        setIncidents(res.incidents);
        setTotalItems(res.pagination.totalItems);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [currentPage, searchTerm]);

  function handleSearch() {
    setLoading(true);

    incidentService
      .getAll({ page: 1, limit: PAGE_SIZE, search: searchTerm })
      .then((res) => {
        setIncidents(res.incidents);
        setCurrentPage(1);
      })
      .finally(() => setLoading(false));
  }

  function handleView(incidentId: number) {
    navigate(`/admin/incidents/${incidentId}`);
  }

  function handleEdit(incidentId: number) {
    navigate(`/admin/incidents/edit/${incidentId}`);
  }

  function handleAdd() {
    navigate("/admin/incidents/add");
  }

  function handleDelete(postId: number) {
    setIncidentToDelete(postId);
    setModalOpen(true);
  }

  async function handleConfirmDelete() {
    if (!incidentToDelete) return;

    try {
      await incidentService.delete(incidentToDelete);

      setIncidents((prev) =>
        prev.filter((i) => i.incidentId !== incidentToDelete)
      );
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Xóa sự cố thất bại");
    } finally {
      setModalOpen(false);
      setIncidentToDelete(null);
    }
  }

  const totalPages = Math.ceil(totalItems / PAGE_SIZE);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex justify-start items-center">
          <h2 className="text-lg font-semibold text-gray-800">
            Danh sách sự cố
          </h2>
          <span className="ml-5 text-sm bg-[#D1F2FF] text-[#2F73F2] py-1 px-4 rounded-full font-medium">
            {totalItems} sự cố
          </span>
        </div>
        <div className="flex items-center gap-3">
          <SearchInput
            placeholder="Tìm kiếm sự cố..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />

          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-[#1D4ED8] px-4 py-2 text-theme-sm font-medium text-white shadow-theme-xs hover:bg-[rgba(29,78,216,0.9)] cursor-pointer"
          >
            <FaPlus className="my-auto" />
            Tạo sự cố
          </button>
        </div>
      </div>
      {loading ? (
      <div className=" bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
      ) : (
        <Table>
          <TableHeader className="border-gray-100 border-y">
            <TableRow className="bg-gray-50 transition-colors cursor-pointer">
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-800 text-center px-3 text-theme-sm"
              >
                ID
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-800 text-center px-3 text-theme-sm"
              >
                Tiêu đề
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-800 text-center px-3 text-theme-sm"
              >
                Nội dung
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-800 text-center px-3 text-theme-sm"
              >
                Ngày tạo
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-800 text-center text-theme-sm"
              >
                Trạng thái
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-800 text-center px-3 text-theme-sm"
              >
                Thao tác
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100">
            {incidents.map((incident) => (
              <TableRow
                key={incident.incidentId}
                className="hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <TableCell className="py-6 text-gray-500 text-theme-sm px-3">
                  {incident.incidentId}
                </TableCell>
                <TableCell className="py-6 text-gray-500 text-theme-sm px-3">
                  <div className="max-w-[200px] truncate mx-auto">
                    {markdownToPlainText(incident.title).slice(0, 100)}...
                  </div>
                </TableCell>
                <TableCell className="py-6 text-gray-500 text-theme-sm px-3">
                  {markdownToPlainText(incident.content).slice(0, 240)}...
                </TableCell>
                <TableCell className="py-6 text-gray-500 text-theme-sm px-3 text-center">
                  {dayjs(incident.createdAt).format("DD/MM/YYYY")}
                </TableCell>
                <TableCell className="text-center px-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium
                    ${
                      incident.status === 0
                        ? "text-[#FFB836] border-2 border-[#FFB836] rounded-2xl"
                        : " text-[#34C759] border-2 border-[#34C759] rounded-2xl"
                    }
                    `}
                  >
                    {incident.status === 0 ? "Mới" : "Đã giải quyết"}
                  </span>
                </TableCell>
                <TableCell className="py-6 text-gray-500 text-theme-sm px-3">
                  <div className="flex gap-2 justify-center">
                    <button onClick={() => handleView(incident.incidentId)}>
                      <EyeOutlined className="w-5 h-5 cursor-pointer" />
                    </button>
                    <button onClick={() => handleEdit(incident.incidentId)}>
                      <EditOutlined className="w-5 h-5 cursor-pointer" />
                    </button>
                    <button onClick={() => handleDelete(incident.incidentId)}>
                      <DeleteOutlined style={{ color: '#ff4d4f' }} className="w-5 h-5 cursor-pointer" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={PAGE_SIZE}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
        />
      )}

      <DeleteConfirmationModal
        isOpen={isModalOpen}
        onClose={() => {
          setModalOpen(false);
          setIncidentToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa sự cố"
        message="Bạn có chắc chắn muốn xóa sự cố này không? Hành động này không thể hoàn tác."
        confirmButtonText="Xóa"
        cancelButtonText="Hủy"
      />
    </div>
  );
}
