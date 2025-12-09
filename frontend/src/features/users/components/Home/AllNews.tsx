import React from "react";
import { useNavigate } from "react-router-dom";
import NewsList from "./NewsList";

const AllNews = () => {
  const navigate = useNavigate();

  const handleSeeAllClick = () => {
    navigate("/users/news");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6"> 
        <div className="grid">
          <h2 className="font-[Brushwell] text-3xl mb-2">Cập nhật thông tin mới nhất</h2>
          <h2 className="text-5xl font-extrabold text-red uppercase">Tin tức & Sự kiện</h2>
        </div>
        <button
          onClick={handleSeeAllClick}
          className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-primary-light cursor-pointer transition-colors"
        >
          Tất cả
        </button>
      </div>

      <NewsList />
    </div>
  );
};

export default AllNews;