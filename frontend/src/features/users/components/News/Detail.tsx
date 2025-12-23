import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import newsService from "../../api/services/newsService";
import type { News } from "../../api/types/news.types";
import banner from "../../../../assets/images/users/hero.png"

const Detail = () => {
  const { id } = useParams<{ id: string }>();
  const [news, setNews] = useState<News | null>(null);
  const [latestNews, setLatestNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [detailRes, latestRes] = await Promise.all([
          newsService.getById(id),
          newsService.getAll(1, 5)
        ]);
        setNews(detailRes.news);
        setLatestNews(latestRes.news);
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  if (loading) return (
    <div className="flex justify-center items-center h-screen text-red-600 font-bold">
      Đang tải...
    </div>
  );
  
  if (!news) return <p className="p-4 text-center">Không tìm thấy bài viết.</p>;

  return (
    <div className="w-full">
   <div className="relative w-full">
      <div
        className="relative w-full h-full bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${banner})`,
          height: "70vh",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-red to-transparent"></div>
        <div className="absolute inset-0 bg-black opacity-50"></div>

        <div className="container mx-auto px-4 lg:px-0 flex flex-col lg:flex-row items-center justify-center h-full">
          <div className="z-10 max-w-4xl w-full flex flex-col items-center justify-center gap-4">
            <p className="text-white font-[Brushwell] text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              Tham gia trao đổi!
            </p>
            <div className="text-white text-[40px] md:text-[60px] lg:text-[80px] font-bold leading-tight mt-5 mb-5 ">
              <p>Diễn đàn chung</p>
            </div>
            <div className="text-white text-center text-[12px] md:text-[16px] lg:text-[20px] font-light leading-tight">
              <p>
                Nền tảng trực tuyến nơi mọi người có thể trao đổi, thảo luận và chia sẻ thông tin về các chủ đề trong Đại học quốc gia - TP.HCM. 
                Hãy cùng đóng góp và tạo nên một diễn đàn sôi nổi nhé!
              </p>
            </div>
            <div className="w-full h-px bg-white mt-10"></div>
          </div>
        </div>
      </div>
    </div>

      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <h1 className="text-4xl font-extrabold mb-4 text-gray-900 leading-tight">
            {news.title}
          </h1>
          <p className="text-gray-500 mb-6 flex items-center gap-2">
            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold uppercase">Tin tức</span>
            • Ngày đăng: {new Date(news.createdAt).toLocaleDateString("vi-VN")}
          </p>
          
          {news.thumbnail && (
            <div className="rounded-2xl overflow-hidden mb-8 shadow-xl">
              <img src={news.thumbnail} alt={news.title} className="w-full h-auto object-cover" />
            </div>
          )}
          
          <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-line text-justify leading-relaxed">
            {news.contentMarkdown}
          </div>
        </div>
        
        <div className="space-y-8">
          <div className="bg-gray-50 p-6 rounded-2xl">
            <h2 className="text-xl font-bold border-b-2 border-red-500 pb-2 mb-6 uppercase tracking-wider">
              Tin mới nhất
            </h2>
            <div className="space-y-6">
              {latestNews.filter(item => item.newsId.toString() !== id).map((item) => (
                <Link to={`/news/${item.newsId}`} key={item.newsId} className="group flex gap-4 items-start">
                  <div className="w-24 h-20 flex-shrink-0 overflow-hidden rounded-lg shadow-sm">
                    <img 
                      src={item.thumbnail || "https://via.placeholder.com/100"} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                      alt={item.title}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold line-clamp-2 group-hover:text-red-600 transition-colors">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Detail;