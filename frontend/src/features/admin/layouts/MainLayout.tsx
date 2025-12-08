import Sidebar from "../components/General/Sidebar";
import Header from "../components/General/Header";
import type { ReactNode } from "react";

interface OrganizationLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<OrganizationLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-4 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
