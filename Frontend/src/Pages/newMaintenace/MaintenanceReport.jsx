import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/Home/hero.png";
import { DatePicker, Select, Input, Spin, Empty } from "antd";
import {
  FileTextOutlined,
  FilterOutlined,
  PrinterOutlined,
  ArrowLeftOutlined,
  ToolOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useGetMaintanceQuery } from "../redux/api/routesApi";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

const COMPONENT_OPTIONS = [
  { value: "", label: "All Components" },
  { value: "airConditioning", label: "Air Conditioning" },
  { value: "chassis", label: "Chassis" },
  { value: "ceilingFans", label: "Ceiling Fans" },
  { value: "dishwasher", label: "Dishwasher" },
  { value: "dryer", label: "Dryer" },
  { value: "dvdPlayer", label: "DVD Player" },
  { value: "exhaustFans", label: "Exhaust Fans" },
  { value: "generator", label: "Generator" },
  { value: "gps", label: "GPS" },
  { value: "heater", label: "Heater" },
  { value: "outdoorRadio", label: "Outdoor Radio" },
  { value: "rv", label: "RV" },
  { value: "satelliteInternet", label: "Satellite Internet" },
  { value: "surroundSound", label: "Surround Sound" },
  { value: "tire", label: "Tire" },
  { value: "toilet", label: "Toilet" },
  { value: "tv", label: "TV" },
  { value: "ventFans", label: "Vent Fans" },
  { value: "washer", label: "Washer" },
  { value: "waterHeater", label: "Water Heater" },
  { value: "waterPump", label: "Water Pump" },
  { value: "wifiRouter", label: "WiFi Router" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "completed", label: "Completed" },
  { value: "overdue", label: "Overdue" },
  { value: "upcoming", label: "Upcoming" },
  { value: "scheduled", label: "Scheduled" },
];

const STATUS_STYLES = {
  completed: { badge: "bg-green-100 text-green-700", icon: <CheckCircleOutlined /> },
  overdue:   { badge: "bg-red-100 text-red-700",   icon: <WarningOutlined /> },
  upcoming:  { badge: "bg-amber-100 text-amber-700", icon: <ClockCircleOutlined /> },
  scheduled: { badge: "bg-blue-50 text-blue-600",   icon: <CalendarOutlined /> },
};

const COMPONENT_LABELS = {
  airConditioning: "Air Conditioning", chassis: "Chassis", ceilingFans: "Ceiling Fans",
  dishwasher: "Dishwasher", dryer: "Dryer", dvdPlayer: "DVD Player",
  exhaustFans: "Exhaust Fans", generator: "Generator", gps: "GPS", heater: "Heater",
  outdoorRadio: "Outdoor Radio", rv: "RV", satelliteInternet: "Satellite Internet",
  surroundSound: "Surround Sound", tire: "Tire", toilet: "Toilet", tv: "TV",
  ventFans: "Vent Fans", washer: "Washer", waterHeater: "Water Heater",
  waterPump: "Water Pump", wifiRouter: "WiFi Router",
};

