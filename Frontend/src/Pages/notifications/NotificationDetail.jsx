import { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Spin } from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  DeleteOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import {
  useGetNotificationByIdQuery,
  useMarkNotificationAsReadMutation,
  useDeleteNotificationMutation,
} from "../redux/api/routesApi";

const TYPE_COLORS = {
  maintenance:      "bg-blue-100 text-blue-700 border-blue-200",
  generator:        "bg-amber-100 text-amber-700 border-amber-200",
  warranty:         "bg-purple-100 text-purple-700 border-purple-200",
  insurance:        "bg-red-100 text-red-700 border-red-200",
  repair:           "bg-orange-100 text-orange-700 border-orange-200",
  mpg:              "bg-green-100 text-green-700 border-green-200",
  trip:             "bg-teal-100 text-teal-700 border-teal-200",
  component:        "bg-gray-100 text-gray-700 border-gray-200",
  component_health: "bg-rose-100 text-rose-700 border-rose-200",
};

const PRIORITY_CONFIG = {
  high:   { dot: "bg-red-500",   label: "High Priority",   icon: <WarningOutlined className="text-red-500" /> },
  medium: { dot: "bg-amber-500", label: "Medium Priority", icon: <ClockCircleOutlined className="text-amber-500" /> },
  low:    { dot: "bg-blue-400",  label: "Low Priority",    icon: <CheckCircleOutlined className="text-blue-400" /> },
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    + " at " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
};

const NotificationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useGetNotificationByIdQuery(id);
  const [markAsRead] = useMarkNotificationAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  const n = data?.data;

  // Auto mark as read when opened
  useEffect(() => {
    if (n && !n.isRead) markAsRead(id);
  }, [n?.isRead]);

  const handleDelete = async () => {
    await deleteNotification(id);
    navigate("/notifications");
  };

  if (isLoading) {
    return <div className="flex justify-center py-32"><Spin size="large" /></div>;
  }

  if (isError || !n) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 mb-4">Notification not found.</p>
        <Link to="/notifications" className="text-[#3B7D3C] hover:underline text-sm">← Back to notifications</Link>
      </div>
    );
  }

  const typeColor  = TYPE_COLORS[n.type]  || "bg-gray-100 text-gray-700 border-gray-200";
  const priority   = PRIORITY_CONFIG[n.priority] || PRIORITY_CONFIG.low;

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Back */}
        <button
          onClick={() => navigate("/notifications")}
          className="flex items-center gap-2 text-sm text-[#5A5A5A] hover:text-[#3B7D3C] mb-6 transition-colors"
        >
          <ArrowLeftOutlined /> Back to notifications
        </button>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#E8F0E8] shadow-sm overflow-hidden">

          {/* Top accent bar based on priority */}
          <div className={`h-1 w-full ${n.priority === "high" ? "bg-red-500" : n.priority === "medium" ? "bg-amber-400" : "bg-blue-400"}`} />

          <div className="p-6 sm:p-8">

            {/* Type + Priority row */}
            <div className="flex items-center gap-3 mb-5">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full border capitalize ${typeColor}`}>
                {n.type?.replace("_", " ")}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-[#5A5A5A]">
                {priority.icon}
                <span>{priority.label}</span>
              </div>
              {!n.isRead && (
                <span className="ml-auto text-xs bg-red-50 text-red-500 font-semibold px-2 py-0.5 rounded-full border border-red-100">
                  Unread
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-xl font-bold text-[#1A1A1A] mb-3 leading-snug">{n.title}</h1>

            {/* Message */}
            <p className="text-[#5A5A5A] text-sm leading-relaxed mb-6">{n.message}</p>

            {/* Meta */}
            <div className="bg-[#F5F5F0] rounded-xl px-4 py-3 text-xs text-[#5A5A5A] mb-6">
              {formatDate(n.createdAt)}
            </div>

            {/* Action link */}
            {n.href && (
              <Link
                to={n.href}
                className="flex items-center gap-2 w-full justify-center bg-[#3B7D3C] hover:bg-[#2E6B2F] text-white font-semibold text-sm px-5 py-3 rounded-xl transition-colors duration-200 mb-3"
              >
                <LinkOutlined /> View Related Content
              </Link>
            )}

            {/* Delete */}
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 w-full justify-center border border-red-200 text-red-500 hover:bg-red-50 font-medium text-sm px-5 py-2.5 rounded-xl transition-colors duration-200"
            >
              <DeleteOutlined /> Delete Notification
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationDetail;
