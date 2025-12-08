import React, { useEffect, useState } from "react";
import NewsCard from "./NewsCard";
import axios from "axios";

const NewsList = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get("/api/news");

        console.log("Dữ liệu API trả về:", response.data);

        let newsArray = [];

        if (Array.isArray(response.data.news)) {
          newsArray = response.data.news;
        }

        setNews(newsArray);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu tin tức:", error);
        setNews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return <div className="text-center mt-10 text-lg">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {news.length === 0 ? (
        <div className="text-center text-gray-500">Không có tin tức nào.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {news.map((item, idx) => (
            <NewsCard key={item._id || idx} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default NewsList;