import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Spin, Modal, message } from "antd";
import {
  BellOutlined, DeleteOutlined, CheckOutlined,
  CheckCircleOutlined, ArrowRightOutlined,
} from "@ant-design/icons";
import {
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useDeleteNotificationMutation,
  useClearAllNotificationsMutation,
  useGenerateNotificationsMutation,
} from "../redux/api/routesApi";

// ── helpers ───────────────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  maintenance:      { label: "Maintenance",  bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200"   },
  generator:        { label: "Generator",    bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200"  },
  warranty:         { label: "Warranty",     bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  insurance:        { label: "Insurance",    bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200"    },
  repair:           { label: "Repair",       bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  mpg:              { label: "MPG Alert",    bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200"  },
  trip:             { label: "Trip",         bg: "bg-teal-50",   text: "text-teal-700",   border: "border-teal-200"   },
  component:        { label: "Component",    bg: "bg-gray-50",   text: "text-gray-700",   border: "border-gray-200"   },
  component_health: { label: "Health",       bg: "bg-rose-50",   text: "text-rose-700",   border: "border-rose-200"   },
};

const PRIORITY_DOT = { high: "bg-red-500", medium: "bg-amber-500", low: "bg-blue-400" };

const fmt = (d) => {
  if (!d) return "";
  const diff = (Date.now() - new Date(d).getTime()) / 1000;
  if (diff < 60)    return "just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800)return `${Math.floor(diff / 86400)}d ago`;
  return new Date(d).toLocaleDateString();
};

const ALL_TYPES = ["all", "maintenance", "generator", "warranty", "insurance", "repair", "mpg", "trip", "component", "component_health"];

// ── main ──────────────────────────────────────────────────────────────────────
const NotificationCenter = () => {
  const [filter, setFilter]     = useState("all");
  const [page, setPage]         = useState(1);

  const { data, isLoading, refetch } = useGetNotificationsQuery({ page: 1, limit: 200 });
  const [markAsRead]    = useMarkNotificationAsReadMutation();
  const [markAll]       = useMarkAllNotificationsAsReadMutation();
  const [deleteN]       = useDeleteNotificationMutation();
  const [clearAll]      = useClearAllNotificationsMutation();
  const [generate]      = useGenerateNotificationsMutation();

  const all   = data?.data  || [];
  const unread = all.filter(n => !n.isRead).length;

  const filtered = filter === "all" ? all : all.filter(n => n.type === filter);

  // Generate on mount
  useEffect(() => { generate().then(() => refetch()); }, []);

  const handleMarkRead = async (id) => {
    await markAsRead(id);
    refetch();
  };

  const handleMarkAll = async () => {
    await markAll();
    message.success("All notifications marked as read");
    refetch();
  };

  const handleDelete = async (id) => {
    await deleteN(id);
    refetch();
  };

  const handleClearAll = () => {
    Modal.confirm({
      title: "Clear all notifications?",
      content: "This will permanently delete all your notifications.",
      okText: "Clear All", okButtonProps: { danger: true },
      onOk: async () => {
        await clearAll();
        message.success("All notifications cleared");
        refetch();
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
              <h1 className="text-3xl font-bold text-[#1A1A1A]">Notifications</h1>
            </div>
            <p className="text-[#5A5A5A] text-sm ml-4 pl-3">
              {all.length} total · {unread} unread
            </p>
          </div>
          <div className="flex gap-2">
            {unread > 0 && (
              <button onClick={handleMarkAll}
                className="flex items-center gap-1.5 text-sm font-medium text-[#3B7D3C] border border-[#E8F0E8] hover:border-[#3B7D3C] px-4 py-2 rounded-xl transition-all">
                <CheckOutlined /> Mark all read
              </button>
            )}
            {all.length > 0 && (
              <button onClick={handleClearAll}
                className="flex items-center gap-1.5 text-sm font-medium text-red-500 border border-red-100 hover:border-red-400 px-4 py-2 rounded-xl transition-all">
                <DeleteOutlined /> Clear all
              </button>
            )}
          </div>
        </div>

        {/* Type filter tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {ALL_TYPES.map(t => {
            const cfg = TYPE_CONFIG[t];
            const count = t === "all" ? all.length : all.filter(n => n.type === t).length;
            if (t !== "all" && count === 0) return null;
            return (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                  filter === t
                    ? "bg-[#3B7D3C] text-white border-[#3B7D3C]"
                    : "bg-white text-[#5A5A5A] border-[#E0E0E0] hover:border-[#3B7D3C]"
                }`}
              >
                {cfg ? cfg.label : "All"} ({count})
              </button>
            );
          })}
        </div>

        {/* Empty state */}
        {filtered.length === 0 ? (
          <div className="bg-white border border-[#E8F0E8] rounded-2xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-[#E8F0E8] flex items-center justify-center mx-auto mb-4">
              <CheckCircleOutlined className="text-3xl text-[#3B7D3C]" />
            </div>
            <p className="text-lg font-semibold text-[#1A1A1A] mb-1">All Clear!</p>
            <p className="text-[#5A5A5A] text-sm">No notifications in this category.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(n => {
              const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.component;
              return (
                <div
                  key={n.id}
                  className={`bg-white border rounded-2xl px-5 py-4 shadow-sm transition-all ${
                    !n.isRead ? "border-[#3B7D3C]/30 bg-[#F0F7F0]" : "border-[#E8F0E8]"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Priority dot */}
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${PRIORITY_DOT[n.priority] || "bg-gray-400"}`} />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                          {cfg.label}
                        </span>
                        {!n.isRead && (
                          <span className="text-[10px] font-bold text-[#3B7D3C] bg-[#E8F0E8] px-2 py-0.5 rounded-full">NEW</span>
                        )}
                        <span className="text-xs text-[#5A5A5A] ml-auto">{fmt(n.createdAt)}</span>
                      </div>
                      <p className="text-sm font-semibold text-[#1A1A1A]">{n.title}</p>
                      <p className="text-sm text-[#5A5A5A]">{n.message}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {n.href && (
                        <Link to={n.href}>
                          <button className="flex items-center gap-1 text-xs font-medium text-[#3B7D3C] border border-[#E8F0E8] hover:border-[#3B7D3C] hover:bg-[#E8F0E8] rounded-lg px-2.5 py-1.5 transition-all">
                            View <ArrowRightOutlined className="text-[10px]" />
                          </button>
                        </Link>
                      )}
                      {!n.isRead && (
                        <button
                          onClick={() => handleMarkRead(n.id)}
                          className="p-1.5 rounded-lg border border-[#E8F0E8] text-[#3B7D3C] hover:bg-[#E8F0E8] transition-all"
                          title="Mark as read"
                        >
                          <CheckOutlined className="text-xs" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(n.id)}
                        className="p-1.5 rounded-lg border border-red-100 text-red-400 hover:bg-red-50 hover:border-red-300 transition-all"
                        title="Delete"
                      >
                        <DeleteOutlined className="text-xs" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Preferences link */}
        <div className="mt-8 text-center">
          <Link to="/profilePage?tab=Notifications" className="text-sm text-[#5A5A5A] hover:text-[#3B7D3C] transition-colors">
            Manage notification preferences →
          </Link>
        </div>

      </div>
    </div>
  );
};

export default NotificationCenter;
