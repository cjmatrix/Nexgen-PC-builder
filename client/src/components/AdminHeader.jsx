import React from "react";
import { LogOut, Menu } from "lucide-react";

const AdminHeader = ({ onLogout, onMenuClick }) => {
  return (
    <header className="w-full bg-[#0f172a] text-white h-16 flex items-center justify-between px-6 shadow-md">
      {/* Logo / Title Section */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-1 hover:bg-white/10 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold tracking-wide">NexGen Admin Panel</h1>
      </div>

      {/* Right Side Actions */}
      <div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 bg-[#1e293b] hover:bg-[#334155] text-gray-200 text-sm font-medium rounded-lg border border-gray-700 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </header>
    
  );
};

export default AdminHeader;
