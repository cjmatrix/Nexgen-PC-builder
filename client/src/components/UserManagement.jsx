import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Search, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import {
  getUsers,
  blockUser,
  setSearch,
  setPage,
  reset,
} from "../store/slices/userSlice";
import { logout, reset as authReset } from "../store/slices/authSlice";
import {
  FaSearch,
  FaTrash,
  FaBan,
  FaCheck,
  FaSignOutAlt,
} from "react-icons/fa";
import UsersList from "./UsersList";
import Pagination from "./Pagination";
const UserManagement = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { users, isLoading, isError, message, page, totalPages, search } =
    useSelector((state) => state.users);

  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    dispatch(getUsers({ page, limit: 2, search }));
    return () => {
      dispatch(reset());
    };
  }, [page, search, dispatch]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      dispatch(setSearch(searchInput));
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchInput, dispatch]);

  const handleResetSearch = () => {
    setSearchInput("");
    dispatch(setSearch(""));
  };

  console.log("ree");

  console.log(page);
  const handleLogout = () => {
    dispatch(logout());
    dispatch(authReset());
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans ">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
        >
          <FaSignOutAlt /> Logout
        </button>
      </div>

      {/* Header Section */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800">User Management</h1>

        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search Users..."
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10 pr-4 py-2 border border-transparent rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white w-64 shadow-sm placeholder-gray-400"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider"
                >
                  User ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider"
                >
                  Email
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider"
                >
                  Role
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider"
                >
                  Registered Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <UsersList user={user} key={user._id}></UsersList>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <Pagination totalCount={totalPages} setPage={setPage}></Pagination>
      </div>
    </div>
  );
};

export default UserManagement ;
