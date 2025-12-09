import PageMeta from "../../components/Common/PageMeta";
import IncidentTable from "../../components/Incident/IncidentTable";

const Forum = () => {
  return (
    <div>
      <PageMeta
        title="Incident | Admin Dashboard"
        description="This is Incident Dashboard"
      />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="col-span-12 xl:col-span-7">
          <IncidentTable />
        </div>
      </div>
    </div>
  );
};

export default Forum;
