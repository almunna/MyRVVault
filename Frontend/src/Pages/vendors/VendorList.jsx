import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { message, Modal, Select, Input } from "antd";
import {
  FiPhone, FiGlobe, FiMail, FiMapPin, FiStar, FiTrash2,
  FiEdit2, FiPlus, FiSearch, FiNavigation
} from "react-icons/fi";

const { Option } = Select;

const CATEGORIES = [
  { value: "rv_repair", label: "RV Repair" },
  { value: "rv_dealer", label: "RV Dealer" },
  { value: "mobile_rv_tech", label: "Mobile RV Tech" },
  { value: "truck_repair", label: "Truck Repair" },
  { value: "auto_repair", label: "Auto Repair" },
  { value: "tire_shop", label: "Tire Shop" },
  { value: "campground", label: "Campground" },
  { value: "general_service", label: "General Service" },
  { value: "other", label: "Other" },
];

const categoryLabel = (val) => CATEGORIES.find(c => c.value === val)?.label || val;

const categoryColor = {
  rv_repair: "bg-orange-100 text-orange-700",
  rv_dealer: "bg-blue-100 text-blue-700",
  mobile_rv_tech: "bg-purple-100 text-purple-700",
  truck_repair: "bg-red-100 text-red-700",
  auto_repair: "bg-yellow-100 text-yellow-700",
  tire_shop: "bg-green-100 text-green-700",
  campground: "bg-teal-100 text-teal-700",
  general_service: "bg-gray-100 text-gray-700",
  other: "bg-gray-100 text-gray-700",
};

