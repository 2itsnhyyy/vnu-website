import React, { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

interface MainLayoutProps {
  children?: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {children || <Outlet />} 
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;