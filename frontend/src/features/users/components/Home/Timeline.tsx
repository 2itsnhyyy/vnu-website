import React, { useEffect, useRef, useState } from "react";

const items = [
  {
    year: "1994",
    title: "Giai đoạn thành lập",
    description: {
      goal: "Giáo dục đại học cần đổi mới để hội nhập, xóa bỏ mô hình đơn ngành, lạc hậu.",
      event:
        "Ngày 27/1/1995, Chính phủ ban hành Nghị định 16-CP thành lập ĐHQG-HCM trên cơ sở sáp nhập 09 trường đại học lớn tại TP.HCM.",
      leader: "PGS.TS Trần Chí Đáo (Giám đốc đầu tiên).",
    },
  },
  {
    year: "1996",
    title: "Giai đoạn Xây dựng mô hình",
    description: {
      goal: "Tìm kiếm mô hình tổ chức hiệu quả và tiên tiến.",
      event:
        "Năm 2001, ĐHQG-HCM được tổ chức lại, tinh gọn bộ máy với 4 đơn vị thành viên nòng cốt (Bách khoa, KHTN, KHXH&NV, Viện MT&TN).",
      leader: "PGS.TS Nguyễn Tấn Phát.",
    },
  },
  {
    year: "2001",
    title: "Giai đoạn Hội nhập Quốc tế",
    description: {
      goal: "Đẩy mạnh tự chủ đại học gắn với trách nhiệm giải trình và xây dựng Khu đô thị đại học thông minh.",
      event:
        "Trở thành nơi quy tụ nhân tài, tiên phong đổi mới sáng tạo và hội nhập sâu rộng.",
      leader: "PGS.TS Phan Thanh Bình (từ 2007).",
    },
  },
  {
    year: "2016",
    title: "Giai đoạn Khẳng định và Phát triển",
    description: {
      goal: "Tập trung vào 3 đột phá: Quản trị hệ thống - Phát triển đội ngũ - Xây dựng cơ sở hạ tầng.",
      event:
        "Khẳng định vị thế đại học nghiên cứu đa ngành, chuẩn hóa chất lượng quốc tế.",
      leader: "PGS.TS Huỳnh Thành Đạt (từ 2017).",
    },
  },
  {
    year: "2021",
    title: "Giai đoạn Vươn tầm thế giới",
    description: {
      goal: "Trở thành cơ sở giáo dục đại học hàng đầu châu Á.",
      event:
        "Thu hút nhân tài, phát triển nghiên cứu liên ngành, xây dựng Trung tâm Đổi mới sáng tạo Quốc gia và tự chủ tài chính bền vững.",
      leader: "PGS.TS Vũ Hải Quân (từ 2021).",
    },
  },
];

const Timeline = () => {
  const refs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"));
            setActiveIndex((prev) => Math.max(prev, index));
          }
        });
      },
      { threshold: 0.4 }
    );

    refs.current.forEach((el) => el && observer.observe(el));
    return () => refs.current.forEach((el) => el && observer.unobserve(el));
  }, []);

  return (
    <div className="px-6 py-10 max-w-4xl mx-auto">
      {/* TITLE */}
      <div className="text-center mb-10">
        <h2 className="font-[Brushwell] text-3xl mb-2">Một hành trình dài</h2>
        <h2 className="text-5xl font-extrabold text-red uppercase">
          Lịch sử hình thành
        </h2>
      </div>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-1/2 top-0 w-1 -translate-x-1/2 h-full bg-blue-400"></div>

        {items.map((item, index) => (
          <div
            key={index}
            data-index={index}
            ref={(el) => (refs.current[index] = el)}
            className="grid grid-cols-[1fr_auto_1fr] gap-8 items-start mb-16 justify-center"
          >
            {/* YEAR */}
            <div className="text-right">
              <h3 className="text-5xl font-bold">{item.year}</h3>
            </div>

            {/* DOT */}
            <div className="relative flex flex-col items-center">
              <span
                className={`
          flex items-center justify-center w-6 h-6 rounded-full border-4 
          transition-all duration-500
          ${
            activeIndex >= index
              ? "bg-blue-500 border-blue-500"
              : "border-blue-500 bg-white"
          }
        `}
              ></span>
            </div>

            {/* CONTENT */}
            <div className="">
              <h4 className="text-3xl font-semibold mb-2 font-[Brushwell]">
                {item.title}
              </h4>

              <div className="space-y-1 text-gray-700">
                <p>
                  <span className="font-semibold">Mục tiêu:</span>{" "}
                  {item.description.goal}
                </p>
                <p>
                  <span className="font-semibold">Sự kiện:</span>{" "}
                  {item.description.event}
                </p>
                <p>
                  <span className="font-semibold">Lãnh đạo:</span>{" "}
                  {item.description.leader}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
