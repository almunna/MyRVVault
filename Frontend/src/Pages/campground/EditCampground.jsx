import React, { useState, useEffect } from "react";
import { Form, Input, DatePicker, Rate, message } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { FiCamera, FiX, FiTrash2 } from "react-icons/fi";
import dayjs from "dayjs";

const { TextArea } = Input;

const EditCampground = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [photos, setPhotos] = useState([]);
  const [newPhotos, setNewPhotos] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5002/api";
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch(`${BASE_URL}/campgrounds/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          const cg = data.data;
          setPhotos(cg.photos || []);
          form.setFieldsValue({
            name: cg.name,
            location: cg.location,
            checkIn: cg.checkIn ? dayjs(cg.checkIn) : null,
            checkOut: cg.checkOut ? dayjs(cg.checkOut) : null,
            notes: cg.notes,
            rating: cg.rating,
            tripId: cg.tripId,
          });
        }
      } catch {
        message.error("Failed to load campground");
      } finally {
        setFetching(false);
      }
    };
    fetch_();
  }, [id]);

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files || []);
    setNewPhotos(prev => [...prev, ...files]);
    setNewPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };

  const removeExistingPhoto = async (filename) => {
    try {
      await fetch(`${BASE_URL}/campgrounds/${id}/photo`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ filename }),
      });
      setPhotos(prev => prev.filter(p => p.filename !== filename));
      message.success("Photo removed");
    } catch {
      message.error("Failed to remove photo");
    }
  };

  const removeNewPhoto = (idx) => {
    setNewPhotos(prev => prev.filter((_, i) => i !== idx));
    setNewPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();
      if (values.name) formData.append("name", values.name);
      if (values.location) formData.append("location", values.location);
      if (values.checkIn) formData.append("checkIn", values.checkIn.format("YYYY-MM-DD"));
      if (values.checkOut) formData.append("checkOut", values.checkOut.format("YYYY-MM-DD"));
      if (values.notes !== undefined) formData.append("notes", values.notes || "");
      if (values.rating) formData.append("rating", String(values.rating));
      if (values.tripId !== undefined) formData.append("tripId", values.tripId || "");
      newPhotos.forEach(p => formData.append("photos", p));

      const res = await fetch(`${BASE_URL}/campgrounds/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        message.success("Campground updated!");
        navigate("/campgrounds");
      } else {
        message.error(data.message || "Failed to update");
      }
    } catch {
      message.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="text-center py-10 text-[#F9B038]">Loading...</div>;

  return (
    <div className="container m-auto py-8 px-3 lg:px-0 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="text-[#F9B038] hover:underline text-sm">← Back</button>
        <h1 className="text-2xl font-semibold text-[#F9B038]">Edit Campground</h1>
      </div>

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label={<span className="text-[#F9B038]">Campground Name *</span>}
          name="name"
          rules={[{ required: true, message: "Name is required" }]}
        >
          <Input className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2" />
        </Form.Item>

        <Form.Item label={<span className="text-[#F9B038]">Location</span>} name="location">
          <Input className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2" />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item label={<span className="text-[#F9B038]">Check-In</span>} name="checkIn">
            <DatePicker className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2" format="MM/DD/YYYY" />
          </Form.Item>
          <Form.Item label={<span className="text-[#F9B038]">Check-Out</span>} name="checkOut">
            <DatePicker className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2" format="MM/DD/YYYY" />
          </Form.Item>
        </div>

        <Form.Item label={<span className="text-[#F9B038]">Rating</span>} name="rating">
          <Rate className="text-[#F9B038]" />
        </Form.Item>

        <Form.Item label={<span className="text-[#F9B038]">Notes</span>} name="notes">
          <TextArea className="w-full bg-transparent border border-[#F9B038] text-[#F9B038]" rows={3} />
        </Form.Item>

        <Form.Item label={<span className="text-[#F9B038]">Trip ID</span>} name="tripId">
          <Input className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2" placeholder="Linked trip ID" />
        </Form.Item>

        {/* Existing Photos */}
        {photos.length > 0 && (
          <div className="mb-4">
            <label className="block text-[#F9B038] text-sm font-medium mb-2">Existing Photos</label>
            <div className="flex flex-wrap gap-2">
              {photos.map(p => (
                <div key={p.filename} className="relative">
                  <img src={p.url} alt="" className="w-20 h-20 object-cover rounded-lg border border-gray-600" />
                  <button
                    type="button"
                    onClick={() => removeExistingPhoto(p.filename)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center"
                  >
                    <FiX size={8} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Photos */}
        <div className="mb-6">
          <label className="block text-[#F9B038] text-sm font-medium mb-2">Add More Photos</label>
          <div className="flex flex-wrap gap-2">
            {newPreviews.map((src, idx) => (
              <div key={idx} className="relative">
                <img src={src} alt="" className="w-20 h-20 object-cover rounded-lg border border-gray-600" />
                <button type="button" onClick={() => removeNewPhoto(idx)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                  <FiX size={8} />
                </button>
              </div>
            ))}
            <label className="w-20 h-20 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#F9B038] transition-colors">
              <FiCamera size={20} className="text-gray-400" />
              <span className="text-xs text-gray-400 mt-1">Add</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoChange} />
            </label>
          </div>
        </div>

        <Form.Item>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#F9B038] text-black font-semibold py-2 rounded-md hover:bg-yellow-500 transition-colors disabled:opacity-60"
          >
            {loading ? "Saving..." : "Update Campground"}
          </button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default EditCampground;
