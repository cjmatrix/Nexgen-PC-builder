import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminComponents,
  deleteComponent,
} from "../../../store/slices/componentSlice";
import { Link } from "react-router-dom";
import {
  Edit,
  Trash2,
  Plus,
  Search,
  ChevronDown,
  RefreshCcw,
} from "lucide-react";

import Pagination from "../../../components/Pagination";

function tierList(tier) {
  switch (tier) {
    case 1:
      return " Entry ";
    case 2:
      return " Budget ";
    case 3:
      return " Mid-Range ";
    case 4:
      return " High-end ";
    case 5:
      return " Ultra ";
    default:
      return " Unknown ";
  }
}

const ComponentManagement = () => {
  const dispatch = useDispatch();

  const { items, pagination, loading } = useSelector(
    (state) => state.components
  );

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("");

  useEffect(() => {
    dispatch(fetchAdminComponents({ page, search, category, status, sort }));
  }, [dispatch, page, search, category, status, sort]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearch(searchInput);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchInput]);

  const handleToggleStatus = (id, currentStatus) => {
    const action = currentStatus ? "deactivate" : "activate";
    if (window.confirm(`Are you sure you want to ${action} this item?`)) {
      dispatch(deleteComponent(id));
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 1:
        return "bg-gray-100 text-gray-800";
      case 2:
        return "bg-green-100 text-green-800";
      case 3:
        return "bg-blue-100 text-blue-800";
      case 4:
        return "bg-purple-100 text-purple-800";
      case 5:
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Component Management
        </h1>
        <Link
          to="/admin/components/create"
          className="flex items-center gap-2 bg-[#0f172a] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add New Component
        </Link>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
       
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search Components..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all outline-none"
          />
        </div>

        <div className="flex gap-3">
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="">All Categories</option>
              <option value="cpu">CPU</option>
              <option value="gpu">GPU</option>
              <option value="motherboard">Motherboard</option>
              <option value="ram">RAM</option>
              <option value="storage">Storage</option>
              <option value="case">Case</option>
              <option value="psu">PSU</option>
              <option value="cooler">Cooler</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              onChange={(e) => setStatus(e.target.value)}
              className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="">Status All</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="">Sort By: Newest</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="stock_low">Stock: Low to High</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="px-6 py-4">Image</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Tier</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-500">
                    No components found.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-gray-50/80 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 bg-white flex items-center justify-center">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900 text-sm">
                        {item.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 capitalize">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      ₹{item.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {item.stock}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getTierColor(
                          item.tier_level
                        )}`}
                      >
                        Tier {item.tier_level} ({tierList(item.tier_level)})
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          item.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {item.isActive ? "Available" : "Unavailable"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Link
                          to={`/admin/components/edit/${item._id}`}
                          className="text-gray-500 hover:text-blue-600 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() =>
                            handleToggleStatus(item._id, item.isActive)
                          }
                          className={`transition-colors ${
                            item.isActive
                              ? "text-gray-500 hover:text-red-600"
                              : "text-gray-500 hover:text-green-600"
                          }`}
                          title={item.isActive ? "Deactivate" : "Activate"}
                        >
                          {item.isActive ? (
                            <Trash2 className="w-4 h-4" />
                          ) : (
                            <RefreshCcw className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      
        <Pagination
          pagination={pagination}
          page={page}
          setPage={setPage}
        ></Pagination>
      </div>
    </div>
  );
};

export default ComponentManagement;
