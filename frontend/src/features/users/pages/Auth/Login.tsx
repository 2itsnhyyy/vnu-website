import React, {
  useState,
  useEffect,
  type FormEvent,
  type ChangeEvent,
} from "react";
import { NavLink, useNavigate } from "react-router-dom";
import LogoKhongChu from "../../../../assets/logos/LogoKhongChu.svg";
import { authService } from "../../api/services/authService";
import { userService } from "../../api/services/userService";

interface LoginErrors {
  email?: string;
  password?: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errors, setErrors] = useState<LoginErrors>({});
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const newErrors: LoginErrors = {};
    if (!email.trim()) newErrors.email = "Email không được để trống";
    if (!password.trim()) newErrors.password = "Mật khẩu không được để trống";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      await authService.login({ email, password });

      const me = await userService.getMe();

      if (me.role === 1) {
        navigate("/admin", { replace: true });
      } else {
        navigate("/users", { replace: true });
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const redirectByRole = async () => {
      if (!authService.isAuthenticated()) return;

      try {
        const me = await userService.getMe();
        localStorage.setItem("user", JSON.stringify(me));

        if (me.role === 1) {
          navigate("/admin", { replace: true });
        } else {
          navigate("/users", { replace: true });
        }
      } catch {
        authService.logout();
      }
    };
    redirectByRole();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <div className="w-full flex z-10">
        {/* Left Half: Image */}
        <div
          className="w-2/3 hidden md:block bg-contain bg-center bg-no-repeat bg-bg h-screen"
          style={{ backgroundImage: `url(${LogoKhongChu})` }}
        ></div>

        {/* Right Half: Login Form */}
        <div className="w-full md:w-1/2 bg-white p-20 flex flex-col justify-center h-screen animate-fade-in">
          <h2 className="text-3xl font-bold text-center text-[var(--color-text-main)] mb-6 uppercase">
            Đăng nhập
          </h2>
          <div className="text-center text-gray-600 mb-8">
            <p>Chào mừng bạn trở lại với MyVNU!</p>
          </div>
          <div className="w-3/4 mx-auto h-px bg-[var(--color-surface-dim)] mb-8"></div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`mt-1 w-full px-4 py-2 border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-primary outline-none`}
                placeholder="email@vnu.edu.vn"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`mt-1 w-full px-4 py-2 border ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-primary outline-none`}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-primary"
                >
                  {showPassword ? "Ẩn" : "Hiện"}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-[var(--color-primary)] text-white py-3 rounded-lg font-bold transition-all ${
                isLoading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-primary-light"
              }`}
            >
              {isLoading ? "Đang xử lý..." : "ĐĂNG NHẬP"}
            </button>
          </form>

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-center text-red-600 text-sm">
              {errorMessage}
            </div>
          )}

          <div className="mt-6 text-center text-sm text-gray-600">
            Chưa có tài khoản?{" "}
            <NavLink
              to="/users/register"
              className="text-primary font-bold hover:underline"
            >
              Đăng ký ngay
            </NavLink>

                      <div className="mt-6 text-center text-sm text-gray-600">
            Quên mật khẩu?{" "}
            <NavLink
              to="/users/forgot-password"
              className="text-primary font-bold hover:underline"
            >
              Đặt lại mật khẩu
            </NavLink>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
