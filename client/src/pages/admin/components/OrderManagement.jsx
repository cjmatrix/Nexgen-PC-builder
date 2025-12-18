import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Clock,
  CheckCircle,
  Truck,
  Package,
  XCircle,
} from "lucide-react";
import api from "../../../api/axios";
import OrderDetailsModal from "./OrderDetailsModal";

const OrderManagement = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["adminOrders", page, search, statusFilter],
    queryFn: async () => {
      const params = {
        page,
        limit: 2,
        search: search || undefined,
        status: statusFilter !== "All" ? statusFilter : undefined,
      };
      const response = await api.get("/orders", { params });
      return response.data;
    },
    keepPreviousData: true,
  });

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const OrderStatusBadge = ({ status }) => {
    let color = "bg-gray-100 text-gray-800";
    let icon = <Clock className="w-3 h-3" />;

    switch (status) {
      case "Pending":
        color = "bg-amber-100 text-amber-800";
        break;
      case "Processing":
        color = "bg-blue-100 text-blue-800";
        icon = <Package className="w-3 h-3" />;
        break;
      case "Shipped":
        color = "bg-purple-100 text-purple-800";
        icon = <Truck className="w-3 h-3" />;
        break;
      case "Out for Delivery":
        color = "bg-indigo-100 text-indigo-800";
        icon = <Truck className="w-3 h-3" />;
        break;
      case "Delivered":
        color = "bg-green-100 text-green-800";
        icon = <CheckCircle className="w-3 h-3" />;
        break;
      case "Cancelled":
        color = "bg-red-100 text-red-800";
        icon = <XCircle className="w-3 h-3" />;
        break;
      default:
        break;
    }

    return (
      <span
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${color}`}
      >
        {icon}
        {status}
      </span>
    );
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
        <p className="text-gray-500 mt-1">Manage and track customer orders</p>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search Order ID, Customer Name..."
            value={search}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all placeholder:text-gray-400"
          />
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={handleStatusChange}
              className="pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none cursor-pointer text-sm font-medium text-gray-700 appearance-none min-w-[180px]"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Out for Delivery">Out For Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            {/* Custom Arrow for select */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                <path
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                  fillRule="evenodd"
                />
              </svg>
            </div>
          </div>

          {/* Date Filter (Placeholder for now) */}
          {/* <select className="..."> ... </select> */}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
                      Loading orders...
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-red-500">
                    Failed to load orders.
                  </td>
                </tr>
              ) : data?.orders?.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-500">
                    No orders found matching your criteria.
                  </td>
                </tr>
              ) : (
                data?.orders?.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-gray-50/60 transition-colors group"
                  >
                    <td className="py-4 px-6 text-sm font-medium text-gray-900">
                      {order.orderId || "#" + order._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {order.userName || order.shippingAddress.fullName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.userEmail}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                      <span className="text-xs text-gray-400 block">
                        {new Date(order.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm font-bold text-gray-900">
                      ₹{order.totalPrice?.toLocaleString()}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded ${
                          order.isPaid
                            ? "bg-green-50 text-green-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {order.isPaid ? "Paid" : "Pending"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleViewDetails(order)}
                        className="bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/10"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
            <p className="text-sm text-gray-600">
              Showing page <span className="font-bold">{page}</span> of{" "}
              <span className="font-bold">{data.pages}</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                disabled={page === data.pages}
                className="p-2 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      <OrderDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        order={selectedOrder}
      />
    </div>
  );
};

export default OrderManagement;
