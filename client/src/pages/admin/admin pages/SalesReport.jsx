import { useState, useEffect } from "react";
import autoTable from "jspdf-autotable";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import api from "../../../api/axios";
import {
  FaIndianRupeeSign,
  FaCalendar,
  FaFilePdf,
  FaFileExcel,
  FaTags,
} from "react-icons/fa6";
import { FaShoppingCart, FaChartLine, FaBoxOpen } from "react-icons/fa";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useQuery } from "@tanstack/react-query";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const StatsCard = ({ title, value, icon, color, delay }) => {
  useGSAP(() => {
    gsap.fromTo(
      ".stats-card",
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.1 }
    );
  }, []);

  const colorClasses = {
    purple: "bg-purple-100 text-purple-600",
    pink: "bg-pink-100 text-pink-600",
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
  };

  return (
    <div className="stats-card bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4 transition-all hover:shadow-md">
      <div
        className={`p-3 rounded-lg ${
          colorClasses[color] || "bg-gray-100 text-gray-600"
        } text-2xl`}
      >
        {icon}
      </div>
      <div>
        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">
          {title}
        </p>
        <h3 className="text-2xl font-bold text-gray-800 mt-1">
          {typeof value === "number" &&
          (title.includes("Revenue") ||
            title.includes("Discount") ||
            title.includes("Value"))
            ? `₹${value.toLocaleString()}`
            : value}
        </h3>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 p-3 rounded-lg shadow-lg">
        <p className="text-gray-600 mb-1 text-sm font-semibold">{label}</p>
        {payload.map((entry, index) => (
          <p
            key={index}
            className="text-sm font-bold"
            style={{ color: entry.color }}
          >
            {entry.name}:{" "}
            {entry.name.includes("Revenue")
              ? `₹${entry.value.toLocaleString()}`
              : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Fetch Functions
const fetchSalesReport = async ({ queryKey }) => {
  const [_, { startDate, endDate, interval }] = queryKey;
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  if (interval) params.append("interval", interval);

  const { data } = await api.get(`/admin/sales-report?${params.toString()}`);
  return data;
};

const fetchSalesInsights = async (reportData) => {
  const { data } = await api.post("/admin/sales-insights", reportData);
  return data.insights;
};

const SalesReport = () => {
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [interval, setInterval] = useState("daily");

  const {
    data,
    isLoading: loading,
    isError,
  } = useQuery({
    queryKey: ["salesReport", { ...dateRange, interval }],
    queryFn: fetchSalesReport,
    staleTime: 1000 * 60 * 5,
  });

  const handleDownloadPDF = () => {
    if (!data) return;
    const doc = new jsPDF();
    doc.text("Sales Report", 14, 20);
    autoTable(doc,{
      startY: 30,
      head: [["Date", "Orders", "Revenue (INR)"]],
      body: data.salesOverTime.map((item) => [
        item._id,
        item.dailyOrders,
        item.dailyRevenue.toLocaleString(),
      ]),
    });
    doc.save("sales_report.pdf");
  };

  const handleDownloadExcel = () => {
    if (!data) return;
    const worksheet = XLSX.utils.json_to_sheet(
      data.salesOverTime.map((item) => ({
        Date: item._id,
        Orders: item.dailyOrders,
        Revenue: item.dailyRevenue,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "sales_report.xlsx");
  };

  const {
    data: insights,
    isLoading: insightsLoading,
    isFetching: insightsFetching,
    isError: insightsError,
    refetch: refetchInsights,
  } = useQuery({
    queryKey: ["salesInsights", data],
    queryFn: () => fetchSalesInsights(data),
    enabled: false,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  useGSAP(() => {
    if (!loading && data) {
      gsap.from(".chart-container", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
      });
    }
  }, [loading, data]);

  if (loading)
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );

  if (isError || !data)
    return (
      <div className="text-gray-500 text-center mt-20">
        Failed to load sales data.
      </div>
    );

  const { stats, salesOverTime, topProducts, orderStatusStats } = data;

  const STATUS_COLORS = {
    Pending: "#f59e0b",
    Processing: "#3b82f6",
    Shipped: "#8b5cf6",
    "Out for Delivery": "#a855f7",
    Delivered: "#10b981",
    Cancelled: "#ef4444",
    "Return Requested": "#f97316",
    "Return Approved": "#06b6d4",
    "Return Rejected": "#94a3b8",
  };

  const COLORS = ["#8b5cf6", "#ec4899", "#3b82f6", "#10b981"];

  return (
    <div className="p-8 bg-gray-100 min-h-screen font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Sales Intelligence
          </h1>
          <p className="text-gray-500 text-sm">
            Real-time financial analytics and performance metrics
          </p>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={interval}
            onChange={(e) => setInterval(e.target.value)}
            className="p-2 border rounded-lg text-sm bg-white"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>

          <div className="flex items-center gap-2 bg-white p-1 border rounded-lg">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, startDate: e.target.value })
              }
              className="text-sm p-1 outline-none"
            />
            <span className="text-gray-400">-</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, endDate: e.target.value })
              }
              className="text-sm p-1 outline-none"
            />
          </div>

          <button
            onClick={handleDownloadPDF}
            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            title="Download PDF"
          >
            <FaFilePdf />
          </button>
          <button
            onClick={handleDownloadExcel}
            className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
            title="Download Excel"
          >
            <FaFileExcel />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
        <StatsCard
          title="Total Revenue"
          value={stats.totalRevenue}
          icon={<FaIndianRupeeSign />}
          color="purple"
        />
        <StatsCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={<FaShoppingCart />}
          color="pink"
        />
        <StatsCard
          title="Avg. Order Value"
          value={Math.round(stats.avgOrderValue)}
          icon={<FaChartLine />}
          color="blue"
        />
        <StatsCard
          title="Products Sold"
          value={data.topProducts.reduce(
            (acc, curr) => acc + curr.totalSold,
            0
          )}
          icon={<FaBoxOpen />}
          color="green"
        />
        <StatsCard
          title="Total Discount"
          value={stats.totalDiscount || 0}
          icon={<FaTags />}
          color="pink"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="chart-container lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
            Revenue Trend (Last 30 Days)
          </h2>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesOverTime}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  vertical={false}
                />
                <XAxis
                  dataKey="_id"
                  stroke="#94a3b8"
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="#94a3b8"
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `₹${value / 1000}k`}
                  dx={-10}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: "#e2e8f0" }}
                />
                <Area
                  type="monotone"
                  dataKey="dailyRevenue"
                  name="Revenue"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-container bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-pink-500 rounded-full"></span>
            Top Products
          </h2>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topProducts}
                layout="vertical"
                margin={{ left: 0, right: 20 }}
                barSize={20}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  horizontal={true}
                  vertical={false}
                />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={100}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  content={<CustomTooltip />}
                />
                <Bar
                  dataKey="totalSold"
                  name="Units Sold"
                  radius={[0, 4, 4, 0]}
                >
                  {topProducts.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="chart-container bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
            Order Status Distribution
          </h2>
          <div className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatusStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="_id"
                  stroke="#fff"
                  strokeWidth={2}
                >
                  {orderStatusStats.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        STATUS_COLORS[entry._id] ||
                        COLORS[index % COLORS.length]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="middle"
                  align="right"
                  layout="vertical"
                  iconType="circle"
                  wrapperStyle={{ fontSize: "12px", color: "#64748b" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-container bg-linear-to-br from-indigo-900 to-slate-900 rounded-xl p-8 text-white relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-[80px] rounded-full pointer-events-none"></div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            ✨ AI Insights
          </h2>

          {insightsLoading ? (
            <div className="flex flex-col gap-2 animate-pulse">
              <div className="h-4 bg-white/20 rounded w-3/4"></div>
              <div className="h-4 bg-white/20 rounded w-full"></div>
              <div className="h-4 bg-white/20 rounded w-5/6"></div>
            </div>
          ) : insightsError ? (
            <p className="text-red-300">Failed to load insights.</p>
          ) : (
            <div className="text-gray-200 leading-relaxed mb-6 font-light space-y-2">
              {insights ? (
                <ul className="list-disc pl-5 space-y-2">
                  {insights
                    .split("\n")
                    .map(
                      (insight, i) =>
                        insight.trim() && (
                          <li key={i}>{insight.replace(/^-\s*/, "")}</li>
                        )
                    )}
                </ul>
              ) : (
                <p>No insights generated yet.</p>
              )}
            </div>
          )}

          <button
            onClick={() => refetchInsights()}
            disabled={insightsFetching}
            className="mt-6 px-5 py-2.5 bg-white text-indigo-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {insightsFetching ? "Analyzing..." : "Refresh Insights"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalesReport;
