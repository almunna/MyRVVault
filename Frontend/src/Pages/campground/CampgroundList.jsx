import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { message, Modal, Rate } from "antd";
import { FiMapPin, FiCalendar, FiPlus, FiTrash2, FiEdit2, FiStar, FiClock } from "react-icons/fi";
import {
  useGetCampgroundsQuery,
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

const CampgroundList = () => {
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState(null);

  const { data, isLoading, isError } = useGetCampgroundsQuery({});
  const [deleteCampground] = useDeleteCampgroundMutation();
  const [toggleFavorite] = useToggleCampgroundFavoriteMutation();

  const campgrounds = data?.data || [];

  const handleToggleFavorite = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await toggleFavorite(id).unwrap();
    } catch {
      message.error("Failed to update favorite");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCampground(deleteId).unwrap();
      message.success("Campground deleted");
      setDeleteId(null);
    } catch {
      message.error("Failed to delete");
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
      <p className="text-[#5A5A5A]">Loading…</p>
    </div>
  );

  if (isError) return (
    <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
      <p className="text-red-500">Failed to load campgrounds.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="max-w-site mx-auto px-4 lg:px-6 2xl:px-8 py-10">

        {/* Page Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-1 h-8 bg-[#D4872D] rounded-full" />
              <h1 className="text-3xl font-bold text-[#1A1A1A]">Campground History</h1>
            </div>
            <p className="text-[#5A5A5A] text-sm ml-4 pl-3">
              All the places you've stayed in your RV.
            </p>
          </div>
          <Link to="/addCampground">
            <button className="flex items-center gap-2 py-2 px-4 rounded-xl bg-[#3B7D3C] text-white font-medium text-sm hover:bg-[#2d6130] shadow-sm hover:shadow-md transition-all duration-200">
              <FiPlus size={14} /> Add Campground
            </button>
          </Link>
        </div>

        {/* Empty state */}
        {campgrounds.length === 0 && (
          <div className="bg-white border border-[#E8F0E8] rounded-2xl p-16 text-center shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-[#E8F0E8] flex items-center justify-center mx-auto mb-4">
              <FiMapPin className="text-[#3B7D3C] text-2xl" />
            </div>
            <p className="text-[#1A1A1A] font-semibold text-lg mb-1">No campgrounds recorded yet</p>
            <p className="text-[#5A5A5A] text-sm mb-5">Start logging the campgrounds from your travels.</p>
            <Link to="/addCampground">
              <button className="py-2 px-5 rounded-xl bg-[#3B7D3C] text-white font-medium text-sm hover:bg-[#2d6130] transition-all duration-200">
                Add First Campground
              </button>
            </Link>
          </div>
        )}

        {/* Grid */}
        <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5">
          {campgrounds.map((cg) => (
            <div
              key={cg.id}
              className="bg-white border border-[#E8F0E8] rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-[#3B7D3C]/40 transition-all duration-200 cursor-pointer"
              onClick={() => navigate(`/campgrounds/${cg.id}`)}
            >
              {/* Photo */}
              {cg.photos?.length > 0 ? (
                <img src={cg.photos[0].url} alt={cg.name} className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 bg-[#F0F4F0] flex items-center justify-center">
                  <FiMapPin size={32} className="text-[#C8D8C8]" />
                </div>
              )}

              <div className="p-4 space-y-2">
                {/* Name + Favorite */}
                <div className="flex justify-between items-start gap-2">
                  <h3 className="text-[#1A1A1A] font-semibold text-base truncate flex-1">{cg.name}</h3>
                  <button
                    onClick={(e) => handleToggleFavorite(cg.id, e)}
                    className="flex-shrink-0 p-0.5"
                    title={cg.isFavorite ? "Remove from favorites" : "Add to favorites"}
                  >
                    <FiStar
                      size={16}
                      className={cg.isFavorite ? "fill-[#D4872D] text-[#D4872D]" : "text-[#C0C0C0]"}
                    />
                  </button>
                </div>

                {/* Location */}
                {cg.location && (
                  <div className="flex items-center gap-1.5 text-sm text-[#5A5A5A]">
                    <FiMapPin size={12} className="text-[#3B7D3C] flex-shrink-0" />
                    <span className="truncate">{cg.location}</span>
                  </div>
                )}

                {/* Dates */}
                {(cg.checkIn || cg.checkOut) && (
                  <div className="flex items-center gap-1.5 text-sm text-[#5A5A5A]">
                    <FiCalendar size={12} className="text-[#3B7D3C] flex-shrink-0" />
                    <span>
                      {formatDate(cg.checkIn)}
                      {cg.checkOut ? ` → ${formatDate(cg.checkOut)}` : ""}
                    </span>
                  </div>
                )}

                {/* Duration */}
                {stayDuration(cg) && (
                  <div className="flex items-center gap-1.5 text-xs text-[#9E9E9E]">
                    <FiClock size={11} className="flex-shrink-0" />
                    <span>{stayDuration(cg)}</span>
                  </div>
                )}

                {/* Rating */}
                {cg.rating > 0 && (
                  <Rate disabled value={cg.rating} className="text-sm" style={{ color: "#D4872D" }} />
                )}

                {/* Notes */}
                {cg.notes && (
                  <p className="text-[#9E9E9E] text-xs line-clamp-2 italic">{cg.notes}</p>
                )}

                {/* Actions */}
                <div
                  className="flex justify-end gap-2 pt-2 border-t border-[#F0F0F0]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => navigate(`/editCampground/${cg.id}`)}
                    className="flex items-center gap-1 text-xs text-[#3B7D3C] border border-[#3B7D3C] px-2.5 py-1 rounded-lg hover:bg-[#3B7D3C] hover:text-white transition-all duration-200"
                  >
                    <FiEdit2 size={10} /> Edit
                  </button>
                  <button
                    onClick={() => setDeleteId(cg.id)}
                    className="flex items-center gap-1 text-xs text-red-500 border border-red-300 px-2.5 py-1 rounded-lg hover:bg-red-500 hover:text-white transition-all duration-200"
                  >
                    <FiTrash2 size={10} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal
        open={!!deleteId}
        title={<span className="text-red-500">Delete Campground</span>}
        okText="Delete"
        okButtonProps={{ danger: true }}
        onOk={handleDelete}
        onCancel={() => setDeleteId(null)}
      >
        <p className="text-[#5A5A5A]">Delete this campground entry and all its photos? This cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default CampgroundList;
