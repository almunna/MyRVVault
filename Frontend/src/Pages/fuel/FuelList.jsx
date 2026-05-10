import { useState } from "react";
import { Link } from "react-router-dom";
import { message, Spin, Empty, Modal } from "antd";
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  RiseOutlined, DollarOutlined, ColumnWidthOutlined, ThunderboltOutlined,
} from "@ant-design/icons";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  useGetFuelLogsQuery,
  useDeleteFuelLogMutation,
  useGetFuelStatsQuery,
} from "../redux/api/routesApi";

// ── helpers ───────────────────────────────────────────────────────────────────
const fmt = (d) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

const StatCard = ({ icon, label, value, sub, color = "#3B7D3C" }) => (
  <div className="bg-white border border-[#E8F0E8] rounded-2xl p-5 shadow-sm">
    <div className="flex items-center gap-2 mb-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <span className="text-xs font-semibold text-[#5A5A5A] uppercase tracking-wide">{label}</span>
    </div>
    <p className="text-2xl font-bold text-[#1A1A1A]">{value}</p>
    {sub && <p className="text-xs text-[#5A5A5A] mt-0.5">{sub}</p>}
  </div>
);

const ChartCard = ({ title, children, empty }) => (
  <div className="bg-white border border-[#E8F0E8] rounded-2xl p-6 shadow-sm">
    <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">{title}</h3>
    {empty ? (
      <div className="h-40 flex items-center justify-center text-[#5A5A5A] text-sm">
        Not enough data yet — add more fill-ups to see trends.
      </div>
    ) : children}
  </div>
);

// ── custom tooltip ────────────────────────────────────────────────────────────
const MpgTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#E8F0E8] rounded-xl px-3 py-2 shadow text-xs">
      <p className="text-[#5A5A5A] mb-1">{label}</p>
      <p className="font-bold text-[#3B7D3C]">{payload[0].value} MPG</p>
    </div>
  );
};

const CostTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#E8F0E8] rounded-xl px-3 py-2 shadow text-xs">
      <p className="text-[#5A5A5A] mb-1">{label}</p>
      <p className="font-bold text-[#D4872D]">${payload[0].value?.toFixed(2)}</p>
    </div>
  );
};

