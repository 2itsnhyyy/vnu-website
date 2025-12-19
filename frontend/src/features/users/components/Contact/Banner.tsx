import React from "react";
import banner from "../../../../assets/images/users/contact.jpg";
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
              Liên hệ với chúng tôi
            </p>
            <div className="text-white text-[40px] md:text-[60px] lg:text-[80px] font-bold leading-tight mt-5 mb-5 ">
              <p>Khám phá & Đóng góp</p>
            </div>
            <div className="text-white text-center text-[12px] md:text-[16px] lg:text-[20px] font-light leading-tight">
              <p>Mỗi phản hồi của bạn giúp chúng tôi cải thiện chất lượng dữ liệu và trải nghiệm người dùng trên bản đồ 3D ĐHQG. Hãy cùng đóng góp ý kiến để xây dựng một hệ thống quản lý đồng bộ, trực quan và thông minh</p>
            </div>
            <div className="w-full h-px bg-white mt-10"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
