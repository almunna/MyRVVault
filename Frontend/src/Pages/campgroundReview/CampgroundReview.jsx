import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Modal, Input, message } from "antd";
import { FiPlay, FiSquare, FiMapPin } from "react-icons/fi";
import NewTrip from './NewTrip';
import Progress from './Progress';
import UpdateState from './UpdateState';
import ViewTrips from './ViewTrips';
import StateMap from './StateMap';

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5002/api";

const formatDuration = (startDate) => {
  if (!startDate) return "";
  const start = new Date(startDate);
  const now = new Date();
  const days = Math.floor((now - start) / 86400000);
  if (days === 0) return "Started today";
  return `Day ${days + 1}`;
};

const ActiveTripWidget = () => {
  const [activeTrip, setActiveTrip] = useState(undefined);
  const [startModal, setStartModal] = useState(false);
  const [endModal, setEndModal] = useState(false);
  const [tripTitle, setTripTitle] = useState("");
  const [startOdo, setStartOdo] = useState("");
  const [endOdo, setEndOdo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const token = localStorage.getItem("accessToken");

  const fetchActive = async () => {
    try {
      const res = await fetch(`${BASE_URL}/trips/active`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setActiveTrip(data.success ? data.data : null);
    } catch {
      setActiveTrip(null);
    }
  };

  useEffect(() => { fetchActive(); }, []);

  const handleStart = async () => {
    if (!tripTitle.trim()) { message.warning("Please enter a trip name"); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/trips/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: tripTitle.trim(), startOdometer: startOdo || undefined }),
      });
      const data = await res.json();
      if (data.success) {
        message.success("Trip started!");
        setStartModal(false);
        setTripTitle("");
        setStartOdo("");
        setActiveTrip(data.data);
      } else {
        message.error(data.message || "Failed to start trip");
      }
    } catch {
      message.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEnd = async () => {
    if (!activeTrip) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/trips/${activeTrip.id}/end`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ endOdometer: endOdo || undefined }),
      });
      const data = await res.json();
      if (data.success) {
        message.success("Trip completed!");
        setEndModal(false);
        setEndOdo("");
        setActiveTrip(null);
      } else {
        message.error(data.message || "Failed to end trip");
      }
    } catch {
      message.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (activeTrip === undefined) return null;

  if (activeTrip) {
    return (
      <>
        <div className="mb-4 bg-green-950 border border-green-700 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
            <div>
              <p className="text-green-300 font-semibold text-sm">{activeTrip.title}</p>
              <p className="text-green-600 text-xs">{formatDuration(activeTrip.startDate)} · In progress</p>
            </div>
          </div>
          <button
            onClick={() => setEndModal(true)}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            <FiSquare size={12} /> End Trip
          </button>
        </div>

        <Modal
          open={endModal}
          title={<span className="text-[#F9B038]">End Trip — {activeTrip.title}</span>}
          okText={submitting ? "Ending..." : "Complete Trip"}
          okButtonProps={{ style: { background: "#F9B038", borderColor: "#F9B038", color: "#000" }, disabled: submitting }}
          onOk={handleEnd}
          onCancel={() => { setEndModal(false); setEndOdo(""); }}
        >
          <p className="text-gray-600 text-sm mb-4">Record your final odometer reading to auto-calculate miles driven.</p>
          <label className="block text-sm font-medium mb-1">End Odometer (optional)</label>
          <Input
            type="number"
            placeholder="e.g., 45800"
            value={endOdo}
            onChange={e => setEndOdo(e.target.value)}
          />
          {activeTrip.startOdometer && endOdo && Number(endOdo) > activeTrip.startOdometer && (
            <p className="text-green-600 text-sm mt-2">
              Miles driven: {Number(endOdo) - activeTrip.startOdometer} mi
            </p>
          )}
        </Modal>
      </>
    );
  }

  return (
    <>
      <div className="mb-4 border border-dashed border-gray-600 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <FiMapPin size={14} />
          <span>No trip in progress</span>
        </div>
        <button
          onClick={() => setStartModal(true)}
          className="flex items-center gap-2 bg-[#F9B038] text-black px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-yellow-500 transition-colors"
        >
          <FiPlay size={12} /> Start Trip
        </button>
      </div>

      <Modal
        open={startModal}
        title={<span className="text-[#F9B038]">Start New Trip</span>}
        okText={submitting ? "Starting..." : "Start Trip"}
        okButtonProps={{ style: { background: "#F9B038", borderColor: "#F9B038", color: "#000" }, disabled: submitting }}
        onOk={handleStart}
        onCancel={() => { setStartModal(false); setTripTitle(""); setStartOdo(""); }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Trip Name *</label>
            <Input
              placeholder="e.g., Summer Road Trip 2026"
              value={tripTitle}
              onChange={e => setTripTitle(e.target.value)}
              onPressEnter={handleStart}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Starting Odometer (optional)</label>
            <Input
              type="number"
              placeholder="e.g., 45000"
              value={startOdo}
              onChange={e => setStartOdo(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

const TABS = [
  { id: "stateMap", label: "State Map" },
  { id: "newTrip", label: "New Trip" },
  { id: "viewTrips", label: "All Trips" },
  { id: "progress", label: "Progress" },
];

const CampgroundReview = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("stateMap");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get("tab");
    if (tabParam) setActiveTab(tabParam);
  }, [location.search]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const params = new URLSearchParams(location.search);
    params.set("tab", tab);
    window.history.pushState(null, "", `?${params.toString()}`);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "stateMap":    return <StateMap />;
      case "progress":    return <Progress />;
      case "newTrip":     return <NewTrip />;
      case "updateState": return <UpdateState />;
      case "viewTrips":   return <ViewTrips />;
      default:            return null;
    }
  };

  return (
    <div className="container m-auto px-3 lg:px-0 mt-6">
      <ActiveTripWidget />
      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-[#F9B038] text-black"
                : "border border-[#F9B038] text-[#F9B038]"
            }`}
            onClick={() => handleTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {renderContent()}
    </div>
  );
};

export default CampgroundReview;
