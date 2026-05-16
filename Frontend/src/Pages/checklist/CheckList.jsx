import React, { useState } from "react";
import { Link } from "react-router-dom";
import { message, Modal } from "antd";
import { CheckSquareOutlined, PlusOutlined } from "@ant-design/icons";
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

  if (isLoading) return (
    <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
      <p className="text-[#5A5A5A]">Loading…</p>
    </div>
  );
  if (isError) return (
    <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
      <p className="text-red-500">Failed to load checklists.</p>
    </div>
  );

  const checklists = checklistData?.data || [];

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="max-w-site mx-auto px-4 lg:px-6 2xl:px-8 py-10">

        {/* Page Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-1 h-8 bg-[#D4872D] rounded-full" />
              <h1 className="text-3xl font-bold text-[#1A1A1A]">Checklists</h1>
            </div>
            <p className="text-[#5A5A5A] text-sm ml-4 pl-3">
              Create, manage, and track your RV checklists.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowTemplates(true)}
              className="py-2 px-4 rounded-xl border border-[#3B7D3C] text-[#3B7D3C] font-medium text-sm hover:bg-[#3B7D3C]/5 transition-all duration-200"
            >
              Use Template
            </button>
            <Link to="/addChecklist">
              <button className="py-2 px-4 rounded-xl bg-[#3B7D3C] text-white font-medium text-sm hover:bg-[#2d6130] shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-1.5">
                <PlusOutlined /> Add Checklist
              </button>
            </Link>
          </div>
        </div>

        {/* Grid */}
        <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4">
          {checklists.map((list) => {
            const items = list.items || [];
            const checked = items.filter((i) => i.status).length;
            const pct = items.length > 0 ? Math.round((checked / items.length) * 100) : 0;

            return (
              <Link key={list.id} to={`/checklistDetails/${list.id}`}>
                <div className="bg-white border border-[#E8F0E8] rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-[#3B7D3C]/40 transition-all duration-200 h-full">
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-semibold text-[#1A1A1A] text-base leading-snug pr-2">
                      {list.title}
                    </span>
                    {list.templateType && list.templateType !== "custom" && (
                      <span className="text-xs bg-[#E8F0E8] text-[#3B7D3C] px-2 py-0.5 rounded-full flex-shrink-0 font-medium">
                        Template
                      </span>
                    )}
                  </div>

                  {/* Progress */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-[#5A5A5A] mb-1.5">
                      <span>{checked}/{items.length} items</span>
                      <span className="font-medium text-[#3B7D3C]">{pct}%</span>
                    </div>
                    <div className="w-full bg-[#E8F0E8] rounded-full h-1.5">
                      <div
                        className="bg-[#3B7D3C] h-1.5 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    {items.slice(0, 4).map((item, index) => (
                      <p
                        key={index}
                        className={`text-sm flex items-center gap-1.5 ${
                          item.status ? "line-through text-[#9E9E9E]" : "text-[#5A5A5A]"
                        }`}
                      >
                        <CheckSquareOutlined
                          className={item.status ? "text-[#3B7D3C]" : "text-[#9E9E9E]"}
                          style={{ fontSize: 11 }}
                        />
                        {item.name}
                      </p>
                    ))}
                    {items.length > 4 && (
                      <p className="text-xs text-[#9E9E9E] mt-1">+{items.length - 4} more</p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}

          {checklists.length === 0 && (
            <div className="col-span-full">
              <div className="bg-white border border-[#E8F0E8] rounded-2xl p-12 text-center shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-[#E8F0E8] flex items-center justify-center mx-auto mb-4">
                  <CheckSquareOutlined className="text-[#3B7D3C] text-2xl" />
                </div>
                <p className="text-[#1A1A1A] font-semibold text-lg mb-1">No checklists yet</p>
                <p className="text-[#5A5A5A] text-sm mb-5">
                  Create a custom checklist or start with a pre-built template.
                </p>
                <button
                  onClick={() => setShowTemplates(true)}
                  className="py-2 px-5 rounded-xl border border-[#3B7D3C] text-[#3B7D3C] font-medium text-sm hover:bg-[#3B7D3C]/5 transition-all duration-200"
                >
                  Use Template
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Templates Modal */}
      <Modal
        open={showTemplates}
        title={<span className="text-[#1A1A1A] font-semibold">Pre-Built Templates</span>}
        footer={null}
        onCancel={() => setShowTemplates(false)}
      >
        <div className="space-y-3 py-2">
          <div
            onClick={() => !creating && createFromTemplate("pre_departure")}
            className="border border-[#E8F0E8] rounded-xl p-4 cursor-pointer hover:border-[#3B7D3C] hover:bg-[#E8F0E8]/30 transition-all duration-200"
          >
            <h4 className="font-semibold text-[#1A1A1A] mb-1">Pre-Departure Checklist</h4>
            <p className="text-sm text-[#5A5A5A]">
              16 items to check before you hit the road — safety, hookups, exterior.
            </p>
          </div>
          <div
            onClick={() => !creating && createFromTemplate("setup")}
            className="border border-[#E8F0E8] rounded-xl p-4 cursor-pointer hover:border-[#3B7D3C] hover:bg-[#E8F0E8]/30 transition-all duration-200"
          >
            <h4 className="font-semibold text-[#1A1A1A] mb-1">RV Setup Checklist</h4>
            <p className="text-sm text-[#5A5A5A]">
              13 items to set up your RV at the campsite — utilities, leveling, comfort.
            </p>
          </div>
        </div>
        {creating && (
          <p className="text-center text-[#3B7D3C] mt-3 text-sm font-medium">Creating checklist…</p>
        )}
      </Modal>
    </div>
  );
};

export default CheckList;
