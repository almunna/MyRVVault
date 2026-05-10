import React, { useState } from "react";
import { message, Modal, Input } from "antd";
import { FiMapPin, FiPhone, FiGlobe, FiStar, FiNavigation, FiBookmark } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const { TextArea } = Input;

const categoryLabel = {
  rv_repair: "RV Repair", rv_dealer: "RV Dealer", mobile_rv_tech: "Mobile RV Tech",
  auto_repair: "Auto Repair", tire_shop: "Tire Shop", general_service: "General Service", other: "Other"
};

const categoryColor = {
  rv_repair: "bg-orange-100 text-orange-700", rv_dealer: "bg-blue-100 text-blue-700",
  mobile_rv_tech: "bg-purple-100 text-purple-700", auto_repair: "bg-yellow-100 text-yellow-700",
  tire_shop: "bg-green-100 text-green-700", general_service: "bg-gray-100 text-gray-700"
};

const FindVendors = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [coords, setCoords] = useState(null);
  const [saveModal, setSaveModal] = useState({ open: false, place: null, loadingDetails: false });
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5002/api";
  const token = localStorage.getItem("accessToken");

  const getLocation = () => {
    if (!navigator.geolocation) {
      message.error("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        setLocating(false);
        await searchNearby(latitude, longitude);
      },
      () => {
        message.error("Unable to retrieve your location. Please allow location access.");
        setLocating(false);
      },
      { timeout: 10000 }
    );
  };

  const searchNearby = async (lat, lng) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/vendors/places/nearby?lat=${lat}&lng=${lng}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setResults(data.data || []);
        if (data.data?.length === 0) message.info("No service providers found nearby.");
      } else {
        message.error(data.message || "Search failed");
      }
    } catch {
      message.error("Failed to search nearby vendors");
    } finally {
      setLoading(false);
    }
  };

  const openSaveModal = async (place) => {
    setSaveModal({ open: true, place, loadingDetails: true });
    setNotes("");
    if (place.placeId) {
      try {
        const res = await fetch(`${BASE_URL}/vendors/places/details?placeId=${place.placeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setSaveModal(prev => ({
            ...prev,
            place: { ...prev.place, phone: data.data.phone || prev.place.phone, website: data.data.website || prev.place.website },
            loadingDetails: false
          }));
          return;
        }
      } catch {}
    }
    setSaveModal(prev => ({ ...prev, loadingDetails: false }));
  };

  const saveVendor = async () => {
    if (!saveModal.place) return;
    setSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/vendors/places/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          placeId: saveModal.place.placeId,
          name: saveModal.place.name,
          address: saveModal.place.address,
          phone: saveModal.place.phone,
          website: saveModal.place.website,
          category: saveModal.place.category,
          notes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        message.success("Vendor saved to your list!");
        setSaveModal({ open: false, place: null });
      } else {
        message.error(data.message || "Failed to save vendor");
      }
    } catch {
      message.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const getDistanceText = (place) => {
    if (place.location && coords) {
      const R = 3959;
      const dLat = ((place.location.lat - coords.lat) * Math.PI) / 180;
      const dLon = ((place.location.lng - coords.lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((coords.lat * Math.PI) / 180) *
        Math.cos((place.location.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
      const mi = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return `${mi.toFixed(1)} mi`;
    }
    return null;
  };

  return (
    <div className="container m-auto py-8 px-3 lg:px-0">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="text-[#F9B038] hover:underline text-sm">← Back</button>
        <h1 className="text-2xl font-semibold text-[#F9B038]">Find Service Near Me</h1>
      </div>

      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 mb-8 text-center">
        <FiNavigation size={40} className="mx-auto mb-3 text-[#F9B038]" />
        <p className="text-gray-300 mb-4">
          Find RV repair shops, dealers, tire stores, and more near your current location.
          Results are sorted by RV relevance.
        </p>
        <button
          onClick={getLocation}
          disabled={locating || loading}
          className="bg-[#F9B038] text-black font-semibold px-8 py-3 rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-60 flex items-center gap-2 mx-auto"
        >
          <FiNavigation size={16} />
          {locating ? "Getting Location..." : loading ? "Searching..." : "Find Service Near Me"}
        </button>
      </div>

      {results.length > 0 && (
        <>
          <p className="text-gray-400 text-sm mb-4">{results.length} results found near you, sorted by RV relevance.</p>
          <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
            {results.map((place, idx) => (
              <div key={place.placeId || idx} className="border border-gray-700 rounded-lg p-4 bg-gray-900 space-y-3 hover:border-[#F9B038] transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[#F9B038] font-semibold text-base truncate">{place.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColor[place.category] || "bg-gray-100 text-gray-700"}`}>
                      {categoryLabel[place.category] || place.category}
                    </span>
                  </div>
                  <div className="text-right ml-2">
                    {place.rating && (
                      <div className="flex items-center gap-1 text-yellow-400 text-sm">
                        <FiStar size={12} className="fill-current" />
                        <span>{place.rating}</span>
                        <span className="text-gray-500 text-xs">({place.totalRatings})</span>
                      </div>
                    )}
                    {getDistanceText(place) && (
                      <p className="text-gray-400 text-xs">{getDistanceText(place)}</p>
                    )}
                  </div>
                </div>

                {place.address && (
                  <div className="flex items-start gap-2 text-sm text-gray-400">
                    <FiMapPin size={12} className="mt-0.5 shrink-0" />
                    <span>{place.address}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex gap-3 text-sm text-gray-400">
                    {place.isOpenNow !== null && (
                      <span className={place.isOpenNow ? "text-green-400" : "text-red-400"}>
                        {place.isOpenNow ? "Open Now" : "Closed"}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => openSaveModal(place)}
                    className="flex items-center gap-1 text-xs text-[#F9B038] border border-[#F9B038] px-3 py-1.5 rounded hover:bg-[#F9B038] hover:text-black transition-colors"
                  >
                    <FiBookmark size={11} /> Save
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Modal
        open={saveModal.open}
        title={<span className="text-[#F9B038]">Save Vendor</span>}
        okText={saving ? "Saving..." : "Save to My Vendors"}
        okButtonProps={{ style: { background: "#F9B038", borderColor: "#F9B038", color: "#000" }, disabled: saving }}
        onOk={saveVendor}
        onCancel={() => setSaveModal({ open: false, place: null })}
      >
        <p className="mb-1"><strong>{saveModal.place?.name}</strong></p>
        <p className="text-gray-600 text-sm mb-2">{saveModal.place?.address}</p>
        {saveModal.loadingDetails && <p className="text-xs text-gray-400 mb-2">Loading contact details...</p>}
        {!saveModal.loadingDetails && (saveModal.place?.phone || saveModal.place?.website) && (
          <div className="flex gap-4 text-sm text-gray-500 mb-3">
            {saveModal.place?.phone && (
              <span className="flex items-center gap-1"><FiPhone size={11} /> {saveModal.place.phone}</span>
            )}
            {saveModal.place?.website && (
              <a href={saveModal.place.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-500 hover:underline">
                <FiGlobe size={11} /> Website
              </a>
            )}
          </div>
        )}
        <label className="block text-sm font-medium mb-1">Add Notes (optional)</label>
        <TextArea
          rows={3}
          placeholder="Notes about this vendor..."
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default FindVendors;