// ── main page ─────────────────────────────────────────────────────────────────
const FuelList = () => {
  const { data, isLoading, refetch } = useGetFuelLogsQuery();
  const { data: statsData, isLoading: statsLoading } = useGetFuelStatsQuery();
  const [deleteFuelLog] = useDeleteFuelLogMutation();
  const [deletingId, setDeletingId] = useState(null);

  const [dateRange, setDateRange] = useState(["", ""]);
  const hasDateRange = !!(dateRange[0] && dateRange[1]);

  const logs    = data?.data || [];
  const summary = data?.summary || {};
  const stats   = statsData?.data || {};

  const visibleLogs = hasDateRange
    ? logs.filter(log => {
        if (!log.date) return false;
        const d = new Date(log.date);
        const start = new Date(dateRange[0]);
        const end = new Date(dateRange[1]);
        end.setHours(23, 59, 59, 999);
        return d >= start && d <= end;
      })
    : logs;
  const mpgTrend  = (stats.mpgTrend  || []).map(p => ({ ...p, label: fmt(p.date) }));
  const costTrend = (stats.costTrend || []).map(p => ({ ...p, label: fmt(p.date) }));

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Delete this fuel entry?",
      content: "This will remove the entry and may affect MPG calculations for subsequent fill-ups.",
      okText: "Delete", okButtonProps: { danger: true },
      onOk: async () => {
        setDeletingId(id);
        try {
          await deleteFuelLog(id).unwrap();
          message.success("Fuel entry deleted");
          refetch();
        } catch {
          message.error("Failed to delete");
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="max-w-site mx-auto px-4 lg:px-6 2xl:px-8 py-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-1 h-8 bg-[#D4872D] rounded-full" />
              <h1 className="text-3xl font-bold text-[#1A1A1A]">Fuel Log</h1>
            </div>
            <p className="text-[#5A5A5A] text-sm ml-4 pl-3">
              {hasDateRange
                ? <>{visibleLogs.length} fill-up{visibleLogs.length !== 1 ? "s" : ""} <span className="text-[#3B7D3C]">(filtered)</span></>
                : summary.totalEntries
                  ? `${summary.totalEntries} fill-up${summary.totalEntries !== 1 ? "s" : ""} recorded`
                  : "Track every fill-up to monitor MPG and spending"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Date range pills */}
            {[["From", 0], ["To", 1]].map(([label, idx]) => (
              <label
                key={label}
                className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-1.5 cursor-pointer hover:border-gray-300 transition-colors"
              >
                <span className="text-xs text-gray-400 font-medium select-none">{label}</span>
                <input
                  type="date"
                  value={dateRange[idx]}
                  min={idx === 1 ? dateRange[0] || undefined : undefined}
                  onChange={e => {
                    const next = [...dateRange];
                    next[idx] = e.target.value;
                    if (idx === 0 && next[1] && e.target.value > next[1]) next[1] = "";
                    setDateRange(next);
                  }}
                  className="text-xs text-gray-600 outline-none border-none bg-transparent w-[92px] cursor-pointer"
                />
              </label>
            ))}

            <Link to="/addFuel">
              <button className="flex items-center gap-2 bg-[#3B7D3C] text-white px-5 py-2 rounded-xl font-medium text-sm hover:bg-[#2d6130] transition-colors shadow-sm">
                <PlusOutlined /> Add Fill-Up
              </button>
            </Link>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<ThunderboltOutlined />} label="Fill-Ups"    value={summary.totalEntries ?? 0} />
          <StatCard icon={<ColumnWidthOutlined />} label="Total Gallons" value={`${(summary.totalGallons ?? 0).toFixed(1)} gal`} color="#1D4ED8" />
          <StatCard icon={<DollarOutlined />}      label="Total Spent"   value={`$${(summary.totalCost ?? 0).toFixed(2)}`} color="#D4872D" />
          <StatCard icon={<RiseOutlined />}        label="Avg MPG"
            value={summary.avgMpg ? `${summary.avgMpg}` : "—"}
            sub={summary.avgMpg ? "miles per gallon" : "Need 2+ fill-ups"}
          />
        </div>

        {/* Charts */}
        {!statsLoading && (
          <div className="grid lg:grid-cols-2 gap-4 mb-8">
            <ChartCard title="MPG Trend" empty={mpgTrend.length < 2}>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={mpgTrend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8F0E8" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#5A5A5A" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#5A5A5A" }} />
                  <Tooltip content={<MpgTooltip />} />
                  <Line
                    type="monotone" dataKey="mpg" stroke="#3B7D3C"
                    strokeWidth={2} dot={{ r: 3, fill: "#3B7D3C" }} activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Fuel Spending" empty={costTrend.length < 2}>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={costTrend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8F0E8" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#5A5A5A" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#5A5A5A" }} />
                  <Tooltip content={<CostTooltip />} />
                  <Bar dataKey="totalCost" fill="#D4872D" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        )}

        {/* Log list */}
        <div className="bg-white border border-[#E8F0E8] rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E8F0E8]">
            <h2 className="text-sm font-semibold text-[#1A1A1A]">Fill-Up History</h2>
          </div>

          {logs.length === 0 ? (
            <div className="p-12">
              <Empty
                description={
                  <span className="text-[#5A5A5A]">
                    No fuel entries yet.{" "}
                    <Link to="/addFuel" className="text-[#3B7D3C] underline">Add your first fill-up</Link>
                  </span>
                }
              />
            </div>
          ) : visibleLogs.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-[#5A5A5A] text-sm">No fill-ups found in this date range.</p>
              <button
                onClick={() => setDateRange(["", ""])}
                className="mt-2 text-xs text-[#3B7D3C] underline"
              >
                Clear filter
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#E8F0E8]">
              {visibleLogs.map((log) => (
                <div key={log.id} className="px-6 py-4 hover:bg-[#F5F5F0] transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: main info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-1.5">
                        <span className="text-base font-bold text-[#1A1A1A]">
                          {(log.odometer || 0).toLocaleString()} mi
                        </span>
                        <span className="text-sm font-semibold text-[#3B7D3C]">{log.gallons} gal</span>
                        {log.mpg != null && (
                          <span className="text-xs font-semibold bg-[#E8F0E8] text-[#3B7D3C] px-2 py-0.5 rounded-full">
                            {log.mpg} MPG
                          </span>
                        )}
                        {log.totalCost != null && (
                          <span className="text-xs font-semibold bg-amber-50 text-[#D4872D] px-2 py-0.5 rounded-full">
                            ${log.totalCost.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-[#5A5A5A]">
                        {log.date && <span>{new Date(log.date).toLocaleDateString()}</span>}
                        {log.pricePerGallon && <span>${log.pricePerGallon}/gal</span>}
                        {log.milesDriven > 0 && <span>{log.milesDriven.toLocaleString()} miles driven</span>}
                        {log.costPerMile != null && <span>${log.costPerMile}/mile</span>}
                        {log.tripId && <span className="text-[#1D4ED8]">Linked to trip</span>}
                      </div>
                      {log.notes && (
                        <p className="text-xs text-[#5A5A5A] italic mt-1 truncate">{log.notes}</p>
                      )}
                    </div>

                    {/* Right: actions */}
                    <div className="flex gap-2 flex-shrink-0">
                      <Link to={`/updateFuel/${log.id}`}>
                        <button className="p-2 border border-[#E8F0E8] rounded-lg text-[#3B7D3C] hover:border-[#3B7D3C] hover:bg-[#E8F0E8] transition-all">
                          <EditOutlined />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(log.id)}
                        disabled={deletingId === log.id}
                        className="p-2 border border-red-100 rounded-lg text-red-400 hover:border-red-400 hover:bg-red-50 transition-all disabled:opacity-40"
                      >
                        {deletingId === log.id ? <Spin size="small" /> : <DeleteOutlined />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default FuelList;
