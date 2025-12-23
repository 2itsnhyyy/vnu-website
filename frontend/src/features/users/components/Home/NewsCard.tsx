import React from "react";
import { FaRegCalendarAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import type { News } from "../../api/types/news.types";
import ReactMarkdown from "react-markdown";

interface NewsCardProps {
  item: News;
}

const NewsCard = ({ item }: NewsCardProps) => {
  const navigate = useNavigate();

  const extractImage = (markdown: string) => {
    const match = markdown.match(/!\[.*?\]\((.*?)\)/);
    return match ? match[1] : null;
  };

  const displayThumbnail =
    item.thumbnail ||
    (item.contentMarkdown ? extractImage(item.contentMarkdown) : null);
  const handleReadMore = () => {
    navigate(`/users/news/${item.newsId}`);
  };

  const formatDate = (rawDate: string) => {
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
          displayThumbnail ||
          "https://via.placeholder.com/400x200?text=No+Image"
        }
        alt={item.title}
        className="w-full h-50 object-cover group-hover:scale-105 transition-transform duration-500"
        onError={(e) => {
          (e.target as HTMLImageElement).src =
            "https://via.placeholder.com/400x200?text=Image+Error";
        }}
      />
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          <p className="text-sm text-gray-500 flex items-center gap-1 mb-3">
            <FaRegCalendarAlt className="text-base" />
            {item.createdAt ? formatDate(item.createdAt) : "N/A"}
          </p>

          <h3
            className="text-lg font-semibold text-gray-800 mb-1 truncate"
            title={item.title}
          >
            {item.title}
          </h3>
        </div>

        <button
          onClick={handleReadMore}
          className="mt-auto w-full flex items-center justify-center gap-1 bg-primary hover:bg-primary-light text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
        >
          Đọc thêm <span className="text-base">→</span>
        </button>
      </div>
    </div>
  );
};

export default NewsCard;
