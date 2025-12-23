import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "../../api/index";
import LogoKhongChu from "../../../../assets/logos/LogoKhongChu.svg";

export default function VerifyOtp() {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate("/users/register");
    }
  }, [email, navigate]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length < 6) return alert("Vui lòng nhập đủ 6 số");

    setIsLoading(true);
    try {
      await authService.verifyOtp({
        email: email,
        code: otpCode
      });
      
      alert("Xác thực thành công! Bạn có thể đăng nhập ngay.");
      navigate("/users/login");
    } catch (error: any) {
      alert(error.message || "Mã OTP không chính xác");
    } finally {
      setIsLoading(false);
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
