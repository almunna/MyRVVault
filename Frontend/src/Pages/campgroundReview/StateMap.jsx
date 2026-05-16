import React, { useState, useEffect } from "react";
import { message, Tooltip, Modal } from "antd";

const STATE_GRID = [
  { abbr: "AK", name: "Alaska", row: 7, col: 0 },
  { abbr: "HI", name: "Hawaii", row: 7, col: 2 },
  { abbr: "WA", name: "Washington", row: 0, col: 0 },
  { abbr: "MT", name: "Montana", row: 0, col: 1 },
  { abbr: "ND", name: "North Dakota", row: 0, col: 2 },
  { abbr: "MN", name: "Minnesota", row: 0, col: 3 },
  { abbr: "WI", name: "Wisconsin", row: 0, col: 4 },
  { abbr: "MI", name: "Michigan", row: 0, col: 5 },
  { abbr: "VT", name: "Vermont", row: 0, col: 9 },
  { abbr: "ME", name: "Maine", row: 0, col: 10 },
  { abbr: "OR", name: "Oregon", row: 1, col: 0 },
  { abbr: "ID", name: "Idaho", row: 1, col: 1 },
  { abbr: "SD", name: "South Dakota", row: 1, col: 2 },
  { abbr: "IA", name: "Iowa", row: 1, col: 3 },
  { abbr: "IN", name: "Indiana", row: 1, col: 4 },
  { abbr: "OH", name: "Ohio", row: 1, col: 5 },
  { abbr: "PA", name: "Pennsylvania", row: 1, col: 6 },
  { abbr: "NY", name: "New York", row: 1, col: 7 },
  { abbr: "NH", name: "New Hampshire", row: 1, col: 9 },
  { abbr: "MA", name: "Massachusetts", row: 1, col: 10 },
  { abbr: "CA", name: "California", row: 2, col: 0 },
  { abbr: "NV", name: "Nevada", row: 2, col: 1 },
  { abbr: "WY", name: "Wyoming", row: 2, col: 2 },
  { abbr: "NE", name: "Nebraska", row: 2, col: 3 },
  { abbr: "IL", name: "Illinois", row: 2, col: 4 },
  { abbr: "WV", name: "West Virginia", row: 2, col: 5 },
  { abbr: "NJ", name: "New Jersey", row: 2, col: 6 },
  { abbr: "CT", name: "Connecticut", row: 2, col: 8 },
  { abbr: "RI", name: "Rhode Island", row: 2, col: 9 },
  { abbr: "AZ", name: "Arizona", row: 3, col: 1 },
  { abbr: "UT", name: "Utah", row: 3, col: 2 },
  { abbr: "CO", name: "Colorado", row: 3, col: 3 },
  { abbr: "KS", name: "Kansas", row: 3, col: 4 },
  { abbr: "MO", name: "Missouri", row: 3, col: 5 },
  { abbr: "KY", name: "Kentucky", row: 3, col: 6 },
  { abbr: "VA", name: "Virginia", row: 3, col: 7 },
  { abbr: "MD", name: "Maryland", row: 3, col: 8 },
  { abbr: "DE", name: "Delaware", row: 3, col: 9 },
  { abbr: "NM", name: "New Mexico", row: 4, col: 2 },
  { abbr: "OK", name: "Oklahoma", row: 4, col: 3 },
  { abbr: "AR", name: "Arkansas", row: 4, col: 4 },
  { abbr: "TN", name: "Tennessee", row: 4, col: 5 },
  { abbr: "NC", name: "North Carolina", row: 4, col: 6 },
  { abbr: "SC", name: "South Carolina", row: 4, col: 7 },
  { abbr: "TX", name: "Texas", row: 5, col: 3 },
  { abbr: "LA", name: "Louisiana", row: 5, col: 4 },
  { abbr: "MS", name: "Mississippi", row: 5, col: 5 },
  { abbr: "AL", name: "Alabama", row: 5, col: 6 },
  { abbr: "GA", name: "Georgia", row: 5, col: 7 },
  { abbr: "FL", name: "Florida", row: 6, col: 7 },
];

const STATUS_COLORS = {
  camped: "#3B7D3C",
  traveled_through: "#60a5fa",
  planning: "#a78bfa",
  manual: "#D4872D",
  none: "#E8E8E4",
};

const STATUS_LABELS = {
  camped: "Camped",
  traveled_through: "Traveled Through",
  planning: "Planning",
  manual: "Manually Added",
};

