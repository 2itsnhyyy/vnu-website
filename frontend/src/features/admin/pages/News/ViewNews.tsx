import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import type { News } from "../../types/news";
import { mockNews } from "../../types/news";
import PageMeta from "../../components/Common/PageMeta";
import { GrFormPrevious } from "react-icons/gr";

export default function ViewNews() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [news, setNews] = useState<News | null>(null);

  useEffect(() => {
    if (id) loadNews(Number(id));
  }, [id]);

  const loadNews = (newsId: number) => {
    setLoading(true);

    const found = mockNews.find((n) => n.newsId === newsId);

    setTimeout(() => {
      if (found) {
        setNews(found);
      }
      setLoading(false);
    }, 300);
  };

  if (loading && !news) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-600">Không tìm thấy tin tức</div>
      </div>
    );
  }

  return (
    <div>
      <PageMeta
        title={`Chỉnh sửa ${news.title} | Admin Dashboard`}
        description="Chỉnh sửa thông tin tin tức"
      />

      <div className="mb-6 flex items-center">
        <Link to="/admin/news">
          <GrFormPrevious className="w-6 h-6 mr-2 my-auto" />
        </Link>
        <h2 className="text-xl font-semibold text-gray-800">Xem tin tức</h2>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề
            </label>
            <input
              type="text"
              name="title"
              value={news.title || ""}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500/20 focus:border-base-500 outline-0"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày tạo
              </label>
              <input
                type="date"
                name="createdAt"
                value={news.createdAt || ""}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500/20 focus:border-base-500 outline-0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày cập nhật
              </label>
              <input
                type="date"
                name="updatedAt"
                value={news.updatedAt || ""}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500/20 focus:border-base-500 outline-0"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nội dung chi tiết
            </label>

            <textarea
              name="content"
              value={news.content || ""}
              disabled
              rows={9}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-base-500/20 focus:border-base-500 outline-0"
            ></textarea>
          </div>
        </form>
      </div>
    </div>
  );
}
