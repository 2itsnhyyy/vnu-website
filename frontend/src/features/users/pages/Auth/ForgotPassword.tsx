import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  const [otpTimer, setOtpTimer] = useState<number>(2 * 60 * 60);
  const navigate = useNavigate();

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
    if (!otpString || otpString.length !== 6) {
      setErrors({ otp: "Mã OTP phải là 6 chữ số." });
      return false;
    }
    return true;
  };

  const validatePassword = (): boolean => {
    const trimmedNewPassword = newPassword.trim();
    if (!trimmedNewPassword || trimmedNewPassword.length < 8) {
      setErrors({ password: "Mật khẩu mới phải có ít nhất 8 ký tự." });
      return false;
    }
    if (trimmedNewPassword !== confirmPassword.trim()) {
      setErrors({ confirmPassword: "Mật khẩu xác nhận không khớp." });
      return false;
    }
    return true;
  };

  const handleRequestOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus(null);

    if (!validateEmail()) {
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setStatus({
        success: true,
        message: "Mã OTP đã được gửi tới email của bạn! (Demo mode - mã OTP: 123456)",
      });
      setStep("confirm");
      setOtpTimer(60 * 60);
      setOtp(["", "", "", "", "", ""]);
      setIsLoading(false);
    }, 1000);
  };

  const handleConfirmOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus(null);

    if (!validateOtp()) {
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const otpString = otp.join("");
      if (otpString === "123456") {
        setStatus({
          success: true,
          message: "Xác nhận OTP thành công! Vui lòng nhập mật khẩu mới.",
        });
        setStep("reset");
      } else {
        setStatus({
          success: false,
          message: "Mã OTP không đúng. (Demo mode - sử dụng: 123456)",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus(null);

    if (!validatePassword()) {
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setStatus({
        success: true,
        message: "Mật khẩu đã được đặt lại thành công! (Demo mode)",
      });
      setTimeout(() => {
        navigate("/users/login");
      }, 2000);
      setIsLoading(false);
    }, 1000);
  };

  const handleOtpChange = (index: number, value: string): void => {
    if (value.length > 1 && index === 0) {
      const pastedOtp = value.replace(/\D/g, "").slice(0, 6).split("");
      const newOtp = ["", "", "", "", "", ""];
      pastedOtp.forEach((digit, i) => {
        newOtp[i] = digit;
      });
      setOtp(newOtp);
      setErrors({});
      if (pastedOtp.length === 6) {
        const lastInput = document.getElementById("otp-5") as HTMLInputElement;
        lastInput?.focus();
      }
      return;
    }
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setErrors({});
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`) as HTMLInputElement;
      prevInput?.focus();
    }
  };

  useEffect(() => {
    if (step === "confirm" && otpTimer > 0) {
      const interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step, otpTimer]);

  useEffect(() => {
    setErrors({});
    setStatus(null);
  }, [step]);

  const formatTimer = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

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
          <h2 className="text-2xl font-bold text-[var(--color-text-main)] text-center mb-6">
            {step === "request" && "Quên mật khẩu"}
            {step === "confirm" && "Xác nhận OTP"}
            {step === "reset" && "Đặt lại mật khẩu"}
          </h2>

          {step === "request" && (
            <>
              <div className="text-center text-gray-600 mb-6">
                <p>Nhập email của bạn để nhận mã OTP</p>
              </div>
              <form onSubmit={handleRequestOtp} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors({});
                    }}
                    className="mt-1 w-full px-4 py-2 border border-[var(--color-surface-dim)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    placeholder="Nhập email đăng ký"
                  />
                  {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full bg-[var(--color-primary)] text-white cursor-pointer py-2 rounded-md font-medium transition-all duration-300 ${isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-[var(--color-primary-light)]"}`}
                >
                  {isLoading ? "Đang gửi..." : "Gửi OTP"}
                </button>
              </form>
            </>
          )}

          {step === "confirm" && (
            <>
              <div className="text-center text-gray-600 mb-6">
                <p>Nhập mã OTP được gửi đến {email}</p>
                <p className="text-sm mt-2">Thời gian còn lại: {formatTimer(otpTimer)}</p>
              </div>
              <form onSubmit={handleConfirmOtp} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Mã OTP <span className="text-red-500">*</span>
                  </label>
                  <div className="flex justify-between">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        maxLength={1}
                        className="w-12 h-12 text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 input-focus"
                      />
                    ))}
                  </div>
                  {errors.otp && <p className="text-red-500 text-sm">{errors.otp}</p>}
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full bg-primary-light cursor-pointer text-white py-2 rounded-lg font-bold transition-all duration-300 button-hover ${isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-yellow-600"
                    }`}
                >
                  {isLoading ? "Đang xác nhận..." : "Xác nhận OTP"}
                </button>
                <button
                  type="button"
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    const form = e.currentTarget.form;
                    if (form) {
                      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                      Object.defineProperty(submitEvent, 'target', { value: form, enumerable: true });
                      handleRequestOtp(submitEvent as any);
                    }
                  }}
                  disabled={isLoading}
                  className="mt-2 text-sm text-red-500 hover:underline w-full text-center cursor-pointer"
                >
                  Gửi lại OTP
                </button>
              </form>
            </>
          )}

          {step === "reset" && (
            <>
              <div className="text-center text-gray-600 mb-6">
                <p>Nhập mật khẩu mới cho {email}</p>
              </div>
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                    Mật khẩu mới <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setErrors({});
                    }}
                    className="mt-1 w-full px-4 py-2 border border-[var(--color-surface-dim)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    placeholder="Nhập mật khẩu mới"
                  />
                  {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Xác nhận mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setErrors({});
                    }}
                    className="mt-1 w-full px-4 py-2 border border-[var(--color-surface-dim)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    placeholder="Nhập lại mật khẩu mới"
                  />
                  {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full bg-primary-light cursor-pointer text-white py-2 rounded-lg font-bold transition-all duration-300 button-hover ${isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-yellow-600"
                    }`}
                >
                  {isLoading ? "Đang cập nhật..." : "Đặt lại mật khẩu"}
                </button>
              </form>
            </>
          )}

          {status && (
            <div className={`mt-4 text-center ${status.success ? "text-green-600" : "text-red-500"}`}>
              <p>{status.message}</p>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link to="/users/login" className="text-[var(--color-primary)] font-medium hover:underline cursor-pointer">
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}