import React from "react";
import banner from "../../../../assets/images/users/banner.webp";
const Banner = () => {
  return (
    <div className="relative w-full">
      <div
        className="relative w-full h-full bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${banner})`,
          height: "100vh",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-red to-transparent"></div>
        <div className="absolute inset-0 bg-black opacity-50"></div>

        <div className="container mx-auto px-4 lg:px-0 flex flex-col lg:flex-row items-center justify-center">
          <div className="z-10 max-w-4xl w-full flex flex-col items-center justify-center gap-4 py-10 ml-15 md:py-[10vw] md:mb-[-30px]">
            <p className="text-white font-[Brushwell] text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              Nhiều điều thú vị đang chờ bạn khám phá
            </p>
            <div className="text-white text-[40px] md:text-[60px] lg:text-[80px] font-bold leading-tight mt-5 mb-5">
              <p>Hãy cùng nhau dạo một vòng ĐHQG-HCM nào!</p>
            </div>
            <div className="text-white text-[12px] md:text-[16px] lg:text-[20px] font-light leading-tight">
              <p>Thay đổi chỉ thật sự bắt đầu từ sự chung tay</p>
            </div>
            <div className="w-full h-px bg-white mt-10"></div>
            <div className="mt-[30px] lg:mt-[70px] flex flex-col lg:flex-row lg:items-center justify-between gap-5 lg:gap-[30px]">
              <div className="hover:scale-105 transition-all duration-300 text-center">
                <h2 className="text-[40px] leading-[56px] lg:text-[60px] lg:leading-[54px] font-bold text-surface">
                  8
                </h2>
                <p className="text-white mt-2 font-light">
                  Trường Đại học thành viên
                </p>
              </div>
              <div className="hover:scale-105 transition-all duration-300 text-center">
                <h2 className="text-[40px] leading-[56px] lg:text-[60px] lg:leading-[54px] font-bold text-surface">
                  10000+
                </h2>
                <p className="text-white mt-2 font-light">
                  Sinh viên đang theo học
                </p>
              </div>
              <div className="hover:scale-105 transition-all duration-300 text-center">
                <h2 className="text-[40px] leading-[56px] lg:text-[60px] lg:leading-[54px] font-bold text-surface">
                  6000+
                </h2>
                <p className="text-white mt-2 font-light">
                  Giảng viên & cán bộ công nhân viên
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
