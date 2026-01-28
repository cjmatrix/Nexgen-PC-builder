import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  RotateCcw,
  Ban,
  Calendar,
  Package,
  ArrowRight,
  CheckCircle,
  AlertOctagon,
} from "lucide-react";
import api from "../../../../api/axios";
import Pagination from "../../../../components/Pagination";
import { useNavigate } from "react-router-dom";

const BlacklistProducts = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchBlacklist = async () => {
    const response = await api.get("/blacklist", {
      params: { page, limit: 10, search: debouncedSearch },
    });
    return response.data;
  };

  const { data, isLoading } = useQuery({
    queryKey: ["blacklist", page, debouncedSearch],
    queryFn: fetchBlacklist,
    keepPreviousData: true,
  });

  const handleComponentView = async (item) => {
    navigate(`/admin/blacklist/${item._id}`, {
      state: { blacklistData: item },
    });
  };

  return (
    <div className="animate-fade-up font-sans space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Blacklisted Items
          </h1>
          <p className="text-gray-500 mt-1">
            Manage returned items and restore salvaged components to inventory.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by product, order ID, or reason..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                <th className="px-6 py-4">Product Details</th>
                <th className="px-6 py-4">Order Context</th>
                <th className="px-6 py-4">Return Reason</th>
                <th className="px-6 py-4">Recovery Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-gray-500">
                    <div className="flex justify-center items-center gap-2">
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></span>{" "}
                      Loading records...
                    </div>
                  </td>
                </tr>
              ) : data?.items?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-gray-500">
                    No blacklisted items found.
                  </td>
                </tr>
              ) : (
                data?.items?.map((item) => {
                  const isFullyRestored = item.components?.length === 0;
                  return (
                    <tr
                      key={item._id}
                      className="group hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
                            <Package className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {item.productName}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 font-mono">
                              PID: {item.productId?.slice(-6) || "N/A"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-medium text-gray-900">
                            Order #{item.orderId?.slice(-6)}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(item.blacklistedAt).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric" },
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 max-w-xs">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 text-red-700 text-xs font-medium border border-red-100">
                            <Ban className="w-3 h-3" />
                            {item.reason}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {isFullyRestored ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium border border-green-100">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Fully Restored
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium border border-amber-100">
                            <AlertOctagon className="w-3.5 h-3.5" />
                            {item.components?.length} Components Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleComponentView(item)}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            isFullyRestored
                              ? "bg-gray-100 text-gray-500 hover:bg-gray-200"
                              : "bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                          }`}
                        >
                          {isFullyRestored ? "View History" : "Inspect Items"}
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      {data?.total > 0 && (
        <Pagination
          pagination={{ page: data?.page, totalPages: data?.pages }}
          page={page}
          setPage={setPage}
        />
      )}
    </div>
  );
};

export default BlacklistProducts;
