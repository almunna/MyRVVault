import React, { useState } from "react";
import { Modal, Rate, message } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { FiMapPin, FiCalendar, FiClock, FiEdit2, FiTrash2, FiStar } from "react-icons/fi";
import { LinkOutlined } from "@ant-design/icons";
import {
  useGetSingleCampgroundQuery,
  useDeleteCampgroundMutation,
  useToggleCampgroundFavoriteMutation,
} from "../redux/api/routesApi";

const formatDate = (d) => {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return d;
  }
};

const stayDuration = (cg) => {
  if (!cg.checkIn || !cg.checkOut) return null;
  const days = Math.round((new Date(cg.checkOut) - new Date(cg.checkIn)) / (1000 * 60 * 60 * 24));
  return days > 0 ? `${days} night${days > 1 ? "s" : ""}` : null;
};

const CampgroundDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showDelete, setShowDelete] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);

  const { data, isLoading, isError } = useGetSingleCampgroundQuery(id);
  const [deleteCampground] = useDeleteCampgroundMutation();
  const [toggleFavorite] = useToggleCampgroundFavoriteMutation();

  const handleDelete = async () => {
    try {
      await deleteCampground(id).unwrap();
      message.success("Campground deleted");
      navigate("/campgrounds");
    } catch {
      message.error("Failed to delete");
    } finally {
      setShowDelete(false);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      await toggleFavorite(id).unwrap();
    } catch {
      message.error("Failed to update favorite");
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
      <p className="text-[#5A5A5A]">Loading…</p>
    </div>
  );

  if (isError || !data?.data) return (
    <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
      <p className="text-red-500">Campground not found.</p>
    </div>
  );

  const cg = data.data;
  const photos = cg.photos || [];
  const duration = stayDuration(cg);

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="max-w-site mx-auto px-4 lg:px-6 2xl:px-8 py-10">

        {/* Page Header */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-1 h-8 bg-[#D4872D] rounded-full flex-shrink-0" />
              <h1 className="text-3xl font-bold text-[#1A1A1A] truncate">{cg.name}</h1>
              <button
                onClick={handleToggleFavorite}
                className="flex-shrink-0 p-1"
                title={cg.isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <FiStar
                  size={20}
                  className={cg.isFavorite ? "fill-[#D4872D] text-[#D4872D]" : "text-[#C0C0C0] hover:text-[#D4872D]"}
                />
              </button>
            </div>
            {cg.location && (
              <div className="flex items-center gap-1.5 ml-4 pl-3">
                <FiMapPin size={13} className="text-[#3B7D3C] flex-shrink-0" />
                <span className="text-[#5A5A5A] text-sm">{cg.location}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => navigate(`/editCampground/${id}`)}
              className="flex items-center gap-1.5 py-2 px-3 rounded-xl border border-[#3B7D3C] text-[#3B7D3C] text-sm font-medium hover:bg-[#3B7D3C] hover:text-white transition-all duration-200"
            >
              <FiEdit2 size={13} /> Edit
            </button>
            <button
              onClick={() => setShowDelete(true)}
              className="flex items-center gap-1.5 py-2 px-3 rounded-xl border border-red-300 text-red-500 text-sm font-medium hover:bg-red-50 transition-all duration-200"
            >
              <FiTrash2 size={13} /> Delete
            </button>
          </div>
        </div>

        <div className="max-w-3xl space-y-5">

          {/* Photo Gallery */}
          {photos.length > 0 ? (
            <div className="bg-white border border-[#E8F0E8] rounded-2xl overflow-hidden shadow-sm">
              <img
                src={photos[activePhoto]?.url}
                alt={cg.name}
                className="w-full h-72 object-cover"
              />
              {photos.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {photos.map((p, idx) => (
                    <button
                      key={p.filename || idx}
                      onClick={() => setActivePhoto(idx)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                        idx === activePhoto ? "border-[#3B7D3C]" : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={p.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-[#E8F0E8] rounded-2xl shadow-sm">
              <div className="w-full h-48 flex items-center justify-center">
                <FiMapPin size={40} className="text-[#C8D8C8]" />
              </div>
            </div>
          )}

          {/* Details Card */}
          <div className="bg-white border border-[#E8F0E8] rounded-2xl p-6 shadow-sm space-y-4">

            {/* Dates + Duration */}
            {(cg.checkIn || cg.checkOut) && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm text-[#5A5A5A]">
                  <FiCalendar size={14} className="text-[#3B7D3C] flex-shrink-0" />
                  <span>
                    {formatDate(cg.checkIn)}
                    {cg.checkOut ? ` → ${formatDate(cg.checkOut)}` : ""}
                  </span>
                </div>
                {duration && (
                  <div className="flex items-center gap-2 text-xs text-[#9E9E9E]">
                    <FiClock size={12} className="flex-shrink-0" />
                    <span>{duration}</span>
                  </div>
                )}
              </div>
            )}

            {/* Rating */}
            {cg.rating > 0 && (
              <div>
                <p className="text-xs font-medium text-[#5A5A5A] mb-1">Rating</p>
                <Rate disabled value={cg.rating} style={{ color: "#D4872D" }} />
              </div>
            )}

            {/* Notes */}
            {cg.notes && (
              <div>
                <p className="text-xs font-medium text-[#5A5A5A] mb-1">Notes</p>
                <p className="text-sm text-[#1A1A1A] whitespace-pre-wrap">{cg.notes}</p>
              </div>
            )}
          </div>

          {/* Trip Link */}
          {cg.tripId && (
            <div className="bg-white border border-[#E8F0E8] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-[#E8F0E8]">
                <div className="w-8 h-8 rounded-lg bg-[#E8F0E8] flex items-center justify-center">
                  <span className="text-[#3B7D3C] text-sm"><LinkOutlined /></span>
                </div>
                <h2 className="text-base font-semibold text-[#1A1A1A]">Linked Trip</h2>
              </div>
              <button
                onClick={() => navigate(`/campgroundReview`)}
                className="text-sm text-[#3B7D3C] font-medium hover:underline"
              >
                View in Trips →
              </button>
            </div>
          )}

          {/* Back */}
          <button
            onClick={() => navigate("/campgrounds")}
            className="w-full py-3 rounded-xl border border-[#E0E0E0] text-[#5A5A5A] font-medium text-sm hover:border-[#3B7D3C] hover:text-[#3B7D3C] transition-all duration-200"
          >
            ← Back to Campgrounds
          </button>
        </div>
      </div>

      <Modal
        open={showDelete}
        title={<span className="text-red-500">Delete Campground</span>}
        okText="Delete"
        okButtonProps={{ danger: true }}
        onOk={handleDelete}
        onCancel={() => setShowDelete(false)}
      >
        <p className="text-[#5A5A5A]">
          Delete <strong className="text-[#1A1A1A]">{cg.name}</strong> and all its photos? This cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default CampgroundDetail;
