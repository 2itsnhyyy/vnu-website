import PageMeta from "../../components/Common/PageMeta";
import NewsTable from "../../components/News/NewsTable";

const News = () => {
  return (
    <div>
      <PageMeta
        title="News | Admin Dashboard"
        description="This is News Dashboard"
      />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="col-span-12 xl:col-span-7">
          <NewsTable />
        </div>
      </div>
    </div>
  );
};

export default News;
