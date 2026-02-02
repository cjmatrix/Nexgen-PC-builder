import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Menu,
  X,
  Cpu,
  ShoppingCart,
  User,
  Sparkles,
  LogOut,
  Wrench,
} from "lucide-react";
import { logout } from "../../../store/slices/authSlice";
import { fetchCart } from "../../../store/slices/cartSlice";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
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
      ? "bg-gray-900 text-white font-semibold text-sm px-5 py-2.5 rounded-full shadow-lg shadow-gray-900/20 transform scale-105 transition-all duration-300"
      : "text-gray-600 hover:text-gray-900 font-medium text-sm px-5 py-2.5 rounded-full hover:bg-gray-100 hover:shadow-sm hover:scale-105 active:scale-95 transition-all duration-200 ease-out";

  const getMobileNavLinkClass = ({ isActive }) =>
    isActive
      ? "block px-4 py-3 rounded-xl text-base font-bold text-white bg-gray-900 shadow-md transform scale-[1.02] transition-all"
      : "block px-4 py-3 rounded-xl text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:pl-6 transition-all duration-200";

  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full z-50 top-0 left-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div
            className="shrink-0 flex items-center cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <div className="bg-gray-900 p-1.5 rounded-lg mr-2 group-hover:scale-110 transition-transform duration-300">
              <Cpu className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors duration-300">
              NexGen PC Builder
            </span>
          </div>

          <div className="hidden xl:flex items-center space-x-2">
            <NavLink to="/" className={getNavLinkClass} end>
              Home
            </NavLink>
            <NavLink to="/products" className={getNavLinkClass}>
              Products
            </NavLink>
            <NavLink to="/deals" className={getNavLinkClass}>
              Deals
            </NavLink>
            <NavLink to="/community-builds" className={getNavLinkClass}>
              Community
            </NavLink>
          </div>

          <div className="hidden xl:flex items-center space-x-4">
            <NavLink
              to="/builder"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-sm shadow-lg shadow-blue-500/30 scale-105"
                    : "bg-blue-50 text-blue-600 font-bold text-sm border border-blue-200 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 hover:bg-blue-100"
                }`
              }
            >
              <Wrench className="h-4 w-4" />
              <span>Build PC</span>
            </NavLink>
            <div className="relative group">
              <NavLink
                to="/ai-assistant"
                className={({ isActive }) =>
                  `relative z-10 flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-violet-500/30 scale-105"
                      : "bg-violet-50 text-violet-700 font-bold text-sm border border-violet-200 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 hover:bg-violet-100"
                  }`
                }
              >
                <Sparkles className="h-4 w-4" />
                <span>AI Assistant</span>
              </NavLink>
            </div>
            {user ? (
              <div className="flex items-center space-x-3">
                <NavLink
                  to="/user/profile"
                  className={() =>
                    `flex items-center justify-center h-10 w-10 rounded-full transition-all duration-300 ${
                      location.pathname.startsWith("/user")
                        ? "bg-gray-900 text-white shadow-md scale-105 ring-2 ring-gray-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-110 active:scale-95"
                    }`
                  }
                >
                  <User className="h-5 w-5" />
                </NavLink>

                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 text-gray-600 hover:text-white hover:bg-red-500 transition-all duration-300 hover:shadow-md hover:scale-110 active:scale-95"
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
                      ? "text-gray-900 font-bold text-sm scale-105"
                      : "text-gray-600 hover:text-gray-900 font-medium text-sm transition-all hover:scale-105"
                  }
                >
                  Log in
                </NavLink>
                <NavLink
                  to="/signup"
                  className="bg-gray-900 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  Sign up
                </NavLink>
              </div>
            )}
            <NavLink
              to="/cart"
              className={({ isActive }) =>
                `relative flex items-center justify-center h-10 w-10 rounded-full transition-all duration-300 group ${
                  isActive
                    ? "bg-gray-900 text-white shadow-md scale-105"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-110 active:scale-95"
                }`
              }
            >
              <ShoppingCart className="h-5 w-5 group-hover:animate-bounce" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white shadow-sm animate-pulse">
                  {totalItems}
                </span>
              )}
            </NavLink>
          </div>

          <div className="xl:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-gray-600 hover:text-gray-900 focus:outline-none p-2 rounded-full hover:bg-gray-100 transition-all duration-300 active:scale-90"
            >
              <div
                className={`transition-all duration-300 ease-in-out transform ${
                  isOpen ? "rotate-90 scale-110" : "rotate-0 scale-100"
                }`}
              >
                {isOpen ? (
                  <X className="h-6 w-6 text-gray-900" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Backdrop */}
      <div
        className={`xl:hidden fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Mobile Menu Bottom Sheet */}
      <div
        className={`xl:hidden fixed bottom-0 left-0 w-full z-[70] bg-white rounded-t-3xl shadow-[0_-5px_30px_rgba(0,0,0,0.1)] transform transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1) ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="p-2 flex justify-center">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full mb-2"></div>
        </div>
        <div className="px-6 pb-8 space-y-2 max-h-[80vh] overflow-y-auto">
          <NavLink
            to="/"
            className={getMobileNavLinkClass}
            onClick={() => setIsOpen(false)}
            end
          >
            Home
          </NavLink>
          <NavLink
            to="/products"
            className={getMobileNavLinkClass}
            onClick={() => setIsOpen(false)}
          >
            Products
          </NavLink>
          <NavLink
            to="/deals"
            className={getMobileNavLinkClass}
            onClick={() => setIsOpen(false)}
          >
            Deals
          </NavLink>
          <NavLink
            to="/community-builds"
            className={getMobileNavLinkClass}
            onClick={() => setIsOpen(false)}
          >
            Community
          </NavLink>
          <NavLink
            to="/builder"
            className={getMobileNavLinkClass}
            onClick={() => setIsOpen(false)}
          >
            Build PC
          </NavLink>

          <NavLink
            to="/ai-assistant"
            onClick={() => setIsOpen(false)}
            className="w-full mt-4 flex items-center justify-center space-x-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 py-3 rounded-xl text-base font-bold shadow-lg hover:shadow-indigo-500/30 transition-all hover:scale-[1.02] active:scale-95"
          >
            <Sparkles className="h-5 w-5" />
            <span>AI Assistant</span>
          </NavLink>

          <div className="pt-6 border-t border-gray-100 mt-4 space-y-3">
            {user ? (
              <>
                <NavLink
                  to="/cart"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all active:scale-95"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-full shadow-sm">
                      <ShoppingCart className="h-5 w-5 text-gray-700" />
                    </div>
                    <span className="font-bold text-gray-700">My Cart</span>
                  </div>
                  {totalItems > 0 && (
                    <span className="bg-gray-900 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      {totalItems} items
                    </span>
                  )}
                </NavLink>

                <NavLink
                  to="/user/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all active:scale-95"
                >
                  <div className="bg-white p-2 rounded-full shadow-sm">
                    <User className="h-5 w-5 text-gray-700" />
                  </div>
                  <span className="font-bold text-gray-700">My Profile</span>
                </NavLink>

                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors mt-2 active:scale-95"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Log Out</span>
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center px-4 py-3 rounded-xl border border-gray-200 font-bold text-gray-700 hover:bg-gray-50 transition-all active:scale-95"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center px-4 py-3 rounded-xl bg-gray-900 text-white font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/20 active:scale-95"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
