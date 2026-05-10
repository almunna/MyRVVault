import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { message, Modal, Select, Tag } from "antd";
import { FiUpload, FiFile, FiImage, FiTrash2, FiEye, FiFilter } from "react-icons/fi";

const { Option } = Select;

const CATEGORIES = [
  { value: "warranty", label: "Warranty", color: "blue" },
  { value: "insurance", label: "Insurance", color: "green" },
  { value: "registration", label: "Registration", color: "purple" },
  { value: "receipt", label: "Receipt", color: "orange" },
  { value: "manual", label: "Manual", color: "cyan" },
  { value: "photo", label: "Photo", color: "magenta" },
  { value: "other", label: "Other", color: "default" },
];

const categoryColor = { warranty: "blue", insurance: "green", registration: "purple", receipt: "orange", manual: "cyan", photo: "magenta", other: "default" };

const DocumentVault = () => {
  const navigate = useNavigate();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5002/api";
  const token = localStorage.getItem("accessToken");

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryFilter) params.set("category", categoryFilter);
      const res = await fetch(`${BASE_URL}/documents?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setDocs(data.data || []);
    } catch {
      message.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocs(); }, [categoryFilter]);

  const confirmDelete = async () => {
    try {
      await fetch(`${BASE_URL}/documents/${deleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("Document deleted");
      setDeleteId(null);
      fetchDocs();
    } catch {
      message.error("Failed to delete document");
    }
  };

  const getFileIcon = (doc) => {
    const types = doc.files?.map(f => f.fileType) || [];
    if (types.includes("pdf")) return <FiFile size={32} className="text-red-400" />;
    if (types.includes("image")) return <FiImage size={32} className="text-blue-400" />;
    return <FiFile size={32} className="text-gray-400" />;
  };

  const formatDate = (ts) => {
    if (!ts) return "";
    try { return new Date(ts).toLocaleDateString(); } catch { return ""; }
  };

  return (
    <div className="container m-auto py-8 px-3 lg:px-0">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
        <h1 className="text-3xl font-semibold text-[#F9B038]">Document Vault</h1>
        <Link to="/uploadDocument">
          <button className="flex items-center gap-2 bg-[#F9B038] py-2 px-4 text-black rounded-md font-medium">
            <FiUpload size={14} /> Upload Document
          </button>
        </Link>
      </div>

      <div className="flex gap-3 mb-6">
        <Select
          allowClear
          placeholder="All Categories"
          style={{ minWidth: 180, height: 42 }}
          value={categoryFilter || undefined}
          onChange={val => setCategoryFilter(val || "")}
          className="custom-select"
        >
          {CATEGORIES.map(c => <Option key={c.value} value={c.value}>{c.label}</Option>)}
        </Select>
      </div>

      {loading && <div className="text-center py-10 text-[#F9B038]">Loading...</div>}

      {!loading && docs.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <FiFile size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg">No documents yet.</p>
          <p className="text-sm mt-1">Upload warranties, insurance cards, receipts, and more.</p>
        </div>
      )}

      <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4">
        {docs.map(doc => (
          <div key={doc.id} className="border border-gray-700 rounded-lg p-4 bg-gray-900 hover:border-[#F9B038] transition-colors">
            <div className="flex items-start justify-between mb-3">
              {getFileIcon(doc)}
              <Tag color={categoryColor[doc.category] || "default"} className="text-xs">
                {CATEGORIES.find(c => c.value === doc.category)?.label || doc.category}
              </Tag>
            </div>

            <h3 className="text-[#F9B038] font-medium text-sm mb-1 truncate">{doc.title}</h3>

            {doc.files?.length > 0 && (
              <p className="text-gray-500 text-xs mb-1">{doc.files.length} file{doc.files.length > 1 ? "s" : ""}</p>
            )}

            {doc.notes && (
              <p className="text-gray-500 text-xs italic line-clamp-2 mb-2">{doc.notes}</p>
            )}

            <p className="text-gray-600 text-xs mb-3">{formatDate(doc.createdAt)}</p>

            {/* Thumbnails */}
            {doc.files?.filter(f => f.fileType === "image").length > 0 && (
              <div className="flex gap-1 mb-3 overflow-hidden">
                {doc.files.filter(f => f.fileType === "image").slice(0, 3).map((f, i) => (
                  <img key={i} src={f.url} alt="" className="w-12 h-12 object-cover rounded border border-gray-600" />
                ))}
              </div>
            )}

            <div className="flex gap-2">
              {doc.files?.[0]?.url && (
                <a
                  href={doc.files[0].url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs text-[#F9B038] border border-[#F9B038] px-2 py-1 rounded hover:bg-[#F9B038] hover:text-black transition-colors"
                >
                  <FiEye size={10} /> View
                </a>
              )}
              <button
                onClick={() => setDeleteId(doc.id)}
                className="flex items-center gap-1 text-xs text-red-400 border border-red-400 px-2 py-1 rounded hover:bg-red-400 hover:text-white transition-colors"
              >
                <FiTrash2 size={10} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={!!deleteId}
        title={<span className="text-red-500">Delete Document</span>}
        okText="Delete"
        okButtonProps={{ danger: true }}
        onOk={confirmDelete}
        onCancel={() => setDeleteId(null)}
      >
        <p>This will permanently delete the document and all its files. Continue?</p>
      </Modal>
    </div>
  );
};

export default DocumentVault;
