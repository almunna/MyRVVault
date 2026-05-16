import { Checkbox, Input, message, Modal } from "antd";
import React, { useEffect, useState } from "react";
import { RiDeleteBinLine } from "react-icons/ri";
import { FiCopy, FiRotateCcw, FiEdit2, FiCheck, FiX, FiTrash2, FiArrowUp, FiArrowDown } from "react-icons/fi";
import { CheckSquareOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import {
  useDeleteCheckListMutation,
  useGetSingleCheckListQuery,
  useUpdateCheckListMutation,
  useUncheckAllChecklistMutation,
  useDuplicateChecklistMutation,
} from "../redux/api/routesApi";

const ChecklistDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newItemValue, setNewItemValue] = useState("");
  const [addingItem, setAddingItem] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState("");

  const { data: singleChecklistData, isLoading, isError, refetch } = useGetSingleCheckListQuery({ id });
  const [updateChecklist] = useUpdateCheckListMutation();
  const [deleteChecklist] = useDeleteCheckListMutation();
  const [uncheckAll] = useUncheckAllChecklistMutation();
  const [duplicateChecklist] = useDuplicateChecklistMutation();

  useEffect(() => {
    if (singleChecklistData?.data?.title) {
      setTitleValue(singleChecklistData.data.title);
    }
  }, [singleChecklistData]);

  if (isLoading) return (
    <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
      <p className="text-[#5A5A5A]">Loading…</p>
    </div>
  );
  if (isError || !singleChecklistData?.data) return (
    <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
      <p className="text-red-500">Checklist not found.</p>
    </div>
  );

  const checklist = singleChecklistData.data;
  const items = checklist.items || [];
  const checkedCount = items.filter((i) => i.status).length;
  const pct = items.length > 0 ? Math.round((checkedCount / items.length) * 100) : 0;

  const handleStatusChange = async (itemId, checked, itemName) => {
    try {
      await updateChecklist({
        id,
        data: { itemOperations: [{ action: "update", itemId, updates: { name: itemName, status: checked } }] },
      }).unwrap();
      refetch();
    } catch {
      message.error("Failed to update item");
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await updateChecklist({
        id,
        data: { itemOperations: [{ action: "remove", itemId }] },
      }).unwrap();
      message.success("Item removed");
      refetch();
    } catch {
      message.error("Failed to remove item");
    }
  };

  const handleMoveItem = async (index, direction) => {
    const newItems = [...items];
    const swapIdx = direction === "up" ? index - 1 : index + 1;
    if (swapIdx < 0 || swapIdx >= newItems.length) return;
    [newItems[index], newItems[swapIdx]] = [newItems[swapIdx], newItems[index]];
    try {
      await updateChecklist({
        id,
        data: { itemOperations: [{ action: "reorder", itemIds: newItems.map((i) => i.id) }] },
      }).unwrap();
      refetch();
    } catch {
      message.error("Failed to reorder items");
    }
  };

  const handleSaveTitle = async () => {
    if (!titleValue.trim()) return;
    try {
      await updateChecklist({ id, data: { title: titleValue.trim() } }).unwrap();
      message.success("Title updated");
      setEditingTitle(false);
      refetch();
    } catch {
      message.error("Failed to update title");
    }
  };

  const handleCancelEdit = () => {
    setEditingTitle(false);
    setTitleValue(checklist.title);
  };

  const handleAddItem = async () => {
    const name = newItemValue.trim();
    if (!name) return;
    setAddingItem(true);
    try {
      await updateChecklist({
        id,
        data: { itemOperations: [{ action: "add", items: [{ name }] }] },
      }).unwrap();
      setNewItemValue("");
      refetch();
    } catch {
      message.error("Failed to add item");
    } finally {
      setAddingItem(false);
    }
  };

  const handleReset = async () => {
    try {
      await uncheckAll(id).unwrap();
      message.success("All items reset!");
      refetch();
    } catch {
      message.error("Failed to reset");
    } finally {
      setShowResetConfirm(false);
    }
  };

  const handleComplete = async () => {
    try {
      await uncheckAll(id).unwrap();
      navigate("/checklist");
    } catch {
      message.error("Something went wrong");
    }
  };

  const handleDuplicate = async () => {
    try {
      const result = await duplicateChecklist(id).unwrap();
      message.success("Checklist duplicated!");
      navigate(`/checklistDetails/${result.data.id}`);
    } catch {
      message.error("Failed to duplicate");
    }
  };

  const handleDeleteChecklist = async () => {
    try {
      await deleteChecklist(id).unwrap();
      message.success("Checklist deleted");
      navigate("/checklist");
    } catch {
      message.error("Failed to delete checklist");
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="max-w-site mx-auto px-4 lg:px-6 2xl:px-8 py-10">

        {/* Page Header */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-1 h-8 bg-[#D4872D] rounded-full flex-shrink-0" />
              {editingTitle ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    value={titleValue}
                    onChange={(e) => setTitleValue(e.target.value)}
                    onPressEnter={handleSaveTitle}
                    className="text-2xl font-bold border-[#3B7D3C] focus:border-[#3B7D3C]"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveTitle}
                    className="text-[#3B7D3C] hover:text-[#2d6130] flex-shrink-0"
                    title="Save"
                  >
                    <FiCheck size={20} />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="text-[#5A5A5A] hover:text-red-500 flex-shrink-0"
                    title="Cancel"
                  >
                    <FiX size={20} />
                  </button>
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-bold text-[#1A1A1A] truncate">{checklist.title}</h1>
                  <button
                    onClick={() => setEditingTitle(true)}
                    className="text-[#9E9E9E] hover:text-[#3B7D3C] transition flex-shrink-0"
                    title="Edit title"
                  >
                    <FiEdit2 size={18} />
                  </button>
                </>
              )}
            </div>
            {checklist.templateType && checklist.templateType !== "custom" && (
              <p className="text-[#5A5A5A] text-sm ml-4 pl-3">Pre-built template</p>
            )}
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleDuplicate}
              className="flex items-center gap-1.5 py-2 px-3 rounded-xl border border-[#E0E0E0] text-[#5A5A5A] text-sm font-medium hover:border-[#3B7D3C] hover:text-[#3B7D3C] transition-all duration-200"
            >
              <FiCopy size={13} /> Duplicate
            </button>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1.5 py-2 px-3 rounded-xl border border-[#E0E0E0] text-[#5A5A5A] text-sm font-medium hover:border-[#D4872D] hover:text-[#D4872D] transition-all duration-200"
            >
              <FiRotateCcw size={13} /> Reset
            </button>
            <button
              onClick={() => navigate(`/addItems/${id}`)}
              className="py-2 px-3 rounded-xl bg-[#3B7D3C] text-white text-sm font-medium hover:bg-[#2d6130] shadow-sm hover:shadow-md transition-all duration-200"
            >
              + Add Item
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-1.5 py-2 px-3 rounded-xl border border-red-300 text-red-500 text-sm font-medium hover:bg-red-50 transition-all duration-200"
            >
              <FiTrash2 size={13} /> Delete
            </button>
          </div>
        </div>

        <div className="max-w-3xl">
          {/* Progress Card */}
          <div className="bg-white border border-[#E8F0E8] rounded-2xl p-5 mb-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#E8F0E8]">
              <div className="w-8 h-8 rounded-lg bg-[#E8F0E8] flex items-center justify-center">
                <CheckSquareOutlined className="text-[#3B7D3C] text-sm" />
              </div>
              <h2 className="text-base font-semibold text-[#1A1A1A]">Progress</h2>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[#5A5A5A]">{checkedCount} of {items.length} items completed</span>
              <span className="font-semibold text-[#3B7D3C]">{pct}%</span>
            </div>
            <div className="w-full bg-[#E8F0E8] rounded-full h-2">
              <div
                className="bg-[#3B7D3C] h-2 rounded-full transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* Items Card */}
          <div className="bg-white border border-[#E8F0E8] rounded-2xl p-6 mb-5 shadow-sm">
            <div className="space-y-1">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className={`flex justify-between items-center py-3 border-b border-[#F0F0F0] last:border-0 transition-opacity ${item.status ? "opacity-60" : ""}`}
                >
                  <Checkbox
                    className="flex-1"
                    checked={item.status}
                    onChange={(e) => handleStatusChange(item.id, e.target.checked, item.name)}
                  >
                    <span className={`text-sm ${item.status ? "line-through text-[#9E9E9E]" : "text-[#1A1A1A]"}`}>
                      {item.name}
                    </span>
                  </Checkbox>

                  <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                    <button
                      onClick={() => handleMoveItem(index, "up")}
                      disabled={index === 0}
                      className="text-[#9E9E9E] hover:text-[#3B7D3C] disabled:opacity-25 disabled:cursor-not-allowed transition"
                      title="Move up"
                    >
                      <FiArrowUp size={14} />
                    </button>
                    <button
                      onClick={() => handleMoveItem(index, "down")}
                      disabled={index === items.length - 1}
                      className="text-[#9E9E9E] hover:text-[#3B7D3C] disabled:opacity-25 disabled:cursor-not-allowed transition"
                      title="Move down"
                    >
                      <FiArrowDown size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-[#9E9E9E] hover:text-red-500 transition"
                      title="Remove item"
                    >
                      <RiDeleteBinLine size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {items.length === 0 && (
                <p className="text-center text-[#9E9E9E] py-6 text-sm">
                  No items yet. Add your first item below.
                </p>
              )}

              {/* Inline add item */}
              <div className="flex items-center gap-2 pt-4 mt-2 border-t border-[#F0F0F0]">
                <Input
                  size="large"
                  value={newItemValue}
                  onChange={(e) => setNewItemValue(e.target.value)}
                  onPressEnter={handleAddItem}
                  placeholder="Add a new item and press Enter…"
                  className="flex-1 rounded-lg border border-[#E0E0E0] bg-white text-[#1A1A1A] placeholder-gray-400 focus:border-[#3B7D3C]"
                  disabled={addingItem}
                />
                <button
                  onClick={handleAddItem}
                  disabled={!newItemValue.trim() || addingItem}
                  className="flex-shrink-0 py-2 px-4 rounded-lg bg-[#3B7D3C] text-white text-sm font-medium hover:bg-[#2d6130] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {addingItem ? "Adding…" : "Add"}
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          {items.length > 0 && (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate("/checklist")}
                className="flex-1 py-3 rounded-xl border border-[#E0E0E0] text-[#5A5A5A] font-medium text-sm hover:border-[#3B7D3C] hover:text-[#3B7D3C] transition-all duration-200"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleComplete}
                className="flex-1 py-3 rounded-xl bg-[#3B7D3C] text-white font-semibold text-sm hover:bg-[#2d6130] shadow-sm hover:shadow-md transition-all duration-200"
              >
                Complete &amp; Archive
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reset Confirm Modal */}
      <Modal
        open={showResetConfirm}
        title="Reset Checklist"
        okText="Reset All Items"
        okButtonProps={{ style: { backgroundColor: "#D4872D", borderColor: "#D4872D" } }}
        onOk={handleReset}
        onCancel={() => setShowResetConfirm(false)}
      >
        <p className="text-[#5A5A5A]">
          Uncheck all items in this checklist? Use this to reuse it for a new trip or task.
        </p>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        open={showDeleteConfirm}
        title={<span className="text-red-500">Delete Checklist</span>}
        okText="Delete"
        okButtonProps={{ danger: true }}
        onOk={handleDeleteChecklist}
        onCancel={() => setShowDeleteConfirm(false)}
      >
        <p className="text-[#5A5A5A]">
          Are you sure you want to delete <strong className="text-[#1A1A1A]">{checklist?.title}</strong>? This cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default ChecklistDetails;
