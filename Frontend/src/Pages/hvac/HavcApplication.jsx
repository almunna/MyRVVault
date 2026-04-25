import React from "react";
import { Link } from "react-router-dom";
import { COMPONENT_TYPES_BY_CATEGORY, CATEGORY_META } from "./componentConfig";

const HavcApplication = () => {
  const categoryOrder = ["house", "entertainment", "chassis"];

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="max-w-site mx-auto px-4 lg:px-6 2xl:px-8 py-10">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-8 bg-[#D4872D] rounded-full" />
            <h1 className="text-3xl font-bold text-[#1A1A1A]">Components</h1>
          </div>
          <p className="text-[#5A5A5A] text-sm ml-4 pl-3">
            Track health, warranty, and replacement history for every component in your RV.
          </p>
        </div>

        {/* Categories */}
        <div className="space-y-8">
          {categoryOrder.map((cat) => {
            const meta = CATEGORY_META[cat];
            const types = COMPONENT_TYPES_BY_CATEGORY[cat] || [];
            return (
              <div key={cat}>
                {/* Category header */}
                <div
                  className="flex items-center gap-3 mb-4 px-4 py-3 rounded-2xl"
                  style={{ background: meta.bg, border: `1px solid ${meta.border}` }}
                >
                  <div className="w-1 h-6 rounded-full" style={{ background: meta.accent }} />
                  <div>
                    <p className="text-sm font-bold" style={{ color: meta.color }}>{meta.label}</p>
                    <p className="text-xs" style={{ color: meta.accent }}>{meta.description}</p>
                  </div>
                </div>

                {/* Component tiles */}
                <div className="grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-3">
                  {types.map(({ key, label, icon }) => (
                    <Link key={key} to={`/components/${key}`}>
                      <div className="bg-white border border-[#E8F0E8] rounded-2xl px-4 py-5 flex flex-col items-center gap-2 hover:shadow-md hover:border-[#3B7D3C] transition-all duration-200 cursor-pointer group">
                        <span className="text-3xl">{icon}</span>
                        <p className="text-sm font-semibold text-[#1A1A1A] text-center group-hover:text-[#3B7D3C] transition-colors">
                          {label}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HavcApplication;
