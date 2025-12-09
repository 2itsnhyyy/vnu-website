import PageMeta from "../../components/Common/PageMeta";
import PostTable from "../../components/Forum/PostTable";

const Forum = () => {
  return (
    <div>
      <PageMeta
        title="Forum | Admin Dashboard"
        description="This is Forum Dashboard"
      />
      <div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-6">
          Quản lý Forum
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="col-span-12 xl:col-span-7">
          <PostTable />
        </div>
      </div>
    </div>
  );
};

export default Forum;
