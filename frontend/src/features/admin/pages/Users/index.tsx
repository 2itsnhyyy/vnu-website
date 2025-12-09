import PageMeta from "../../components/Common/PageMeta";
import UserTable from "../../components/User/UserTable";

const Users = () => {
  return (
    <div>
      <PageMeta
        title="Users | Admin Dashboard"
        description="This is Users Dashboard"
      />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="col-span-12 xl:col-span-7">
          <UserTable />
        </div>
      </div>
    </div>
  );
};

export default Users;
