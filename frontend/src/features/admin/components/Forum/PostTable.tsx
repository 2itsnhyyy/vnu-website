import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import type { Post } from "../../types/post";
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
import { forumService } from "../../services/ForumService";
import Pagination from "../Common/Pagination";
import SearchInput from "../Common/SearchInput";
import dayjs from "dayjs";

const PAGE_SIZE = 10;

export default function PostTable() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);

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

    forumService
      .getAll(currentPage, PAGE_SIZE)
      .then((res) => {
        console.log("API DATA:", res);
        setPosts(res.posts);
      })
      .catch((err) => {
        console.error("API ERROR:", err);
      })
      .finally(() => setLoading(false));
  }, [currentPage]);

  function handleSearch() {
    setLoading(true);

    forumService
      .getAll(1, PAGE_SIZE)
      .then((res) => {
        const filtered = res.posts.filter((p) =>
          p.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setPosts(filtered);
        setCurrentPage(1);
      })
      .finally(() => setLoading(false));
  }

  function handleView(postId: number) {
    navigate(`/admin/forum/${postId}`);
  }

  function handleEdit(postId: number) {
    navigate(`/admin/forum/edit/${postId}`);
  }

  function handleDelete(postId: number) {
    setPostToDelete(postId);
    setModalOpen(true);
  }

  function handleConfirmDelete() {
    if (!postToDelete) return;
    setPosts((prev) => prev.filter((p) => p.postId !== postToDelete));
    setModalOpen(false);
  }

  const totalItems = posts.length;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);

  const paginatedData = posts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex justify-start items-center pt-5">
          <h2 className="text-xl font-semibold text-gray-800">
            Danh sách bài đăng
          </h2>
          <span className="ml-5 text-sm bg-[#D1F2FF] text-[#2F73F2] py-1 px-4 rounded-full font-medium">
            {totalItems} bài đăng
          </span>
        </div>
        <div className="flex items-center gap-3">
          <SearchInput
            placeholder="Tìm kiếm bài đăng..."
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
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 cursor-pointer"
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
        </div>
      </div>
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <Table>
          <TableHeader className="border-gray-100 border-y">
            <TableRow className="bg-gray-50 transition-colors">
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 px-3 text-center text-theme-sm"
              >
                Mã
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-center text-theme-sm"
              >
                Tiêu đề
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-center text-theme-sm"
              >
                Tác giả
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-center text-theme-sm mx-2"
              >
                Ngày đăng
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-center text-theme-sm"
              >
                Nội dung
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-center text-theme-sm"
              >
                Thao tác
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100">
            {paginatedData.map((post) => (
              <TableRow
                key={post.postId}
                className="hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <TableCell className="py-6 px-3 text-center text-gray-500 text-theme-sm">
                  {post.postId}
                </TableCell>
                <TableCell className="py-6 text-center text-gray-500 text-theme-sm">
                  <div className="max-w-[350px] truncate">{post.title}</div>
                </TableCell>
                <TableCell className="py-6 text-center text-gray-500 text-theme-sm">
                  {post.author.name}
                </TableCell>
                <TableCell className="py-6 text-center text-gray-500 text-theme-sm mx-2">
                  {dayjs(post.createdAt).format("DD/MM/YYYY")}
                </TableCell>

                <TableCell className="py-6 text-center text-gray-500 text-theme-sm">
                  <div className="max-w-[200px] truncate mx-auto">
                    {markdownToPlainText(post.contentMarkdown)}
                  </div>
                </TableCell>

                <TableCell className="py-6 text-center text-gray-500 text-theme-sm">
                  <div className="flex gap-2 justify-center">
                    <button onClick={() => handleView(post.postId)}>
                      <MdRemoveRedEye className="w-5 h-5 cursor-pointer" />
                    </button>
                    <button onClick={() => handleEdit(post.postId)}>
                      <MdEdit className="w-5 h-5 cursor-pointer" />
                    </button>
                    <button onClick={() => handleDelete(post.postId)}>
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
    </div>
  );
}
