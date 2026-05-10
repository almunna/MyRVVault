import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { message, Modal, Input } from "antd";
import { FiPlus, FiTrash2, FiRotateCcw, FiEdit2, FiCheck } from "react-icons/fi";

const PackingListDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newItemName, setNewItemName] = useState("");
  const [addingItem, setAddingItem] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5002/api";
  const token = localStorage.getItem("accessToken");

  const fetchList = async () => {
    try {
      const res = await fetch(`${BASE_URL}/packing-lists/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setList(data.data);
        setTitleInput(data.data.title);
      }
    } catch {
      message.error("Failed to load packing list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchList(); }, [id]);

  const patchList = async (body) => {
    const res = await fetch(`${BASE_URL}/packing-lists/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.success) setList(data.data);
    else message.error(data.message || "Update failed");
    return data;
  };

  const toggleItem = async (itemId, current) => {
    await patchList({
      itemOperations: [{ action: "update", itemId, updates: { checked: !current } }]
    });
  };

  const addItem = async () => {
    if (!newItemName.trim()) return;
    setAddingItem(true);
    try {
      await patchList({
        itemOperations: [{ action: "add", items: [{ name: newItemName.trim(), quantity: 1 }] }]
      });
      setNewItemName("");
    } finally {
      setAddingItem(false);
    }
  };

  const removeItem = async (itemId) => {
    await patchList({ itemOperations: [{ action: "remove", itemId }] });
  };

  const updateTitle = async () => {
    if (!titleInput.trim()) return;
    await patchList({ title: titleInput.trim() });
    setEditingTitle(false);
  };

  const resetAll = async () => {
    try {
      const res = await fetch(`${BASE_URL}/packing-lists/${id}/uncheck-all`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) { setList(data.data); message.success("All items reset!"); }
      else message.error("Failed to reset");
    } catch {
      message.error("Something went wrong");
    } finally {
      setShowResetConfirm(false);
    }
  };

  if (loading) return <div className="text-center py-10 text-[#F9B038]">Loading...</div>;
  if (!list) return <div className="text-center py-10 text-red-500">List not found</div>;

  const items = list.items || [];
  const checked = items.filter(i => i.checked).length;
  const pct = items.length > 0 ? Math.round((checked / items.length) * 100) : 0;

  return (
    <div className="container m-auto py-8 px-3 lg:px-0 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="text-[#F9B038] hover:underline text-sm">← Back</button>
        {editingTitle ? (
          <div className="flex items-center gap-2 flex-1">
            <Input
              value={titleInput}
              onChange={e => setTitleInput(e.target.value)}
              onPressEnter={updateTitle}
              className="flex-1"
              autoFocus
            />
            <button onClick={updateTitle} className="text-[#F9B038]"><FiCheck size={18} /></button>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-1">
            <h1 className="text-2xl font-semibold text-[#F9B038]">{list.title}</h1>
            <button onClick={() => setEditingTitle(true)} className="text-gray-400 hover:text-[#F9B038]">
              <FiEdit2 size={14} />
            </button>
          </div>
        )}
        <button
          onClick={() => setShowResetConfirm(true)}
          className="flex items-center gap-1 text-sm text-gray-400 border border-gray-600 px-3 py-1.5 rounded hover:border-[#F9B038] hover:text-[#F9B038] transition-colors"
        >
          <FiRotateCcw size={12} /> Reset
        </button>
      </div>

      {/* Progress */}
      <div className="mb-6 bg-gray-900 rounded-lg p-4 border border-gray-700">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">{checked} of {items.length} items packed</span>
          <span className="text-[#F9B038] font-semibold">{pct}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-[#F9B038] h-2 rounded-full transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        {pct === 100 && (
          <p className="text-green-400 text-sm mt-2 text-center font-medium">All packed! You're ready to go!</p>
        )}
      </div>

      {/* Items */}
      <div className="space-y-2 mb-6">
        {items.map(item => (
          <div
            key={item.id}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
              item.checked ? "border-[#F9B038] bg-yellow-900/10" : "border-gray-700 bg-gray-900"
            }`}
          >
            <button
              onClick={() => toggleItem(item.id, item.checked)}
              className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors shrink-0 ${
                item.checked ? "bg-[#F9B038] border-[#F9B038]" : "border-gray-500"
              }`}
            >
              {item.checked && <FiCheck size={11} className="text-black" />}
            </button>
            <span className={`flex-1 text-sm ${item.checked ? "line-through text-gray-500" : "text-gray-200"}`}>
              {item.name}
              {item.quantity > 1 && <span className="text-gray-400 ml-1">×{item.quantity}</span>}
            </span>
            <button
              onClick={() => removeItem(item.id)}
              className="text-red-400 hover:text-red-300 opacity-50 hover:opacity-100 transition-opacity"
            >
              <FiTrash2 size={13} />
            </button>
          </div>
        ))}
      </div>

      {/* Add Item */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newItemName}
          onChange={e => setNewItemName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addItem()}
          placeholder="Add an item..."
          className="flex-1 bg-transparent border border-gray-600 text-gray-200 px-3 py-2 rounded-md focus:border-[#F9B038] outline-none text-sm"
        />
        <button
          onClick={addItem}
          disabled={addingItem || !newItemName.trim()}
          className="flex items-center gap-1 bg-[#F9B038] text-black px-4 py-2 rounded-md font-medium disabled:opacity-50 hover:bg-yellow-500 transition-colors"
        >
          <FiPlus size={14} /> Add
        </button>
      </div>

      <Modal
        open={showResetConfirm}
        title="Reset Packing List"
        okText="Reset All"
        onOk={resetAll}
        onCancel={() => setShowResetConfirm(false)}
      >
        <p>Uncheck all items in this list? Use this to reuse the list for a new trip.</p>
      </Modal>
    </div>
  );
};

export default PackingListDetails;
