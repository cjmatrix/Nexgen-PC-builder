import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Menu,
  X,
  Cpu,
  ShoppingCart,
  User,
  Sparkles,
  LogOut,
} from "lucide-react";
import { logout } from "../store/slices/authSlice";
import { fetchCart } from "../store/slices/cartSlice";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);

  useEffect(() => {
    if (user) {
      dispatch(fetchCart());
    }
  }, [dispatch, user]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const getNavLinkClass = ({ isActive }) =>
    isActive
      ? "bg-gray-900 text-white font-semibold text-sm px-4 py-2 rounded-full shadow-md transition-all duration-300"
      : "text-gray-600 hover:text-gray-900 font-medium text-sm px-4 py-2 hover:bg-gray-50 rounded-full transition-all duration-300";

  const getMobileNavLinkClass = ({ isActive }) =>
    isActive
      ? "block px-4 py-3 rounded-xl text-base font-bold text-white bg-gray-900 shadow-md transform scale-[1.02] transition-all"
      : "block px-4 py-3 rounded-xl text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all";

  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full z-50 top-0 left-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div
            className="shrink-0 flex items-center cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="bg-gray-900 p-1.5 rounded-lg mr-2">
              <Cpu className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">
              NexGen PC Builder
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            <NavLink to="/" className={getNavLinkClass} end>
              Home
            </NavLink>
            <NavLink to="/products" className={getNavLinkClass}>
              Products
            </NavLink>
            <NavLink to="/deals" className={getNavLinkClass}>
              Deals
            </NavLink>
            <NavLink to="/builder" className={getNavLinkClass}>
              Build
            </NavLink>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <NavLink
              to="/ai-assistant"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                  isActive
                    ? "bg-linear-to-r from-violet-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-violet-500/30 scale-105"
                    : "bg-violet-50 text-violet-700 font-bold text-sm border border-violet-200 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 hover:bg-violet-100"
                }`
              }
            >
              <Sparkles className="h-4 w-4" />
              <span>AI Assistant</span>
            </NavLink>

            {user ? (
              <div className="flex items-center space-x-3">
                <NavLink
                  to="/user/profile"
                  className={({ isActive }) =>
                    `flex items-center justify-center h-10 w-10 rounded-full transition-all duration-300 ${
                      isActive
                        ? "bg-gray-900 text-white shadow-md scale-105"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105"
                    }`
                  }
                >
                  <User className="h-5 w-5" />
                </NavLink>

                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 text-gray-600 hover:text-white hover:bg-red-500 transition-all duration-300 hover:shadow-md hover:scale-105"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    isActive
                      ? "text-gray-900 font-bold text-sm"
                      : "text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors"
                  }
                >
                  Log in
                </NavLink>
                <NavLink
                  to="/signup"
                  className="bg-gray-900 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-800 shadow-md transition-all duration-300 hover:scale-105"
                >
                  Sign up
                </NavLink>
              </div>
            )}

            <NavLink
              to="/cart"
              className={({ isActive }) =>
                `relative flex items-center justify-center h-10 w-10 rounded-full transition-all duration-300 ${
                  isActive
                    ? "bg-gray-900 text-white shadow-md scale-105"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105"
                }`
              }
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white shadow-sm">
                  {totalItems}
                </span>
              )}
            </NavLink>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-gray-600 hover:text-gray-900 focus:outline-none p-2 rounded-full hover:bg-gray-100 transition-all duration-300"
            >
              <div
                className={`transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`}
              >
                {isOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </div>
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-lg">
          <div className="px-4 pt-2 pb-4 space-y-1">
            <NavLink
              to="/"
              className={getMobileNavLinkClass}
              onClick={() => setIsOpen(false)}
              end
            >
              Home
            </NavLink>
            <NavLink
              to="/build"
              className={getMobileNavLinkClass}
              onClick={() => setIsOpen(false)}
            >
              Build
            </NavLink>
            <NavLink
              to="/products"
              className={getMobileNavLinkClass}
              onClick={() => setIsOpen(false)}
            >
              Products
            </NavLink>

            <div className="pt-4 border-t border-gray-100 mt-2">
              <button className="w-full flex items-center justify-center space-x-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors mb-3">
                <Sparkles className="h-4 w-4" />
                <span>AI Assistant</span>
              </button>

              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 px-3 py-2">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                    <span className="font-medium text-gray-700">
                      {user.name || "User"}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Log out</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link
                    to="/login"
                    className="block w-full text-center px-4 py-2 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                    onClick={() => setIsOpen(false)}
                  >
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    className="block w-full text-center px-4 py-2 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
