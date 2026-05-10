import { useState } from "react";
import { Link } from "react-router-dom";
import { Spin, Empty, Modal, Form, Input, message } from "antd";
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  ToolOutlined, CalendarOutlined, ClockCircleOutlined,
  CheckCircleOutlined, WarningOutlined, ExclamationCircleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import {
  useDeleteMaintanceMutation,
  useGetMaintanceQuery,
  useMarkMaintenanceCompleteMutation,
} from "../redux/api/routesApi";
import { useGetProfileQuery } from "../redux/api/userApi";

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
const MaintenanceCard = ({ item, onDelete, onMarkComplete }) => {
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
            <p className="text-sm font-bold text-[#1A1A1A] capitalize">
              {item.component || "Component"}
              {item.componentInstance && (
                <span className="ml-1.5 text-xs font-semibold text-[#3B7D3C] bg-[#E8F0E8] px-1.5 py-0.5 rounded-md">
                  {item.componentInstance}
                </span>
              )}
            </p>
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
        <Row label="Repair Shop" value={item.vendor || null} />
        <Row label="Cost"
          value={item.cost ? `$${Number(item.cost).toLocaleString()}` : null} />
        <Row label="Generator Hours"
          value={item.hoursAtMaintenance ? `${item.hoursAtMaintenance} hrs` : null} />
        {(item.recurringMiles || item.recurringMonths) && (
          <div className="flex items-center gap-1.5 text-xs text-[#3B7D3C] font-medium pt-1">
            <span className="text-base leading-none">↻</span>
            Every
            {item.recurringMiles ? ` ${Number(item.recurringMiles).toLocaleString()} mi` : ""}
            {item.recurringMiles && item.recurringMonths ? " or" : ""}
            {item.recurringMonths ? ` ${item.recurringMonths} mo` : ""}
          </div>
        )}
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
      <div className="flex flex-col gap-2 pt-1 border-t border-[#F5F5F0]">
        {status !== "completed" && (
          <button
            onClick={() => onMarkComplete(item)}
            className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-[#3B7D3C] hover:bg-[#2d6130] rounded-xl py-2 transition-all duration-200"
          >
            <CheckCircleOutlined /> Mark as Complete
          </button>
        )}
        <div className="flex gap-2">
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
    </div>
  );
};

