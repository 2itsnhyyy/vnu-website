import React from "react";
import { Link } from "react-router-dom";

const NewsCard = ({ id, title, image, date }) => {
  return (
    <Link
      to={`/news/${id}`}
      className="block rounded-2xl overflow-hidden shadow hover:shadow-lg transition-all duration-300 bg-white"
    >
      {/* Ảnh thumbnail */}
      <div className="relative w-full h-56 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* Nội dung dưới ảnh */}
      <div className="flex items-center px-4 py-4 text-gray-700">
        {/* Ngày đăng */}
        <div className="text-center mr-2">
          <p className="text-3xl font-bold leading-none">
            {new Date(date).getDate().toString().padStart(2, "0")}
          </p>
          <p className="text-xs text-gray-500">
            {`${(new Date(date).getMonth() + 1)
              .toString()
              .padStart(2, "0")}-${new Date(date).getFullYear()}`}
          </p>
        </div>

        {/* Dấu gạch đứng */}
        <div className="w-px h-12 bg-gray-300 mx-4" />

        {/* Tiêu đề */}
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-800 line-clamp-2">
            {title}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default NewsCard;