import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useGetMaintanceAllQuery } from "../redux/api/routesApi";

const OverDue = () => {
  const { data, isLoading, isError } = useGetMaintanceAllQuery();
  console.log(data)
  const [openSection, setOpenSection] = useState(null);
  const [openItem, setOpenItem] = useState(null);

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Something went wrong!</p>;


  const overdueData = data?.data?.overdue || [];
  const scheduledData = data?.data?.scheduled || [];
  const upcomingData = data?.data?.upcoming || [];


  const renderSection = (title, sectionKey, items) => (
    <div className="mb-8">
      {/* Section Header */}
      <button
        onClick={() => setOpenSection(openSection === sectionKey ? null : sectionKey)}
        className="flex justify-between items-center w-full bg-[#35549B] text-[#F9B038] font-semibold text-xl px-5 py-3 rounded-md border border-[#F9B038]"
      >
        {title} ({items.length})
        <span>{openSection === sectionKey ? "▲" : "▼"}</span>
      </button>

      {/* Section Content */}
     <div>
         {openSection === sectionKey && (
        <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4 mt-4">
          {items.length === 0 ? (
            <p className="text-white col-span-full">No {title.toLowerCase()} items found.</p>
          ) : (
            items.map((item) => (
              <div
                key={item._id}
                className="bg-[#F59B07] py-4 w-full rounded px-4 shadow-md"
              >
                {/* Item Header */}
                <div
                  onClick={() => setOpenItem(openItem === item._id ? null : item._id)}
                  className="cursor-pointer flex justify-between items-center font-semibold text-gray-800"
                >
                  <span>{item.component}</span>
                  <span>{openItem === item._id ? "-" : "+"}</span>
                </div>

                {/* Item Details (Collapsible) */}
                {openItem === item._id && (
                  <div className="mt-3 text-gray-800 font-semibold space-y-2 border-t border-gray-600 pt-2">
                    {item.component && (
                      <div>
                        <span>Component: </span>
                        <span className="font-normal">{item.component}</span>
                      </div>
                    )}

                    {item.maintenanceToBePerformed && (
                      <div>
                        <span>Maintenance To Be Performed: </span>
                        <span className="font-normal">
                          {new Date(item.maintenanceToBePerformed).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {item.nextMaintenanceDate && (
                      <div>
                        <span>Next Maintenance Date: </span>
                        <span className="font-normal">
                          {new Date(item.nextMaintenanceDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {item.rvType && (
                      <div>
                        <span>RV Type: </span>
                        <span className="font-normal">{item.rvType}</span>
                      </div>
                    )}

                    {item.notes && (
                      <div>
                        <span>Notes: </span>
                        <span className="font-normal">{item.notes}</span>
                      </div>
                    )}

                    <div>
                      <span>Status: </span>
                      <span
                        className={`font-normal px-2 py-1 rounded text-white ${
                          item.isOverdue ? "bg-red-500" : "bg-green-500"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
     </div>
    </div>
  );

  return (
    <div className="container m-auto py-8 px-3 lg:px-0">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-[#F9B038] mb-6">
          Maintenance 
        </h1>
     
      </div>

      {/* Render All Sections */}
      {renderSection("Overdue", "overdue", overdueData)}
      {renderSection("Scheduled", "scheduled", scheduledData)}
      {renderSection("Upcoming", "upcoming", upcomingData)}
    </div>
  );
};

export default OverDue;
