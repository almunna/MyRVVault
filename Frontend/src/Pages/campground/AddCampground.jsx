import React, { useState } from "react";
import { Form, Input, DatePicker, Rate, message } from "antd";
import { useNavigate } from "react-router-dom";
import { FiCamera, FiX } from "react-icons/fi";
import dayjs from "dayjs";
import compressImage from "../../utils/compressImage";

const { TextArea } = Input;

const AddCampground = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [photos, setPhotos] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5002/api";
  const token = localStorage.getItem("accessToken");

  const handlePhotoChange = async (e) => {
    const raw = Array.from(e.target.files || []);
    const compressed = await Promise.all(raw.map(f => compressImage(f)));
    const newPhotos = [...photos, ...compressed];
    setPhotos(newPhotos);
    setPreviews(newPhotos.map(f => URL.createObjectURL(f)));
  };

  const removePhoto = (idx) => {
    setPhotos(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => prev.filter((_, i) => i !== idx));
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
      photos.forEach(p => formData.append("photos", p));

      const res = await fetch(`${BASE_URL}/campgrounds`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        message.success("Campground added successfully!");
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
    <div className="container m-auto py-8 px-3 lg:px-0 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="text-[#F9B038] hover:underline text-sm">← Back</button>
        <h1 className="text-2xl font-semibold text-[#F9B038]">Add Campground</h1>
      </div>

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label={<span className="text-[#F9B038]">Campground Name *</span>}
          name="name"
          rules={[{ required: true, message: "Name is required" }]}
        >
          <Input
            className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
            placeholder="e.g., Yosemite Valley Campground"
          />
        </Form.Item>

        <Form.Item label={<span className="text-[#F9B038]">Location / Address</span>} name="location">
          <Input
            className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
            placeholder="City, State or full address"
          />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item label={<span className="text-[#F9B038]">Check-In Date</span>} name="checkIn">
            <DatePicker
              className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
              format="MM/DD/YYYY"
              placeholder="Check-in"
            />
          </Form.Item>
          <Form.Item label={<span className="text-[#F9B038]">Check-Out Date</span>} name="checkOut">
            <DatePicker
              className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
              format="MM/DD/YYYY"
              placeholder="Check-out"
            />
          </Form.Item>
        </div>

        <Form.Item label={<span className="text-[#F9B038]">Rating</span>} name="rating">
          <Rate className="text-[#F9B038]" />
        </Form.Item>

        <Form.Item label={<span className="text-[#F9B038]">Notes</span>} name="notes">
          <TextArea
            className="w-full bg-transparent border border-[#F9B038] text-[#F9B038]"
            rows={3}
            placeholder="Hook-ups available, pet-friendly, site #, highlights..."
          />
        </Form.Item>

        <Form.Item label={<span className="text-[#F9B038]">Link to Trip ID (optional)</span>} name="tripId">
          <Input
            className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
            placeholder="Trip ID"
          />
        </Form.Item>

        {/* Photo Upload */}
        <div className="mb-6">
          <label className="block text-[#F9B038] text-sm font-medium mb-2">Photos</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {previews.map((src, idx) => (
              <div key={idx} className="relative">
                <img src={src} alt="" className="w-20 h-20 object-cover rounded-lg border border-gray-600" />
                <button
                  type="button"
                  onClick={() => removePhoto(idx)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center"
                >
                  <FiX size={8} />
                </button>
              </div>
            ))}
            <label className="w-20 h-20 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#F9B038] transition-colors">
              <FiCamera size={20} className="text-gray-400" />
              <span className="text-xs text-gray-400 mt-1">Add</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoChange}
              />
            </label>
          </div>
        </div>

        <Form.Item>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#F9B038] text-black font-semibold py-2 rounded-md hover:bg-yellow-500 transition-colors disabled:opacity-60"
          >
            {loading ? "Saving..." : "Add Campground"}
          </button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddCampground;
