import { Checkbox, message, Modal } from "antd";
import React, { useState } from "react";
import { RiDeleteBinLine } from "react-icons/ri";
import { FiCopy, FiRotateCcw } from "react-icons/fi";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  useDeleteCheckListMutation,
  useGetSingleCheckListQuery,
  useUpdateCheckListMutation,
} from "../redux/api/routesApi";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5002/api";

const ChecklistDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const { data: singleChecklistData, isLoading, isError, refetch } = useGetSingleCheckListQuery({ id });
  const [completeAll] = useDeleteCheckListMutation();
  const [checkUpdateStatusAndDelete] = useUpdateCheckListMutation();

  if (isLoading) return <div className="text-center text-[#F59B07] py-10">Loading...</div>;
  if (isError || !singleChecklistData?.data) return <div className="text-center text-white">No data.</div>;

  const checklist = singleChecklistData.data;
  const items = checklist.items || [];
  const checkedCount = items.filter(i => i.status).length;
  const pct = items.length > 0 ? Math.round((checkedCount / items.length) * 100) : 0;

  const handleStatusChange = async (itemId, checked, itemName) => {
    try {
      const res = await checkUpdateStatusAndDelete({
        id,
        data: { itemOperations: [{ action: "update", itemId, updates: { name: itemName, status: checked } }] },
      }).unwrap();
      message.success(res?.message || "Updated!");
    } catch (err) {
      message.error(err?.data?.message || "Failed to update");
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      const res = await checkUpdateStatusAndDelete({
        id,
        data: { itemOperations: [{ action: "remove", itemId }] },
      }).unwrap();
      message.success(res?.message || "Item deleted!");
    } catch (err) {
      message.error(err?.data?.message || "Failed to delete item");
    }
  };

  const handleComplete = async () => {
    try {
      const res = await completeAll({ id, data: { status: "false" } }).unwrap();
      message.success(res?.message);
      navigate("/checklist");
    } catch (err) {
      message.error(err?.data?.message);
    }
  };

  const handleReset = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${BASE_URL}/checklist/${id}/uncheck-all`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        message.success("All items reset!");
        refetch();
      } else {
        message.error(data.message || "Failed to reset");
      }
    } catch {
      message.error("Something went wrong");
    } finally {
      setShowResetConfirm(false);
    }
  };

  const handleDuplicate = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${BASE_URL}/checklist/${id}/duplicate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        message.success("Checklist duplicated!");
        navigate(`/checklistDetails/${data.data.id}`);
      } else {
        message.error(data.message || "Failed to duplicate");
      }
    } catch {
      message.error("Something went wrong");
    }
  };

  return (
    <div className="container m-auto py-8 px-3 lg:px-0">
      <div className="text-[#F59B07]">
        <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
          <h1 className="font-semibold text-2xl">{checklist.title}</h1>
          <div className="flex gap-2">
            <button
              onClick={handleDuplicate}
              className="flex items-center gap-1 border border-[#F9B038] py-1.5 px-3 text-[#F9B038] rounded-md text-sm"
            >
              <FiCopy size={12} /> Duplicate
            </button>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1 border border-gray-500 py-1.5 px-3 text-gray-400 rounded-md text-sm hover:border-[#F9B038] hover:text-[#F9B038] transition-colors"
            >
              <FiRotateCcw size={12} /> Reset
            </button>
            <Link to={`/addItems/${id}`}>
              <button className="border border-[#F9B038] py-1.5 px-3 text-[#F9B038] rounded-md text-sm font-medium">
                + Add Item
              </button>
            </Link>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 bg-gray-900 rounded-lg p-4 border border-gray-700">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">{checkedCount} of {items.length} items completed</span>
            <span className="text-[#F9B038] font-semibold">{pct}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-[#F9B038] h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {items.map((item) => (
            <div
              key={item.id || item._id}
              className={`flex justify-between border-b border-b-slate-700 pb-4 items-center transition-opacity ${item.status ? "opacity-60" : ""}`}
            >
              <Checkbox
                className="text-[#F59B07]"
                defaultChecked={item.status}
                onChange={(e) => handleStatusChange(item.id || item._id, e.target.checked, item.name)}
              >
                <span className={item.status ? "line-through text-gray-500" : ""}>{item.name}</span>
              </Checkbox>
              <RiDeleteBinLine
                className="text-xl cursor-pointer hover:text-red-500 transition"
                onClick={() => handleDeleteItem(item.id || item._id)}
              />
            </div>
          ))}

          <button
            onClick={handleComplete}
            type="button"
            className="w-full text-black bg-[#F9B038] py-2 rounded mt-6 font-semibold hover:bg-yellow-500 transition-colors"
          >
            Complete & Archive
          </button>
        </div>
      </div>

      <Modal
        open={showResetConfirm}
        title="Reset Checklist"
        okText="Reset All Items"
        onOk={handleReset}
        onCancel={() => setShowResetConfirm(false)}
      >
        <p>Uncheck all items in this checklist? Use this to reuse it for a new trip or task.</p>
      </Modal>
    </div>
  );
};

export default ChecklistDetails;
