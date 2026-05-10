import React, { useState } from "react";
import { Form, Input, Select, message, Upload } from "antd";
import { useNavigate } from "react-router-dom";
import { FiUpload, FiFile, FiX } from "react-icons/fi";
import compressImage from "../../utils/compressImage";

const { Option } = Select;
const { TextArea } = Input;
const { Dragger } = Upload;

const CATEGORIES = [
  { value: "warranty", label: "Warranty" },
  { value: "insurance", label: "Insurance" },
  { value: "registration", label: "Registration" },
  { value: "receipt", label: "Receipt" },
  { value: "manual", label: "Manual" },
  { value: "photo", label: "Photo" },
  { value: "other", label: "Other" },
];

const LINK_TYPES = [
  { value: "general", label: "General" },
  { value: "rv", label: "RV" },
  { value: "component", label: "Component / Appliance" },
  { value: "repair_order", label: "Repair Order" },
  { value: "maintenance", label: "Maintenance" },
];

const UploadDocument = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5002/api";
  const token = localStorage.getItem("accessToken");

  const handleFileChange = async (info) => {
    const raw = info.fileList.map(f => f.originFileObj).filter(Boolean);
    const processed = await Promise.all(raw.map(f => compressImage(f)));
    setFiles(processed);
  };

  const handleSubmit = async (values) => {
    if (files.length === 0) {
      message.error("Please select at least one file");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", values.title || "");
      formData.append("category", values.category || "other");
      if (values.notes) formData.append("notes", values.notes);
      if (values.linkedToType) formData.append("linkedToType", values.linkedToType);
      if (values.linkedToId) formData.append("linkedToId", values.linkedToId);
      files.forEach(file => formData.append("files", file));

      const res = await fetch(`${BASE_URL}/documents`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        message.success("Document uploaded successfully!");
        navigate("/documents");
      } else {
        message.error(data.message || "Upload failed");
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
        <h1 className="text-2xl font-semibold text-[#F9B038]">Upload Document</h1>
      </div>

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        {/* File Upload Area */}
        <div className="mb-6 border-2 border-dashed border-[#F9B038] rounded-lg p-6">
          <Dragger
            multiple
            accept="image/*,.pdf"
            beforeUpload={() => false}
            onChange={handleFileChange}
            fileList={files.map((f, i) => ({ uid: i, name: f.name, status: "done", originFileObj: f }))}
            className="bg-transparent"
          >
            <div className="text-center py-4">
              <FiUpload size={32} className="mx-auto mb-2 text-[#F9B038]" />
              <p className="text-[#F9B038] font-medium">Click or drag files to upload</p>
              <p className="text-gray-400 text-sm mt-1">Supports: JPG, PNG, PDF (up to 50MB each)</p>
            </div>
          </Dragger>
        </div>

        <Form.Item label={<span className="text-[#F9B038]">Document Title</span>} name="title">
          <Input
            className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
            placeholder="e.g., Refrigerator Warranty 2024"
          />
        </Form.Item>

        <Form.Item
          label={<span className="text-[#F9B038]">Category *</span>}
          name="category"
          rules={[{ required: true, message: "Please select a category" }]}
        >
          <Select placeholder="Select category" className="custom-select" style={{ height: 42 }}>
            {CATEGORIES.map(c => <Option key={c.value} value={c.value}>{c.label}</Option>)}
          </Select>
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item label={<span className="text-[#F9B038]">Link To</span>} name="linkedToType">
            <Select allowClear placeholder="None" className="custom-select" style={{ height: 42 }}>
              {LINK_TYPES.map(t => <Option key={t.value} value={t.value}>{t.label}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item label={<span className="text-[#F9B038]">Linked ID</span>} name="linkedToId">
            <Input
              className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
              placeholder="ID of linked item"
            />
          </Form.Item>
        </div>

        <Form.Item label={<span className="text-[#F9B038]">Notes</span>} name="notes">
          <TextArea
            className="w-full bg-transparent border border-[#F9B038] text-[#F9B038]"
            rows={3}
            placeholder="Additional notes about this document..."
          />
        </Form.Item>

        <Form.Item>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#F9B038] text-black font-semibold py-2 rounded-md hover:bg-yellow-500 transition-colors disabled:opacity-60"
          >
            {loading ? "Uploading..." : "Upload Document"}
          </button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default UploadDocument;
