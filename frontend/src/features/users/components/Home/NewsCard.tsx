import React from "react";
import { FaRegCalendarAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const NewsCard = ({ item }) => {
  const navigate = useNavigate();

  const handleReadMore = () => {
    navigate(`/news/${item._id}`); // Đảm bảo item có _id
  };

  const formatDate = (rawDate) => {
    const date = new Date(rawDate);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
      <img
        src={
          item.thumbnail ||
          "https://vstatic.vietnam.vn/vietnam/resource/IMAGE/2025/4/16/0247546f97e14b3196d93b24ed84fe83"
        }
        alt="News"
        className="w-full h-48 object-cover"
      />
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          <p className="text-sm text-gray-500 flex items-center gap-1 mb-3">
            <FaRegCalendarAlt className="text-base" />
            {item.date ? formatDate(item.date) : "N/A"}
          </p>

          <h3
            className="text-lg font-semibold text-gray-800 mb-1 truncate"
            title={item.title}
          >
            {item.title}
          </h3>

          <p className="text-sm text-gray-600 line-clamp-3 mb-3 text-justify">
            {item.content || "Nội dung đang được cập nhật..."}
          </p>
        </div>

        <button
          onClick={handleReadMore}
          className="mt-auto w-full flex items-center justify-center gap-1 bg-yellow hover:bg-yellow-light text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          Đọc thêm <span className="text-base">→</span>
        </button>
      </div>
    </div>
  );
};

export default NewsCard;