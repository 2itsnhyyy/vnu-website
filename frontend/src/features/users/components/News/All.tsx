import React, { useEffect, useState } from "react";
import NewsCard from "./Card";
import newsService from "../../api/services/newsService";
import type { News } from "../../api/types/news.types";

const AllNews = () => {
  const [newsList, setNewsList] = useState<News[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchNews = async (currentPage: number) => {
    setLoading(true);
    try {
      const data = await newsService.getAll(currentPage, 9);
      setNewsList(data.news);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error("Lỗi khi tải tin tức:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const getPaginationGroup = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    }
    return rangeWithDots;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 mt-10">
      {loading ? (
        <div className="flex justify-center py-20 text-red-600 font-bold tracking-widest animate-pulse">
          ĐANG TẢI TIN TỨC...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsList.map((item) => (
              <NewsCard
                key={item.newsId}
                id={item.newsId}
                title={item.title}
                image={item.thumbnail}
                date={item.createdAt}
                contentMarkdown={item.contentMarkdown}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-16 mb-10">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="w-10 h-10 flex items-center justify-center border rounded-full hover:bg-gray-100 disabled:opacity-30 transition-all"
              >
                <span className="sr-only">Trước</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="flex items-center gap-1 sm:gap-2">
                {getPaginationGroup().map((item, index) => (
                  <button
                    key={index}
                    onClick={() => typeof item === "number" && setPage(item)}
                    disabled={item === "..."}
                    className={`min-w-[40px] h-10 px-2 rounded-lg font-semibold text-sm transition-all ${
                      page === item
                        ? "bg-red-600 text-white shadow-lg"
                        : item === "..."
                        ? "cursor-default text-gray-400"
                        : "bg-white border border-gray-200 text-gray-600 hover:border-red-500 hover:text-red-500"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className="w-10 h-10 flex items-center justify-center border rounded-full hover:bg-gray-100 disabled:opacity-30 transition-all"
              >
                <span className="sr-only">Sau</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AllNews;