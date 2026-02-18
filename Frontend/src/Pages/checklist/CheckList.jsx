import React from "react";
import { Link } from "react-router-dom";
import { useGetCheckListQuery } from "../redux/api/routesApi";

const CheckList = () => {
  const { data: checklistData, isLoading, isError } = useGetCheckListQuery();

  if (isLoading) {
    return <div className="text-center py-10 text-[#F9B038]">Loading...</div>;
  }

  if (isError) {
    return <div className="text-center text-red-500">Failed to load checklist.</div>;
  }

  const checklists = checklistData?.data || [];

  return (
    <div className="container m-auto py-8 px-3 lg:px-0">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-[#F9B038]">Checklist</h1>
        <Link to="/addChecklist">
          <button className="border border-[#F9B038] py-2 px-5 text-[#F9B038] rounded-md font-medium">
            Add Checklist
          </button>
        </Link>
      </div>

      {/* ✅ Checklist Grid */}
      <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4">
        {checklists.map((list) => (
          <Link key={list._id} to={`/checklistDetails/${list._id}`}>
            <div className="bg-[#F59B07] py-4 w-full rounded px-4 text-gray-800 space-y-2">
              {/* ✅ Title */}
              <div>
                <span className="font-semibold  text-lg">
                  {list.title}
                </span>
              </div>

              {/* ✅ Items */}
              <div className="space-y-1">
                {list.items.map((item, index) => (
                  <h1 key={index} className="text-sm ">
                    • {item.name}
                  </h1>
                ))}
              </div>
            </div>
          </Link>
        ))}

        {/* ❌ If no checklist */}
        {checklists.length === 0 && (
          <p className="col-span-full text-center text-gray-500">
            No checklist found.
          </p>
        )}
      </div>
    </div>
  );
};

export default CheckList;
