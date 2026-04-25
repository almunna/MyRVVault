import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Spin, Modal, message } from "antd";
import {
  WarningOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  ToolOutlined,
  PlusOutlined,
  DownOutlined,
  RightOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useGetMaintanceAllQuery, useDeleteMaintanceMutation } from "../redux/api/routesApi";

const statusConfig = {
  overdue: {
    label: "Overdue",
    icon: <WarningOutlined />,
    accent: "#DC2626",
    bg: "#FEF2F2",
    border: "#FECACA",
    badge: "bg-red-100 text-red-700 border border-red-200",
    dot: "bg-red-500",
  },
  scheduled: {
    label: "Scheduled",
    icon: <CalendarOutlined />,
    accent: "#3B7D3C",
    bg: "#F0FDF4",
    border: "#BBF7D0",
    badge: "bg-green-100 text-green-700 border border-green-200",
    dot: "bg-green-500",
  },
  upcoming: {
    label: "Upcoming",
    icon: <ClockCircleOutlined />,
    accent: "#D4872D",
    bg: "#FFFBEB",
    border: "#FDE68A",
    badge: "bg-amber-100 text-amber-700 border border-amber-200",
    dot: "bg-amber-500",
  },
};

const ItemCard = ({ item }) => {
  const [expanded, setExpanded] = useState(false);
  const [deleteMaintance] = useDeleteMaintanceMutation();

  const handleDelete = () => {
    Modal.confirm({
      title: "Delete maintenance record?",
      content: `This will permanently remove the "${item.component || "maintenance"}" entry. This action cannot be undone.`,
      okText: "Delete",
      okButtonProps: { danger: true },
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await deleteMaintance(item.id).unwrap();
          message.success("Maintenance record deleted");
        } catch {
          message.error("Failed to delete record");
        }
      },
    });
  };

  return (
    <div className="bg-white border border-[#E8F0E8] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Card Header */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#F5F5F0] transition-colors duration-150"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#E8F0E8] flex items-center justify-center flex-shrink-0">
            <ToolOutlined className="text-[#3B7D3C] text-sm" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#1A1A1A] truncate capitalize">
              {item.component || "Unknown Component"}
            </p>
            {item.maintenanceToBePerformed && (
              <p className="text-xs text-[#5A5A5A] truncate">
                {item.maintenanceToBePerformed}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {item.status && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium hidden sm:inline-flex ${
                item.status === "overdue"
                  ? statusConfig.overdue.badge
                  : item.status === "scheduled"
                  ? statusConfig.scheduled.badge
                  : statusConfig.upcoming.badge
              }`}
            >
              {item.status}
            </span>
          )}
          {expanded ? (
            <DownOutlined className="text-[#5A5A5A] text-xs" />
          ) : (
            <RightOutlined className="text-[#5A5A5A] text-xs" />
          )}
        </div>
      </button>

      {/* Expandable Details */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-[#E8F0E8] pt-3 space-y-2">
          {[
            { label: "Component", value: item.component },
            { label: "Maintenance", value: item.maintenanceToBePerformed },
            {
              label: "Next Service Date",
              value: item.nextMaintenanceDate
                ? new Date(item.nextMaintenanceDate).toLocaleDateString()
                : null,
            },
            {
              label: "Date of Service",
              value: item.dateOfMaintenance
                ? new Date(item.dateOfMaintenance).toLocaleDateString()
                : null,
            },
            {
              label: "Next Service Mileage",
              value: item.nextMaintenanceMileage
                ? `${Number(item.nextMaintenanceMileage).toLocaleString()} mi`
                : null,
            },
            {
              label: "Mileage at Service",
              value: item.milageAtMaintenance
                ? `${Number(item.milageAtMaintenance).toLocaleString()} mi`
                : null,
            },
            { label: "Days Until Due", value: item.daysUntilDue },
            { label: "RV Type", value: item.rvType },
            { label: "Notes", value: item.notes },
          ]
            .filter((f) => f.value)
            .map(({ label, value }) => (
              <div key={label} className="flex justify-between gap-4 text-sm">
                <span className="text-[#5A5A5A] flex-shrink-0">{label}</span>
                <span className="text-[#1A1A1A] font-medium text-right">{value}</span>
              </div>
            ))}

          <div className="flex justify-end gap-2 pt-2 border-t border-[#E8F0E8] mt-3">
            <button
              onClick={handleDelete}
              className="text-xs px-3 py-1.5 rounded-lg border border-red-300 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200 font-medium flex items-center gap-1"
            >
              <DeleteOutlined />
              Delete
            </button>
            <Link to={`/UpdateMaintanceSchedule/${item.id}`}>
              <button className="text-xs px-3 py-1.5 rounded-lg border border-[#3B7D3C] text-[#3B7D3C] hover:bg-[#3B7D3C] hover:text-white transition-all duration-200 font-medium">
                Edit
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

const Section = ({ sectionKey, items }) => {
  const [open, setOpen] = useState(sectionKey === "overdue");
  const cfg = statusConfig[sectionKey];

  return (
    <div className="mb-4">
      {/* Section Toggle */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between bg-white border border-[#E8F0E8] rounded-2xl px-5 py-4 shadow-sm hover:shadow-md transition-shadow duration-200 group"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm flex-shrink-0"
            style={{ backgroundColor: cfg.accent }}
          >
            {cfg.icon}
          </div>
          <div className="text-left">
            <span className="text-base font-semibold text-[#1A1A1A] group-hover:text-[#3B7D3C] transition-colors duration-200">
              {cfg.label}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="text-sm font-bold px-3 py-1 rounded-full"
            style={{ backgroundColor: cfg.bg, color: cfg.accent, border: `1px solid ${cfg.border}` }}
          >
            {items.length} {items.length === 1 ? "item" : "items"}
          </span>
          {open ? (
            <DownOutlined className="text-[#5A5A5A] text-xs" />
          ) : (
            <RightOutlined className="text-[#5A5A5A] text-xs" />
          )}
        </div>
      </button>

      {/* Items Grid */}
      {open && (
        <div className="mt-3">
          {items.length === 0 ? (
            <div className="bg-white border border-[#E8F0E8] rounded-xl p-8 text-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                style={{ backgroundColor: cfg.bg }}
              >
                <span style={{ color: cfg.accent, fontSize: 20 }}>{cfg.icon}</span>
              </div>
              <p className="text-[#5A5A5A] text-sm">No {cfg.label.toLowerCase()} maintenance items</p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-3">
              {items.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const OverDue = () => {
  const { data, isLoading, isError } = useGetMaintanceAllQuery();

  const overdueData = data?.data?.overdue || [];
  const scheduledData = data?.data?.scheduled || [];
  const upcomingData = data?.data?.upcoming || [];
  const total = overdueData.length + scheduledData.length + upcomingData.length;

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="max-w-site mx-auto px-4 lg:px-6 2xl:px-8 py-10">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-1 h-8 bg-[#D4872D] rounded-full" />
              <h1 className="text-3xl font-bold text-[#1A1A1A]">Maintenance</h1>
            </div>
            <p className="text-[#5A5A5A] text-sm ml-4 pl-3">
              {isLoading ? "Loading…" : `${total} total maintenance record${total !== 1 ? "s" : ""}`}
            </p>
          </div>
          <Link to="/AddNewMaintanceSchedule">
            <button className="flex items-center gap-2 bg-[#3B7D3C] text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-[#2d6130] transition-colors duration-200 shadow-sm">
              <PlusOutlined />
              New Maintenance
            </button>
          </Link>
        </div>

        {/* Summary Pills */}
        {!isLoading && !isError && (
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { key: "overdue", count: overdueData.length },
              { key: "scheduled", count: scheduledData.length },
              { key: "upcoming", count: upcomingData.length },
            ].map(({ key, count }) => {
              const cfg = statusConfig[key];
              return (
                <div
                  key={key}
                  className="bg-white border border-[#E8F0E8] rounded-xl p-4 shadow-sm text-center"
                >
                  <div
                    className="w-2 h-2 rounded-full mx-auto mb-2"
                    style={{ backgroundColor: cfg.accent }}
                  />
                  <p className="text-2xl font-bold text-[#1A1A1A]">{count}</p>
                  <p className="text-xs text-[#5A5A5A] mt-0.5">{cfg.label}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spin size="large" />
          </div>
        ) : isError ? (
          <div className="bg-white border border-red-200 rounded-2xl p-8 text-center">
            <p className="text-red-500 font-medium">Failed to load maintenance data.</p>
          </div>
        ) : (
          <>
            <Section sectionKey="overdue" items={overdueData} />
            <Section sectionKey="scheduled" items={scheduledData} />
            <Section sectionKey="upcoming" items={upcomingData} />
          </>
        )}
      </div>
    </div>
  );
};

export default OverDue;