// ── page ──────────────────────────────────────────────────────────────────────
const NewMaintenace = () => {
  const { data, isLoading, isError } = useGetMaintanceQuery();
  const { data: profileData } = useGetProfileQuery();
  const [deleteMaintenance] = useDeleteMaintanceMutation();
  const [markComplete] = useMarkMaintenanceCompleteMutation();
  const [completeModal, setCompleteModal] = useState(null);
  const [completeForm] = Form.useForm();
  const [completing, setCompleting] = useState(false);

  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState(["", ""]);

  // Sort all items chronologically — oldest due date first, no-date items go last
  const items = [...(data?.data || [])].sort((a, b) => {
    const da = a.dateOfMaintenance ? new Date(a.dateOfMaintenance) : null;
    const db = b.dateOfMaintenance ? new Date(b.dateOfMaintenance) : null;
    if (!da && !db) return 0;
    if (!da) return 1;
    if (!db) return -1;
    return da - db;
  });

  const overdue  = items.filter(i => i.status === "overdue").length;
  const upcoming = items.filter(i => i.status === "upcoming").length;

  const hasDateRange = !!(dateRange[0] && dateRange[1]);

  // Apply status + date range filter
  const visibleItems = items.filter(i => {
    if (statusFilter && i.status !== statusFilter) return false;
    if (hasDateRange) {
      const d = i.dateOfMaintenance ? new Date(i.dateOfMaintenance) : null;
      if (!d) return false;
      const start = new Date(dateRange[0]);
      const end = new Date(dateRange[1]);
      end.setHours(23, 59, 59, 999);
      if (d < start || d > end) return false;
    }
    return true;
  });

  const toggleFilter = (key) => setStatusFilter(prev => prev === key ? "" : key);

  const sel = profileData?.user?.selectedRvId;
  const rvId = typeof sel === "string" ? sel : sel?.id;

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

  const handleMarkComplete = (item) => {
    setCompleteModal(item);
    completeForm.resetFields();
  };

  const handleCompleteSubmit = async (values) => {
    if (!rvId) return message.error("No RV selected");
    setCompleting(true);
    try {
      const res = await markComplete({
        rvId,
        maintenanceScheduleId: completeModal.id,
        vendor: values.vendor,
        cost: values.cost ? Number(values.cost) : undefined,
        date: new Date().toISOString(),
      }).unwrap();
      const msg = res?.data?.nextSchedule
        ? "Marked complete! Next service auto-scheduled."
        : "Marked as complete.";
      message.success(msg);
      setCompleteModal(null);
    } catch (err) {
      message.error(err?.data?.message || "Failed to mark complete");
    } finally {
      setCompleting(false);
    }
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
              {(statusFilter || hasDateRange)
                ? <>{visibleItems.length} record{visibleItems.length !== 1 ? "s" : ""} <span className="text-[#3B7D3C]">(filtered)</span></>
                : <>{items.length} record{items.length !== 1 ? "s" : ""}
                    {overdue > 0 && <span className="text-red-600 font-semibold"> · {overdue} overdue</span>}
                    {upcoming > 0 && <span className="text-amber-600 font-semibold"> · {upcoming} due soon</span>}
                  </>
              }
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/maintenanceReport">
              <button className="flex items-center gap-2 border border-[#3B7D3C] text-[#3B7D3C] px-4 py-2 rounded-xl font-medium text-sm hover:bg-[#3B7D3C] hover:text-white transition-colors duration-200">
                <FileTextOutlined /> Reports
              </button>
            </Link>
            <Link to="/AddNewMaintanceSchedule">
              <button className="flex items-center gap-2 bg-[#3B7D3C] text-white px-5 py-2 rounded-xl font-medium text-sm hover:bg-[#2d6130] transition-colors shadow-sm">
                <PlusOutlined /> New Maintenance
              </button>
            </Link>
          </div>
        </div>

        {/* Filter row: status pills + date range picker */}
        {items.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="flex flex-wrap gap-2">
              {[
                { label: "All",       key: "",          count: items.length,                                          base: "bg-white text-[#1A1A1A] border border-[#E8F0E8]",       active: "bg-[#1A1A1A] text-white border-[#1A1A1A]" },
                { label: "Overdue",   key: "overdue",   count: overdue,                                               base: "bg-red-50 text-red-700 border border-red-200",           active: "bg-red-600 text-white border-red-600" },
                { label: "Due Soon",  key: "upcoming",  count: upcoming,                                              base: "bg-amber-50 text-amber-700 border border-amber-200",     active: "bg-amber-500 text-white border-amber-500" },
                { label: "Scheduled", key: "scheduled", count: items.filter(i => i.status === "scheduled").length,   base: "bg-blue-50 text-blue-700 border border-blue-200",        active: "bg-blue-600 text-white border-blue-600" },
                { label: "Completed", key: "completed", count: items.filter(i => i.status === "completed").length,   base: "bg-green-50 text-green-700 border border-green-200",     active: "bg-green-600 text-white border-green-600" },
              ].filter(p => p.count > 0).map(p => {
                const isActive = statusFilter === p.key;
                return (
                  <button
                    key={p.label}
                    onClick={() => toggleFilter(p.key)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all duration-200 ${isActive ? p.active : p.base} hover:opacity-80`}
                  >
                    {p.label}: {p.count}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 ml-auto">
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
            </div>
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
        ) : visibleItems.length === 0 ? (
          <div className="bg-white border border-[#E8F0E8] rounded-2xl p-10 text-center shadow-sm">
            <p className="text-[#5A5A5A] text-sm">No records match the current filters.</p>
            <button
              onClick={() => { setStatusFilter(""); setDateRange(["", ""]); }}
              className="mt-2 text-xs text-[#3B7D3C] underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4">
            {visibleItems.map(item => (
              <MaintenanceCard key={item.id} item={item} onDelete={handleDelete} onMarkComplete={handleMarkComplete} />
            ))}
          </div>
        )}

      </div>

      {/* Mark Complete Modal */}
      <Modal
        open={!!completeModal}
        onCancel={() => setCompleteModal(null)}
        footer={null}
        centered
        title={
          <span className="font-semibold text-[#1A1A1A]">
            Mark as Complete
            {completeModal?.componentInstance
              ? ` — ${completeModal.component} (${completeModal.componentInstance})`
              : completeModal?.component
              ? ` — ${completeModal.component}`
              : ""}
          </span>
        }
      >
        <Form form={completeForm} onFinish={handleCompleteSubmit} layout="vertical" className="mt-2">
          <Form.Item label="Vendor / Shop (optional)" name="vendor">
            <Input placeholder="e.g. Camping World, Local Shop…" size="large" />
          </Form.Item>
          <Form.Item label="Actual Cost (optional)" name="cost">
            <Input placeholder="e.g. 150" prefix="$" type="number" min="0" size="large" />
          </Form.Item>
          {(completeModal?.recurringMiles || completeModal?.recurringMonths) && (
            <div className="bg-[#E8F0E8] rounded-xl px-4 py-3 mb-4 text-sm text-[#3B7D3C] font-medium">
              ↻ Next service will auto-schedule every
              {completeModal?.recurringMiles ? ` ${Number(completeModal.recurringMiles).toLocaleString()} mi` : ""}
              {completeModal?.recurringMiles && completeModal?.recurringMonths ? " or" : ""}
              {completeModal?.recurringMonths ? ` ${completeModal.recurringMonths} months` : ""}
            </div>
          )}
          <button
            type="submit"
            disabled={completing}
            className="w-full bg-[#3B7D3C] text-white py-3 rounded-xl font-semibold hover:bg-[#2d6130] transition-colors duration-200"
          >
            {completing ? "Saving…" : "Confirm Complete"}
          </button>
        </Form>
      </Modal>
    </div>
  );
};

export default NewMaintenace;
