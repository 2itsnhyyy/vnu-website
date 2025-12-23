import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import type { News } from "../../types/news";
import PageMeta from "../../components/Common/PageMeta";
import { GrFormPrevious } from "react-icons/gr";
import { newsService } from "../../services/NewsService";
import dayjs from "dayjs";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ViewNews() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [news, setNews] = useState<News | null>(null);

  useEffect(() => {
    if (id) loadNews(Number(id));
  }, [id]);

  useEffect(() => {
    if (id) loadNews(Number(id));
    console.log(id);
  }, [id]);

  const loadNews = async (newsId: number) => {
    setLoading(true);
    try {
      const data = await newsService.getById(newsId);
      setNews(data);
    } catch (err) {
      console.error("Load post failed", err);
      setNews(null);
    } finally {
      setLoading(false);
    }
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
                type="text"
                name="createdAt"
                value={
                  news.createdAt
                    ? dayjs(news.createdAt).format("DD/MM/YYYY")
                    : ""
                }
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500/20 focus:border-base-500 outline-0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày cập nhật
              </label>
              <input
                type="text"
                name="updatedAt"
                value={
                  news.updatedAt
                    ? dayjs(news.updatedAt).format("DD/MM/YYYY")
                    : ""
                }
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500/20 focus:border-base-500 outline-0"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nội dung chi tiết
            </label>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-[400px] overflow-auto">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {news.contentMarkdown || ""}
              </ReactMarkdown>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
