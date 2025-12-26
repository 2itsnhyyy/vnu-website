import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import type { User } from "../../types/user";
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
import { userService } from "../../services/UserService";
import dayjs from "dayjs";
import { DeleteConfirmationModal } from "../Common/DeleteConfirmationModal";

export default function UserTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const PAGE_SIZE = 5;

  const [isModalOpen, setModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    userService
      .getAll({ page: currentPage, limit: PAGE_SIZE })
      .then((res) => {
        setUsers(res.users);
        setTotalItems(res.pagination.totalItems);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [currentPage, searchTerm]);

  function handleSearch() {
    setLoading(true);

    userService
      .getAll({ page: 1, limit: PAGE_SIZE, search: searchTerm })
      .then((res) => {
        setUsers(res.users);
        setCurrentPage(1);
      })
      .finally(() => setLoading(false));
  }

  function handleView(userId: number) {
    navigate(`/admin/users/${userId}`);
  }

  function handleDelete(userId: number) {
    setUserToDelete(userId);
    setModalOpen(true);
  }

  async function handleConfirmDelete() {
    if (!userToDelete) return;

    try {
      await userService.delete(userToDelete);

      setUsers((prev) => prev.filter((u) => u.userId !== userToDelete));
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Xóa tin tức thất bại");
    } finally {
      setModalOpen(false);
      setUserToDelete(null);
    }
  }

  const totalPages = Math.ceil(totalItems / PAGE_SIZE);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex justify-start items-center">
          <h2 className="text-lg font-semibold text-gray-800">
            Danh sách người dùng
          </h2>
          <span className="ml-5 text-sm bg-[#D1F2FF] text-[#2F73F2] py-1 px-4 rounded-full font-medium">
            {totalItems} người dùng
          </span>
        </div>
        <div className="flex items-center gap-3">
          <SearchInput
            placeholder="Tìm kiếm người dùng..."
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
                className="py-3 px-4 font-medium text-gray-800 text-center text-theme-sm"
              >
                Mã
              </TableCell>
              <TableCell
                isHeader
                className="py-3 px-3 font-medium text-gray-800 text-start text-theme-sm"
              >
                Họ tên
              </TableCell>
              <TableCell
                isHeader
                className="py-3 px-3 font-medium text-gray-800 text-start text-theme-sm"
              >
                Email
              </TableCell>
              <TableCell
                isHeader
                className="py-3 px-3 font-medium text-gray-800 text-center text-theme-sm"
              >
                Ngày sinh
              </TableCell>
              <TableCell
                isHeader
                className="py-3 px-3 font-medium text-gray-800 text-center text-theme-sm"
              >
                Vai trò
              </TableCell>
              <TableCell
                isHeader
                className="py-3 px-3 font-medium text-gray-800 text-center text-theme-sm"
              >
                Thao tác
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100">
            {users.map((user) => (
              <TableRow
                key={user.userId}
                className="hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <TableCell className="py-4 px-4 text-center text-black text-theme-sm">
                  {user.userId}
                </TableCell>
                <TableCell className="py-4 text-center px-3 text-black text-theme-sm">
                  <div className="flex gap-2">
                    <img
                      src={user.avatar || "/default-avatar.png"}
                      alt="avatar"
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="my-auto ml-2">{user.name}</div>
                  </div>
                </TableCell>
                <TableCell className="py-4 px-3 text-black text-theme-sm">
                  {user.email}
                </TableCell>
                <TableCell className="py-4 text-black text-theme-sm text-center">
                  {dayjs(user.birthday).format("DD/MM/YYYY")}
                </TableCell>
                <TableCell className="text-center px-6">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium
                    ${
                      user.role === 1
                        ? "text-[#FFB836] border-2 border-[#FFB836] rounded-2xl"
                        : " text-[#34C759] border-2 border-[#34C759] rounded-2xl"
                    }
                    `}
                  >
                    {user.role === 1 ? "Quản trị viên" : "Người dùng"}
                  </span>
                </TableCell>
                <TableCell className="py-4 text-black text-theme-sm px-3 text-center">
                  <div className="flex gap-6 justify-center">
                    <button onClick={() => handleView(user.userId)}>
                      <MdRemoveRedEye className="w-5 h-5 cursor-pointer" />
                    </button>
                    <button onClick={() => handleDelete(user.userId)}>
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
          setUserToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa người dùng"
        message="Bạn có chắc chắn muốn xóa người dùng này không? Hành động này không thể hoàn tác."
        confirmButtonText="Xóa"
        cancelButtonText="Hủy"
      />
    </div>
  );
}
