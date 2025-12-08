import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const Detail = () => {
  const { id } = useParams();
  const [news, setNews] = useState(null);
  const [latestNews, setLatestNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await axios.get(`/api/news/${id}`);
        setNews(res.data);
      } catch (err) {
        console.error("Lỗi khi lấy chi tiết bài viết:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchLatestNews = async () => {
      try {
        const res = await axios.get("/api/news?page=1&limit=5");
        setLatestNews(res.data.news);
      } catch (err) {
        console.error("Lỗi khi lấy bài viết mới nhất:", err);
      }
    };

    fetchNews();
    fetchLatestNews();
  }, [id]);

  if (loading) return <p className="p-4 text-center">Đang tải...</p>;
  if (!news) return <p className="p-4 text-center">Không tìm thấy bài viết.</p>;

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-30">
        {/* Left Side - Nội dung bài viết */}
        <div className="lg:col-span-2">
          <h1 className="font-[Brushwell] text-3xl pb-2 text-red">
            Câu chuyện
          </h1>
          <h1 className="text-3xl font-bold text-black mb-4 text-justify">
            {news.title}
          </h1>
          <p className="text-gray-500 text-sm mb-4">
            Ngày đăng: {new Date(news.datePosted).toLocaleDateString("vi-VN")}
          </p>
          <img
            src={news.thumbnail}
            alt={news.title}
            className="w-full h-auto object-cover rounded-lg mb-6"
          />
          <div className="text-gray-800 leading-relaxed whitespace-pre-line text-justify">
            {news.content}
          </div>
        </div>

        {/* Right Side - Tin mới nhất */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-800 border-b pb-2">
            TIN MỚI NHẤT
          </h2>
          {latestNews
            .filter((item) => item._id !== id)
            .map((item) => (
              <Link
                to={`/news/${item._id}`}
                key={item._id}
                className="block hover:opacity-90"
              >
                <div className="flex gap-3">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-24 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800 text-justify">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{item.date}</p>
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Detail;