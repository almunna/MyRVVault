import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Spin, Modal, message, Progress } from "antd";
import {
  PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined,
  WarningOutlined, CheckCircleOutlined, ClockCircleOutlined,
  HistoryOutlined, RightOutlined, DownOutlined, SafetyCertificateOutlined,
} from "@ant-design/icons";
import { COMPONENT_TYPES, CATEGORY_META } from "./componentConfig";
import {
  useGetComponentsQuery,
  useDeleteComponentMutation,
  useMarkComponentReplacedMutation,
} from "../redux/api/routesApi";

// ── Warranty status helper ────────────────────────────────────────────────────
const getWarrantyAlert = (warrantyEndDate) => {
  if (!warrantyEndDate) return null;
  const daysLeft = Math.ceil((new Date(warrantyEndDate) - new Date()) / 86400000);
  if (daysLeft < 0) return { type: "expired", label: "Warranty Expired", daysLeft };
  if (daysLeft <= 30) return { type: "expiring", label: `Warranty expires in ${daysLeft}d`, daysLeft };
  return null;
};

// ── Warranty alert badge ──────────────────────────────────────────────────────
const WarrantyAlert = ({ warrantyEndDate }) => {
  const alert = getWarrantyAlert(warrantyEndDate);
  if (!alert) return null;
  const isExpired = alert.type === "expired";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
      isExpired
        ? "bg-red-100 text-red-700 border border-red-200"
        : "bg-amber-100 text-amber-700 border border-amber-200"
    }`}>
      <SafetyCertificateOutlined />
      {alert.label}
    </span>
  );
};

// ── Health badge ─────────────────────────────────────────────────────────────
const HealthBadge = ({ health, size = "sm" }) => {
  if (!health) return null;
  const icon = health.status === "good"
    ? <CheckCircleOutlined />
    : health.status === "needs_attention"
    ? <ClockCircleOutlined />
    : <WarningOutlined />;
  const colors = {
    good:            "bg-green-100 text-green-700 border border-green-200",
    needs_attention: "bg-amber-100 text-amber-700 border border-amber-200",
    overdue:         "bg-red-100 text-red-700 border border-red-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${colors[health.status] || colors.good}`}>
      {icon}
      {size === "lg" ? `${health.score}/100 · ${health.label}` : health.label}
    </span>
  );
};

// ── Health progress bar ───────────────────────────────────────────────────────
const HealthBar = ({ health }) => {
  if (!health) return null;
  const color = health.status === "good" ? "#52c41a"
    : health.status === "needs_attention" ? "#faad14"
    : "#ff4d4f";
  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs text-[#5A5A5A] mb-1">
        <span>Health Score</span>
        <span className="font-semibold">{health.score}/100</span>
      </div>
      <Progress percent={health.score} showInfo={false} strokeColor={color} trailColor="#E8F0E8" size="small" />
    </div>
  );
};

