import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {

  // Load sidebar state from localStorage
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    return localStorage.getItem("sidebar-collapsed") === "true";
  });

  // Save sidebar state whenever it changes
  useEffect(() => {
    localStorage.setItem(
      "sidebar-collapsed",
      String(collapsed)
    );
  }, [collapsed]);

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* Navbar */}
      <Navbar collapsed={collapsed} />

      {/* Main Content */}
      <main
        className={`pt-20 transition-all duration-300 ${
          collapsed
            ? "lg:ml-20"
            : "lg:ml-64"
        }`}
      >
        <div className="p-6">
          {children}
        </div>
      </main>

    </div>
  );
};

export default MainLayout;