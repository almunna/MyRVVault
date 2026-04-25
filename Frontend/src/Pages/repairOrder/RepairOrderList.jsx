import { useState } from "react";
import { Link } from "react-router-dom";
import { message, Spin, Modal, Select } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ToolOutlined,
  ShopOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  RightOutlined,
  DownOutlined,
} from "@ant-design/icons";
import {
  useGetRepairOrdersQuery,
  useDeleteRepairOrderMutation,
  useUpdateRepairOrderStatusMutation,
} from "../redux/api/routesApi";

const STATUS = {
  pending: {
    label: "Pending",
    icon: <ClockCircleOutlined />,
    card: "bg-amber-50 border-amber-200 text-amber-700",
    dot: "bg-amber-400",
    badge: "bg-amber-100 text-amber-700 border border-amber-200",
    accent: "#D97706",
  },
  "in-progress": {
    label: "In Progress",
    icon: <ExclamationCircleOutlined />,
    card: "bg-blue-50 border-blue-200 text-blue-700",
    dot: "bg-blue-500",
    badge: "bg-blue-100 text-blue-700 border border-blue-200",
    accent: "#2563EB",
  },
  completed: {
    label: "Completed",
    icon: <CheckCircleOutlined />,
    card: "bg-green-50 border-green-200 text-green-700",
    dot: "bg-green-500",
    badge: "bg-green-100 text-green-700 border border-green-200",
    accent: "#16A34A",
  },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS[status] || STATUS.pending;
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${cfg.badge}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
};

