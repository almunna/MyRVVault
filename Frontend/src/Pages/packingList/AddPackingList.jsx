import React, { useState } from "react";
import { Form, Input, message } from "antd";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiX } from "react-icons/fi";

const AddPackingList = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [items, setItems] = useState([{ name: "", quantity: 1, category: "general" }]);
  const [loading, setLoading] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5002/api";
  const token = localStorage.getItem("accessToken");

  const addItem = () => setItems(prev => [...prev, { name: "", quantity: 1, category: "general" }]);
  const removeItem = (idx) => setItems(prev => prev.filter((_, i) => i !== idx));
  const updateItem = (idx, field, val) => setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: val } : item));

  const handleSubmit = async (values) => {
    const validItems = items.filter(i => i.name.trim());
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/packing-lists`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: values.title, items: validItems }),
      });
      const data = await res.json();
      if (data.success) {
        message.success("Packing list created!");
        navigate(`/packingListDetails/${data.data.id}`);
      } else {
        message.error(data.message || "Failed to create list");
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
        <h1 className="text-2xl font-semibold text-[#F9B038]">New Packing List</h1>
      </div>

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label={<span className="text-[#F9B038]">List Title *</span>}
          name="title"
          rules={[{ required: true, message: "Title is required" }]}
        >
          <Input
            className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
            placeholder="e.g., Weekend Camping Trip"
          />
        </Form.Item>

        <div className="mb-4">
          <label className="text-[#F9B038] text-sm font-medium block mb-3">Items</label>
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={item.name}
                  onChange={e => updateItem(idx, "name", e.target.value)}
                  placeholder={`Item ${idx + 1}`}
                  className="flex-1 bg-transparent border border-gray-600 text-gray-200 px-3 py-2 rounded-md focus:border-[#F9B038] outline-none text-sm"
                />
                <input
                  type="number"
                  value={item.quantity}
                  onChange={e => updateItem(idx, "quantity", Number(e.target.value))}
                  min={1}
                  className="w-16 bg-transparent border border-gray-600 text-gray-200 px-2 py-2 rounded-md text-center text-sm outline-none focus:border-[#F9B038]"
                />
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  disabled={items.length === 1}
                  className="text-red-400 hover:text-red-300 disabled:opacity-30"
                >
                  <FiX size={16} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addItem}
            className="mt-3 flex items-center gap-2 text-sm text-[#F9B038] border border-[#F9B038] px-4 py-2 rounded-md hover:bg-[#F9B038] hover:text-black transition-colors"
          >
            <FiPlus size={14} /> Add Item
          </button>
        </div>

        <Form.Item>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#F9B038] text-black font-semibold py-2 rounded-md hover:bg-yellow-500 transition-colors disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Packing List"}
          </button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddPackingList;
