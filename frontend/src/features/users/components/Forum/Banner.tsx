import banner from "../../../../assets/images/users/hero.png"
const Banner = () => {
  return (
    <div className="relative w-full">
      <div
        className="relative w-full h-full bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${banner})`,
          height: "70vh",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-red to-transparent"></div>
        <div className="absolute inset-0 bg-black opacity-50"></div>

        <div className="container mx-auto px-4 lg:px-0 flex flex-col lg:flex-row items-center justify-center h-full">
          <div className="z-10 max-w-4xl w-full flex flex-col items-center justify-center gap-4">
            <p className="text-white font-[Brushwell] text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              Tham gia trao đổi!
            </p>
            <div className="text-white text-[40px] md:text-[60px] lg:text-[80px] font-bold leading-tight mt-5 mb-5 ">
              <p>Diễn đàn chung</p>
            </div>
            <div className="text-white text-center text-[12px] md:text-[16px] lg:text-[20px] font-light leading-tight">
              <p>
                Nền tảng trực tuyến nơi mọi người có thể trao đổi, thảo luận và chia sẻ thông tin về các chủ đề trong Đại học quốc gia - TP.HCM. 
                Hãy cùng đóng góp và tạo nên một diễn đàn sôi nổi nhé!
              </p>
            </div>
            <div className="w-full h-px bg-white mt-10"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Banner