const OrderCard = ({ order, onDelete, onStatusChange, deletingId, changingId }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white border border-[#E8F0E8] rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Card Header */}
      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#E8F0E8] flex items-center justify-center flex-shrink-0 mt-0.5">
              <ToolOutlined className="text-[#3B7D3C] text-sm" />
            </div>
            <div className="min-w-0">
              <p className="text-base font-semibold text-[#1A1A1A] truncate">
                {order.title || "Repair Order"}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <StatusBadge status={order.status} />
                {order.totalCost > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#E8F0E8] text-[#3B7D3C] font-semibold border border-[#3B7D3C]/20">
                    ${order.totalCost.toFixed(2)}
                  </span>
                )}
                {order.recallId && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200 font-medium">
                    Recall linked
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Link to={`/updateRepairOrder/${order.id}`}>
              <button className="w-8 h-8 rounded-lg border border-[#E0E0E0] flex items-center justify-center text-[#5A5A5A] hover:border-[#3B7D3C] hover:text-[#3B7D3C] transition-all duration-200">
                <EditOutlined className="text-sm" />
              </button>
            </Link>
            <button
              onClick={() => onDelete(order.id)}
              disabled={deletingId === order.id}
              className="w-8 h-8 rounded-lg border border-[#E0E0E0] flex items-center justify-center text-[#5A5A5A] hover:border-red-400 hover:text-red-500 transition-all duration-200 disabled:opacity-40"
            >
              {deletingId === order.id ? <Spin size="small" /> : <DeleteOutlined className="text-sm" />}
            </button>
            <button
              onClick={() => setExpanded((e) => !e)}
              className="w-8 h-8 rounded-lg border border-[#E0E0E0] flex items-center justify-center text-[#5A5A5A] hover:border-[#3B7D3C] transition-all duration-200"
            >
              {expanded ? <DownOutlined className="text-xs" /> : <RightOutlined className="text-xs" />}
            </button>
          </div>
        </div>

        {/* Vendor + date row */}
        <div className="flex flex-wrap gap-4 mt-3">
          {order.vendor && (
            <span className="flex items-center gap-1.5 text-sm text-[#5A5A5A]">
              <ShopOutlined className="text-[#3B7D3C]" />
              {order.vendor}
            </span>
          )}
          {order.createdAt && (
            <span className="text-sm text-[#5A5A5A]">
              {new Date(order.createdAt).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Line items preview */}
        {Array.isArray(order.lineItems) && order.lineItems.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {order.lineItems.slice(0, 3).map((item, i) => (
              <span key={i} className="text-xs px-2 py-1 bg-[#F5F5F0] text-[#5A5A5A] rounded-lg border border-[#E8F0E8]">
                {item.component}
                {item.cost ? ` · $${(item.cost * (item.quantity || 1)).toFixed(2)}` : ""}
              </span>
            ))}
            {order.lineItems.length > 3 && (
              <span className="text-xs px-2 py-1 text-[#5A5A5A]">+{order.lineItems.length - 3} more</span>
            )}
          </div>
        )}
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-[#E8F0E8] px-5 py-4 bg-[#FAFAFA] space-y-4">

          {/* Quick status change */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#5A5A5A] font-medium flex-shrink-0">Change Status:</span>
            <Select
              value={order.status}
              size="small"
              style={{ width: 160 }}
              onChange={(val) => onStatusChange(order.id, val)}
              loading={changingId === order.id}
              disabled={changingId === order.id}
            >
              <Select.Option value="pending">Pending</Select.Option>
              <Select.Option value="in-progress">In Progress</Select.Option>
              <Select.Option value="completed">Completed</Select.Option>
            </Select>
          </div>

          {/* Full line items table */}
          {Array.isArray(order.lineItems) && order.lineItems.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[#5A5A5A] uppercase tracking-wide mb-2">Line Items</p>
              <div className="rounded-xl border border-[#E8F0E8] overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#F5F5F0] text-[#5A5A5A] text-xs">
                      <th className="text-left px-3 py-2 font-medium">Component</th>
                      <th className="text-left px-3 py-2 font-medium">Description</th>
                      <th className="text-right px-3 py-2 font-medium">Cost</th>
                      <th className="text-right px-3 py-2 font-medium">Qty</th>
                      <th className="text-right px-3 py-2 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.lineItems.map((item, i) => (
                      <tr key={i} className="border-t border-[#E8F0E8]">
                        <td className="px-3 py-2 font-medium text-[#1A1A1A]">{item.component}</td>
                        <td className="px-3 py-2 text-[#5A5A5A]">{item.description || "—"}</td>
                        <td className="px-3 py-2 text-right text-[#1A1A1A]">${Number(item.cost || 0).toFixed(2)}</td>
                        <td className="px-3 py-2 text-right text-[#5A5A5A]">{item.quantity || 1}</td>
                        <td className="px-3 py-2 text-right font-semibold text-[#3B7D3C]">
                          ${(Number(item.cost || 0) * Number(item.quantity || 1)).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-[#E8F0E8] bg-[#F5F5F0]">
                      <td colSpan={4} className="px-3 py-2 text-right font-semibold text-[#1A1A1A] text-sm">Total</td>
                      <td className="px-3 py-2 text-right font-bold text-[#3B7D3C] text-sm">${order.totalCost?.toFixed(2) || "0.00"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div>
              <p className="text-xs font-semibold text-[#5A5A5A] uppercase tracking-wide mb-1">Notes</p>
              <p className="text-sm text-[#1A1A1A]">{order.notes}</p>
            </div>
          )}

          {/* Photos */}
          {Array.isArray(order.images) && order.images.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[#5A5A5A] uppercase tracking-wide mb-2">Photos</p>
              <div className="flex flex-wrap gap-2">
                {order.images.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noreferrer">
                    <img src={url} alt={`photo-${i}`} className="w-16 h-16 object-cover rounded-lg border border-[#E8F0E8] hover:opacity-80 transition-opacity" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Status history */}
          {Array.isArray(order.statusHistory) && order.statusHistory.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[#5A5A5A] uppercase tracking-wide mb-2">Status History</p>
              <div className="space-y-2">
                {order.statusHistory.map((entry, i) => {
                  const cfg = STATUS[entry.status] || STATUS.pending;
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${cfg.dot}`} />
                      <div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.badge}`}>{cfg.label}</span>
                        {entry.note && <span className="text-xs text-[#5A5A5A] ml-2">{entry.note}</span>}
                        <p className="text-xs text-gray-400 mt-0.5">{new Date(entry.date).toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recall link */}
          {order.recallId && (
            <div>
              <p className="text-xs font-semibold text-[#5A5A5A] uppercase tracking-wide mb-1">Linked Recall ID</p>
              <span className="text-sm text-orange-600 font-mono bg-orange-50 px-2 py-1 rounded-lg border border-orange-200">{order.recallId}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const RepairOrderList = () => {
  const { data, isLoading, refetch } = useGetRepairOrdersQuery();
  const [deleteRepairOrder] = useDeleteRepairOrderMutation();
  const [updateRepairOrderStatus] = useUpdateRepairOrderStatusMutation();
  const [deletingId, setDeletingId] = useState(null);
  const [changingId, setChangingId] = useState(null);

  const orders = data?.data || [];
  const pending    = orders.filter((o) => o.status === "pending").length;
  const inProgress = orders.filter((o) => o.status === "in-progress").length;
  const completed  = orders.filter((o) => o.status === "completed").length;

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Delete repair order?",
      content: "This action cannot be undone.",
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: async () => {
        setDeletingId(id);
        try {
          const res = await deleteRepairOrder(id).unwrap();
          message.success(res?.message || "Deleted successfully");
          refetch();
        } catch (err) {
          message.error(err?.data?.message || "Failed to delete");
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  const handleStatusChange = async (id, status) => {
    setChangingId(id);
    try {
      await updateRepairOrderStatus({ id, status }).unwrap();
      message.success("Status updated");
      refetch();
    } catch (err) {
      message.error(err?.data?.message || "Failed to update status");
    } finally {
      setChangingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="max-w-site mx-auto px-4 lg:px-6 2xl:px-8 py-10">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-1 h-8 bg-[#D4872D] rounded-full" />
              <h1 className="text-3xl font-bold text-[#1A1A1A]">Repair Orders</h1>
            </div>
            <p className="text-[#5A5A5A] text-sm ml-4 pl-3">
              {isLoading ? "Loading…" : `${orders.length} total order${orders.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <Link to="/addRepairOrder">
            <button className="flex items-center gap-2 bg-[#3B7D3C] text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-[#2d6130] transition-colors duration-200 shadow-sm">
              <PlusOutlined />
              New Repair Order
            </button>
          </Link>
        </div>

        {/* Summary Pills */}
        {!isLoading && (
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { label: "Pending",     count: pending,    dot: "bg-amber-400"  },
              { label: "In Progress", count: inProgress, dot: "bg-blue-500"   },
              { label: "Completed",   count: completed,  dot: "bg-green-500"  },
            ].map(({ label, count, dot }) => (
              <div key={label} className="bg-white border border-[#E8F0E8] rounded-xl p-4 shadow-sm text-center">
                <div className={`w-2 h-2 rounded-full mx-auto mb-2 ${dot}`} />
                <p className="text-2xl font-bold text-[#1A1A1A]">{count}</p>
                <p className="text-xs text-[#5A5A5A] mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-20"><Spin size="large" /></div>
        ) : orders.length === 0 ? (
          <div className="bg-white border border-[#E8F0E8] rounded-2xl p-12 text-center shadow-sm">
            <div className="w-14 h-14 rounded-full bg-[#E8F0E8] flex items-center justify-center mx-auto mb-4">
              <ToolOutlined className="text-[#3B7D3C] text-2xl" />
            </div>
            <p className="text-[#1A1A1A] font-semibold mb-1">No repair orders yet</p>
            <p className="text-[#5A5A5A] text-sm mb-4">Create your first repair order to get started</p>
            <Link to="/addRepairOrder">
              <button className="bg-[#3B7D3C] text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-[#2d6130] transition-colors">
                Create Repair Order
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                deletingId={deletingId}
                changingId={changingId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RepairOrderList;
