import { useState, useEffect } from "react";
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
  Cell,
  PieChart,
  Pie,
} from "recharts";
import api from "../../../../api/axios";
import {
  FaIndianRupeeSign,
  FaCartShopping,
  FaChartLine,
  FaBoxOpen,
  FaTags,
} from "react-icons/fa6";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const LOADING_SKELETON = (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
  </div>
);

const ERROR_STATE = (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <p className="text-gray-500 text-lg">Failed to load dashboard data.</p>
  </div>
);

const COLORS = [
  "#8b5cf6",
  "#ec4899",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#6366f1",
  "#14b8a6",
  "#ef4444",
  "#84cc16",
  "#d946ef",
];

const StatsCard = ({ title, value, icon, color, delay }) => {
  return (
    <div className="stats-card bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 p-3 md:p-4 flex items-center gap-3 md:gap-4 transition-all hover:shadow-lg hover:-translate-y-1">
      <div
        className={`p-2 md:p-3 rounded-xl ${
          color === "purple"
            ? "bg-purple-50 text-purple-600"
            : color === "pink"
              ? "bg-pink-50 text-pink-600"
              : color === "blue"
                ? "bg-blue-50 text-blue-600"
                : "bg-green-50 text-green-600"
        } text-[clamp(1.1rem,2vw,1.5rem)] shadow-sm h-fit shrink-0`}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-gray-400 text-[clamp(0.6rem,1vw,0.75rem)] font-bold uppercase tracking-widest mb-0.5 md:mb-1 truncate">
          {title}
        </p>
        <h3 className="text-[clamp(1rem,2.5vw,2rem)] font-extrabold text-gray-800 break-words leading-tight">
          {typeof value === "number" &&
          (title.includes("Revenue") ||
            title.includes("Value") ||
            title.includes("Discount"))
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
      <div className="bg-white/95 backdrop-blur-md border border-gray-100 p-4 rounded-xl shadow-xl">
        <p className="text-gray-500 mb-2 text-xs font-bold tracking-wide uppercase">
          {label}
        </p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            ></span>
            <p className="text-sm font-bold text-gray-700">
              {entry.name}:{" "}
              <span className="text-indigo-600">
                {entry.name.includes("Revenue")
                  ? `₹${entry.value.toLocaleString()}`
                  : entry.value}
              </span>
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const fetchDashboardData = async ({ queryKey }) => {
  const [_, { interval, componentType }] = queryKey;
  const { data } = await api.get(
    `/admin/sales-report?interval=${interval}&componentType=${componentType}`,
  );
  return data;
};

const AdminDashboardHome = () => {
  const [interval, setInterval] = useState("daily");
  const [componentType, setComponentType] = useState("all");

  const {
    data,
    isLoading: loading,
    isError,
  } = useQuery({
    queryKey: ["adminDashboard", { interval, componentType }],
    queryFn: fetchDashboardData,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    const baseURL = import.meta.env.VITE_API_URL;
    const eventSource = new EventSource(`${baseURL}/admin/sales-updates`, {
      withCredentials: true,
    });

    eventSource.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "NEW_ORDER" || message.type === "STATUS_UPDATE") {
        queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
      }
    };

    return () => {
      eventSource.close();
    };
  }, [queryClient]);

  useGSAP(() => {
    if (!loading && data) {
      gsap.fromTo(
        ".stats-card",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out" },
      );
      gsap.fromTo(
        ".chart-card",
        { y: 40, opacity: 0, scale: 0.98 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          stagger: 0.15,
          delay: 0.3,
          ease: "elastic.out(1, 0.9)",
        },
      );
    }
  }, [loading, data]);

  if (loading) return LOADING_SKELETON;
  if (isError || !data) return ERROR_STATE;

  const { stats, salesOverTime, topProducts, topCategories, topComponents } =
    data;

  return (
    <div className="animate-fade-up font-sans text-slate-800">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-6 md:mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-1 md:mb-2">
            Dashboard <span className="text-indigo-600">.</span>
          </h1>
          <p className="text-gray-500 font-medium text-[clamp(0.75rem,1.5vw,1rem)]">
            Overview of your store performance
          </p>
        </div>

        <div className="w-full xl:w-auto bg-white p-1 rounded-xl border border-gray-200 shadow-sm grid grid-cols-4 gap-1 sm:flex sm:gap-0">
          {["daily", "weekly", "monthly", "yearly"].map((tab) => (
            <button
              key={tab}
              onClick={() => setInterval(tab)}
              className={`py-1.5 px-2 md:px-4 md:py-2 rounded-lg text-[clamp(0.65rem,1.2vw,0.875rem)] font-bold capitalize transition-all whitespace-nowrap flex justify-center items-center ${
                interval === tab
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-10">
        <StatsCard
          title="Total Revenue"
          value={stats.totalRevenue}
          icon={<FaIndianRupeeSign />}
          color="purple"
        />
        <StatsCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={<FaCartShopping />}
          color="pink"
        />
        <StatsCard
          title="Avg. Order Value"
          value={Math.round(stats.avgOrderValue)}
          icon={<FaChartLine />}
          color="blue"
        />
        <StatsCard
          title="Total Discount"
          value={stats.totalDiscount}
          icon={<FaTags />}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8 mb-6 md:mb-10">
        <div className="chart-card xl:col-span-2 bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-6 md:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-8 gap-2">
            <h2 className="text-[clamp(1rem,1.5vw,1.5rem)] font-bold text-gray-900">
              Revenue Analytics
            </h2>
            <div className="flex items-center gap-2 text-[clamp(0.65rem,1vw,0.875rem)] text-green-600 font-bold bg-green-50 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">
              <FaChartLine />
              <span>+12.5% vs last period</span>
            </div>
          </div>
          <div className="h-[200px] sm:h-[250px] md:h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesOverTime}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
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
                  tick={{ fill: "#64748b", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="#94a3b8"
                  tick={{ fill: "#64748b", fontSize: 10 }}
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
                  stroke="#6366f1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 p-4 md:p-8">
          <h2 className="text-[clamp(1rem,1.5vw,1.5rem)] font-bold text-gray-900 mb-4 md:mb-8">
            Best Selling Categories
          </h2>
          <div className="h-[200px] sm:h-[250px] md:h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={topCategories}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="totalSold"
                  nameKey="_id"
                  stroke="none"
                >
                  {topCategories &&
                    topCategories.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {topCategories &&
              topCategories.slice(0, 4).map((cat, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-[clamp(0.65rem,1vw,0.875rem)] font-semibold text-gray-500 truncate"
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: COLORS[i] }}
                  ></span>
                  <span className="truncate">{cat._id}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-12">
        <div className="chart-card bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 p-4 md:p-8">
          <h2 className="text-[clamp(1rem,1.5vw,1.5rem)] font-bold text-gray-900 mb-4 md:mb-6">
            Top 10 Products
          </h2>
          <div
            style={{
              height: `${Math.max(250, (topProducts?.length || 0) * 45)}px`,
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topProducts}
                layout="vertical"
                margin={{ left: 0, right: 10 }}
                barSize={12}
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
                  tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
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
                  {topProducts &&
                    topProducts.map((entry, index) => (
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

        <div className="chart-card bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 p-4 md:p-8">
          <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center mb-4 md:mb-6 gap-2">
            <h2 className="text-[clamp(1rem,1.5vw,1.5rem)] font-bold text-gray-900">
              Top 10 Components
            </h2>
            <select
              value={componentType}
              onChange={(e) => setComponentType(e.target.value)}
              className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-[clamp(0.65rem,1vw,0.875rem)] font-semibold text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-full xs:w-auto"
            >
              <option value="all">All Components</option>
              <option value="cpu">CPU</option>
              <option value="gpu">GPU</option>
              <option value="motherboard">Motherboard</option>
              <option value="ram">RAM</option>
              <option value="storage">Storage</option>
              <option value="case">Case</option>
              <option value="psu">PSU</option>
              <option value="cooler">Cooler</option>
            </select>
          </div>
          <div
            style={{
              height: `${Math.max(200, (topComponents?.length || 0) * 45)}px`,
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topComponents}
                layout="vertical"
                margin={{ left: 0, right: 10 }}
                barSize={12}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  horizontal={true}
                  vertical={false}
                />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="_id"
                  type="category"
                  width={80}
                  tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
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
                  {topComponents &&
                    topComponents.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[(index + 4) % COLORS.length]}
                      />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardHome;
