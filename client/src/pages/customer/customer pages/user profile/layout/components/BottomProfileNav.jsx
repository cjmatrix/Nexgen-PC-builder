import React from "react";
import { NavLink } from "react-router-dom";
import { Package, Heart, User, Wallet, Share2 } from "lucide-react";

const BottomProfileNav = () => {
  const navItems = [
    { label: "Profile", path: "/user/profile", icon: User },
    { label: "Orders", path: "/user/orders", icon: Package },
    { label: "Wallet", path: "/user/wallet", icon: Wallet },
    { label: "Wishlist", path: "/user/wishlist", icon: Heart },
    { label: "Refer", path: "/user/referral", icon: Share2 },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 px-6 py-2 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-safe">
      <div className="flex justify-between items-center">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 ${
                isActive
                  ? "text-gray-900 scale-105"
                  : "text-gray-400 hover:text-gray-600"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`p-1.5 rounded-full transition-all duration-300 ${
                    isActive ? "bg-gray-900 text-white" : "bg-transparent"
                  }`}
                >
                  <item.icon className="w-5 h-5" strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-bold">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default BottomProfileNav;
