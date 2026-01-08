import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, RotateCcw, Ban, Calendar, Package } from "lucide-react";
import api from "../../../api/axios";

const BlacklistProducts = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch API
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

  return (
    <div className="p-6 md:p-8 space-y-8 bg-white min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Blacklisted Items
          </h1>
          <p className="text-gray-500 mt-1">
            View damaged or defective returns that were not restocked.
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
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Blacklisted Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="text-center py-12 text-gray-500">
                    Loading records...
                  </td>
                </tr>
              ) : data?.items?.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-12 text-gray-500">
                    No blacklisted items found.
                  </td>
                </tr>
              ) : (
                data?.items?.map((item) => (
                  <tr
                    key={item._id}
                    className="group hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {item.productName}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            ID: {item.productId || "N/A"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                        {item.orderId}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2 max-w-xs">
                        <Ban className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700 font-medium">
                          {item.reason}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Date(item.blacklistedAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data?.total > 0 && (
          <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium">{data.items.length}</span>{" "}
              of <span className="font-medium">{data.total}</span> results
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= data?.pages}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlacklistProducts;
