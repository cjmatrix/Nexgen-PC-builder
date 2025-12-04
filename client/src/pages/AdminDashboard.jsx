import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/SideBar";
import { Menu } from "lucide-react";
import AdminHeader from "../components/AdminHeader";
function AdminDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader onMenuClick={() => setIsSidebarOpen(true)} />

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
