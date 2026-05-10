import React from "react";
import { Form, Input, Select, message } from "antd";
import { useNavigate } from "react-router-dom";

const { Option } = Select;
const { TextArea } = Input;

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

const inputClass = "w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2 placeholder-yellow-600";

const AddVendor = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5002/api";
  const token = localStorage.getItem("accessToken");

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/vendors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (data.success) {
        message.success("Vendor added successfully!");
        navigate("/vendors");
      } else {
        message.error(data.message || "Failed to add vendor");
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
        <h1 className="text-2xl font-semibold text-[#F9B038]">Add Vendor</h1>
      </div>

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label={<span className="text-[#F9B038]">Vendor Name *</span>}
          name="name"
          rules={[{ required: true, message: "Vendor name is required" }]}
        >
          <Input className={inputClass} placeholder="e.g., Smith's RV Repair" />
        </Form.Item>

        <Form.Item
          label={<span className="text-[#F9B038]">Category *</span>}
          name="category"
          rules={[{ required: true, message: "Category is required" }]}
        >
          <Select placeholder="Select category" className="custom-select" style={{ height: 42 }}>
            {CATEGORIES.map(c => <Option key={c.value} value={c.value}>{c.label}</Option>)}
          </Select>
        </Form.Item>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item label={<span className="text-[#F9B038]">Phone</span>} name="phone">
            <Input className={inputClass} placeholder="(555) 123-4567" />
          </Form.Item>
          <Form.Item label={<span className="text-[#F9B038]">Email</span>} name="email">
            <Input className={inputClass} placeholder="contact@vendor.com" type="email" />
          </Form.Item>
        </div>

        <Form.Item label={<span className="text-[#F9B038]">Address</span>} name="address">
          <Input className={inputClass} placeholder="123 Main St, City, State" />
        </Form.Item>

        <Form.Item label={<span className="text-[#F9B038]">Website</span>} name="website">
          <Input className={inputClass} placeholder="https://example.com" />
        </Form.Item>

        <Form.Item label={<span className="text-[#F9B038]">Notes</span>} name="notes">
          <TextArea
            className="w-full bg-transparent border border-[#F9B038] text-[#F9B038]"
            rows={3}
            placeholder="Any notes about this vendor..."
          />
        </Form.Item>

        <Form.Item>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#F9B038] text-black font-semibold py-2 rounded-md hover:bg-yellow-500 transition-colors disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save Vendor"}
          </button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddVendor;