// ── Replace modal ─────────────────────────────────────────────────────────────
const ReplaceModal = ({ open, onClose, onConfirm, label, loading }) => {
  const [notes, setNotes] = useState("");
  const [cost, setCost] = useState("");
  const [mileage, setMileage] = useState("");
  const handleOk = () => {
    onConfirm({ notes, cost: cost ? Number(cost) : null, replacedMileage: mileage ? Number(mileage) : null });
    setNotes(""); setCost(""); setMileage("");
  };
  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText="Confirm Replacement"
      okButtonProps={{ className: "bg-[#3B7D3C] border-[#3B7D3C]", loading }}
      title={<span className="font-semibold">Mark {label} as Replaced</span>}
    >
      <p className="text-[#5A5A5A] text-sm mb-4">
        Recording a replacement resets the component age and mileage counter so health score reflects the new unit.
      </p>
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-[#5A5A5A] block mb-1">Odometer at Replacement (mi)</label>
          <input type="number" value={mileage} onChange={e => setMileage(e.target.value)}
            placeholder="e.g. 48,500"
            className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm focus:border-[#3B7D3C] outline-none" />
        </div>
        <div>
          <label className="text-xs font-medium text-[#5A5A5A] block mb-1">Cost ($)</label>
          <input type="number" value={cost} onChange={e => setCost(e.target.value)}
            placeholder="e.g. 350"
            className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm focus:border-[#3B7D3C] outline-none" />
        </div>
        <div>
          <label className="text-xs font-medium text-[#5A5A5A] block mb-1">Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            rows={2} placeholder="Brand, reason for replacement..."
            className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm focus:border-[#3B7D3C] outline-none resize-none" />
        </div>
      </div>
    </Modal>
  );
};

// ── Component card ────────────────────────────────────────────────────────────
const ComponentCard = ({ item, typeKey, cfg }) => {
  const [expanded, setExpanded] = useState(false);
  const [replaceOpen, setReplaceOpen] = useState(false);
  const [deleteComponent] = useDeleteComponentMutation();
  const [markReplaced, { isLoading: replacing }] = useMarkComponentReplacedMutation();

  const handleDelete = () => {
    Modal.confirm({
      title: "Delete this component?",
      content: `"${item.name || cfg.label}" will be permanently removed.`,
      okText: "Delete", okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteComponent({ urlPath: cfg.urlPath, id: item.id }).unwrap();
          message.success("Component deleted");
        } catch { message.error("Delete failed"); }
      },
    });
  };

  const handleReplace = async (data) => {
    try {
      await markReplaced({ collection: cfg.collection, id: item.id, data }).unwrap();
      message.success("Replacement recorded. Health score reset.");
      setReplaceOpen(false);
    } catch { message.error("Failed to record replacement"); }
  };

  return (
    <>
      <div className="bg-white border border-[#E8F0E8] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
        {/* Card header */}
        <button
          onClick={() => setExpanded(e => !e)}
          className="w-full text-left px-4 py-3 flex items-start justify-between hover:bg-[#F5F5F0] transition-colors duration-150"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#E8F0E8] flex items-center justify-center flex-shrink-0 text-base">
              {cfg.icon}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#1A1A1A] truncate">
                {item.name || cfg.label}
              </p>
              {item.modelNumber && (
                <p className="text-xs text-[#5A5A5A] truncate">Model: {item.modelNumber}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 ml-2 flex-shrink-0 flex-wrap justify-end">
            <WarrantyAlert warrantyEndDate={item.warrantyEndDate} />
            <HealthBadge health={item.health} />
            {expanded ? <DownOutlined className="text-[#5A5A5A] text-xs" /> : <RightOutlined className="text-[#5A5A5A] text-xs" />}
          </div>
        </button>

        {/* Expanded details */}
        {expanded && (
          <div className="px-4 pb-4 border-t border-[#E8F0E8] pt-3">
            <HealthBar health={item.health} />

            {/* Health factors */}
            {item.health?.factors?.length > 0 && (
              <div className="mt-3 space-y-1">
                {item.health.factors.map((f, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="text-[#5A5A5A]">{f.name}</span>
                    <span className={`font-medium ${f.deduction > 0 ? "text-red-500" : f.deduction < 0 ? "text-green-600" : "text-[#1A1A1A]"}`}>
                      {f.deduction > 0 ? `-${f.deduction}pts` : f.deduction < 0 ? `+${Math.abs(f.deduction)}pts` : ""} {f.value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Details grid */}
            {(() => {
              const warrantyAlert = getWarrantyAlert(item.warrantyEndDate);
              return (
                <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                  {[
                    { label: "Serial #", value: item.serialNumber },
                    { label: "Location", value: item.location },
                    { label: "Purchased", value: item.dateOfPurchase ? new Date(item.dateOfPurchase).toLocaleDateString() : null },
                    { label: "Install Date", value: item.installDate ? new Date(item.installDate).toLocaleDateString() : null },
                    { label: "Install Mileage", value: item.installMileage ? `${Number(item.installMileage).toLocaleString()} mi` : null },
                    { label: "Cost", value: item.cost ? `$${Number(item.cost).toLocaleString()}` : null },
                    { label: "Warranty Start", value: item.warrantyStartDate ? new Date(item.warrantyStartDate).toLocaleDateString() : null },
                    {
                      label: "Warranty End",
                      value: item.warrantyEndDate ? new Date(item.warrantyEndDate).toLocaleDateString() : null,
                      alert: warrantyAlert,
                    },
                    { label: "Warranty Provider", value: item.warrantyProvider },
                    { label: "Last Replaced", value: item.lastReplacedDate ? new Date(item.lastReplacedDate).toLocaleDateString() : null },
                  ].filter(f => f.value).map(({ label, value, alert }) => (
                    <div key={label}>
                      <span className="text-[#5A5A5A]">{label}: </span>
                      <span className={`font-medium ${
                        alert?.type === "expired" ? "text-red-600"
                        : alert?.type === "expiring" ? "text-amber-600"
                        : "text-[#1A1A1A]"
                      }`}>{value}</span>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Warranty terms */}
            {item.warrantyTerms && (
              <div className="mt-2 text-xs text-[#5A5A5A] bg-[#F5F5F0] rounded-lg p-2">
                <span className="font-medium">Warranty Terms: </span>{item.warrantyTerms}
              </div>
            )}

            {/* Notes */}
            {item.notes && (
              <div className="mt-2 text-xs text-[#5A5A5A] italic">{item.notes}</div>
            )}

            {/* Replacement history */}
            {item.replacementHistory?.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-semibold text-[#5A5A5A] flex items-center gap-1 mb-1.5">
                  <HistoryOutlined /> Replacement History
                </p>
                <div className="space-y-1">
                  {[...item.replacementHistory].reverse().map((r, i) => (
                    <div key={i} className="text-xs bg-[#F5F5F0] rounded-lg px-2 py-1.5 flex justify-between">
                      <span className="text-[#1A1A1A] font-medium">{new Date(r.replacedAt).toLocaleDateString()}</span>
                      <span className="text-[#5A5A5A]">
                        {r.replacedMileage ? `${Number(r.replacedMileage).toLocaleString()} mi` : ""}
                        {r.cost ? ` · $${r.cost}` : ""}
                        {r.notes ? ` · ${r.notes}` : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 mt-3 pt-2 border-t border-[#E8F0E8]">
              {cfg.replaceable && (
                <button
                  onClick={() => setReplaceOpen(true)}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-[#3B7D3C] text-[#3B7D3C] hover:bg-[#3B7D3C] hover:text-white transition-all duration-200 font-medium"
                >
                  <ReloadOutlined className="text-xs" /> Replace
                </button>
              )}
              <Link to={`/components/${typeKey}/update/${item.id}`}>
                <button className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-[#3B7D3C] text-[#3B7D3C] hover:bg-[#3B7D3C] hover:text-white transition-all duration-200 font-medium">
                  <EditOutlined /> Edit
                </button>
              </Link>
              <button
                onClick={handleDelete}
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-red-300 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200 font-medium"
              >
                <DeleteOutlined /> Delete
              </button>
            </div>
          </div>
        )}
      </div>

      <ReplaceModal
        open={replaceOpen}
        onClose={() => setReplaceOpen(false)}
        onConfirm={handleReplace}
        label={item.name || cfg.label}
        loading={replacing}
      />
    </>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────
const ComponentsList = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const cfg = COMPONENT_TYPES[type];

  if (!cfg) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-semibold text-[#1A1A1A] mb-2">Unknown component type</p>
          <button onClick={() => navigate("/havcApplication")} className="text-[#3B7D3C] underline text-sm">
            Back to Components
          </button>
        </div>
      </div>
    );
  }

  const { data, isLoading, isError } = useGetComponentsQuery(cfg.urlPath);
  const items = data?.data || [];

  // Average health score
  const scores = items.map(i => i.health?.score).filter(s => s != null);
  const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
  const healthStatus = avgScore == null ? null
    : avgScore >= 70 ? "good" : avgScore >= 40 ? "needs_attention" : "overdue";

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="max-w-site mx-auto px-4 lg:px-6 2xl:px-8 py-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-1 h-8 bg-[#D4872D] rounded-full" />
              <h1 className="text-3xl font-bold text-[#1A1A1A]">
                <span className="mr-2">{cfg.icon}</span>{cfg.label}
              </h1>
            </div>
            <p className="text-[#5A5A5A] text-sm ml-4 pl-3">
              {isLoading ? "Loading…" : `${items.length} unit${items.length !== 1 ? "s" : ""} tracked`}
              {avgScore != null && (
                <span className="ml-2">
                  · Avg health: <span className={`font-semibold ${healthStatus === "good" ? "text-green-600" : healthStatus === "needs_attention" ? "text-amber-600" : "text-red-500"}`}>
                    {avgScore}/100
                  </span>
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate("/havcApplication")}
              className="text-sm px-4 py-2 rounded-xl border border-[#E0E0E0] text-[#5A5A5A] hover:border-[#3B7D3C] hover:text-[#3B7D3C] transition-all duration-200"
            >
              ← Back
            </button>
            <Link to={`/components/${type}/add`}>
              <button className="flex items-center gap-2 bg-[#3B7D3C] text-white px-5 py-2 rounded-xl font-medium text-sm hover:bg-[#2d6130] transition-colors duration-200 shadow-sm">
                <PlusOutlined /> Add {cfg.label}
              </button>
            </Link>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-20"><Spin size="large" /></div>
        ) : isError ? (
          <div className="bg-white border border-red-200 rounded-2xl p-8 text-center">
            <p className="text-red-500 font-medium mb-1">Failed to load components.</p>
            <p className="text-[#5A5A5A] text-sm">Make sure you have an RV added and selected in your profile.</p>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white border border-[#E8F0E8] rounded-2xl p-12 text-center">
            <div className="text-4xl mb-3">{cfg.icon}</div>
            <p className="text-[#1A1A1A] font-semibold mb-1">No {cfg.label} units tracked yet</p>
            <p className="text-[#5A5A5A] text-sm mb-4">Add your first unit to start tracking health and warranty info.</p>
            <Link to={`/components/${type}/add`}>
              <button className="bg-[#3B7D3C] text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-[#2d6130] transition-colors">
                <PlusOutlined className="mr-2" /> Add First Unit
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4">
            {items.map(item => (
              <ComponentCard key={item.id} item={item} typeKey={type} cfg={cfg} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ComponentsList;
