import React from 'react';
import { LogOut } from 'lucide-react';

const AccountSidebar = ({ activePage = 'Profile Settings' }) => {
  const menuItems = [
    'Dashboard Overview',
    'Order History',
    'Saved Builds / Wishlist',
    'Profile Settings',
    'Wallet',
  ];

  return (
    <aside className="w-64 bg-gray-50/50 min-h-screen p-8 hidden md:block border-r border-gray-100 font-sans">
      <h2 className="text-lg font-bold text-slate-900 mb-8">My Account</h2>
      
      <nav className="space-y-1 mb-12">
        {menuItems.map((item) => (
          <button
            key={item}
            className={`w-full text-left px-4 py-3 text-sm font-medium rounded-r-none border-l-2 transition-all
              ${
                activePage === item
                  ? 'border-slate-900 text-slate-900 font-bold bg-white shadow-sm'
                  : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }
            `}
          >
            {item}
          </button>
        ))}
      </nav>

      <div className="pt-6">
        <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AccountSidebar;