const VendorList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [nearbyResults, setNearbyResults] = useState([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyEnabled, setNearbyEnabled] = useState(false);
  const [nearbyCoords, setNearbyCoords] = useState(null);
  const [savingPlaceId, setSavingPlaceId] = useState(null);

  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5002/api";
  const token = localStorage.getItem("accessToken");

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryFilter) params.set("category", categoryFilter);
      if (favoritesOnly) params.set("favorites", "true");
      if (search) params.set("searchTerm", search);

      const res = await fetch(`${BASE_URL}/vendors?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setVendors(data.data || []);
    } catch {
      message.error("Failed to load vendors");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { fetchVendors(); }, [categoryFilter, favoritesOnly, search]);

  const toggleFavorite = async (id) => {
    try {
      await fetch(`${BASE_URL}/vendors/${id}/favorite`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchVendors();
    } catch {
      message.error("Failed to update favorite");
    }
  };

  const confirmDelete = async () => {
    try {
      await fetch(`${BASE_URL}/vendors/${deleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("Vendor deleted");
      setDeleteId(null);
      fetchVendors();
    } catch {
      message.error("Failed to delete vendor");
    }
  };

  const findNearby = () => {
    if (!navigator.geolocation) { message.error("Geolocation not supported"); return; }
    setNearbyLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setNearbyCoords({ lat: latitude, lng: longitude });
        try {
          const res = await fetch(`${BASE_URL}/vendors/places/nearby?lat=${latitude}&lng=${longitude}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (data.success) {
            setNearbyResults(data.data || []);
            setNearbyEnabled(true);
            if (!data.data?.length) message.info("No nearby service providers found.");
          } else {
            message.error(data.message || "Nearby search failed");
          }
        } catch {
          message.error("Failed to search nearby vendors");
        } finally {
          setNearbyLoading(false);
        }
      },
      () => { message.error("Unable to retrieve location. Allow location access."); setNearbyLoading(false); },
      { timeout: 10000 }
    );
  };

  const saveNearbyVendor = async (place) => {
    setSavingPlaceId(place.placeId);
    try {
      const res = await fetch(`${BASE_URL}/vendors/places/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ placeId: place.placeId, name: place.name, address: place.address, category: place.category }),
      });
      const data = await res.json();
      if (data.success) {
        message.success("Vendor saved!");
        setNearbyResults(prev => prev.filter(p => p.placeId !== place.placeId));
        fetchVendors();
      } else {
        message.error(data.message || "Failed to save vendor");
      }
    } catch {
      message.error("Something went wrong");
    } finally {
      setSavingPlaceId(null);
    }
  };

  const getDistanceMi = (place) => {
    if (!nearbyCoords || !place.location) return null;
    const R = 3959;
    const dLat = ((place.location.lat - nearbyCoords.lat) * Math.PI) / 180;
    const dLon = ((place.location.lng - nearbyCoords.lng) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos((nearbyCoords.lat * Math.PI) / 180) *
      Math.cos((place.location.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
  };

  const savedPlaceIds = new Set(vendors.filter(v => v.placeId).map(v => v.placeId));
  const unsavedNearby = nearbyResults.filter(p => !savedPlaceIds.has(p.placeId));

  const filtered = vendors.filter(v =>
    !search || v.name?.toLowerCase().includes(search.toLowerCase()) ||
    v.address?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container m-auto py-8 px-3 lg:px-0">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
        <h1 className="text-3xl font-semibold text-[#F9B038]">Vendors</h1>
        <div className="flex gap-2">
          <button
            onClick={nearbyEnabled ? () => { setNearbyEnabled(false); setNearbyResults([]); } : findNearby}
            disabled={nearbyLoading}
            className={`flex items-center gap-2 border py-2 px-4 rounded-md font-medium transition-colors ${
              nearbyEnabled ? "bg-[#F9B038] text-black border-[#F9B038]" : "border-[#F9B038] text-[#F9B038]"
            } disabled:opacity-60`}
          >
            <FiNavigation size={14} /> {nearbyLoading ? "Locating..." : nearbyEnabled ? "Hide Nearby" : "Find Near Me"}
          </button>
          <Link to="/addVendor">
            <button className="flex items-center gap-2 bg-[#F9B038] py-2 px-4 text-black rounded-md font-medium">
              <FiPlus size={14} /> Add Vendor
            </button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2 pl-9 pr-3 rounded-md placeholder-yellow-600 outline-none"
            placeholder="Search vendors..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Select
          allowClear
          placeholder="All Categories"
          style={{ minWidth: 160, height: 42 }}
          value={categoryFilter || undefined}
          onChange={val => setCategoryFilter(val || "")}
          className="custom-select"
        >
          {CATEGORIES.map(c => <Option key={c.value} value={c.value}>{c.label}</Option>)}
        </Select>
        <button
          onClick={() => setFavoritesOnly(p => !p)}
          className={`flex items-center gap-2 py-2 px-4 rounded-md border font-medium transition-colors ${
            favoritesOnly ? "bg-[#F9B038] text-black border-[#F9B038]" : "border-[#F9B038] text-[#F9B038]"
          }`}
        >
          <FiStar size={14} /> Favorites
        </button>
      </div>

      {loading && <div className="text-center py-10 text-[#F9B038]">Loading...</div>}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <FiMapPin size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg">No vendors found.</p>
          <p className="text-sm mt-1">Add your first vendor or find one nearby.</p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4">
        {filtered.map(vendor => (
          <div key={vendor.id} className="border border-gray-700 rounded-lg p-4 bg-gray-900 space-y-3 hover:border-[#F9B038] transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-[#F9B038] font-semibold text-lg truncate">{vendor.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColor[vendor.category] || "bg-gray-100 text-gray-700"}`}>
                  {categoryLabel(vendor.category)}
                </span>
              </div>
              <button onClick={() => toggleFavorite(vendor.id)} className="ml-2 mt-1">
                <FiStar
                  size={18}
                  className={vendor.isFavorite ? "fill-[#F9B038] text-[#F9B038]" : "text-gray-500"}
                />
              </button>
            </div>

            {vendor.address && (
              <div className="flex items-start gap-2 text-sm text-gray-400">
                <FiMapPin size={13} className="mt-0.5 shrink-0" />
                <span>{vendor.address}</span>
              </div>
            )}

            <div className="flex flex-wrap gap-3 text-sm text-gray-400">
              {vendor.phone && (
                <a href={`tel:${vendor.phone}`} className="flex items-center gap-1 hover:text-[#F9B038]">
                  <FiPhone size={12} /> {vendor.phone}
                </a>
              )}
              {vendor.website && (
                <a href={vendor.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-[#F9B038]">
                  <FiGlobe size={12} /> Website
                </a>
              )}
              {vendor.email && (
                <a href={`mailto:${vendor.email}`} className="flex items-center gap-1 hover:text-[#F9B038]">
                  <FiMail size={12} /> Email
                </a>
              )}
            </div>

            {vendor.notes && (
              <p className="text-sm text-gray-500 italic line-clamp-2">{vendor.notes}</p>
            )}

            {vendor.source === 'google' && (
              <span className="inline-block text-xs text-blue-400 border border-blue-400 px-2 py-0.5 rounded">Google</span>
            )}

            <div className="flex justify-end gap-2 pt-1 border-t border-gray-700">
              <button
                onClick={() => navigate(`/editVendor/${vendor.id}`)}
                className="flex items-center gap-1 text-xs text-[#F9B038] border border-[#F9B038] px-3 py-1.5 rounded hover:bg-[#F9B038] hover:text-black transition-colors"
              >
                <FiEdit2 size={11} /> Edit
              </button>
              <button
                onClick={() => setDeleteId(vendor.id)}
                className="flex items-center gap-1 text-xs text-red-400 border border-red-400 px-3 py-1.5 rounded hover:bg-red-400 hover:text-white transition-colors"
              >
                <FiTrash2 size={11} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {nearbyEnabled && unsavedNearby.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-[#F9B038] mb-3 flex items-center gap-2">
            <FiNavigation size={16} /> Nearby Service Providers
            <span className="text-sm font-normal text-gray-400">({unsavedNearby.length} found near you)</span>
          </h2>
          <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4">
            {unsavedNearby.map(place => (
              <div key={place.placeId} className="border border-gray-600 rounded-lg p-4 bg-gray-900 space-y-2 hover:border-[#F9B038] transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[#F9B038] font-semibold text-base truncate">{place.name}</h3>
                    <div className="flex gap-2 items-center mt-0.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColor[place.category] || "bg-gray-100 text-gray-700"}`}>
                        {categoryLabel(place.category)}
                      </span>
                      <span className="text-xs text-blue-400 border border-blue-400 px-1.5 py-0.5 rounded">Google</span>
                    </div>
                  </div>
                  {place.rating && (
                    <div className="flex items-center gap-1 text-yellow-400 text-xs ml-2">
                      <FiStar size={10} className="fill-current" />
                      <span>{place.rating}</span>
                    </div>
                  )}
                </div>
                {place.address && (
                  <div className="flex items-start gap-2 text-sm text-gray-400">
                    <FiMapPin size={12} className="mt-0.5 shrink-0" />
                    <span className="text-xs">{place.address}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-gray-500">{getDistanceMi(place)} mi away</span>
                  <button
                    onClick={() => saveNearbyVendor(place)}
                    disabled={savingPlaceId === place.placeId}
                    className="text-xs text-[#F9B038] border border-[#F9B038] px-3 py-1.5 rounded hover:bg-[#F9B038] hover:text-black transition-colors disabled:opacity-50"
                  >
                    {savingPlaceId === place.placeId ? "Saving..." : "+ Save"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal
        open={!!deleteId}
        title={<span className="text-red-500">Delete Vendor</span>}
        okText="Delete"
        okButtonProps={{ danger: true }}
        onOk={confirmDelete}
        onCancel={() => setDeleteId(null)}
      >
        <p>Are you sure you want to delete this vendor?</p>
      </Modal>
    </div>
  );
};

export default VendorList;
