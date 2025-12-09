import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { GrFormPrevious } from "react-icons/gr";
import PageMeta from "../../components/Common/PageMeta";
import type { User } from "../../types/user";
import { mockUsers } from "../../types/user";
import { MdOutlineMail } from "react-icons/md";
import { FaBirthdayCake } from "react-icons/fa";

const ViewUser = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (id) loadUser(Number(id));
  }, [id]);

  const loadUser = (userId: number) => {
    setLoading(true);

    const found = mockUsers.find((u) => u.userId === userId);

    setTimeout(() => {
      if (found) {
        setUser(found);
      }
      setLoading(false);
    }, 300);
  };

  if (loading && !user) {
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
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          Xem thông tin cá nhân
        </h2>
      </div>

      <div className="flex gap-6">
        <div className="w-[70%]">
          <div className="relative bg-white rounded-xl border border-gray-200 overflow-hidden mb-4 h-[60%]">
            <div className="h-[150px] bg-[rgba(29,78,216,0.15)] relative">
              <img
                src={user.avatar}
                alt=""
                className="absolute left-10 bottom-[-90px] w-[150px] h-[150px] rounded-full border-4 border-white shadow-md"
              />

              <h2 className="absolute left-[220px] bottom-[-55px] text-2xl font-semibold">
                {user.name}
              </h2>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h1 className="text-xl font-semibold mb-3 text-[#1D4ED8]">
              Bài đăng
            </h1>
            <p className="leading-relaxed">
              `Đại học Quốc gia TP. Hồ Chí Minh (ĐHQG-HCM) là một trong hai đại
              học quốc gia lớn nhất Việt Nam, giữ vai trò nòng cốt trong hệ
              thống giáo dục bậc cao của cả nước. Được thành lập với tầm nhìn
              xây dựng một trung tâm đào tạo – nghiên cứu chất lượng quốc tế,
              ĐHQG-HCM hiện quy tụ hơn 10 trường đại học thành viên, viện nghiên
              cứu và đơn vị trực thuộc. 🎓 Các trường thành viên tiêu biểu:
              Trường Đại học Bách Khoa Trường Đại học Công nghệ Thông tin Trường
              Đại học Khoa học Xã hội & Nhân văn Trường Đại học Kinh tế – Luật
              Trường Đại học Khoa học Tự nhiên Trường Đại học Quốc Tế Viện Môi
              Trường – Tài Nguyên,… Với gần 80.000 sinh viên cùng hệ thống cơ sở
              vật chất hiện đại tại Khu đô thị ĐHQG ở Thủ Đức, trường tạo nên
              một môi trường học tập năng động, sáng tạo và hiện đại.`
            </p>
          </div>
        </div>

        <div className="w-[30%]">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold mb-3 text-[#1D4ED8] text-lg">
              Thông tin khác
            </h3>
            <p>
              <p className="flex font-medium my-2">
                <MdOutlineMail className="mr-2 my-auto w-5 h-5" />
                Email
              </p>
              <span className="ml-7">{user.email}</span>
            </p>
            <p className="mt-6">
              <p className="flex font-medium my-2">
                <FaBirthdayCake className="mr-2 my-auto w-5 h-5" />
                Ngày sinh
              </p>
              <span className="ml-7">{user.birthday}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewUser;
