import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdDeleteOutline } from "react-icons/md";
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
import { commentService } from "../../services/CommentService";
import dayjs from "dayjs";
import { DeleteConfirmationModal } from "../Common/DeleteConfirmationModal";
import type { Comment } from "../../types/comment";

interface CommentTableProps {
  postId: number;
}

export default function CommentTable({ postId }: CommentTableProps) {
  const numericPostId = Number(postId);

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const PAGE_SIZE = 3;

  const [isModalOpen, setModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!numericPostId) return;

    setLoading(true);

    commentService
      .getAll(numericPostId, { page: currentPage, limit: PAGE_SIZE })
      .then((res) => {
        setComments(res.comments);
        setTotalItems(res.pagination.totalItems);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [numericPostId, currentPage]);

  function handleSearch() {
    setLoading(true);

    commentService
      .getAll(numericPostId, { page: 1, limit: PAGE_SIZE })
      .then((res) => {
        setComments(res.comments);
        setCurrentPage(1);
      })
      .finally(() => setLoading(false));
  }

  function handleView(commentId: number) {
    navigate(`/admin/comments/${commentId}`);
  }

  function handleDelete(commentId: number) {
    setCommentToDelete(commentId);
    setModalOpen(true);
  }

  async function handleConfirmDelete() {
    if (commentToDelete === null) return;

    try {
      await commentService.delete(commentToDelete);

      setComments((prev) =>
        prev.filter((c) => c.commentId !== commentToDelete)
      );
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Xóa bình luận thất bại");
    } finally {
      setModalOpen(false);
      setCommentToDelete(null);
    }
  }

  const totalPages = Math.ceil(totalItems / PAGE_SIZE);

  return (
    <div className="">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex justify-start items-center pt-5">
          <h2 className="text-xl font-semibold text-gray-800">
            Danh sách bình luận của bài viết
          </h2>
          <span className="ml-5 text-sm bg-[#D1F2FF] text-[#2F73F2] py-1 px-4 rounded-full font-medium">
            {totalItems} bình luận
          </span>
        </div>
        <div className="flex items-center gap-3">
          <SearchInput
            placeholder="Tìm kiếm bình luận..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />
        </div>
      </div>
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <Table>
          <TableHeader className="border-gray-100 border-y">
            <TableRow className="bg-gray-50 transition-colors cursor-pointer">
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-center px-3 text-theme-sm"
              >
                Mã
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-center px-3 text-theme-sm"
              >
                Nội dung
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-center px-3 text-theme-sm"
              >
                Ngày tạo
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-center px-3 text-theme-sm"
              >
                Thao tác
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100">
            {comments.map((comment) => (
              <TableRow
                key={comment.commentId}
                className="hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <TableCell className="py-6 text-gray-500 text-theme-sm px-3">
                  {comment.commentId}
                </TableCell>
                <TableCell className="py-6 text-gray-500 text-theme-sm px-3">
                  <div className="">{comment.content.slice(0, 100)}...</div>
                </TableCell>
                <TableCell className="py-6 text-gray-500 text-theme-sm px-3 text-center">
                  {dayjs(comment.createdAt).format("DD/MM/YYYY")}
                </TableCell>

                <TableCell className="py-6 text-gray-500 text-theme-sm px-3">
                  <div className="flex gap-2 justify-center">
                    <button
                      type="button"
                      onClick={() => handleView(comment.commentId)}
                    >
                      <MdRemoveRedEye className="w-5 h-5 cursor-pointer" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(comment.commentId)}
                    >
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
          setCommentToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa bình luận"
        message="Bạn có chắc chắn muốn xóa bình luận này không? Hành động này không thể hoàn tác."
        confirmButtonText="Xóa"
        cancelButtonText="Hủy"
      />
    </div>
  );
}