const StateMap = () => {
  const [stateStats, setStateStats] = useState({});
  const [manualStates, setManualStates] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState(null);
  const [addModal, setAddModal] = useState({ open: false, abbr: "", name: "" });

  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5002/api";
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${BASE_URL}/trips/stats/map`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          const stats = {};
          (data.data || []).forEach(s => {
            const abbr = getAbbr(s.state);
            if (abbr) stats[abbr] = s;
          });
          setStateStats(stats);
        }
      } catch {
        message.error("Failed to load state statistics");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();

    const saved = localStorage.getItem("manualVisitedStates");
    if (saved) {
      try { setManualStates(new Set(JSON.parse(saved))); } catch {}
    }
  }, []);

  const getAbbr = (fullName) => {
    const found = STATE_GRID.find(s =>
      s.name.toUpperCase() === (fullName || "").toUpperCase() ||
      s.abbr === (fullName || "").toUpperCase()
    );
    return found?.abbr;
  };

  const getStateColor = (abbr) => {
    const stat = stateStats[abbr];
    if (manualStates.has(abbr)) return STATUS_COLORS.manual;
    if (!stat) return STATUS_COLORS.none;
    if (stat.camped > 0) return STATUS_COLORS.camped;
    if (stat.traveled > 0) return STATUS_COLORS.traveled_through;
    if (stat.planning > 0) return STATUS_COLORS.planning;
    return STATUS_COLORS.none;
  };

  const getStatusText = (abbr) => {
    if (manualStates.has(abbr)) return "manually marked";
    const stat = stateStats[abbr];
    if (!stat) return "not visited";
    if (stat.camped > 0) return `camped ${stat.camped}x`;
    if (stat.traveled > 0) return "traveled through";
    if (stat.planning > 0) return "planning to visit";
    return "not visited";
  };

  const toggleManualState = () => {
    const { abbr } = addModal;
    setManualStates(prev => {
      const next = new Set(prev);
      if (next.has(abbr)) next.delete(abbr);
      else next.add(abbr);
      localStorage.setItem("manualVisitedStates", JSON.stringify([...next]));
      return next;
    });
    setAddModal({ open: false, abbr: "", name: "" });
    message.success("State updated!");
  };

  const visited = Object.keys(stateStats).length + manualStates.size;
  const totalStates = 50;
  const maxRow = Math.max(...STATE_GRID.map(s => s.row));
  const maxCol = Math.max(...STATE_GRID.map(s => s.col));

  if (loading) {
    return (
      <div className="py-10 flex items-center justify-center">
        <p className="text-[#5A5A5A]">Loading map…</p>
      </div>
    );
  }

  return (
    <div>
      {/* Stats bar */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="bg-white border border-[#E8F0E8] rounded-xl px-5 py-3 text-center shadow-sm">
          <p className="text-3xl font-bold text-[#3B7D3C]">{visited}</p>
          <p className="text-[#5A5A5A] text-xs mt-0.5">States Visited</p>
        </div>
        <div className="bg-white border border-[#E8F0E8] rounded-xl px-5 py-3 text-center shadow-sm">
          <p className="text-3xl font-bold text-[#1A1A1A]">{totalStates - visited}</p>
          <p className="text-[#5A5A5A] text-xs mt-0.5">Remaining</p>
        </div>
        <div className="bg-white border border-[#E8F0E8] rounded-xl px-5 py-3 text-center shadow-sm">
          <p className="text-3xl font-bold text-[#D4872D]">{Math.round((visited / totalStates) * 100)}%</p>
          <p className="text-[#5A5A5A] text-xs mt-0.5">Complete</p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 items-center ml-auto">
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <div key={key} className="flex items-center gap-1.5 text-xs text-[#5A5A5A]">
              <div className="w-3.5 h-3.5 rounded" style={{ background: STATUS_COLORS[key] }} />
              <span>{label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 text-xs text-[#5A5A5A]">
            <div className="w-3.5 h-3.5 rounded bg-[#E8E8E4] border border-[#E0E0E0]" />
            <span>Not Visited</span>
          </div>
        </div>
      </div>

      {/* Grid Map */}
      <div className="bg-white border border-[#E8F0E8] rounded-2xl p-5 shadow-sm overflow-x-auto">
        <div
          className="inline-grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${maxCol + 1}, 52px)`,
            gridTemplateRows: `repeat(${maxRow + 1}, 52px)`,
          }}
        >
          {STATE_GRID.map(state => {
            const color = getStateColor(state.abbr);
            const isVisited = color !== STATUS_COLORS.none;
            return (
              <div
                key={state.abbr}
                style={{ gridColumn: state.col + 1, gridRow: state.row + 1 }}
              >
                <Tooltip title={`${state.name} — ${getStatusText(state.abbr)}`} placement="top">
                  <button
                    onClick={() => setAddModal({ open: true, abbr: state.abbr, name: state.name })}
                    className="w-12 h-12 rounded-lg text-xs font-bold transition-all duration-200 hover:scale-110 hover:z-10 relative border"
                    style={{
                      background: color,
                      borderColor: isVisited ? "rgba(0,0,0,0.1)" : "#D0D0CC",
                      color: isVisited ? "#fff" : "#9E9E9E",
                      boxShadow: hovered === state.abbr ? `0 0 0 2px #3B7D3C` : "none",
                    }}
                    onMouseEnter={() => setHovered(state.abbr)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    {state.abbr}
                  </button>
                </Tooltip>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-[#9E9E9E] text-xs mt-3">Click any state to manually mark as visited or update status.</p>

      <Modal
        open={addModal.open}
        title={<span className="text-[#1A1A1A] font-semibold">{addModal.name}</span>}
        okText={manualStates.has(addModal.abbr) ? "Remove from Visited" : "Mark as Visited"}
        onOk={toggleManualState}
        onCancel={() => setAddModal({ open: false, abbr: "", name: "" })}
      >
        <p className="text-[#5A5A5A] text-sm mb-2">
          Current status: <strong className="text-[#1A1A1A]">{getStatusText(addModal.abbr)}</strong>
        </p>
        <p className="text-xs text-[#9E9E9E]">
          {manualStates.has(addModal.abbr)
            ? "This state is manually marked as visited. Click the button to remove it."
            : "Manually toggle the visited status for this state. Trip-linked visits update automatically."}
        </p>
      </Modal>
    </div>
  );
};

export default StateMap;
