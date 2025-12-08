// pages/AllNews.jsx
import React, { useEffect, useState } from "react";
import NewsCard from "./Card";

const AllNews = () => {
  const [newsList, setNewsList] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchNews = async (currentPage) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/news?page=${currentPage}&limit=6`);
      const data = await res.json();
      setNewsList(data.news);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Lỗi khi tải tin tức:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(page);
  }, [page]);

  return (
    <div className="max-w-7xl mx-auto p-4 mt-10">
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="loader ease-linear rounded-full border-4 border-t-4 border-red h-12 w-12"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsList.map((item) => (
              <NewsCard
                key={item._id}
                id={item._id}
                title={item.title}
                image={item.thumbnail}
                description={item.content}
                date={item.date} 
              />
            ))}
          </div>

          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              ←
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-1 rounded ${
                  page === i + 1 ? "bg-red text-white" : "bg-gray-100 hover:bg-gray-300"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              →
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AllNews;