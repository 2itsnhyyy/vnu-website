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
import { mockNews } from "../../types/news";
import { FaPlus } from "react-icons/fa6";

const PAGE_SIZE = 10;

export default function NewsTable() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setModalOpen] = useState(false);
  const [newsToDelete, setNewsToDelete] = useState<number | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    loadNews();
  }, []);

  function loadNews() {
    setLoading(true);
    setTimeout(() => {
      setNews(mockNews);
      setLoading(false);
    }, 300);
  }

  function handleSearch() {
    setLoading(true);
    setTimeout(() => {
      const filtered = mockNews.filter((n) =>
        n.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setNews(filtered);
      setCurrentPage(1);
      setLoading(false);
    }, 200);
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

  function handleConfirmDelete() {
    if (!newsToDelete) return;
    setNews((prev) => prev.filter((n) => n.newsId !== newsToDelete));
    setModalOpen(false);
  }

  const totalItems = news.length;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);

  const paginatedData = news.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex justify-start items-center pt-5">
          <h2 className="text-xl font-semibold text-gray-800">
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
            onClick={handleSearch}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800"
          >
            <svg
              className="stroke-current fill-white"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.29004 5.90393H17.7067"
                stroke=""
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M17.7075 14.0961H2.29085"
                stroke=""
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12.0826 3.33331C13.5024 3.33331 14.6534 4.48431 14.6534 5.90414C14.6534 7.32398 13.5024 8.47498 12.0826 8.47498C10.6627 8.47498 9.51172 7.32398 9.51172 5.90415C9.51172 4.48432 10.6627 3.33331 12.0826 3.33331Z"
                fill=""
                stroke=""
                strokeWidth="1.5"
              />
              <path
                d="M7.91745 11.525C6.49762 11.525 5.34662 12.676 5.34662 14.0959C5.34661 15.5157 6.49762 16.6667 7.91745 16.6667C9.33728 16.6667 10.4883 15.5157 10.4883 14.0959C10.4883 12.676 9.33728 11.525 7.91745 11.525Z"
                fill=""
                stroke=""
                strokeWidth="1.5"
              />
            </svg>
            Tìm kiếm
          </button>

          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-[#1D4ED8] px-4 py-2.5 text-theme-sm font-medium text-white shadow-theme-xs hover:bg-[rgba(29,78,216,0.9)] cursor-pointer"
          >
            <FaPlus className="my-auto" />
            Tạo tin tức
          </button>
        </div>
      </div>
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <Table>
          <TableHeader className="border-gray-100 border-y">
            <TableRow>
              <TableCell
                isHeader
                className="py-3 pr-6 font-medium text-gray-500 text-start text-theme-sm"
              >
                Mã
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-sm"
              >
                Tiêu đề
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-sm"
              >
                Nội dung
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-center text-theme-sm pr-8"
              >
                Ngày tạo
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-sm px-8"
              >
                Thao tác
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100">
            {paginatedData.map((news) => (
              <TableRow key={news.newsId}>
                <TableCell className="py-3 text-gray-500 text-theme-sm">
                  {news.newsId}
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm">
                  <div className="max-w-[300px] truncate">{news.title}</div>
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm">
                  <div className="max-w-[400px] truncate">{news.content}</div>
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm text-center pr-8">
                  {news.createdAt}
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm px-8">
                  <div className="flex gap-2">
                    <button onClick={() => handleView(news.newsId)}>
                      <MdRemoveRedEye className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleEdit(news.newsId)}>
                      <MdEdit className="w-5 h-5 " />
                    </button>
                    <button onClick={() => handleDelete(news.newsId)}>
                      <MdDeleteOutline className="w-5 h-5 " />
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
    </div>
  );
}
