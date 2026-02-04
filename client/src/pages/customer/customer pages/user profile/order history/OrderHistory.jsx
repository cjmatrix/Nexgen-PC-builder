import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  FileText,
  Package,
  ChevronRight,
  AlertCircle,
  Wrench,
  Sparkles,
} from "lucide-react";
import api from "../../../../../api/axios";
import UserOrderDetails from "./components/UserOrderDetails";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Pagination from "../../../../../components/Pagination";
import { useEffect } from "react";
import ScrollToTop from "../../../../../components/ScrollToTop";
const OrderHistory = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [detailsLoadingId, setDetailsLoadingId] = useState(null); // Track which order is loading

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearchInput(search);
      setPage(1);
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  // Fetch the list of orders
  const { data, isLoading, isError } = useQuery({
    queryKey: ["myOrders", searchInput, page],
    queryFn: async () => {
      const response = await api.get("/orders/myorders", {
        params: {
          search: searchInput || "",
          page: page,
          limit: 9,
        },
      });
      return response.data;
    },
  });

  const handleViewDetails = async (orderId) => {
    if (detailsLoadingId) return;
    setDetailsLoadingId(orderId);
    try {
      const data = await queryClient.fetchQuery({
        queryKey: ["order", orderId],
        queryFn: async () => {
          const response = await api.get(`/orders/${orderId}`);
          return response.data;
        },
        staleTime: 1000 * 60 * 5,
      });
      setSelectedOrder(data);
      setIsDetailsOpen(true);
    } catch (error) {
      console.error("Failed to fetch order details", error);
    } finally {
      setDetailsLoadingId(null);
    }
  };

  const generateInvoice = (order) => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("INVOICE", 105, 20, { align: "center" });

    doc.setFontSize(10);
    doc.text(`Order ID: ${order.orderId}`, 14, 40);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 14, 46);
    doc.text(`Status: ${order.status}`, 14, 52);

    doc.text("Bill To:", 14, 65);
    doc.text(order.shippingAddress.fullName, 14, 71);
    doc.text(order.shippingAddress.address, 14, 77);
    doc.text(
      `${order.shippingAddress.city}, ${order.shippingAddress.postalCode}`,
      14,
      83,
    );

    const tableColumn = ["Item", "Qty", "Price", "Total"];
    const tableRows = [];

    order.orderItems.forEach((item) => {
      const basePrice = item.price / 100;
      const discount = item.discount || 0;
      const discountedPrice = basePrice * (1 - discount / 100);
      const lineTotal = discountedPrice * item.qty;

      const priceDisplay =
        discount > 0
          ? `${basePrice.toLocaleString()} (-${discount}%)`
          : `${basePrice.toLocaleString()}`;

      const itemData = [
        item.name,
        item.qty,
        priceDisplay,
        `${lineTotal.toLocaleString()}`,
      ];
      tableRows.push(itemData);
    });

    const shipping = (order.shippingPrice || 0) / 100;
    if (shipping > 0) {
      tableRows.push([
        "Shipping Charges",
        "",
        "",
        `${shipping.toLocaleString()}`,
      ]);
    }

    const coupon = order.couponDiscount || 0;
    if (coupon > 0) {
      tableRows.push([
        "Coupon Discount",
        "",
        "",
        `-${coupon.toLocaleString()}`,
      ]);
    }

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 90,
    });

    const finalY = doc.lastAutoTable.finalY || 90;
    doc.text(
      `Total Amount: ${(order.totalPrice / 100).toLocaleString()}`,
      14,
      finalY + 10,
    );
    doc.text("Thank you for your business!", 105, finalY + 30, {
      align: "center",
    });

    doc.save(`invoice_${order.orderId}.pdf`);
  };

  const StatusBadge = ({ status }) => {
    let color = "bg-gray-50 text-gray-700 border-gray-200";
    let dotColor = "bg-gray-500";

    // Professional SaaS-style color mapping
    if (status === "Processing") {
      color = "bg-blue-50 text-blue-700 border-blue-200";
      dotColor = "bg-blue-500";
    }
    if (status === "Shipped") {
      color = "bg-indigo-50 text-indigo-700 border-indigo-200";
      dotColor = "bg-indigo-500";
    }
    if (status === "Delivered") {
      color = "bg-emerald-50 text-emerald-700 border-emerald-200";
      dotColor = "bg-emerald-500";
    }
    if (status === "Cancelled") {
      color = "bg-red-50 text-red-700 border-red-200";
      dotColor = "bg-red-500";
    }
    if (status === "Returned" || status === "Return Approved") {
      color = "bg-slate-50 text-slate-700 border-slate-200";
      dotColor = "bg-slate-500";
    }
    if (status === "Return Requested") {
      color = "bg-orange-50 text-orange-700 border-orange-200";
      dotColor = "bg-orange-500";
    }

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${color} shadow-sm capitalize`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
        {status}
      </span>
    );
  };

  return (
    <div className="animate-fade-up bg-gray-50/50 min-h-screen p-4 md:p-8 font-sans pb-24 md:pb-8">
      <ScrollToTop page={page}></ScrollToTop>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-2">
            Order History
          </h1>
          <p className="text-gray-500 font-medium text-lg">
            Track and manage your recent purchases
          </p>
        </div>
        <div className="animate-fade-up bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className=" p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
              <p className="text-sm text-gray-500 mt-1">
                Track and manage your orders
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Order ID..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-gray-500">
              Loading orders...
            </div>
          ) : isError ? (
            <div className="p-12 text-center text-red-500 flex flex-col items-center gap-2">
              <AlertCircle className="w-8 h-8" />
              <p>Failed to load orders.</p>
            </div>
          ) : data?.length === 0 ? (
            <div className="p-12 text-center text-gray-500 flex flex-col items-center gap-2">
              <Package className="w-12 h-12 text-gray-300" />
              <p>No orders found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.orders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-auto group"
                >
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-5 pb-4 border-b border-gray-50">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">
                        Order #{order.orderId}
                      </p>
                      <p className="text-xs font-medium text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  {/* Order Images Stack */}
                  <div className="flex items-center mb-6 pl-2 min-h-[48px]">
                    {order.orderItems.slice(0, 4).map((item, index) => {
                      const image =
                        item.isCustomBuild && !item.isAiBuild
                          ? "/custom-pc.png"
                          : item.image || "https://placehold.co/100";
                      return (
                        <div
                          key={item._id || index}
                          className="relative w-14 h-14 rounded-full border-[3px] border-white -ml-3 shadow-md hover:scale-110 hover:z-20 transition-all cursor-pointer bg-white overflow-hidden"
                          title={item.name}
                          style={{ zIndex: 10 - index }}
                        >
                          <img
                            src={image}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-full"
                          />
                          {item.isCustomBuild && !item.isAiBuild && (
                            <div className="absolute inset-0 bg-purple-500/10 flex items-center justify-center">
                              <Wrench className="w-4 h-4 text-purple-600" />
                            </div>
                          )}
                          {item.isAiBuild && (
                            <div className="absolute inset-0 bg-indigo-500/10 flex items-center justify-center">
                              <Sparkles className="w-4 h-4 text-indigo-600" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {order.orderItems.length > 4 && (
                      <div
                        className="relative w-10 h-10 rounded-full border-[3px] border-white -ml-3 bg-gray-50 shadow-sm flex items-center justify-center text-xs font-bold text-gray-500 z-0"
                        title={`${order.orderItems.length - 4} more items`}
                      >
                        +{order.orderItems.length - 4}
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Total Amount
                      </span>
                      <span className="text-lg font-bold text-gray-900">
                        ₹{(order.totalPrice / 100).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center gap-3 pt-2 mt-auto">
                    {(order.status==="Delivered" || order.status==="Return Approved" || order.status==="Returned" ) && <button
                      onClick={(e) => {
                        e.stopPropagation();
                        generateInvoice(order);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 hover:text-gray-900 transition-colors py-2.5 rounded-lg border border-gray-200"
                      title="Download Invoice"
                    >
                      <FileText className="w-4 h-4" />
                      Invoice
                    </button>
                    }
                    <button
                      onClick={() => handleViewDetails(order._id)}
                      disabled={detailsLoadingId === order._id}
                      className="flex-1 flex items-center justify-center gap-1 text-xs font-bold text-white bg-gray-900 hover:bg-black transition-all py-2.5 rounded-lg shadow-gray-200 hover:shadow-lg disabled:opacity-50 disabled:shadow-none"
                    >
                      {detailsLoadingId === order._id ? (
                        "Loading..."
                      ) : (
                        <>
                          View Details <ChevronRight className="w-3 h-3" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <UserOrderDetails
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          order={selectedOrder}
        />
      </div>
      {!isLoading && (
        <Pagination
          pagination={data.pagination}
          page={page}
          setPage={setPage}
        ></Pagination>
      )}
    </div>
  );
};

export default OrderHistory;
