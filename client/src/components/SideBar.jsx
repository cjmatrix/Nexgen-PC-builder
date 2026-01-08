import React, { useState } from "react";
import {
  LayoutDashboard,
  Layers,
  Package,
  ShoppingCart,
  Users,
  BarChart2,

  Ticket,
  LogOut,
  Ban,
} from "lucide-react";
import { Link } from "react-router-dom";

const navItems = [
  { name: "Dashboard Home", icon: LayoutDashboard, link: "" },
  { name: "Component Management", icon: Layers, link: "/admin/components" },
  {
    name: "Category Management",
    icon: LayoutDashboard,
    link: "/admin/categories",
  },
  { name: "Product Management", icon: Package, link: "/admin/products" },
  { name: "Order Management", icon: ShoppingCart, link: "/admin/orders" },
  { name: "User Management", icon: Users, link: "/admin" },
  { name: "Sales & Reporting", icon: BarChart2, link: "/admin/sales-report" },
  { name: "Coupon Management", icon: Ticket, link: "/admin/coupons" },
  { name: "Blacklisted Items", icon: Ban, link: "/admin/blacklist" },
];

const Sidebar = ({ isOpen, onClose }) => {
  const [activeItem, setActiveItem] = useState("Dashboard Home");

  return (
    <>
      {isOpen && (
        <div
          className=" fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col w-70 h-screen bg-white border-r border-gray-200 font-sans transition-transform duration-300 ease-in-out
          md:static md:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="px-6 py-8 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">NexGen Admin</h1>

          <button
            onClick={onClose}
            className="md:hidden p-1 text-gray-500 hover:text-gray-700"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <ul>
            {navItems.map((item) => {
              const isActive = activeItem === item.name;
              const Icon = item.icon;

              return (
                <li key={item.name}>
                  <Link to={item?.link}>
                    <button
                      onClick={() => {
                        setActiveItem(item.name);

                        if (window.innerWidth < 768) onClose?.();
                      }}
                      className={`w-full flex items-center px-4 py-3 text-sm font-medium transition-colors rounded-lg group
                      ${
                        isActive
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }
                    `}
                    >
                      <Icon
                        className={`w-5 h-5 mr-3 transition-colors
                        ${
                          isActive
                            ? "text-gray-900"
                            : "text-gray-400 group-hover:text-gray-600"
                        }
                      `}
                      />
                      {item.name}
                    </button>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="px-4 py-6 border-t border-gray-100">
          <button className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-600 transition-colors rounded-lg hover:bg-gray-50 hover:text-gray-900 group">
            <LogOut className="w-5 h-5 mr-3 text-gray-400 transition-colors group-hover:text-gray-600" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
