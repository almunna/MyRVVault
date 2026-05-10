import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { message, Modal } from "antd";
import { FiPlus, FiTrash2, FiCopy, FiCheckSquare } from "react-icons/fi";

const PackingLists = () => {
  const navigate = useNavigate();
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5002/api";
  const token = localStorage.getItem("accessToken");

  const fetchLists = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/packing-lists`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setLists(data.data || []);
    } catch {
      message.error("Failed to load packing lists");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLists(); }, []);

  const createFromTemplate = async (templateType) => {
    try {
      const res = await fetch(`${BASE_URL}/packing-lists`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: templateType === "pre_departure" ? "Pre-Departure Checklist" : "RV Setup Checklist",
          templateType
        }),
      });
      const data = await res.json();
      if (data.success) {
        message.success("List created from template!");
        setShowTemplates(false);
        fetchLists();
      } else {
        message.error(data.message || "Failed to create list");
      }
    } catch {
      message.error("Something went wrong");
    }
  };

  const duplicateList = async (id, e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BASE_URL}/packing-lists/${id}/duplicate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        message.success("List duplicated!");
        fetchLists();
      } else {
        message.error(data.message || "Failed to duplicate");
      }
    } catch {
      message.error("Something went wrong");
    }
  };

  const confirmDelete = async () => {
    try {
      await fetch(`${BASE_URL}/packing-lists/${deleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("Packing list deleted");
      setDeleteId(null);
      fetchLists();
    } catch {
      message.error("Failed to delete");
    }
  };

  const getProgress = (list) => {
    const items = list.items || [];
    if (items.length === 0) return { checked: 0, total: 0, pct: 0 };
    const checked = items.filter(i => i.checked).length;
    return { checked, total: items.length, pct: Math.round((checked / items.length) * 100) };
  };

  return (
    <div className="container m-auto py-8 px-3 lg:px-0">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
        <h1 className="text-3xl font-semibold text-[#F9B038]">Packing Lists</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowTemplates(true)}
            className="border border-[#F9B038] py-2 px-4 text-[#F9B038] rounded-md font-medium"
          >
            Use Template
          </button>
          <Link to="/addPackingList">
            <button className="flex items-center gap-2 bg-[#F9B038] py-2 px-4 text-black rounded-md font-medium">
              <FiPlus size={14} /> New List
            </button>
          </Link>
        </div>
      </div>

      {loading && <div className="text-center py-10 text-[#F9B038]">Loading...</div>}

      {!loading && lists.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <FiCheckSquare size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg">No packing lists yet.</p>
          <p className="text-sm mt-1">Create a list or use one of our pre-built templates.</p>
          <button
            onClick={() => setShowTemplates(true)}
            className="mt-4 border border-[#F9B038] text-[#F9B038] px-6 py-2 rounded-md"
          >
            Use Template
          </button>
        </div>
      )}

      <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4">
        {lists.map(list => {
          const { checked, total, pct } = getProgress(list);
          return (
            <Link key={list.id} to={`/packingListDetails/${list.id}`}>
              <div className="border border-gray-700 rounded-lg p-4 bg-gray-900 hover:border-[#F9B038] transition-colors h-full">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-[#F9B038] font-semibold text-base">{list.title}</h3>
                  {list.templateType && list.templateType !== "custom" && (
                    <span className="text-xs bg-yellow-900 text-yellow-300 px-2 py-0.5 rounded">Template</span>
                  )}
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>{checked}/{total} items</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div
                      className="bg-[#F9B038] h-1.5 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {list.items?.slice(0, 3).map(item => (
                  <div key={item.id} className="flex items-center gap-2 text-sm text-gray-400 mb-0.5">
                    <div className={`w-3 h-3 rounded-sm border ${item.checked ? "bg-[#F9B038] border-[#F9B038]" : "border-gray-500"}`} />
                    <span className={item.checked ? "line-through opacity-60" : ""}>{item.name}</span>
                  </div>
                ))}
                {(list.items?.length || 0) > 3 && (
                  <p className="text-xs text-gray-500 mt-1">+{list.items.length - 3} more items</p>
                )}

                <div className="flex justify-end gap-2 mt-3 pt-2 border-t border-gray-700">
                  <button
                    onClick={(e) => duplicateList(list.id, e)}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#F9B038] transition-colors"
                  >
                    <FiCopy size={11} /> Duplicate
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); setDeleteId(list.id); }}
                    className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    <FiTrash2 size={11} /> Delete
                  </button>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Templates Modal */}
      <Modal
        open={showTemplates}
        title={<span className="text-[#F9B038]">Choose a Template</span>}
        footer={null}
        onCancel={() => setShowTemplates(false)}
      >
        <div className="space-y-3 py-2">
          <div
            onClick={() => createFromTemplate("pre_departure")}
            className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-[#F9B038] hover:bg-yellow-50 transition-colors"
          >
            <h4 className="font-semibold text-gray-800 mb-1">Pre-Departure Checklist</h4>
            <p className="text-sm text-gray-500">16 items to check before leaving — safety, hookups, exterior.</p>
          </div>
          <div
            onClick={() => createFromTemplate("setup")}
            className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-[#F9B038] hover:bg-yellow-50 transition-colors"
          >
            <h4 className="font-semibold text-gray-800 mb-1">RV Setup Checklist</h4>
            <p className="text-sm text-gray-500">13 items to set up your RV when you arrive at a campsite.</p>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!deleteId}
        title={<span className="text-red-500">Delete Packing List</span>}
        okText="Delete"
        okButtonProps={{ danger: true }}
        onOk={confirmDelete}
        onCancel={() => setDeleteId(null)}
      >
        <p>Are you sure you want to delete this packing list?</p>
      </Modal>
    </div>
  );
};

export default PackingLists;
