import React, { useState, useEffect, type FormEvent, type ChangeEvent } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import LogoKhongChu from "../../../../assets/logos/LogoKhongChu.svg";

interface LoginErrors {
  email?: string
  password?: string
}

interface UserData {
  user_id: number
  name: string
  avatar?: string
  email: string
  birthday: string
  role: number
}

interface LoginResponse {
  token: string
  user: UserData
}

const Login: React.FC = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [errors, setErrors] = useState<LoginErrors>({})
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [initialCheckDone, setInitialCheckDone] = useState<boolean>(false)

  const validateForm = (): boolean => {
    const newErrors: LoginErrors = {}
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/

    if (!emailRegex.test(email.trim())) {
      newErrors.email = "Email không hợp lệ."
    }

    if (!password.trim()) {
      newErrors.password = "Mật khẩu không được để trống."
    } else if (password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setErrorMessage("")
    setIsLoading(true)

    const trimmedEmail = email.trim()
    const loginPassword = password

    if (!validateForm()) {
      setIsLoading(false)
      return
    }

    try {
      console.log("Đang đăng nhập với email:", trimmedEmail)

      // Giả lập delay network
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Giả lập response từ API
      const mockResponse: LoginResponse = {
        token: "mock-jwt-token-" + Date.now(),
        user: {
          user_id: 1,
          name: "Nguyễn Văn A",
          avatar: "https://i.pravatar.cc/150?img=1",
          email: trimmedEmail,
          birthday: "1990-01-01",
          role: 0
        }
      }

      const data = mockResponse
      console.log("Phản hồi từ server:", JSON.stringify(data, null, 2))

      // Kiểm tra dữ liệu trả về
      if (!data.token || !data.user) {
        throw new Error("Dữ liệu đăng nhập không hợp lệ từ server")
      }

      // Kiểm tra role - chỉ cho phép role = 0
      if (data.user.role !== 0) {
        throw new Error("Bạn không có quyền truy cập vào hệ thống này")
      }

      console.log("User data:", data.user)

      // Lưu vào localStorage
      localStorage.setItem("userData", JSON.stringify(data.user))
      localStorage.setItem("token", data.token)

      console.log("Đăng nhập thành công, chuyển hướng đến dashboard")

      // Chuyển hướng đến dashboard
      navigate("/dashboard", { replace: true })

      setIsLoading(false)
    } catch (err) {
      console.error("Lỗi đăng nhập:", err)
      const error = err as Error
      let userMessage = error.message || "Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại."

      if (
        error.message.includes("Mật khẩu không đúng") ||
        error.message.includes("không tìm thấy") ||
        error.message.includes("không tồn tại")
      ) {
        userMessage = "Email hoặc mật khẩu không đúng."
      } else if (error.message.includes("không có quyền")) {
        userMessage = "Bạn không có quyền truy cập vào hệ thống này."
      } else if (error.message.includes("500")) {
        userMessage = "Lỗi server, vui lòng thử lại sau hoặc liên hệ hỗ trợ."
      } else if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
        userMessage = "Không thể kết nối đến server. Vui lòng kiểm tra server hoặc kết nối mạng."
      }
      setErrorMessage(userMessage)
      setIsLoading(false)
    }
  }

  // Kiểm tra nếu user đã đăng nhập, chuyển hướng đến dashboard
  useEffect(() => {
    if (!initialCheckDone) {
      console.log("Login - Initial check for existing user")

      const savedUserData = localStorage.getItem("userData")
      const savedToken = localStorage.getItem("token")

      if (savedUserData && savedToken) {
        try {
          const parsedUser: UserData = JSON.parse(savedUserData)
          console.log("Login - Found existing user in localStorage:", parsedUser.email)

          // Kiểm tra role
          if (parsedUser.role === 0) {
            console.log("Login - Redirecting to dashboard (from localStorage)")
            navigate("/dashboard", { replace: true })
          } else {
            // Xóa thông tin nếu role không hợp lệ
            localStorage.removeItem("userData")
            localStorage.removeItem("token")
          }
        } catch (e) {
          console.error("Login - Error parsing userData from localStorage:", e)
          localStorage.removeItem("userData")
          localStorage.removeItem("token")
        }
      } else {
        console.log("Login - No existing user found in localStorage")
      }

      setInitialCheckDone(true)
    }
  }, [navigate, initialCheckDone])

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <div className="w-full flex z-10">
        {/* Left Half: Image */}
        <div className="w-2/3 hidden md:block bg-contain bg-center bg-no-repeat bg-bg h-screen" style={{
          backgroundImage: `url(${LogoKhongChu})`
        }}>
        </div>
        {/* Right Half: Login Form */}
        <div className="w-full md:w-1/2 bg-white p-20 fade-in flex flex-col justify-center h-screen">
          <h2 className="text-7xl md:text-3xl font-bold text-center text-[var(--color-text-main)] mb-6">ĐĂNG NHẬP</h2>
          <div className="text-center text-gray-600 mb-8">
            <p>Chào mừng bạn trở lại với MyVNU!</p>
          </div>
          <div className="w-3/4 mx-auto h-px bg-[var(--color-surface-dim)] mb-8"></div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setEmail(e.target.value)
                  setErrors((prev) => ({ ...prev, email: "" }))
                }}
                className="mt-1 w-full px-4 py-2 border border-[var(--color-surface-dim)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] input-focus"
                placeholder="Nhập email của bạn"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setPassword(e.target.value)
                    setErrors((prev) => ({ ...prev, password: "" }))
                  }}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 input-focus"
                  placeholder="Nhập mật khẩu của bạn"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 hover:text-[var(--color-primary)] transition-colors duration-200"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Ẩn" : "Hiện"}
                </button>
              </div>
              {errors.password && <p className="text-[var(--color-primary)] text-sm mt-1">{errors.password}</p>}
              <div className="text-right mt-2">
                <NavLink
                  to="/users/forgot-password"
                  className="text-sm text-[var(--color-primary)] hover:underline"
                >
                  Quên mật khẩu?
                </NavLink>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-[var(--color-primary)] cursor-pointer text-white py-2 rounded-lg font-bold transition-all duration-300 button-hover ${isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-[var(--color-primary-light)]" }`}
            >
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>
          {errorMessage && (
            <div className="mt-4 text-center text-red-500">
              <p>
                {errorMessage}{" "}
                <a href="#" onClick={() => window.location.reload()} className="underline">
                  Thử lại
                </a>
              </p>
            </div>
          )}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Chưa có tài khoản?{" "}
              <NavLink
                to="/users/register/common"
                className="text-[var(--color-primary)] font-medium hover:underline"
              >
                Đăng ký ngay
              </NavLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login