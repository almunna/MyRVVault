import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { message, Modal, Rate } from "antd";
import { FiMapPin, FiCalendar, FiPlus, FiTrash2, FiEdit2, FiStar } from "react-icons/fi";

const formatDate = (d) => {
  if (!d) return "";
  try { return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
  catch { return d; }
};

const CampgroundList = () => {
  const navigate = useNavigate();
  const [campgrounds, setCampgrounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5002/api";
  const token = localStorage.getItem("accessToken");

  const fetchCampgrounds = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/campgrounds`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setCampgrounds(data.data || []);
    } catch {
      message.error("Failed to load campgrounds");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCampgrounds(); }, []);

  const toggleFavorite = async (id, e) => {
    e.preventDefault();
    try {
      await fetch(`${BASE_URL}/campgrounds/${id}/favorite`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCampgrounds();
    } catch {
      message.error("Failed to update");
    }
  };

  const confirmDelete = async () => {
    try {
      await fetch(`${BASE_URL}/campgrounds/${deleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("Campground deleted");
      setDeleteId(null);
      fetchCampgrounds();
    } catch {
      message.error("Failed to delete");
    }
  };

  const stayDuration = (cg) => {
    if (!cg.checkIn || !cg.checkOut) return null;
    const days = Math.round((new Date(cg.checkOut) - new Date(cg.checkIn)) / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} night${days > 1 ? "s" : ""}` : null;
  };

  return (
    <div className="container m-auto py-8 px-3 lg:px-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-[#F9B038]">Campground History</h1>
        <Link to="/addCampground">
          <button className="flex items-center gap-2 bg-[#F9B038] py-2 px-4 text-black rounded-md font-medium">
            <FiPlus size={14} /> Add Campground
          </button>
        </Link>
      </div>

      {loading && <div className="text-center py-10 text-[#F9B038]">Loading...</div>}

      {!loading && campgrounds.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <FiMapPin size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg">No campgrounds recorded yet.</p>
          <p className="text-sm mt-1">Start adding campgrounds from your travels.</p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4">
        {campgrounds.map(cg => (
          <div key={cg.id} className="border border-gray-700 rounded-lg overflow-hidden bg-gray-900 hover:border-[#F9B038] transition-colors">
            {/* Photo Header */}
            {cg.photos?.length > 0 ? (
              <img src={cg.photos[0].url} alt={cg.name} className="w-full h-36 object-cover" />
            ) : (
              <div className="w-full h-36 bg-gray-800 flex items-center justify-center">
                <FiMapPin size={32} className="text-gray-600" />
              </div>
            )}

            <div className="p-4 space-y-2">
              <div className="flex justify-between items-start">
                <h3 className="text-[#F9B038] font-semibold text-base truncate pr-2">{cg.name}</h3>
                <button onClick={(e) => toggleFavorite(cg.id, e)} className="shrink-0">
                  <FiStar size={16} className={cg.isFavorite ? "fill-[#F9B038] text-[#F9B038]" : "text-gray-500"} />
                </button>
              </div>

              {cg.location && (
                <div className="flex items-center gap-1 text-sm text-gray-400">
                  <FiMapPin size={12} /> <span className="truncate">{cg.location}</span>
                </div>
              )}

              {(cg.checkIn || cg.checkOut) && (
                <div className="flex items-center gap-1 text-sm text-gray-400">
                  <FiCalendar size={12} />
                  <span>
                    {formatDate(cg.checkIn)} {cg.checkOut ? `→ ${formatDate(cg.checkOut)}` : ""}
                    {stayDuration(cg) && <span className="ml-1 text-gray-500">({stayDuration(cg)})</span>}
                  </span>
                </div>
              )}

              {cg.rating && (
                <Rate disabled value={cg.rating} className="text-[#F9B038] text-xs" />
              )}

              {cg.notes && (
                <p className="text-gray-500 text-xs italic line-clamp-2">{cg.notes}</p>
              )}

              <div className="flex justify-end gap-2 pt-1 border-t border-gray-700">
                <button
                  onClick={() => navigate(`/editCampground/${cg.id}`)}
                  className="flex items-center gap-1 text-xs text-[#F9B038] border border-[#F9B038] px-2 py-1 rounded hover:bg-[#F9B038] hover:text-black transition-colors"
                >
                  <FiEdit2 size={10} /> Edit
                </button>
                <button
                  onClick={() => setDeleteId(cg.id)}
                  className="flex items-center gap-1 text-xs text-red-400 border border-red-400 px-2 py-1 rounded hover:bg-red-400 hover:text-white transition-colors"
                >
                  <FiTrash2 size={10} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={!!deleteId}
        title={<span className="text-red-500">Delete Campground</span>}
        okText="Delete"
        okButtonProps={{ danger: true }}
        onOk={confirmDelete}
        onCancel={() => setDeleteId(null)}
      >
        <p>Delete this campground entry and all its photos?</p>
      </Modal>
    </div>
  );
};

export default CampgroundList;
