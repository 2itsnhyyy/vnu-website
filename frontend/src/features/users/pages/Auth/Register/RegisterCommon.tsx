import React, {
  useState,
  type FormEvent,
  type ChangeEvent,
  type FocusEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import LogoKhongChu from "../../../../../assets/logos/LogoKhongChu.svg";

interface FormData {
  username: string;
  email: string;
  password: string;
}

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  [key: string]: string | undefined;
}

const RegisterCommon: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value.trim() }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>): void => {};

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.username) newErrors.username = "Vui lòng nhập username.";

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(formData.email.trim()))
      newErrors.email = "Email không hợp lệ.";

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(formData.password))
      newErrors.password =
        "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.";

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    console.log("Đăng ký với mật khẩu:", formData.password);

    const dataToSubmit = {
      ...formData,
      email: formData.email.trim(),
      username: formData.username.trim(),
    };

    console.log("Dữ liệu đăng ký:", dataToSubmit);

    if (validateForm()) {
      console.log("Form hợp lệ, sẵn sàng gửi:", dataToSubmit);
      navigate("/users/register/details");
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
            ĐĂNG KÝ TÀI KHOẢN - THÔNG TIN CHUNG
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
                id="username"
                name="username"
                placeholder="Nhập username"
                value={formData.username}
                onChange={handleChange}
                onBlur={handleBlur}
                className="mt-1 w-full px-4 py-2 border border-[var(--color-surface-dim)] rounded-lg 
                        focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] input-focus"
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username}</p>
              )}
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-main)]">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Nhập email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className="mt-1 w-full px-4 py-2 border border-[var(--color-surface-dim)] rounded-lg 
                        focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] input-focus"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-main)]">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Nhập mật khẩu"
                value={formData.password}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-2 border border-[var(--color-surface-dim)] rounded-lg 
                        focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] input-focus"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
              <p className="text-xs text-[var(--color-text-main)] opacity-60 mt-1">
                Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường,
                số và ký tự đặc biệt.
              </p>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              className="w-full bg-[var(--color-primary)] text-white py-2 rounded-lg font-bold
                      hover:bg-[var(--color-primary-light)] transition-all duration-300 button-hover cursor-pointer"
            >
              Tiếp tục
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

export default RegisterCommon;
