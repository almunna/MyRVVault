import { Spin } from "antd";
import { Link } from "react-router-dom";
import {
  ToolOutlined, ThunderboltOutlined, SafetyCertificateOutlined,
  SafetyOutlined, CarOutlined, HeartOutlined, CheckCircleOutlined,
  ReloadOutlined, ArrowRightOutlined, ExclamationCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useGetSmartSuggestionsQuery } from "../redux/api/routesApi";

// ── type config ───────────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  maintenance:      { icon: <ToolOutlined />,                   label: "Maintenance",  bg: "#EFF6FF", accent: "#1D4ED8" },
  generator:        { icon: <ThunderboltOutlined />,            label: "Generator",    bg: "#FFF7ED", accent: "#D4872D" },
  warranty:         { icon: <SafetyCertificateOutlined />,      label: "Warranty",     bg: "#F5F3FF", accent: "#7C3AED" },
  insurance:        { icon: <SafetyOutlined />,                 label: "Insurance",    bg: "#FFF1F2", accent: "#BE123C" },
  component:        { icon: <CarOutlined />,                    label: "Component",    bg: "#F0FDF4", accent: "#15803D" },
  component_health: { icon: <HeartOutlined />,                  label: "Health",       bg: "#FFF7ED", accent: "#C2410C" },
  repair:           { icon: <ExclamationCircleOutlined />,      label: "Repair",       bg: "#FFFBEB", accent: "#B45309" },
};

const PRIORITY_CONFIG = {
  high:   { label: "Urgent",  bg: "bg-red-50",   text: "text-red-700",   border: "border-red-200",  dot: "bg-red-500"   },
  medium: { label: "Soon",    bg: "bg-amber-50",  text: "text-amber-700", border: "border-amber-200",dot: "bg-amber-500" },
  low:    { label: "Info",    bg: "bg-blue-50",   text: "text-blue-700",  border: "border-blue-200", dot: "bg-blue-500"  },
};

// ── stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, count, color, dot }) => (
  <div className="bg-white border border-[#E8F0E8] rounded-2xl p-5 shadow-sm text-center">
    <div className={`w-2 h-2 rounded-full ${dot} mx-auto mb-2`} />
    <p className={`text-2xl font-bold ${color}`}>{count}</p>
    <p className="text-xs text-[#5A5A5A] mt-0.5">{label}</p>
  </div>
);

// ── suggestion card ───────────────────────────────────────────────────────────
const SuggestionCard = ({ s }) => {
  const type     = TYPE_CONFIG[s.type]     || TYPE_CONFIG.maintenance;
  const priority = PRIORITY_CONFIG[s.priority] || PRIORITY_CONFIG.low;

  return (
    <div className={`bg-white border ${priority.border} rounded-2xl p-5 shadow-sm`}>
      <div className="flex items-start gap-4">

        {/* Type icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
          style={{ background: type.bg, color: type.accent }}
        >
          {type.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-[#1A1A1A]">{s.title}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priority.bg} ${priority.text}`}>
              {priority.label}
            </span>
            <span className="text-xs text-[#5A5A5A] bg-[#F5F5F0] px-2 py-0.5 rounded-full">
              {type.label}
            </span>
          </div>
          <p className="text-sm text-[#5A5A5A]">{s.message}</p>
          {s.detail && (
            <p className="text-xs text-[#5A5A5A] mt-1 flex items-center gap-1">
              <ClockCircleOutlined className="text-[10px]" />
              {s.detail}
            </p>
          )}
          {s.healthScore != null && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-[#E8F0E8] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${s.healthScore}%`,
                    background: s.healthScore >= 70 ? "#3B7D3C" : s.healthScore >= 40 ? "#D4872D" : "#ef4444",
                  }}
                />
              </div>
              <span className="text-xs font-semibold text-[#5A5A5A]">{s.healthScore}/100</span>
            </div>
          )}
        </div>

        {/* Action */}
        {s.action && (
          <Link to={s.action.href} className="flex-shrink-0">
            <button className="flex items-center gap-1 text-xs font-medium text-[#3B7D3C] border border-[#E8F0E8] hover:border-[#3B7D3C] hover:bg-[#E8F0E8] rounded-lg px-3 py-1.5 transition-all duration-200 whitespace-nowrap">
              {s.action.label} <ArrowRightOutlined className="text-[10px]" />
            </button>
          </Link>
        )}
      </div>
    </div>
  );
};

// ── main page ─────────────────────────────────────────────────────────────────
const SmartSuggestions = () => {
  const { data, isLoading, refetch, isFetching } = useGetSmartSuggestionsQuery();

  const suggestions = data?.data    || [];
  const summary     = data?.summary || {};
  const high        = suggestions.filter(s => s.priority === "high");
  const medium      = suggestions.filter(s => s.priority === "medium");
  const low         = suggestions.filter(s => s.priority === "low");

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
              <h1 className="text-3xl font-bold text-[#1A1A1A]">Smart Suggestions</h1>
            </div>
            <p className="text-[#5A5A5A] text-sm ml-4 pl-3">
              Personalized alerts based on your RV's mileage, hours, component ages, and maintenance history.
            </p>
          </div>
          <button
            onClick={refetch}
            disabled={isFetching}
            className="flex items-center gap-2 text-sm font-medium text-[#3B7D3C] border border-[#E8F0E8] hover:border-[#3B7D3C] px-4 py-2 rounded-xl transition-all duration-200 disabled:opacity-50"
          >
            <ReloadOutlined className={isFetching ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard label="Urgent" count={high.length}   color="text-red-600"   dot="bg-red-500"   />
          <StatCard label="Due Soon" count={medium.length} color="text-amber-600" dot="bg-amber-500" />
          <StatCard label="Info"   count={low.length}    color="text-blue-600"  dot="bg-blue-500"  />
        </div>

        {/* All clear */}
        {suggestions.length === 0 ? (
          <div className="bg-white border border-[#E8F0E8] rounded-2xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-[#E8F0E8] flex items-center justify-center mx-auto mb-4">
              <CheckCircleOutlined className="text-3xl text-[#3B7D3C]" />
            </div>
            <p className="text-lg font-semibold text-[#1A1A1A] mb-1">All Caught Up!</p>
            <p className="text-[#5A5A5A] text-sm">No maintenance, service, or component alerts right now.</p>
          </div>
        ) : (
          <div className="space-y-6">

            {/* High priority */}
            {high.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <h2 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wide">
                    Urgent — {high.length} item{high.length !== 1 ? "s" : ""}
                  </h2>
                </div>
                <div className="space-y-3">
                  {high.map((s, i) => <SuggestionCard key={`h-${i}`} s={s} />)}
                </div>
              </section>
            )}

            {/* Medium priority */}
            {medium.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <h2 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wide">
                    Due Soon — {medium.length} item{medium.length !== 1 ? "s" : ""}
                  </h2>
                </div>
                <div className="space-y-3">
                  {medium.map((s, i) => <SuggestionCard key={`m-${i}`} s={s} />)}
                </div>
              </section>
            )}

            {/* Low priority */}
            {low.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <h2 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wide">
                    Info — {low.length} item{low.length !== 1 ? "s" : ""}
                  </h2>
                </div>
                <div className="space-y-3">
                  {low.map((s, i) => <SuggestionCard key={`l-${i}`} s={s} />)}
                </div>
              </section>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

export default SmartSuggestions;
