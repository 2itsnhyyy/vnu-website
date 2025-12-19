import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import type { Incident } from "../../types/incident";
import { mockIncidents } from "../../types/incident";
import PageMeta from "../../components/Common/PageMeta";
import { GrFormPrevious } from "react-icons/gr";

export default function ViewIncident() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [incident, setIncident] = useState<Incident | null>(null);

  useEffect(() => {
    if (id) loadNews(Number(id));
  }, [id]);

  const loadNews = (incidentId: number) => {
    setLoading(true);

    const found = mockIncidents.find((i) => i.incidentId === incidentId);

    setTimeout(() => {
      if (found) {
        setIncident(found);
      }
      setLoading(false);
    }, 300);
  };

  if (loading && !incident) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-600">Không tìm thấy sự cố</div>
      </div>
    );
  }

  return (
    <div>
      <PageMeta
        title={`Chỉnh sửa ${incident.title} | Admin Dashboard`}
        description="Chỉnh sửa thông tin sự cố"
      />

      <div className="mb-6 flex items-center">
        <Link to="/admin/incidents">
          <GrFormPrevious className="w-6 h-6 mr-2 my-auto" />
        </Link>
        <h2 className="text-xl font-semibold text-gray-800">Xem sự cố</h2>
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
              value={incident.title || ""}
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
                value={incident.createdAt || ""}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500/20 focus:border-base-500 outline-0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tình trạng
              </label>
              <input
                type="text"
                name="status"
                value={incident.status === 0 ? "Mới" : "Đã giải quyết"}
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
              value={incident.content || ""}
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
