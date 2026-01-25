import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import AccountSidebar from "./components/AccountSidebar";
import BottomProfileNav from "./components/BottomProfileNav";

function UserDashboard() {
  const location = useLocation();

  return (
    <div className="bg-gray-100 min-h-screen flex justify-center pb-24 md:pb-0">
      <div className="flex w-full max-w-7xl">
        <AccountSidebar />
        <div className="flex-1 overflow-hidden" key={location.pathname}>
          <div className="h-full">
            <Outlet />
          </div>
        </div>
      </div>
      <BottomProfileNav />
    </div>
  );
}

export default UserDashboard;
