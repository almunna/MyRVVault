import { Link } from "react-router-dom";
import { Spin, Empty, Modal, message } from "antd";
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  ToolOutlined, CalendarOutlined, ClockCircleOutlined,
  CheckCircleOutlined, WarningOutlined, ExclamationCircleOutlined,
} from "@ant-design/icons";
import {
  useDeleteMaintanceMutation,
  useGetMaintanceQuery,
} from "../redux/api/routesApi";

// ── status badge ──────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  overdue:   { label: "Overdue",   bg: "bg-red-100",   text: "text-red-700",   icon: <WarningOutlined /> },
  upcoming:  { label: "Due Soon",  bg: "bg-amber-100", text: "text-amber-700", icon: <ExclamationCircleOutlined /> },
  scheduled: { label: "Scheduled", bg: "bg-blue-50",   text: "text-blue-600",  icon: <CalendarOutlined /> },
  completed: { label: "Completed", bg: "bg-green-100", text: "text-green-700", icon: <CheckCircleOutlined /> },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.scheduled;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
};

// ── detail row ────────────────────────────────────────────────────────────────
const Row = ({ label, value }) =>
  value ? (
    <div className="flex justify-between text-xs gap-2">
      <span className="text-[#5A5A5A] flex-shrink-0">{label}</span>
      <span className="font-medium text-[#1A1A1A] text-right">{value}</span>
    </div>
  ) : null;

