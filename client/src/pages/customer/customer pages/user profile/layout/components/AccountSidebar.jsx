import React, { useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Package,
  Heart,
  User,
  Wallet,
  Share2,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { logout } from "../../../../../../store/slices/authSlice";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const AccountSidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const menuItems = [
    { label: "Profile", path: "/user/profile", icon: User },
    { label: "Orders", path: "/user/orders", icon: Package },
    { label: "Wishlist", path: "/user/wishlist", icon: Heart },
    { label: "Wallet", path: "/user/wallet", icon: Wallet },
    { label: "Refer & Earn", path: "/user/referral", icon: Share2 },
  ];

  const handleLogout = async () => {
    await dispatch(logout()).unwrap();
    navigate("/login");
  };

  useGSAP(
    () => {
      gsap.to(".nav-item", {
        x: 0,
        opacity: 1,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
      });
    },
    { scope: containerRef },
  );

  return (
    <aside
      ref={containerRef}
      className="w-64 bg-white min-h-screen p-6 hidden md:flex flex-col border-r border-gray-100 font-sans shadow-sm z-30 relative"
    >
      <div className="mb-10 px-4">
        <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
          My Account
        </h2>
        <p className="text-xs text-gray-400 mt-1 font-medium">
          Manage your personal settings
        </p>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({
              isActive,
            }) => `nav-item opacity-0 -translate-x-[20px] flex items-center gap-3 px-4 py-3.5 text-sm font-bold rounded-xl transition-all duration-200 group relative overflow-hidden
              ${
                isActive
                  ? "bg-gray-900 text-white shadow-lg shadow-gray-900/20"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }
            `}
          >
            <item.icon className="w-5 h-5 relative z-10" />
            <span className="relative z-10">{item.label}</span>

            {/* Hover Effect */}
            <div className="absolute inset-0 bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-0 rounded-xl mix-blend-multiply"></div>
          </NavLink>
        ))}
      </nav>

      <div className="pt-6 border-t border-gray-100 mt-6">
        <button
          onClick={handleLogout}
          className="nav-item opacity-0 -translate-x-[20px] w-full flex items-center gap-3 px-4 py-3.5 text-sm font-bold text-red-500 rounded-xl hover:bg-red-50 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AccountSidebar;
