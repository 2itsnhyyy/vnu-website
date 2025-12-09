import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import LogoKhongChu from "../../../../assets/logos/LogoKhongChu.svg";

interface Errors {
  otp?: string;
}

interface Status {
  success: boolean;
  message: string;
}

interface LocationState {
  email?: string;
}

export default function VerifyOtp() {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [otpTimer, setOtpTimer] = useState<number>(60 * 60);
  const navigate = useNavigate();
  const location = useLocation();
  const { email } = (location.state as LocationState) || {};

  useEffect(() => {
    if (!email) {
      navigate("/users/register");
    }
    if (otpTimer > 0) {
      const interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [otpTimer, email, navigate]);

  const validateOtp = (): boolean => {
    const otpString = otp.join("");
    if (!otpString || otpString.length !== 6) {
      setErrors({ otp: "Mã OTP phải là 6 chữ số." });
      return false;
    }
    return true;
  };

  const handleOtpChange = (index: number, value: string): void => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setErrors({});

    if (value && index < 5) {
      const nextInput = document.getElementById(
        `otp-${index + 1}`
      ) as HTMLInputElement;
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ): void => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(
        `otp-${index - 1}`
      ) as HTMLInputElement;
      prevInput?.focus();
    }
  };

  const handleConfirmOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus(null);

    if (!validateOtp()) return;

    setIsLoading(true);

    setTimeout(() => {
      const otpString = otp.join("");
      if (otpString === "123456") {
        setStatus({
          success: true,
          message: "Xác nhận OTP thành công! Đăng ký hoàn tất. (Demo mode)",
        });
        setTimeout(() => navigate("/users/login"), 2000);
      } else {
        setStatus({
          success: false,
          message: "Mã OTP không đúng. (Demo mode - sử dụng: 123456)",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    setStatus(null);

    setTimeout(() => {
      setStatus({
        success: true,
        message:
          "Mã OTP mới đã được gửi tới email của bạn! (Demo mode - mã OTP: 123456)",
      });
      setOtpTimer(60 * 60);
      setOtp(["", "", "", "", "", ""]);
      setIsLoading(false);
    }, 1000);
  };

  const formatTimer = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
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
            Xác nhận OTP
          </h2>
          <div className="text-center text-gray-600 mb-6">
            <p>Nhập mã OTP được gửi đến {email}</p>
            <p className="text-sm mt-2">
              Thời gian còn lại: {formatTimer(otpTimer)}
            </p>
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
                    className="w-12 h-12 text-center border border-[var(--color-surface-dim)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] input-focus"
                  />
                ))}
              </div>
              {errors.otp && (
                <p className="text-red-500 text-sm">{errors.otp}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`cursor-pointer w-full bg-[var(--color-primary)] text-white py-2 rounded-lg font-bold transition-all duration-300 button-hover ${
                isLoading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-[var(--color-primary-light)]"
              }`}
            >
              {isLoading ? "Đang xác nhận..." : "Xác nhận OTP"}
            </button>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={isLoading}
              className="mt-2 text-sm text-[var(--color-primary)] hover:underline w-full text-center button-hover cursor-pointer"
            >
              Gửi lại OTP
            </button>
          </form>
          {status && (
            <div
              className={`mt-4 text-center ${
                status.success
                  ? "text-green-600"
                  : "text-[var(--color-primary)]"
              }`}
            >
              <p>{status.message}</p>
            </div>
          )}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate("/users/register/common")}
              className="text-[var(--color-primary)] font-medium hover:underline cursor-pointer"
            >
              Quay lại đăng ký
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
