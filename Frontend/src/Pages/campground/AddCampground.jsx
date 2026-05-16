import React, { useState } from "react";
import { Form, Input, DatePicker, Rate, Select, message, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import {
  EnvironmentOutlined,
  CalendarOutlined,
  StarOutlined,
  LinkOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import { FiCamera, FiX } from "react-icons/fi";
import { useGetCampQuery } from "../redux/api/routesApi";
import compressImage from "../../utils/compressImage";

const { TextArea } = Input;

const fieldLabel = (text) => (
  <span className="text-sm font-medium text-[#5A5A5A]">{text}</span>
);

const inputClass =
  "w-full rounded-lg border border-[#E0E0E0] bg-white px-3 py-2 text-[#1A1A1A] placeholder-gray-400 focus:border-[#3B7D3C] focus:ring-1 focus:ring-[#3B7D3C] transition-all duration-200";

const Card = ({ icon, title, children }) => (
  <div className="bg-white border border-[#E8F0E8] rounded-2xl p-6 mb-5 shadow-sm">
    <div className="flex items-center gap-2 mb-5 pb-4 border-b border-[#E8F0E8]">
      <div className="w-8 h-8 rounded-lg bg-[#E8F0E8] flex items-center justify-center">
        <span className="text-[#3B7D3C] text-sm">{icon}</span>
      </div>
      <h2 className="text-base font-semibold text-[#1A1A1A]">{title}</h2>
    </div>
    {children}
  </div>
);

const AddCampground = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [photos, setPhotos] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5002/api";
  const token = localStorage.getItem("accessToken");

  const { data: tripsData } = useGetCampQuery();
  const trips = tripsData?.data || [];

  const handlePhotoChange = async (e) => {
    const raw = Array.from(e.target.files || []);
    const compressed = await Promise.all(raw.map((f) => compressImage(f)));
    const merged = [...photos, ...compressed];
    setPhotos(merged);
    setPreviews(merged.map((f) => URL.createObjectURL(f)));
  };

  const removePhoto = (idx) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      if (values.location) formData.append("location", values.location);
      if (values.checkIn) formData.append("checkIn", values.checkIn.format("YYYY-MM-DD"));
      if (values.checkOut) formData.append("checkOut", values.checkOut.format("YYYY-MM-DD"));
      if (values.notes) formData.append("notes", values.notes);
      if (values.rating) formData.append("rating", String(values.rating));
      if (values.tripId) formData.append("tripId", values.tripId);
      photos.forEach((p) => formData.append("photos", p));

      const res = await fetch(`${BASE_URL}/campgrounds`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        message.success("Campground added!");
        navigate("/campgrounds");
      } else {
        message.error(data.message || "Failed to add campground");
      }
    } catch {
      message.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="max-w-site mx-auto px-4 lg:px-6 2xl:px-8 py-10">

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-8 bg-[#D4872D] rounded-full" />
            <h1 className="text-3xl font-bold text-[#1A1A1A]">Add Campground</h1>
          </div>
          <p className="text-[#5A5A5A] text-sm ml-4 pl-3">
            Log a campground from your travels.
          </p>
        </div>

        <div className="max-w-2xl">
          <Form form={form} layout="vertical" onFinish={handleSubmit}>

            {/* Basic Info */}
            <Card icon={<EnvironmentOutlined />} title="Campground Info">
              <div className="space-y-4">
                <Form.Item
                  label={fieldLabel("Campground Name")}
                  name="name"
                  className="mb-0"
                  rules={[{ required: true, message: "Name is required" }]}
                >
                  <Input
                    size="large"
                    className={inputClass}
                    placeholder="e.g. Yosemite Valley Campground"
                  />
                </Form.Item>
                <Form.Item
                  label={fieldLabel("Location / Address")}
                  name="location"
                  className="mb-0"
                >
                  <Input
                    size="large"
                    className={inputClass}
                    placeholder="City, State or full address"
                  />
                </Form.Item>
              </div>
            </Card>

            {/* Stay Dates */}
            <Card icon={<CalendarOutlined />} title="Stay Dates">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  label={fieldLabel("Check-In Date")}
                  name="checkIn"
                  className="mb-0"
                >
                  <DatePicker
                    size="large"
                    format="MM/DD/YYYY"
                    placeholder="MM/DD/YYYY"
                    className="w-full rounded-lg border-[#E0E0E0]"
                  />
                </Form.Item>
                <Form.Item
                  label={fieldLabel("Check-Out Date")}
                  name="checkOut"
                  className="mb-0"
                >
                  <DatePicker
                    size="large"
                    format="MM/DD/YYYY"
                    placeholder="MM/DD/YYYY"
                    className="w-full rounded-lg border-[#E0E0E0]"
                  />
                </Form.Item>
              </div>
            </Card>

            {/* Rating & Notes */}
            <Card icon={<StarOutlined />} title="Rating & Notes">
              <div className="space-y-4">
              <Form.Item
                label={fieldLabel("Rating")}
                name="rating"
                className="mb-0"
              >
                <Rate style={{ color: "#D4872D" }} />
              </Form.Item>
              <Form.Item
                label={fieldLabel("Notes")}
                name="notes"
                className="mb-0"
              >
                <Input.TextArea
                  rows={4}
                  placeholder="Hook-ups, pet-friendly, site number, highlights…"
                  className="w-full rounded-lg border border-[#E0E0E0] text-[#1A1A1A] placeholder-gray-400 focus:border-[#3B7D3C] resize-none"
                />
              </Form.Item>
              </div>
            </Card>

            {/* Link to Trip */}
            <Card icon={<LinkOutlined />} title="Link to Trip (optional)">
              <Form.Item
                label={fieldLabel("Trip")}
                name="tripId"
                className="mb-0"
              >
                <Select
                  size="large"
                  allowClear
                  placeholder="Select a trip to link this campground to"
                  className="w-full"
                  notFoundContent={
                    <span className="text-[#5A5A5A] text-sm">No trips found</span>
                  }
                >
                  {trips.map((t) => (
                    <Select.Option key={t.id} value={t.id}>
                      {t.tripName || t.name || `Trip — ${new Date(t.startDate || t.createdAt).toLocaleDateString()}`}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Card>

            {/* Photos */}
            <Card icon={<PictureOutlined />} title="Photos">
              <div className="flex flex-wrap gap-3">
                {previews.map((src, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={src}
                      alt=""
                      className="w-24 h-24 object-cover rounded-xl border border-[#E0E0E0]"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow"
                    >
                      <FiX size={10} />
                    </button>
                  </div>
                ))}
                <label className="w-24 h-24 border-2 border-dashed border-[#E0E0E0] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#3B7D3C] hover:bg-[#E8F0E8]/30 transition-all duration-200">
                  <FiCamera size={22} className="text-[#9E9E9E]" />
                  <span className="text-xs text-[#9E9E9E] mt-1">Add Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </label>
              </div>
              <p className="text-xs text-[#5A5A5A] mt-3">Up to 10 photos. Images are compressed automatically.</p>
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate("/campgrounds")}
                className="flex-1 py-3 rounded-xl border border-[#E0E0E0] text-[#5A5A5A] font-medium text-sm hover:border-[#3B7D3C] hover:text-[#3B7D3C] transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                  loading
                    ? "bg-[#3B7D3C]/70 text-white cursor-not-allowed"
                    : "bg-[#3B7D3C] text-white hover:bg-[#2d6130] shadow-sm hover:shadow-md"
                }`}
              >
                {loading ? <><Spin size="small" /><span>Saving…</span></> : "Save Campground"}
              </button>
            </div>

          </Form>
        </div>
      </div>
    </div>
  );
};

export default AddCampground;