const ReportRow = ({ item }) => {
  const s = STATUS_STYLES[item.status] || STATUS_STYLES.scheduled;
  return (
    <div className="bg-white border border-[#E8F0E8] rounded-xl p-4 shadow-sm print:border print:shadow-none print:rounded-none print:border-b print:border-gray-200">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#E8F0E8] flex items-center justify-center flex-shrink-0 print:hidden">
            <ToolOutlined className="text-[#3B7D3C] text-sm" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#1A1A1A] capitalize">
              {COMPONENT_LABELS[item.component] || item.component || "Component"}
              {item.componentInstance && (
                <span className="ml-1.5 text-xs font-semibold text-[#3B7D3C] bg-[#E8F0E8] px-1.5 py-0.5 rounded-md">
                  {item.componentInstance}
                </span>
              )}
            </p>
            {item.maintenanceToBePerformed && (
              <p className="text-xs text-[#5A5A5A] mt-0.5">{item.maintenanceToBePerformed}</p>
            )}
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${s.badge}`}>
          {s.icon} {item.status}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-xs">
        {item.dateOfMaintenance && (
          <div><span className="text-[#5A5A5A]">Due Date: </span><span className="font-medium">{new Date(item.dateOfMaintenance).toLocaleDateString()}</span></div>
        )}
        {item.completionDate && (
          <div><span className="text-[#5A5A5A]">Completed: </span><span className="font-medium text-green-700">{new Date(item.completionDate).toLocaleDateString()}</span></div>
        )}
        {item.nextMaintenanceMileage && (
          <div><span className="text-[#5A5A5A]">Due at: </span><span className="font-medium">{Number(item.nextMaintenanceMileage).toLocaleString()} mi</span></div>
        )}
        {item.vendor && (
          <div><span className="text-[#5A5A5A]">Shop: </span><span className="font-medium">{item.vendor}</span></div>
        )}
        {item.cost != null && (
          <div><span className="text-[#5A5A5A]">Cost: </span><span className="font-medium">${Number(item.cost).toLocaleString()}</span></div>
        )}
        {(item.recurringMiles || item.recurringMonths) && (
          <div className="text-[#3B7D3C] font-medium">
            ↻ Every
            {item.recurringMiles ? ` ${Number(item.recurringMiles).toLocaleString()} mi` : ""}
            {item.recurringMiles && item.recurringMonths ? " or" : ""}
            {item.recurringMonths ? ` ${item.recurringMonths} mo` : ""}
          </div>
        )}
      </div>

      {item.notes && (
        <p className="text-xs text-[#5A5A5A] italic mt-2 border-t border-[#F5F5F0] pt-2">{item.notes}</p>
      )}
    </div>
  );
};

const MaintenanceReport = () => {
  const { data, isLoading, isError } = useGetMaintanceQuery();

  const [dateRange, setDateRange] = useState(null);
  const [component, setComponent] = useState("");
  const [unit, setUnit] = useState("");
  const [status, setStatus] = useState("");

  const allItems = data?.data || [];

  const filtered = useMemo(() => {
    return allItems.filter((item) => {
      // Date range — checks dateOfMaintenance OR completionDate
      if (dateRange && dateRange[0] && dateRange[1]) {
        const from = dateRange[0].startOf("day");
        const to = dateRange[1].endOf("day");
        const dueDt = item.dateOfMaintenance ? dayjs(item.dateOfMaintenance) : null;
        const completeDt = item.completionDate ? dayjs(item.completionDate) : null;
        const inRange = (d) => d && d.isAfter(from) && d.isBefore(to);
        if (!inRange(dueDt) && !inRange(completeDt)) return false;
      }
      // Component
      if (component && item.component !== component) return false;
      // Specific unit
      if (unit.trim() && !(item.componentInstance || "").toLowerCase().includes(unit.trim().toLowerCase())) return false;
      // Status
      if (status && item.status !== status) return false;
      return true;
    });
  }, [allItems, dateRange, component, unit, status]);

  // Summary counts for filtered results
  const summary = useMemo(() => ({
    total: filtered.length,
    completed: filtered.filter(i => i.status === "completed").length,
    overdue: filtered.filter(i => i.status === "overdue").length,
    upcoming: filtered.filter(i => i.status === "upcoming").length,
    scheduled: filtered.filter(i => i.status === "scheduled").length,
    totalCost: filtered.reduce((sum, i) => sum + (i.cost ? Number(i.cost) : 0), 0),
  }), [filtered]);

  const hasFilters = dateRange || component || unit.trim() || status;

  return (
    <div className="min-h-screen bg-[#F5F5F0] print:bg-white">
      <div className="max-w-site mx-auto px-4 lg:px-6 2xl:px-8 py-10 print:py-4">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 print:mb-4">
          <div>
            <div className="flex items-center gap-3">
              <img src={logo} alt="My RV Vault" className="h-20 w-auto flex-shrink-0" />
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-1 h-8 bg-[#D4872D] rounded-full print:hidden" />
                  <h1 className="text-3xl font-bold text-[#1A1A1A] flex items-center gap-2">
                    <FileTextOutlined className="text-[#D4872D] print:hidden" />
                    Maintenance Report
                  </h1>
                </div>
                <p className="text-[#5A5A5A] text-sm">
                  {filtered.length} record{filtered.length !== 1 ? "s" : ""} matched
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2 print:hidden">
            <Link to="/maintenanceOverdue">
              <button className="flex items-center gap-2 border border-[#E0E0E0] text-[#5A5A5A] px-4 py-2.5 rounded-xl font-medium text-sm hover:border-[#3B7D3C] hover:text-[#3B7D3C] transition-colors duration-200">
                <ArrowLeftOutlined /> Back
              </button>
            </Link>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-[#D4872D] text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-[#B8721F] transition-colors duration-200 shadow-sm"
            >
              <PrinterOutlined /> Print / Export
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-[#E8F0E8] rounded-2xl p-5 mb-6 shadow-sm print:hidden">
          <div className="flex items-center gap-2 mb-4">
            <FilterOutlined className="text-[#3B7D3C]" />
            <span className="text-sm font-semibold text-[#1A1A1A]">Filter Records</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range */}
            <div>
              <p className="text-xs font-medium text-[#5A5A5A] mb-1.5">Date Range</p>
              <RangePicker
                className="w-full"
                size="large"
                format="MM/DD/YYYY"
                placeholder={["From date", "To date"]}
                onChange={(val) => setDateRange(val)}
              />
            </div>

            {/* Component */}
            <div>
              <p className="text-xs font-medium text-[#5A5A5A] mb-1.5">Component</p>
              <Select
                className="w-full"
                size="large"
                value={component}
                onChange={setComponent}
                options={COMPONENT_OPTIONS}
              />
            </div>

            {/* Specific Unit */}
            <div>
              <p className="text-xs font-medium text-[#5A5A5A] mb-1.5">Specific Unit</p>
              <Input
                size="large"
                placeholder="e.g. Front, Mid, Rear…"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                allowClear
              />
            </div>

            {/* Status */}
            <div>
              <p className="text-xs font-medium text-[#5A5A5A] mb-1.5">Status</p>
              <Select
                className="w-full"
                size="large"
                value={status}
                onChange={setStatus}
                options={STATUS_OPTIONS}
              />
            </div>
          </div>

          {hasFilters && (
            <button
              onClick={() => { setDateRange(null); setComponent(""); setUnit(""); setStatus(""); }}
              className="mt-3 text-xs text-[#5A5A5A] hover:text-red-500 transition-colors duration-200 underline"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Summary Bar */}
        {!isLoading && filtered.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            {[
              { label: "Total", value: summary.total, color: "text-[#1A1A1A]", bg: "bg-white" },
              { label: "Completed", value: summary.completed, color: "text-green-700", bg: "bg-green-50" },
              { label: "Overdue", value: summary.overdue, color: "text-red-700", bg: "bg-red-50" },
              { label: "Upcoming", value: summary.upcoming, color: "text-amber-700", bg: "bg-amber-50" },
              { label: "Scheduled", value: summary.scheduled, color: "text-blue-700", bg: "bg-blue-50" },
              { label: "Total Cost", value: `$${summary.totalCost.toLocaleString()}`, color: "text-[#D4872D]", bg: "bg-orange-50" },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`${bg} border border-[#E8F0E8] rounded-xl p-3 text-center shadow-sm`}>
                <p className={`text-lg font-bold ${color}`}>{value}</p>
                <p className="text-xs text-[#5A5A5A] mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Print header (only visible in print) */}
        <div className="hidden print:block mb-4 pb-4 border-b border-gray-300">
          <p className="text-xs text-gray-500">
            Generated: {new Date().toLocaleDateString()} ·
            {component ? ` Component: ${COMPONENT_LABELS[component] || component}` : " All components"}
            {unit ? ` · Unit: ${unit}` : ""}
            {status ? ` · Status: ${status}` : ""}
            {dateRange ? ` · ${dateRange[0]?.format("MM/DD/YYYY")} – ${dateRange[1]?.format("MM/DD/YYYY")}` : ""}
          </p>
          <p className="font-bold text-sm mt-1">{filtered.length} records · Total Cost: ${summary.totalCost.toLocaleString()}</p>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex justify-center py-20"><Spin size="large" /></div>
        ) : isError ? (
          <div className="bg-white border border-red-200 rounded-2xl p-8 text-center">
            <p className="text-red-500 font-medium">Failed to load maintenance data.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-[#E8F0E8] rounded-2xl p-12 text-center shadow-sm">
            <Empty description={<span className="text-[#5A5A5A]">{hasFilters ? "No records match the selected filters." : "No maintenance records found."}</span>} />
          </div>
        ) : (
          <div className="space-y-3 print:space-y-2">
            {filtered.map((item) => (
              <ReportRow key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MaintenanceReport;
