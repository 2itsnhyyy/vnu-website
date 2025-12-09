import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import LogoKhongChu from "../../../../assets/logos/LogoKhongChu.svg";
interface Errors {
  password?: string;
  confirmPassword?: string;
}

interface Status {
  success: boolean;
  message: string;
}

export default function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status | null>(null);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [tokenMessage, setTokenMessage] = useState<string>("");

  useEffect(() => {
    const validateToken = async () => {
      setTimeout(() => {
        setIsTokenValid(true);
        setTokenMessage("Token hợp lệ");
      }, 1000);
    };

    validateToken();
  }, [token]);

  const validateForm = (): boolean => {
    const newErrors: Errors = {};

    if (!password) {
      newErrors.password = "Vui lòng nhập mật khẩu mới";
    } else if (password.length < 8) {
      newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự";
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = "Mật khẩu phải có ít nhất 1 chữ hoa";
    } else if (!/[a-z]/.test(password)) {
      newErrors.password = "Mật khẩu phải có ít nhất 1 chữ thường";
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = "Mật khẩu phải có ít nhất 1 số";
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      newErrors.password = "Mật khẩu phải có ít nhất 1 ký tự đặc biệt";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setStatus(null);

    setTimeout(() => {
      setStatus({
        success: true,
        message:
          "Mật khẩu đã được đặt lại thành công. Bạn có thể đăng nhập với mật khẩu mới. (Demo mode)",
      });

      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/users/login");
      }, 3000);

      setIsLoading(false);
    }, 1500);
  };

  if (isTokenValid === false) {
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
            <h2 className="text-2xl md:text-3xl font-bold text-center text-black mb-6">
              Đặt lại mật khẩu
            </h2>
            <div className="bg-[var(--color-surface)] border border-[var(--color-primary)] text-[var(--color-primary)] px-4 py-3 rounded mb-4">
              <p>
                {tokenMessage ||
                  "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn."}
              </p>
            </div>
            <div className="text-center mt-6">
              <p className="mb-4">
                Vui lòng yêu cầu liên kết đặt lại mật khẩu mới
              </p>
              <Link
                to="/users/forgot-password"
                className="bg-primary hover:bg-primary-light cursor-pointer text-white py-2 px-4 rounded-lg font-bold button-hover transition-all duration-300"
              >
                Quên mật khẩu
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isTokenValid === null) {
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
            <h2 className="text-2xl md:text-3xl font-bold text-center text-black mb-6">
              Đặt lại mật khẩu
            </h2>
            <div className="flex justify-center">
              <p>Đang xác thực liên kết đặt lại mật khẩu...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          <h2 className="text-2xl md:text-3xl font-bold text-center text-black mb-6">
            Đặt lại mật khẩu
          </h2>
          <div className="text-center text-gray-600 mb-6">
            <p>Nhập mật khẩu mới cho tài khoản của bạn</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Mật khẩu mới <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] input-focus"
                  placeholder="Nhập mật khẩu mới"
                />
                <button
                  type="button"
                  className="absolute right-0 top-0 h-full px-3 flex items-center text-sm leading-5 hover:text-[var(--color-primary)] transition-colors duration-200 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Ẩn" : "Hiện"}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường,
                số và ký tự đặc biệt.
              </p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Xác nhận mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrors((prev) => ({
                      ...prev,
                      confirmPassword: undefined,
                    }));
                  }}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] input-focus"
                  placeholder="Nhập lại mật khẩu mới"
                />
                <button
                  type="button"
                  className="absolute right-0 top-0 h-full px-3 flex items-center text-sm leading-5 hover:text-[var(--color-primary)] transition-colors duration-200 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Ẩn" : "Hiện"}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-[var(--color-primary)] cursor-pointer text-white py-2 rounded-lg font-bold transition-all duration-300 button-hover ${
                isLoading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-[var(--color-primary-light)]"
              }`}
            >
              {isLoading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
            </button>
          </form>

          {status && (
            <div
              className={`mt-4 text-center ${
                status.success ? "text-green-600" : "text-red-500"
              }`}
            >
              <p>{status.message}</p>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-[var(--color-primary)] font-medium hover:underline cursor-pointer"
            >
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
