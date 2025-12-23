import React, { useState, type FormEvent, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../api/index";
import LogoKhongChu from "../../../../assets/logos/LogoKhongChu.svg";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthday: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value.trim() }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Mật khẩu xác nhận không trùng khớp!");
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.register(formData);

      alert("Đăng ký thành công!");
      navigate("/users/login");
    } catch (error: any) {
      alert(error.message || "Có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <div className="w-full flex z-10">
        {/* Left Half: Image */}
        <div
          className="w-2/3 hidden md:block bg-contain bg-center bg-no-repeat bg-bg h-screen"
          style={{
            backgroundImage: `url(${LogoKhongChu})`,
          }}
        ></div>
        {/* Right Half: Login Form */}
        <div className="w-full md:w-1/2 bg-white p-20 fade-in flex flex-col justify-center h-screen">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-[var(--color-text-main)] mb-6">
            ĐĂNG KÝ TÀI KHOẢN
          </h2>

          <div className="text-center text-[var(--color-text-main)] opacity-70 mb-8">
            <p>Tham gia để khám phá thêm nhiều tính năng nào!</p>
          </div>

          <div className="w-3/4 mx-auto h-px bg-[var(--color-surface-dim)] mb-8"></div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* USERNAME */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-main)]">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                type="text"
                required
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                placeholder="Nguyễn Văn A"
                onChange={handleChange}
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-main)]">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                placeholder="example@gmail.com"
                onChange={handleChange}
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-main)]">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <input
                name="password"
                type="password"
                required
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                placeholder="••••••••"
                onChange={handleChange}
              />
              <p className="text-xs text-[var(--color-text-main)] opacity-60 mt-1">
                Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường,
                số và ký tự đặc biệt.
              </p>
            </div>

            {/* CONFIRM PASSWORD - TRƯỜNG MỚI THÊM */}
            <div>
              <label className="block text-sm font-medium">
                Xác nhận mật khẩu *
              </label>
              <input
                name="confirmPassword"
                type="password"
                required
                placeholder="••••••••"
                className={`w-full px-4 py-3 border-2 rounded-xl outline-none ${
                  formData.confirmPassword &&
                  formData.password !== formData.confirmPassword
                    ? "border-red-500"
                    : "border-gray-100"
                }`}
                onChange={handleChange}
              />
              {formData.confirmPassword &&
                formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">
                    Mật khẩu không khớp!
                  </p>
                )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Ngày sinh
              </label>
              <input
                name="birthday"
                type="date"
                required
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                onChange={handleChange}
                value={formData.birthday}
              />
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              className="w-full bg-[var(--color-primary)] text-white py-2 rounded-lg font-bold
                      hover:bg-[var(--color-primary-light)] transition-all duration-300 button-hover cursor-pointer"
            >
              Đăng ký
            </button>

            {/* LINK TO LOGIN */}
            <div className="mt-6 text-center">
              <p className="text-sm text-[var(--color-text-main)] opacity-70">
                Đã có tài khoản?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/users/login")}
                  className="text-[var(--color-primary)] font-medium hover:underline cursor-pointer"
                >
                  Đăng nhập
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
