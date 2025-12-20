import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  FileText,
  Package,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import api from "../../../../api/axios";
import UserOrderDetails from "./UserOrderDetails";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Pagination from "../../../../components/Pagination";

const OrderHistory = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["myOrders", search,page],
   queryFn: async () => {
  const response = await api.get("/orders/myorders", {
    params: {
      search: search || "",
      page: page,
      limit: 10,
    },
  });
  return response.data;
}
  });

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
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
      83
    );

    const tableColumn = ["Item", "Qty", "Price", "Total"];
    const tableRows = [];

    order.orderItems.forEach((item) => {
      const itemData = [
        item.name,
        item.qty,
        `${(item.price/100).toLocaleString()}`,
        `${((item.price * item.qty)/100).toLocaleString()}`,
      ];
      tableRows.push(itemData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 90,
    });

    const finalY = doc.lastAutoTable.finalY || 90;
    doc.text(
      `Total Amount: ${(order.totalPrice/100).toLocaleString()}`,
      14,
      finalY + 10
    );
    doc.text("Thank you for your business!", 105, finalY + 30, {
      align: "center",
    });

    doc.save(`invoice_${order.orderId}.pdf`);
  };

  const StatusBadge = ({ status }) => {
    let color = "bg-gray-100 text-gray-800";
    if (status === "Processing") color = "bg-blue-100 text-blue-800";
    if (status === "Shipped") color = "bg-purple-100 text-purple-800";
    if (status === "Delivered") color = "bg-green-100 text-green-800";
    if (status === "Cancelled") color = "bg-red-100 text-red-800";
    if (status === "Returned") color = "bg-orange-100 text-orange-800";

    return (
      <span
        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${color}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="bg-gray-100 min-h-screen p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Order History</h1>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
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
                onChange={(e) => setSearch(e.target.value)}
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
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 font-medium">
                  <tr>
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Total</th>
                    <th className="px-6 py-4 text-center">Invoice</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.orders.map((order) => (
                    <tr
                      key={order._id}
                      className="hover:bg-gray-50 transition-colors group"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {order.orderId}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900">
                        ₹{(order.totalPrice/100).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            generateInvoice(order);
                          }}
                          className="p-2 hover:bg-gray-200 rounded-full text-gray-500 hover:text-gray-900 transition-colors"
                          title="Download Invoice"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="text-blue-600 hover:text-blue-800 font-medium flex items-center justify-end gap-1"
                        >
                          View <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <UserOrderDetails
            isOpen={isDetailsOpen}
            onClose={() => setIsDetailsOpen(false)}
            order={selectedOrder}
          />
        </div>
      </div>
      {
        !isLoading&&<Pagination pagination={data.pagination} page={page} setPage={setPage}>

      </Pagination>
      }
    </div>
  );
};

export default OrderHistory;
