import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Spin, notification } from "antd";
import { BellOutlined, CheckOutlined, BellFilled } from "@ant-design/icons";
import {
  useGetUnreadCountQuery,
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useGenerateNotificationsMutation,
} from "../../Pages/redux/api/routesApi";

const TYPE_COLORS = {
  maintenance:      "bg-blue-100 text-blue-700",
  generator:        "bg-amber-100 text-amber-700",
  warranty:         "bg-purple-100 text-purple-700",
  insurance:        "bg-red-100 text-red-700",
  repair:           "bg-orange-100 text-orange-700",
  mpg:              "bg-green-100 text-green-700",
  trip:             "bg-teal-100 text-teal-700",
  component:        "bg-gray-100 text-gray-700",
  component_health: "bg-rose-100 text-rose-700",
};

const PRIORITY_DOT = {
  high:   "bg-red-500",
  medium: "bg-amber-500",
  low:    "bg-blue-400",
};

const timeSince = (dateStr) => {
  if (!dateStr) return "";
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60)    return "just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const GENERATE_INTERVAL_MS = 60_000; // generate every 60 s
const COUNT_POLL_MS         = 15_000; // re-check unread count every 15 s

const NotificationBell = () => {
  const [open, setOpen]         = useState(false);
  const [notifApi, contextHolder] = notification.useNotification();
  const ref          = useRef(null);
  const prevUnread   = useRef(null);
  const navigate     = useNavigate();

  const { data: countData, refetch: refetchCount } = useGetUnreadCountQuery(undefined, {
    pollingInterval: COUNT_POLL_MS,
  });
  const { data: listData, isLoading } = useGetNotificationsQuery(
    { page: 1, limit: 5 },
    { skip: !open }
  );
  const [markAsRead] = useMarkNotificationAsReadMutation();
  const [markAll]    = useMarkAllNotificationsAsReadMutation();
  const [generate]   = useGenerateNotificationsMutation();

  const unread        = countData?.count   || 0;
  const notifications = listData?.data     || [];

  // ── Background generation loop ────────────────────────────────────────────
  useEffect(() => {
    const run = () => generate().then(() => refetchCount());
    run(); // run immediately on mount
    const id = setInterval(run, GENERATE_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  // ── Toast when new notifications arrive ──────────────────────────────────
  useEffect(() => {
    if (prevUnread.current !== null && unread > prevUnread.current) {
      const diff = unread - prevUnread.current;
      notifApi.info({
        message: `${diff} new notification${diff > 1 ? "s" : ""}`,
        description: "Open the bell to view details.",
        placement: "topRight",
        duration: 4,
        icon: <BellFilled style={{ color: "#3B7D3C" }} />,
      });
    }
    prevUnread.current = unread;
  }, [unread]);

  // ── Refresh list when bell opens ──────────────────────────────────────────
  useEffect(() => {
    if (open) {
      generate().then(() => refetchCount());
    }
  }, [open]);

  // ── Close on outside click ────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleMarkAll = async () => {
    await markAll();
    refetchCount();
  };

  const handleNotificationClick = (n) => {
    setOpen(false);
    navigate(`/notifications/${n.id}`);
  };

  return (
    <>
      {contextHolder}
      <div className="relative" ref={ref}>
        {/* Bell button */}
        <button
          onClick={() => setOpen(o => !o)}
          className="relative p-2 rounded-lg hover:bg-[#F5F5F0] transition-colors duration-200"
          aria-label="Notifications"
        >
          <BellOutlined className="text-[#1A1A1A] text-lg" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-[#E8F0E8] rounded-2xl shadow-xl z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#E8F0E8]">
              <span className="text-sm font-semibold text-[#1A1A1A]">
                Notifications {unread > 0 && <span className="text-red-500">({unread} new)</span>}
              </span>
              {unread > 0 && (
                <button
                  onClick={handleMarkAll}
                  className="flex items-center gap-1 text-xs text-[#3B7D3C] hover:underline"
                >
                  <CheckOutlined className="text-[10px]" /> Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center py-8"><Spin size="small" /></div>
              ) : notifications.length === 0 ? (
                <div className="py-8 text-center">
                  <BellOutlined className="text-2xl text-[#E0E0E0] mb-2" />
                  <p className="text-xs text-[#5A5A5A]">No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`px-4 py-3 border-b border-[#F5F5F0] cursor-pointer hover:bg-[#F5F5F0] transition-colors ${!n.isRead ? "bg-[#F0F7F0]" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${PRIORITY_DOT[n.priority] || "bg-gray-400"}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${TYPE_COLORS[n.type] || "bg-gray-100 text-gray-600"}`}>
                            {n.type?.replace("_", " ")}
                          </span>
                          <span className="text-[10px] text-[#5A5A5A] ml-auto flex-shrink-0">{timeSince(n.createdAt)}</span>
                        </div>
                        <p className="text-xs font-semibold text-[#1A1A1A] truncate">{n.title}</p>
                        <p className="text-xs text-[#5A5A5A] truncate">{n.message}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-[#E8F0E8] flex justify-between items-center">
              <Link
                to="/notifications"
                onClick={() => setOpen(false)}
                className="text-xs font-medium text-[#3B7D3C] hover:underline"
              >
                View all notifications
              </Link>
              <Link
                to="/profilePage?tab=Notifications"
                onClick={() => setOpen(false)}
                className="text-xs text-[#5A5A5A] hover:underline"
              >
                Settings
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationBell;
