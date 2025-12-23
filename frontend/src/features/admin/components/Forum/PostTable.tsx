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
import { DeleteConfirmationModal } from "../Common/DeleteConfirmationModal";
import { FaPlus } from "react-icons/fa6";

export default function PostTable() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const PAGE_SIZE = 5;

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
      .getAll({ page: currentPage, limit: PAGE_SIZE })
      .then((res) => {
        setPosts(res.posts);
        setTotalItems(res.pagination.totalItems);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [currentPage, searchTerm]);

  function handleSearch() {
    setLoading(true);

    forumService
      .getAll({ page: 1, limit: PAGE_SIZE, search: searchTerm })
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

  function handleAdd() {
    navigate("/admin/forum/add");
  }

  function handleDelete(postId: number) {
    setPostToDelete(postId);
    setModalOpen(true);
  }

  async function handleConfirmDelete() {
    if (!postToDelete) return;

    try {
      await forumService.delete(postToDelete);

      setPosts((prev) => prev.filter((p) => p.postId !== postToDelete));
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Xóa bài đăng thất bại");
    } finally {
      setModalOpen(false);
      setPostToDelete(null);
    }
  }

  const totalPages = Math.ceil(totalItems / PAGE_SIZE);

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
        <div className="flex items-center gap-3 ">
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
            onClick={handleAdd}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-[#1D4ED8] px-4 py-2.5 text-theme-sm font-medium text-white shadow-theme-xs hover:bg-[rgba(29,78,216,0.9)] cursor-pointer"
          >
            <FaPlus className="my-auto" />
            Tạo bài đăng
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
                className="py-3 font-medium text-gray-500 text-center text-theme-sm mx-2"
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
                className="py-3 font-medium text-gray-500 text-center text-theme-sm mx-2"
              >
                Nội dung
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-center text-theme-sm mx-2"
              >
                Thao tác
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100">
            {posts.map((post) => (
              <TableRow
                key={post.postId}
                className="hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <TableCell className="py-6 px-3 text-center text-gray-500 text-theme-sm mx-2">
                  {post.postId}
                </TableCell>
                <TableCell className="py-6 text-gray-500 text-theme-sm mx-2">
                  <div className="">{post.title.slice(0, 60)}...</div>
                </TableCell>
                <TableCell className="py-6 text-center text-gray-500 text-theme-sm mx-2">
                  {post.author.name}
                </TableCell>
                <TableCell className="py-6 text-center text-gray-500 text-theme-sm mx-2">
                  {dayjs(post.createdAt).format("DD/MM/YYYY")}
                </TableCell>

                <TableCell className="py-6 text-gray-500 text-theme-sm mx-2">
                  <div className="max-w-[200px] truncate mx-auto">
                    {markdownToPlainText(post.contentMarkdown).slice(0, 24)}...
                  </div>
                </TableCell>

                <TableCell className="py-6 text-center text-gray-500 text-theme-sm mx-2">
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

      <DeleteConfirmationModal
        isOpen={isModalOpen}
        onClose={() => {
          setModalOpen(false);
          setPostToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa bài đăng"
        message="Bạn có chắc chắn muốn xóa bài đăng này không? Hành động này không thể hoàn tác."
        confirmButtonText="Xóa"
        cancelButtonText="Hủy"
      />
    </div>
  );
}
