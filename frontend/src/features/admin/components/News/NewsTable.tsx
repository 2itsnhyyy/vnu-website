import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import type { News } from "../../types/news";
import { MdDeleteOutline } from "react-icons/md";
import { MdEdit } from "react-icons/md";
import { MdRemoveRedEye } from "react-icons/md";
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
import { newsService } from "../../services/NewsService";
import dayjs from "dayjs";
import { DeleteConfirmationModal } from "../Common/DeleteConfirmationModal";

export default function NewsTable() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const PAGE_SIZE = 5;

  const [isModalOpen, setModalOpen] = useState(false);
  const [newsToDelete, setNewsToDelete] = useState<number | null>(null);

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
    newsService
      .getAll({ page: currentPage, limit: PAGE_SIZE })
      .then((res) => {
        setNews(res.news);
        setTotalItems(res.pagination.totalItems);
      })
      .catch((err) => {
        console.error("API ERROR:", err);
      })
      .finally(() => setLoading(false));
  }, [currentPage]);

  function handleSearch() {
    setLoading(true);

    newsService
      .getAll({ page: 1, limit: PAGE_SIZE, search: searchTerm })
      .then((res) => {
        setNews(res.news);
        setCurrentPage(1);
      })
      .finally(() => setLoading(false));
  }

  function handleView(newsId: number) {
    navigate(`/admin/news/${newsId}`);
  }

  function handleEdit(newsId: number) {
    navigate(`/admin/news/edit/${newsId}`);
  }

  function handleAdd() {
    navigate("/admin/news/add");
  }

  function handleDelete(newsId: number) {
    setNewsToDelete(newsId);
    setModalOpen(true);
  }

  async function handleConfirmDelete() {
    if (!newsToDelete) return;

    try {
      await newsService.delete(newsToDelete);

      setNews((prev) => prev.filter((n) => n.newsId !== newsToDelete));
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Xóa tin tức thất bại");
    } finally {
      setModalOpen(false);
      setNewsToDelete(null);
    }
  }

  const totalPages = Math.ceil(totalItems / PAGE_SIZE);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex justify-start items-center">
          <h2 className="text-lg font-semibold text-gray-800">
            Danh sách tin tức
          </h2>
          <span className="ml-5 text-sm bg-[#D1F2FF] text-[#2F73F2] py-1 px-4 rounded-full font-medium">
            {totalItems} tin tức
          </span>
        </div>
        <div className="flex items-center gap-3">
          <SearchInput
            placeholder="Tìm kiếm tin tức..."
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
            Tạo tin tức
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
                className="py-3 px-4 font-medium text-gray-500 text-center text-theme-sm"
              >
                Mã
              </TableCell>
              <TableCell
                isHeader
                className="py-3 px-2 font-medium text-gray-500 text-center text-theme-sm"
              >
                Tiêu đề
              </TableCell>
              <TableCell
                isHeader
                className="py-3 px-2 font-medium text-gray-500 text-center text-theme-sm"
              >
                Nội dung
              </TableCell>
              <TableCell
                isHeader
                className="py-3 px-2 font-medium text-gray-500 text-center text-theme-sm"
              >
                Ngày tạo
              </TableCell>
              <TableCell
                isHeader
                className="py-3 px-4 font-medium text-gray-500 text-center text-theme-sm"
              >
                Thao tác
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100">
            {news.map((news) => (
              <TableRow
                key={news.newsId}
                className="hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <TableCell className="py-5 px-4 text-center text-black text-theme-sm">
                  {news.newsId}
                </TableCell>
                <TableCell className="py-5 px-3 text-black text-theme-sm">
                  <div className="truncate">{news.title}</div>
                </TableCell>
                <TableCell className="py-5 text-black text-theme-sm">
                  <div className="max-w-[400px] truncate mx-auto">
                    {markdownToPlainText(news.contentMarkdown)}
                  </div>
                </TableCell>
                <TableCell className="py-5 text-black text-theme-sm text-center px-2">
                  {dayjs(news.createdAt).format("DD/MM/YYYY")}
                </TableCell>
                <TableCell className="py-5 text-black text-theme-sm px-4">
                  <div className="flex gap-2 justify-center">
                    <button onClick={() => handleView(news.newsId)}>
                      <MdRemoveRedEye className="w-5 h-5 cursor-pointer" />
                    </button>
                    <button onClick={() => handleEdit(news.newsId)}>
                      <MdEdit className="w-5 h-5 cursor-pointer" />
                    </button>
                    <button onClick={() => handleDelete(news.newsId)}>
                      <MdDeleteOutline className="w-5 h-5 cursor-pointer" />
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
          setNewsToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa tin tức"
        message="Bạn có chắc chắn muốn xóa tin tức này không? Hành động này không thể hoàn tác."
        confirmButtonText="Xóa"
        cancelButtonText="Hủy"
      />
    </div>
  );
}
