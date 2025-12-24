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
      ? "text-gray-900 font-bold text-sm"
      : "text-gray-500 hover:text-gray-900 font-medium transition-colors text-sm";

  const getMobileNavLinkClass = ({ isActive }) =>
    isActive
      ? "block px-3 py-2 rounded-md text-base font-medium text-gray-900 bg-gray-50"
      : "block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50";

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

          <div className="hidden md:flex items-center space-x-8">
            <NavLink to="/" className={getNavLinkClass} end>
              Home
            </NavLink>
            <NavLink to="/build" className={getNavLinkClass}>
              Build
            </NavLink>
            <NavLink to="/products" className={getNavLinkClass}>
              Products
            </NavLink>
            <NavLink to="/components" className={getNavLinkClass}>
              Components
            </NavLink>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link to="/ai-assistant">
              <button className="flex items-center space-x-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                <Sparkles className="h-4 w-4" />
                <span>AI Assistant</span>
              </button>
            </Link>

            {user ? (
              <div className="flex items-center space-x-3">
                <Link to="/user/profile">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 cursor-pointer transition-colors">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 font-medium text-sm"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}
            <Link to="/cart">
              <div className="relative flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 cursor-pointer transition-colors">
                <ShoppingCart className="h-5 w-5 text-gray-600" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
                    {totalItems}
                  </span>
                )}
              </div>
            </Link>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
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
              to="/products"
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
            <NavLink
              to="/products"
              className={getMobileNavLinkClass}
              onClick={() => setIsOpen(false)}
            >
              Components
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
