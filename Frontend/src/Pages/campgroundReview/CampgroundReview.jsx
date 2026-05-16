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
  const days = Math.floor((new Date() - new Date(startDate)) / 86400000);
  return days === 0 ? "Started today" : `Day ${days + 1}`;
};

const inputClass =
  "w-full rounded-lg border border-[#E0E0E0] bg-white px-3 py-2 text-[#1A1A1A] placeholder-gray-400 focus:border-[#3B7D3C] focus:ring-1 focus:ring-[#3B7D3C] transition-all duration-200";

const ActiveTripWidget = ({ onTripChange }) => {
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
        onTripChange?.();
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
        onTripChange?.();
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
        <div className="mb-6 bg-white border border-[#E8F0E8] rounded-2xl px-5 py-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-[#3B7D3C] rounded-full animate-pulse flex-shrink-0" />
            <div>
              <p className="text-[#1A1A1A] font-semibold text-sm">{activeTrip.title}</p>
              <p className="text-[#5A5A5A] text-xs">{formatDuration(activeTrip.startDate)} · Trip in progress</p>
            </div>
          </div>
          <button
            onClick={() => setEndModal(true)}
            className="flex items-center gap-2 border border-red-300 text-red-500 px-4 py-1.5 rounded-xl text-sm font-medium hover:bg-red-50 transition-all duration-200"
          >
            <FiSquare size={12} /> End Trip
          </button>
        </div>

        <Modal
          open={endModal}
          title={<span className="text-[#1A1A1A] font-semibold">End Trip — {activeTrip.title}</span>}
          okText={submitting ? "Ending…" : "Complete Trip"}
          okButtonProps={{ disabled: submitting }}
          onOk={handleEnd}
          onCancel={() => { setEndModal(false); setEndOdo(""); }}
        >
          <p className="text-[#5A5A5A] text-sm mb-4">Record your final odometer reading to auto-calculate miles driven.</p>
          <label className="block text-sm font-medium text-[#5A5A5A] mb-1">End Odometer (optional)</label>
          <Input
            type="number"
            placeholder="e.g., 45800"
            value={endOdo}
            className={inputClass}
            onChange={e => setEndOdo(e.target.value)}
          />
          {activeTrip.startOdometer && endOdo && Number(endOdo) > activeTrip.startOdometer && (
            <p className="text-[#3B7D3C] text-sm mt-2 font-medium">
              Miles driven: {Number(endOdo) - activeTrip.startOdometer} mi
            </p>
          )}
        </Modal>
      </>
    );
  }

  return (
    <>
      <div className="mb-6 bg-white border border-dashed border-[#C8D8C8] rounded-2xl px-5 py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[#9E9E9E] text-sm">
          <FiMapPin size={14} />
          <span>No trip in progress</span>
        </div>
        <button
          onClick={() => setStartModal(true)}
          className="flex items-center gap-2 bg-[#3B7D3C] text-white px-4 py-1.5 rounded-xl text-sm font-semibold hover:bg-[#2d6130] transition-all duration-200 shadow-sm"
        >
          <FiPlay size={12} /> Start Trip
        </button>
      </div>

      <Modal
        open={startModal}
        title={<span className="text-[#1A1A1A] font-semibold">Start New Trip</span>}
        okText={submitting ? "Starting…" : "Start Trip"}
        okButtonProps={{ disabled: submitting }}
        onOk={handleStart}
        onCancel={() => { setStartModal(false); setTripTitle(""); setStartOdo(""); }}
      >
        <div className="space-y-4 mt-2">
          <div>
            <label className="block text-sm font-medium text-[#5A5A5A] mb-1">Trip Name *</label>
            <Input
              placeholder="e.g., Summer Road Trip 2026"
              value={tripTitle}
              className={inputClass}
              onChange={e => setTripTitle(e.target.value)}
              onPressEnter={handleStart}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#5A5A5A] mb-1">Starting Odometer (optional)</label>
            <Input
              type="number"
              placeholder="e.g., 45000"
              value={startOdo}
              className={inputClass}
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
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="max-w-site mx-auto px-4 lg:px-6 2xl:px-8 py-10">

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-8 bg-[#D4872D] rounded-full" />
            <h1 className="text-3xl font-bold text-[#1A1A1A]">My Trips</h1>
          </div>
          <p className="text-[#5A5A5A] text-sm ml-4 pl-3">
            Track your RV travels across the US.
          </p>
        </div>

        <ActiveTripWidget onTripChange={() => {}} />

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-[#3B7D3C] text-white shadow-sm"
                  : "border border-[#E0E0E0] text-[#5A5A5A] hover:border-[#3B7D3C] hover:text-[#3B7D3C]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default CampgroundReview;