// ── card ──────────────────────────────────────────────────────────────────────
const MaintenanceCard = ({ item, onDelete }) => {
  const status = item.status || "scheduled";
  const borderColor =
    status === "overdue"   ? "border-red-200" :
    status === "upcoming"  ? "border-amber-200" :
    status === "completed" ? "border-green-200" :
    "border-[#E8F0E8]";

  const dueLabel = (() => {
    if (item.daysUntilDue != null) {
      if (item.daysUntilDue < 0) return `${Math.abs(item.daysUntilDue)} days overdue`;
      if (item.daysUntilDue === 0) return "Due today";
      return `In ${item.daysUntilDue} days`;
    }
    if (item.mileageUntilDue != null) {
      if (item.mileageUntilDue < 0) return `${Math.abs(item.mileageUntilDue).toLocaleString()} mi overdue`;
      return `In ${item.mileageUntilDue.toLocaleString()} mi`;
    }
    return null;
  })();

  return (
    <div className={`bg-white border ${borderColor} rounded-2xl p-5 shadow-sm flex flex-col gap-4`}>

      {/* Card header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#E8F0E8] flex items-center justify-center flex-shrink-0">
            <ToolOutlined className="text-[#3B7D3C]" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#1A1A1A] capitalize">{item.component || "Component"}</p>
            {item.maintenanceToBePerformed && (
              <p className="text-xs text-[#5A5A5A] mt-0.5 line-clamp-1">{item.maintenanceToBePerformed}</p>
            )}
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Due timing highlight */}
      {dueLabel && (
        <div className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl ${
          status === "overdue" ? "bg-red-50 text-red-700" :
          status === "upcoming" ? "bg-amber-50 text-amber-700" :
          "bg-[#F5F5F0] text-[#5A5A5A]"
        }`}>
          <ClockCircleOutlined />
          {dueLabel}
        </div>
      )}

      {/* Details */}
      <div className="space-y-1.5 border-t border-[#F5F5F0] pt-3">
        <Row label="Due Date"
          value={item.dateOfMaintenance ? new Date(item.dateOfMaintenance).toLocaleDateString() : null} />
        <Row label="Next Date"
          value={item.nextMaintenanceDate ? new Date(item.nextMaintenanceDate).toLocaleDateString() : null} />
        <Row label="Due at Mileage"
          value={item.nextMaintenanceMileage ? `${Number(item.nextMaintenanceMileage).toLocaleString()} mi` : null} />
        <Row label="Generator Hours"
          value={item.hoursAtMaintenance ? `${item.hoursAtMaintenance} hrs` : null} />
        <Row label="Cost"
          value={item.cost ? `$${Number(item.cost).toLocaleString()}` : null} />
        {item.notes && (
          <p className="text-xs text-[#5A5A5A] italic pt-1 line-clamp-2">{item.notes}</p>
        )}
      </div>

      {/* Photo thumbnail */}
      {item.images?.length > 0 && (
        <img
          src={item.images[0]}
          alt="maintenance"
          className="w-full h-32 object-cover rounded-xl"
        />
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1 border-t border-[#F5F5F0]">
        <Link to={`/UpdateMaintanceSchedule/${item.id}`} className="flex-1">
          <button className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-[#3B7D3C] border border-[#E8F0E8] hover:border-[#3B7D3C] hover:bg-[#E8F0E8] rounded-xl py-2 transition-all duration-200">
            <EditOutlined /> Edit
          </button>
        </Link>
        <button
          onClick={() => onDelete(item.id)}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-red-500 border border-red-100 hover:border-red-400 hover:bg-red-50 rounded-xl py-2 transition-all duration-200"
        >
          <DeleteOutlined /> Delete
        </button>
      </div>
    </div>
  );
};

// ── page ──────────────────────────────────────────────────────────────────────
const NewMaintenace = () => {
  const { data, isLoading, isError } = useGetMaintanceQuery();
  const [deleteMaintenance] = useDeleteMaintanceMutation();

  const items    = data?.data || [];
  const overdue  = items.filter(i => i.status === "overdue").length;
  const upcoming = items.filter(i => i.status === "upcoming").length;

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Delete this maintenance record?",
      content: "This cannot be undone.",
      okText: "Delete", okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const res = await deleteMaintenance(id).unwrap();
          message.success(res?.message || "Deleted successfully");
        } catch (err) {
          message.error(err?.data?.message || "Delete failed");
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

  if (isError) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex justify-center items-center">
        <p className="text-red-500">Failed to load maintenance records.</p>
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
              <h1 className="text-3xl font-bold text-[#1A1A1A]">Maintenance Schedule</h1>
            </div>
            <p className="text-[#5A5A5A] text-sm ml-4 pl-3">
              {items.length} record{items.length !== 1 ? "s" : ""}
              {overdue > 0 && <span className="text-red-600 font-semibold"> · {overdue} overdue</span>}
              {upcoming > 0 && <span className="text-amber-600 font-semibold"> · {upcoming} due soon</span>}
            </p>
          </div>
          <Link to="/AddNewMaintanceSchedule">
            <button className="flex items-center gap-2 bg-[#3B7D3C] text-white px-5 py-2 rounded-xl font-medium text-sm hover:bg-[#2d6130] transition-colors shadow-sm">
              <PlusOutlined /> New Maintenance
            </button>
          </Link>
        </div>

        {/* Summary stat pills */}
        {items.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-6">
            {[
              { label: "Total",     count: items.length,  color: "bg-white text-[#1A1A1A] border border-[#E8F0E8]" },
              { label: "Overdue",   count: overdue,        color: "bg-red-50 text-red-700 border border-red-200" },
              { label: "Due Soon",  count: upcoming,       color: "bg-amber-50 text-amber-700 border border-amber-200" },
              { label: "Scheduled", count: items.filter(i => i.status === "scheduled").length, color: "bg-blue-50 text-blue-700 border border-blue-200" },
              { label: "Completed", count: items.filter(i => i.status === "completed").length, color: "bg-green-50 text-green-700 border border-green-200" },
            ].filter(p => p.count > 0).map(p => (
              <span key={p.label} className={`text-xs font-semibold px-3 py-1.5 rounded-full ${p.color}`}>
                {p.label}: {p.count}
              </span>
            ))}
          </div>
        )}

        {/* Grid */}
        {items.length === 0 ? (
          <div className="bg-white border border-[#E8F0E8] rounded-2xl p-12 text-center shadow-sm">
            <Empty
              description={
                <span className="text-[#5A5A5A]">
                  No maintenance records yet.{" "}
                  <Link to="/AddNewMaintanceSchedule" className="text-[#3B7D3C] underline">
                    Add your first one
                  </Link>
                </span>
              }
            />
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4">
            {items.map(item => (
              <MaintenanceCard key={item.id} item={item} onDelete={handleDelete} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default NewMaintenace;
