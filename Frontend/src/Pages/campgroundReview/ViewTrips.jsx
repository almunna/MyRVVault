import { message, Modal } from "antd";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useDeleteCampMutation, useGetCampQuery } from "../redux/api/routesApi";
import { FiEdit2, FiTrash2, FiMapPin, FiCalendar, FiFileText } from "react-icons/fi";

const STATUS_BADGE = {
  CAMPED: { label: "Camped", cls: "bg-[#E8F0E8] text-[#3B7D3C]" },
  TRAVELED_THROUGH: { label: "Traveled Through", cls: "bg-blue-50 text-blue-600" },
  PLANNING: { label: "Planning", cls: "bg-purple-50 text-purple-600" },
  NOT_VISITED: { label: "Not Visited", cls: "bg-[#F5F5F0] text-[#9E9E9E]" },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_BADGE[status] || { label: status, cls: "bg-gray-100 text-gray-500" };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
};

const ViewTrips = () => {
  const { data: campData, isLoading, isError } = useGetCampQuery();
  const [deleteCamp] = useDeleteCampMutation();
  const [confirmId, setConfirmId] = useState(null);

  if (isLoading) {
    return (
      <div className="py-10 flex items-center justify-center">
        <p className="text-[#5A5A5A]">Loading trips…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-10 flex items-center justify-center">
        <p className="text-red-500">Failed to load trips.</p>
      </div>
    );
  }

  const trips = campData?.data || [];

  const handleDelete = async (id) => {
    try {
      const res = await deleteCamp(id).unwrap();
      message.success(res?.message || "Trip deleted");
    } catch (err) {
      message.error(err?.data?.message || "Failed to delete trip");
    } finally {
      setConfirmId(null);
    }
  };

  if (trips.length === 0) {
    return (
      <div className="bg-white border border-[#E8F0E8] rounded-2xl p-10 text-center shadow-sm">
        <p className="text-[#9E9E9E] text-sm">No trips recorded yet. Start a new trip to see it here.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid lg:grid-cols-2 gap-4">
        {trips.map((trip) => (
          <div
            key={trip.id}
            className="bg-white border border-[#E8F0E8] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200"
          >
            {/* Title row */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <h3 className="text-[#1A1A1A] font-semibold text-base leading-tight">{trip.title}</h3>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Link to={`/campgroundReview?tab=updateState&id=${trip.id}`}>
                  <button className="p-1.5 rounded-lg text-[#9E9E9E] hover:text-[#3B7D3C] hover:bg-[#E8F0E8] transition-all duration-200">
                    <FiEdit2 size={15} />
                  </button>
                </Link>
                <button
                  onClick={() => setConfirmId(trip.id)}
                  className="p-1.5 rounded-lg text-[#9E9E9E] hover:text-red-500 hover:bg-red-50 transition-all duration-200"
                >
                  <FiTrash2 size={15} />
                </button>
              </div>
            </div>

            {/* Dates */}
            <div className="flex items-center gap-2 text-[#5A5A5A] text-xs mb-3">
              <FiCalendar size={12} />
              <span>
                {trip.startDate ? new Date(trip.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                {trip.endDate ? ` → ${new Date(trip.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}` : ""}
              </span>
            </div>

            {/* States */}
            {trip.states?.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center gap-1.5 text-[#5A5A5A] text-xs mb-2">
                  <FiMapPin size={12} />
                  <span className="font-medium">States</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {trip.states.map((s, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <span className="text-xs text-[#1A1A1A]">{s.state}</span>
                      <StatusBadge status={s.status} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {trip.description && (
              <div className="flex items-start gap-1.5 mt-3 pt-3 border-t border-[#E8F0E8]">
                <FiFileText size={12} className="text-[#9E9E9E] mt-0.5 flex-shrink-0" />
                <p className="text-[#5A5A5A] text-xs line-clamp-2">{trip.description}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <Modal
        open={!!confirmId}
        title={<span className="text-[#1A1A1A] font-semibold">Delete Trip</span>}
        okText="Delete"
        okButtonProps={{ danger: true }}
        onOk={() => handleDelete(confirmId)}
        onCancel={() => setConfirmId(null)}
      >
        <p className="text-[#5A5A5A] text-sm">Are you sure you want to delete this trip? This cannot be undone.</p>
      </Modal>
    </>
  );
};

export default ViewTrips;
