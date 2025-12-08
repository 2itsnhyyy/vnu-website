import React from "react";
import { useNavigate } from "react-router-dom";
import PlaceCardUSSH from "./PlaceCardUSSH";
import PlaceCardIU from "./PlaceCardIU";

const Places = () => {
  const navigate = useNavigate();

  const handleSeeAllClick = () => {
    navigate("/search/campaign");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="grid">
          <h2 className="font-[Brushwell] text-3xl mb-2">
            Tham quan để biết chi tiết
          </h2>
          <h2 className="text-5xl font-extrabold text-red uppercase">Bản đồ</h2>
        </div>
        <button
          onClick={handleSeeAllClick}
          className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-primary-light cursor-pointer"
        >
          Tất cả
        </button>
      </div>

      {/* Thêm khoảng cách giữa các card */}
      <div className="flex flex-col gap-50">
        <PlaceCardUSSH />
        <PlaceCardIU />
      </div>
    </div>
  );
};

export default Places;
