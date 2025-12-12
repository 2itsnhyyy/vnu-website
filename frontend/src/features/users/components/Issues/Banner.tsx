import React from "react";
import banner from "../../../../assets/images/users/issues.jpg";
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
              Chú ý các sự cố!
            </p>
            <div className="text-white text-[40px] md:text-[60px] lg:text-[80px] font-bold leading-tight mt-5 mb-5 ">
              <p>Sự cố & Bảo trì</p>
            </div>
            <div className="text-white text-center text-[12px] md:text-[16px] lg:text-[20px] font-light leading-tight">
              <p>Những thông báo mới về các tòa nhà đang sửa chưa, bảo trì sẽ được cập nhật nhanh chóng nhất tại đây. Mong quý người dùng chú tâm để có được những trải nghiệm tốt nhất tại khu vực Đại học quốc gia - TP.HCM</p>
            </div>
            <div className="w-full h-px bg-white mt-10"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
