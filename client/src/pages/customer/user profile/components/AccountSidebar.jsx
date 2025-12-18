import { NavLink } from "react-router-dom";

const AccountSidebar = () => {
  const menuItems = [
    // { label: 'Dashboard Overview', path: '/user' }, // Uncomment when Dashboard Overview is ready
    { label: "Order History", path: "/user/orders" },
    { label: "Saved Builds / Wishlist", path: "/user/wishlist" },
    { label: "Profile Settings", path: "/user/profile" },
    { label: "Wallet", path: "/user/wallet" },
  ];

  return (
    <aside className="w-64 bg-gray-50/50 min-h-screen p-8 hidden md:block border-r border-gray-100 font-sans">
      <h2 className="text-lg font-bold text-slate-900 mb-8">My Account</h2>

      <nav className="space-y-1 mb-12">
        {menuItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({
              isActive,
            }) => `block w-full text-left px-4 py-3 text-sm font-medium rounded-r-none border-l-2 transition-all
              ${
                isActive
                  ? "border-slate-900 text-slate-900 font-bold bg-white shadow-sm"
                  : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              }
            `}
          >
            {item.label}
          </NavLink>
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
