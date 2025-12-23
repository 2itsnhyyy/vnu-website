import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../api/index"; // Import authService
import LogoKhongChu from "../../../../assets/logos/LogoKhongChu.svg";

type Step = "request" | "confirm" | "reset";

interface Errors {
  email?: string;
  otp?: string;
  password?: string;
  confirmPassword?: string;
}

interface Status {
  success: boolean;
  message: string;
}

export default function ForgotPassword() {
  const [email, setEmail] = useState<string>("");
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [step, setStep] = useState<Step>("request");
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [otpTimer, setOtpTimer] = useState<number>(120); // 2 phút cho OTP
  const navigate = useNavigate();

  // 1. Gửi yêu cầu mã OTP (API: forgotPassword)
  const handleRequestOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus(null);
    if (!validateEmail()) return;

    setIsLoading(true);
    try {
      const response = await authService.forgotPassword({ email });
      setStatus({ success: true, message: response.message || "Mã OTP đã được gửi!" });
      setStep("confirm");
      setOtpTimer(120);
      setOtp(["", "", "", "", "", ""]);
    } catch (error: any) {
      setStatus({ success: false, message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Xác thực mã OTP (API: verifyOtp)
  const handleConfirmOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus(null);
    if (!validateOtp()) return;

    setIsLoading(true);
    try {
      const otpCode = otp.join("");
      await authService.verifyOtp({ email, code: otpCode });
      
      setStatus({ success: true, message: "Xác thực thành công! Hãy nhập mật khẩu mới." });
      setStep("reset");
    } catch (error: any) {
      setStatus({ success: false, message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Đặt lại mật khẩu mới (API: resetPassword)
  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus(null);
    if (!validatePassword()) return;

    setIsLoading(true);
    try {
      await authService.resetPassword({
        password: newPassword,
        confirmPassword: confirmPassword
      });
      
      setStatus({ success: true, message: "Mật khẩu đã được thay đổi thành công!" });
      setTimeout(() => navigate("/users/login"), 2000);
    } catch (error: any) {
      setStatus({ success: false, message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // --- Các hàm Validate và Helpers (Giữ nguyên hoặc tinh chỉnh) ---
  const validateEmail = (): boolean => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email.trim())) {
      setErrors({ email: "Email không hợp lệ." });
      return false;
    }
    return true;
  };

  const validateOtp = (): boolean => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setErrors({ otp: "Vui lòng nhập đủ 6 chữ số." });
      return false;
    }
    return true;
  };

  const validatePassword = (): boolean => {
    if (newPassword.length < 8) {
      setErrors({ password: "Mật khẩu phải có ít nhất 8 ký tự." });
      return false;
    }
    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: "Mật khẩu xác nhận không khớp." });
      return false;
    }
    return true;
  };

  // Logic xử lý Input OTP (Tự động nhảy ô)
  const handleOtpChange = (index: number, value: string): void => {
    const char = value.slice(-1);
    if (!/^\d*$/.test(char)) return;

    const newOtp = [...otp];
    newOtp[index] = char;
    setOtp(newOtp);

    if (char && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  useEffect(() => {
    if (step === "confirm" && otpTimer > 0) {
      const interval = setInterval(() => setOtpTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [step, otpTimer]);

  const formatTimer = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <div className="w-full flex z-10">
        {/* Left: Background Image */}
        <div className="w-2/3 hidden md:block bg-contain bg-center bg-no-repeat bg-bg h-screen" 
             style={{ backgroundImage: `url(${LogoKhongChu})` }}>
        </div>

        {/* Right: Forms */}
        <div className="w-full md:w-1/2 bg-white p-20 flex flex-col justify-center h-screen">
          <h2 className="text-2xl font-bold text-[var(--color-text-main)] text-center mb-6">
            {step === "request" && "Quên mật khẩu"}
            {step === "confirm" && "Xác nhận OTP"}
            {step === "reset" && "Đặt lại mật khẩu"}
          </h2>

          {/* Form Step 1: Request Email */}
          {step === "request" && (
            <form onSubmit={handleRequestOtp} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  placeholder="Nhập email của bạn"
                  required
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              </div>
              <button disabled={isLoading} className="w-full bg-[var(--color-primary)] text-white py-2 rounded-md font-bold hover:opacity-90 disabled:bg-gray-400">
                {isLoading ? "Đang xử lý..." : "Gửi OTP"}
              </button>
            </form>
          )}

          {/* Form Step 2: Confirm OTP */}
          {step === "confirm" && (
            <form onSubmit={handleConfirmOtp} className="space-y-6">
              <div className="text-center text-sm mb-4">
                Mã đã gửi đến <b>{email}</b>. Hết hạn sau: <span className="text-red-500">{formatTimer(otpTimer)}</span>
              </div>
              <div className="flex justify-between gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    value={digit}
                    maxLength={1}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-full h-12 text-center border-2 rounded-lg focus:border-[var(--color-primary)] outline-none"
                  />
                ))}
              </div>
              <button disabled={isLoading} className="w-full bg-[var(--color-primary)] text-white py-2 rounded-md font-bold cursor-pointer">
                Xác nhận mã OTP
              </button>
              <button type="button" onClick={handleRequestOtp} className="w-full text-sm text-[var(--color-primary)] hover:underline cursor-pointer">
                Gửi lại mã
              </button>
            </form>
          )}

          {/* Form Step 3: Reset Password */}
          {step === "reset" && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Mật khẩu mới *</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Xác nhận mật khẩu *</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
              {(errors.password || errors.confirmPassword) && (
                <p className="text-red-500 text-sm">{errors.password || errors.confirmPassword}</p>
              )}
              <button disabled={isLoading} className="w-full bg-[var(--color-primary)] text-white py-2 rounded-md font-bold cursor-pointer">
                {isLoading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
              </button>
            </form>
          )}

          {status && (
            <div className={`mt-4 text-center text-sm ${status.success ? "text-green-600" : "text-red-500"}`}>
              {status.message}
            </div>
          )}

          <div className="mt-8 text-center">
            <Link to="/users/login" className="text-[var(--color-primary)] text-sm font-medium hover:underline">
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}