import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import NewTrip from './NewTrip';
import Progress from './Progress';
import UpdateState from './UpdateState';
import ViewTrips from './ViewTrips';

const CampgroundReview = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("newTrip");

  // Sync tab state with URL query param on load and when URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get("tab");
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const params = new URLSearchParams(location.search);
    params.set("tab", tab);
    window.history.pushState(null, "", `?${params.toString()}`);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "progress":
        return <Progress />;
      case "newTrip":
        return <NewTrip />;
      case "updateState":
        return <UpdateState />;
      case "viewTrips":
        return <ViewTrips />;
      default:
        return null;
    }
  };

  return (
    <div className="container m-auto px-3 lg:px-0 mt-6">
      <div className="flex gap-4 mb-4">
        {["progress", "newTrip",  "viewTrips"].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === tab
                ? "bg-[#F9B038] text-black"
                : "border border-[#F9B038] text-[#F9B038] "
            }`}
            onClick={() => handleTabChange(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Render tab content */}
      {renderContent()}
    </div>
  );
};

export default CampgroundReview;
