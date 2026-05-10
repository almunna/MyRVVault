import React, { useState } from "react";
import { Link } from "react-router-dom";
import { message, Modal } from "antd";
import { useGetCheckListQuery } from "../redux/api/routesApi";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5002/api";

const CheckList = () => {
  const { data: checklistData, isLoading, isError, refetch } = useGetCheckListQuery();
  const [showTemplates, setShowTemplates] = useState(false);
  const [creating, setCreating] = useState(false);

  const createFromTemplate = async (templateType) => {
    setCreating(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${BASE_URL}/checklist/from-template`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ templateType }),
      });
      const data = await res.json();
      if (data.success) {
        message.success(`${data.data.title} created!`);
        setShowTemplates(false);
        refetch();
      } else {
        message.error(data.message || "Failed to create from template");
      }
    } catch {
      message.error("Something went wrong");
    } finally {
      setCreating(false);
    }
  };

  if (isLoading) return <div className="text-center py-10 text-[#F9B038]">Loading...</div>;
  if (isError) return <div className="text-center text-red-500">Failed to load checklist.</div>;

  const checklists = checklistData?.data || [];

  return (
    <div className="container m-auto py-8 px-3 lg:px-0">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
        <h1 className="text-3xl font-semibold text-[#F9B038]">Checklists</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowTemplates(true)}
            className="border border-[#F9B038] py-2 px-4 text-[#F9B038] rounded-md font-medium text-sm"
          >
            Use Template
          </button>
          <Link to="/addChecklist">
            <button className="border border-[#F9B038] py-2 px-5 text-[#F9B038] rounded-md font-medium">
              Add Checklist
            </button>
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4">
        {checklists.map((list) => {
          const items = list.items || [];
          const checked = items.filter(i => i.status).length;
          const pct = items.length > 0 ? Math.round((checked / items.length) * 100) : 0;

          return (
            <Link key={list.id || list._id} to={`/checklistDetails/${list.id || list._id}`}>
              <div className="bg-gray-900 border border-gray-700 py-4 w-full rounded px-4 text-gray-800 space-y-2 hover:border-[#F9B038] transition-colors">
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-[#F9B038] text-base">{list.title}</span>
                  {list.templateType && list.templateType !== "custom" && (
                    <span className="text-xs bg-yellow-900 text-yellow-300 px-1.5 py-0.5 rounded">Template</span>
                  )}
                </div>

                {/* Progress */}
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{checked}/{items.length}</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1">
                    <div className="bg-[#F9B038] h-1 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>

                <div className="space-y-1 mt-1">
                  {items.slice(0, 4).map((item, index) => (
                    <h1 key={index} className={`text-sm ${item.status ? "line-through text-gray-600" : "text-gray-300"}`}>
                      • {item.name}
                    </h1>
                  ))}
                  {items.length > 4 && (
                    <p className="text-xs text-gray-500">+{items.length - 4} more</p>
                  )}
                </div>
              </div>
            </Link>
          );
        })}

        {checklists.length === 0 && (
          <div className="col-span-full text-center py-16 text-gray-400">
            <p className="text-lg mb-2">No checklists yet.</p>
            <p className="text-sm">Create a custom checklist or use a pre-built template.</p>
            <button
              onClick={() => setShowTemplates(true)}
              className="mt-4 border border-[#F9B038] text-[#F9B038] px-6 py-2 rounded-md"
            >
              Use Template
            </button>
          </div>
        )}
      </div>

      {/* Templates Modal */}
      <Modal
        open={showTemplates}
        title={<span className="text-[#F9B038]">Pre-Built Templates</span>}
        footer={null}
        onCancel={() => setShowTemplates(false)}
      >
        <div className="space-y-3 py-2">
          <div
            onClick={() => !creating && createFromTemplate("pre_departure")}
            className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-[#F9B038] hover:bg-yellow-50 transition-colors"
          >
            <h4 className="font-semibold text-gray-800 mb-1">Pre-Departure Checklist</h4>
            <p className="text-sm text-gray-500">16 items to check before you hit the road — safety, hookups, exterior.</p>
          </div>
          <div
            onClick={() => !creating && createFromTemplate("setup")}
            className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-[#F9B038] hover:bg-yellow-50 transition-colors"
          >
            <h4 className="font-semibold text-gray-800 mb-1">RV Setup Checklist</h4>
            <p className="text-sm text-gray-500">13 items to set up your RV at the campsite — utilities, leveling, comfort.</p>
          </div>
        </div>
        {creating && <p className="text-center text-[#F9B038] mt-3 text-sm">Creating checklist...</p>}
      </Modal>
    </div>
  );
};

export default CheckList;
