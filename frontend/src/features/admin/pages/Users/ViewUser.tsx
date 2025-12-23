import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { GrFormPrevious } from "react-icons/gr";
import PageMeta from "../../components/Common/PageMeta";
import type { User } from "../../types/user";
import { MdOutlineMail } from "react-icons/md";
import { FaBirthdayCake } from "react-icons/fa";
import { userService } from "../../services/UserService";
import { forumService } from "../../services/ForumService";
import dayjs from "dayjs";
import type { Post } from "../../types/post";
import Pagination from "../../components/Common/Pagination";

const ViewUser = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const pageSize = 2;

  const loadUser = async (userId: number) => {
    setUserLoading(true);
    try {
      const data = await userService.getById(userId);
      setUser(data);
    } catch (err) {
      console.error("Load user failed", err);
      setUser(null);
    } finally {
      setUserLoading(false);
    }
  };

  const loadPosts = async (userId: number, page: number, limit: number) => {
    setPostsLoading(true);
    try {
      const data = await forumService.getAll({
        page,
        limit,
        userId,
      });

      setPosts(data.posts || []);
      setTotalPosts(data.pagination.totalItems);
    } catch (err) {
      console.error("Load posts failed", err);
      setPosts([]);
    } finally {
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    const userId = Number(id);
    loadUser(userId);
    loadPosts(userId, page, pageSize);
  }, [id, page]);

  const totalPages = Math.ceil(totalPosts / pageSize);

  const markdownToPlainText = (markdown?: string, maxLength = 500) => {
    if (!markdown) return "";

    const plainText = markdown
      .replace(/[#_*`>~-]/g, "")
      .replace(/\[(.*?)\]\(.*?\)/g, "$1")
      .replace(/\r?\n|\r/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return plainText.length > maxLength
      ? plainText.slice(0, maxLength) + "..."
      : plainText;
  };

  if (userLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-600">Không tìm thấy người dùng</div>
      </div>
    );
  }

  return (
    <div>
      <PageMeta
        title={`Xem ${user.name} | Admin Dashboard`}
        description="Thông tin cá nhân người dùng"
      />

      <div className="mb-6 flex items-center">
        <Link to="/admin/users">
          <GrFormPrevious className="w-6 h-6 mr-2 my-auto" />
        </Link>
        <h2 className="text-xl font-semibold text-gray-800">
          Xem thông tin cá nhân
        </h2>
      </div>

      <div className="flex gap-6">
        <div className="w-[70%]">
          <div className="relative bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
            <div className="h-[218px] relative">
              <img
                src={user.avatar}
                alt=""
                className="absolute w-[150px] h-[150px] left-6 top-6 rounded-full border-4 border-[#F5FBFF] shadow-md"
              />
              <h2 className="absolute left-[200px] top-[55px] text-2xl font-semibold ">
                {user.name} <br />
                <span
                  className={`px-2 py-1 rounded text-xs font-medium bg-white
                    ${
                      user.role === 1
                        ? "text-[#FFB836] border-2 border-[#FFB836] rounded-2xl"
                        : " text-[#34C759] border-2 border-[#34C759] rounded-2xl"
                    }
                    `}
                >
                  {user.role === 1 ? "Quản trị viên" : "Người dùng"}
                </span>
              </h2>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 px-8 py-6">
            <h1 className="text-xl font-semibold mb-3 text-[#1D4ED8] ">
              Bài đăng
            </h1>
            {postsLoading ? (
              <p>Đang tải bài đăng...</p>
            ) : posts.length === 0 ? (
              <p>Người dùng chưa có bài đăng nào</p>
            ) : (
              posts.map((post) => (
                <div key={post.postId} className="mb-4">
                  <h2 className="font-semibold">{post.title}</h2>
                  <p className="text-gray-700 my-1 text-justify">
                    {markdownToPlainText(post.contentMarkdown, 500)}
                  </p>
                  <Link
                    to={`/admin/forum/${post.postId}`}
                    className="text-[#1D4ED8] text-sm font-medium flex justify-end"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              ))
            )}

            {totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalPosts}
                onPageChange={(newPage) => setPage(newPage)}
              />
            )}
          </div>
        </div>

        <div className="w-[30%]">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold mb-3 text-[#1D4ED8] text-lg">
              Thông tin khác
            </h3>
            <div>
              <p className="flex font-medium my-2">
                <MdOutlineMail className="mr-2 my-auto w-5 h-5" />
                Email
              </p>
              <span className="ml-7">{user.email}</span>
            </div>
            <div className="mt-6">
              <p className="flex font-medium my-2">
                <FaBirthdayCake className="mr-2 my-auto w-5 h-5" />
                Ngày sinh
              </p>
              <span className="ml-7">
                {dayjs(user.birthday).format("DD/MM/YYYY")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewUser;
