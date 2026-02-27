import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "../api/axiosClient";
import ledger from "../assets/ledger.png";
import money from "../assets/money.png";
import cashflow from "../assets/cash-flow.png";
import robot from "../assets/robot.png";
import emergency from "../assets/emergency.png";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [customers, setCustomers] = useState([]);
  const [cf, setCf] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [c, f] = await Promise.all([
          api.get("/customers/"),
          api.get("/ai/cashflow"),
        ]);
        setCustomers(c.data);
        setCf(f.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <img
            src={robot}
            alt=""
            className="w-12 h-12 mx-auto mb-3 opacity-40"
          />
          <p className="text-gray-400 text-sm">Loading your khata...</p>
        </div>
      </div>
    );

  const totalDue = customers.reduce((s, c) => s + c.total_due, 0);
  const atRiskCount = customers.filter((c) => c.aitbaar_score < 40).length;
  const safeCount = customers.filter((c) => c.aitbaar_score >= 70).length;
  const avgScore = customers.length
    ? Math.round(
        customers.reduce((s, c) => s + c.aitbaar_score, 0) / customers.length,
      )
    : 0;

  const chartData =
    cf?.upcoming_collections?.map((c) => ({
      name: c.customer_name.split(" ")[0],
      amount: c.amount_due,
    })) || [];

  function formatAmount(amount) {
    if (amount >= 100000) return `₨ ${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₨ ${(amount / 1000).toFixed(0)}k`;
    return `₨ ${amount.toLocaleString()}`;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-gray-400 text-xs mb-1 uppercase tracking-widest">
            خوش آمدید — Welcome back
          </p>
          <h1
            className="text-3xl md:text-4xl font-bold text-green-950"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            {user.shop_name}
          </h1>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-gray-400 text-xs">{user.city}</p>
          <p className="text-gray-500 text-sm font-medium">{user.name}</p>
        </div>
      </div>

      {/* Top Hero Stats — 2 big cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Outstanding */}
        <div className="bg-green-950 rounded-2xl p-6 md:p-8 flex items-end justify-between min-h-[160px] relative overflow-hidden">
          <div className="absolute top-5 right-5 opacity-15">
            <img src={money} alt="" className="w-24 h-24" />
          </div>
          <div>
            <p className="text-white/50 text-xs uppercase tracking-widest mb-2">
              کل باقی — Total Outstanding
            </p>
            <p
              className="text-4xl md:text-5xl font-bold text-white"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              {formatAmount(totalDue)}
            </p>
            <p className="text-white/40 text-sm mt-2">
              across {customers.length} customers
            </p>
          </div>
          <div className="text-right">
            <div className="bg-white/10 border border-white/20 rounded-xl px-3 py-1.5">
              <p className="text-white/60 text-xs">Avg Score</p>
              <p className="text-amber-400 font-bold text-lg">{avgScore}</p>
            </div>
          </div>
        </div>

        {/* At Risk */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 md:p-8 flex items-end justify-between min-h-[160px] relative overflow-hidden">
          <div className="absolute top-5 right-5 opacity-10">
            <img src={emergency} alt="" className="w-24 h-24" />
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">
              خطرہ — At Risk Amount
            </p>
            <p
              className="text-4xl md:text-5xl font-bold text-red-600"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              ₨{((cf?.at_risk_amount || 0) / 1000).toFixed(1)}k
            </p>
            <p className="text-gray-400 text-sm mt-2">
              {atRiskCount} risky · {safeCount} trusted customers
            </p>
          </div>
          {cf?.shortage_warning && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-1.5 text-right">
              <p className="text-red-500 text-xs font-semibold">⚠ Warning</p>
              <p className="text-red-400 text-xs">Cash shortage</p>
            </div>
          )}
        </div>
      </div>

      {/* Warning Banner */}
      {cf?.shortage_warning && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 flex gap-4 items-start">
          <img
            src={emergency}
            alt=""
            className="w-10 h-10 mt-0.5 flex-shrink-0"
          />
          <div>
            <p className="font-semibold text-orange-900 mb-1">
              Cash Flow Warning — نقد رقم کی کمی
            </p>
            <p className="text-orange-700 text-sm leading-relaxed">
              Over 30% of your outstanding amount is with high-risk customers.
              Prioritize collections this week before extending more credit.
            </p>
          </div>
        </div>
      )}

      {/* Middle Row — Chart + AI */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Cash Flow Chart */}
        <div className="md:col-span-3 bg-white border border-stone-200 rounded-2xl p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <img src={cashflow} alt="" className="w-8 h-8" />
              <div>
                <h3
                  className="font-bold text-gray-900 text-base"
                  style={{
                    fontFamily: "Cormorant Garamond, serif",
                    fontSize: "1.2rem",
                  }}
                >
                  Upcoming Collections
                </h3>
                <p className="text-gray-400 text-xs">آنے والی وصولی</p>
              </div>
            </div>
            {chartData.length > 0 && (
              <div className="text-right">
                <p className="text-xs text-gray-400">Total expected</p>
                <p className="text-sm font-bold text-green-950">
                  {formatAmount(chartData.reduce((s, c) => s + c.amount, 0))}
                </p>
              </div>
            )}
          </div>

          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#052e16" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#052e16" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  tick={{
                    fontSize: 11,
                    fill: "#9ca3af",
                    fontFamily: "DM Sans",
                  }}
                  axisLine={false}
                  tickLine={false}
                  dy={8}
                />
                <YAxis
                  tick={{
                    fontSize: 10,
                    fill: "#9ca3af",
                    fontFamily: "DM Sans",
                  }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) =>
                    `₨${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`
                  }
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e7e5e4",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    fontSize: "0.8rem",
                    fontFamily: "DM Sans",
                  }}
                  formatter={(v) => [`₨${v.toLocaleString()}`, "Amount Due"]}
                  labelStyle={{ fontWeight: 600, color: "#1c1917" }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#052e16"
                  strokeWidth={2.5}
                  fill="url(#greenGrad)"
                  dot={{ fill: "#052e16", strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: "#f59e0b", strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-gray-300">
              <img
                src={cashflow}
                alt=""
                className="w-10 h-10 mb-2 opacity-20"
              />
              <p className="text-sm text-gray-400">No upcoming collections</p>
            </div>
          )}
        </div>

        {/* AI Insight */}
        <div className="md:col-span-2 bg-green-950 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={robot} alt="" className="w-8 h-8 invert brightness-0" />
              <div>
                <span className="bg-amber-500 text-green-950 text-[9px] font-bold px-2 py-0.5 rounded-full tracking-widest">
                  AI INSIGHT
                </span>
              </div>
            </div>
            <h3
              className="text-white font-bold mb-1 text-base"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              Financial Advisor
            </h3>
            <p className="text-white/40 text-xs mb-4">مالی مشورہ</p>
            <p className="text-white/70 text-sm leading-relaxed italic">
              {cf?.ai_insight || "Add your GitHub token to enable AI insights."}
            </p>
          </div>
          <button
            onClick={() => navigate("/ai")}
            className="mt-5 w-full bg-amber-500 hover:bg-amber-400 text-green-950 font-bold py-3 rounded-xl text-sm transition-colors"
          >
            Open AI Assistant →
          </button>
        </div>
      </div>

      {/* At Risk Table */}
      {cf?.customers_at_risk?.length > 0 && (
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={emergency} alt="" className="w-7 h-7" />
              <div>
                <h3
                  className="font-bold text-gray-900"
                  style={{
                    fontFamily: "Cormorant Garamond, serif",
                    fontSize: "1.15rem",
                  }}
                >
                  Customers Needing Attention
                </h3>
                <p className="text-gray-400 text-xs">جن پر توجہ دینی ہے</p>
              </div>
            </div>
            <span className="bg-red-50 text-red-600 text-xs font-bold px-2.5 py-1 rounded-full">
              {cf.customers_at_risk.length} flagged
            </span>
          </div>

          <div className="divide-y divide-stone-50">
            {cf.customers_at_risk.map((c, i) => (
              <div
                key={i}
                onClick={() => navigate(`/customers/${c.customer_id}`)}
                className="flex items-center justify-between px-5 py-4 hover:bg-stone-50 transition-colors cursor-pointer group"
              >
                {/* Left — Avatar + Name */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      c.aitbaar_score < 40
                        ? "bg-red-100 text-red-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {c.customer_name[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">
                      {c.customer_name}
                    </p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      {c.risk_reason}
                    </p>
                  </div>
                </div>

                {/* Middle — Overdue badge */}
                <div className="hidden md:flex items-center gap-2 mx-4">
                  {c.overdue_by_days > 0 && (
                    <span className="bg-orange-50 text-orange-600 border border-orange-200 text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap">
                      {c.overdue_by_days}d overdue
                    </span>
                  )}
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                      c.aitbaar_score < 40
                        ? "bg-red-50 text-red-600 border border-red-200"
                        : "bg-orange-50 text-orange-600 border border-orange-200"
                    }`}
                  >
                    Score {c.aitbaar_score}
                  </span>
                </div>

                {/* Right — Amount + Arrow */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <p className="text-red-600 font-bold text-sm">
                    {formatAmount(c.amount_due)}
                  </p>
                  <span className="text-gray-300 group-hover:text-green-900 transition-colors text-sm">
                    →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
