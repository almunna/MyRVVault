import React from "react";
import { Link } from "react-router-dom";
import { useGetRvQuery } from "../redux/api/routesApi";

const DetailRow = ({ label, value }) => {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between items-start gap-2 py-1.5 border-b border-gray-100 last:border-0">
      <span className="text-gray-500 text-sm whitespace-nowrap">{label}</span>
      <span className="text-gray-800 text-sm font-medium text-right">{value}</span>
    </div>
  );
};

const Badge = ({ children, color }) => (
  <span
    className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
    style={{ backgroundColor: color + "22", color }}
  >
    {children}
  </span>
);

const MyRv = () => {
  const { data, isLoading, isError } = useGetRvQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="h-9 w-32 bg-[#F9B038]/20 rounded-lg mb-8 animate-pulse" />
          <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#F9B038]/20 p-5 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-2/3 mb-4" />
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="h-4 bg-gray-100 rounded w-full" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Something went wrong loading your RVs.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-5 py-2 bg-[#F9B038] text-black font-semibold rounded-lg hover:bg-[#d6952f]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const rvs = data?.data || [];

  return (
    <div className="min-h-screen bg-[#F5F5F0] py-10 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#F9B038]">My RVs</h1>
            <p className="text-gray-500 text-sm mt-1">
              {rvs.length} {rvs.length === 1 ? "vehicle" : "vehicles"} registered
            </p>
          </div>
          <Link
            to="/addRv"
            className="flex items-center gap-2 bg-[#F9B038] hover:bg-[#d6952f] text-black font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-all duration-200"
          >
            <span className="text-lg leading-none">+</span>
            Add RV
          </Link>
        </div>

        {/* Empty State */}
        {rvs.length === 0 && (
          <div className="bg-white rounded-2xl border border-[#F9B038]/20 shadow-sm p-16 text-center">
            <div className="text-5xl mb-4">🚐</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No RVs yet</h2>
            <p className="text-gray-400 mb-6">Add your first RV to get started</p>
            <Link
              to="/addRv"
              className="inline-block bg-[#F9B038] hover:bg-[#d6952f] text-black font-semibold px-6 py-2.5 rounded-xl transition-all duration-200"
            >
              Add Your First RV
            </Link>
          </div>
        )}

        {/* RV Cards Grid */}
        <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5">
          {rvs.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-2xl border border-[#F9B038]/20 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col"
            >
              {/* Card Header */}
              <div className="px-5 pt-5 pb-4 border-b border-gray-100">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h2 className="text-lg font-bold text-gray-900 truncate">
                    {item.nickname || "Unnamed RV"}
                  </h2>
                  <div className="flex gap-1.5 flex-shrink-0">
                    {item.isSold && <Badge color="#ef4444">Sold</Badge>}
                    {item.isOverdueForMaintenance && (
                      <Badge color="#f97316">Overdue</Badge>
                    )}
                    {item.condition && (
                      <Badge color={item.condition === "New" ? "#22c55e" : "#F9B038"}>
                        {item.condition}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Key stats row */}
                <div className="flex items-center gap-3 text-sm text-gray-500 flex-wrap">
                  {item.modelYear && (
                    <span className="font-semibold text-[#F9B038]">{item.modelYear}</span>
                  )}
                  {item.manufacturer && <span>{item.manufacturer}</span>}
                  {item.modelName && <span className="text-gray-400">· {item.modelName}</span>}
                  {item.class && (
                    <span className="ml-auto text-xs bg-[#F9B038]/10 text-[#c97d00] font-medium px-2 py-0.5 rounded-md">
                      {item.class}
                    </span>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="px-5 py-4 flex-1">
                <DetailRow label="Model" value={item.model} />
                <DetailRow label="VIN #" value={item.vinNumber} />
                <DetailRow
                  label="Amount Paid"
                  value={item.amountPaid ? `$${Number(item.amountPaid).toLocaleString()}` : null}
                />
                <DetailRow
                  label="Current Mileage"
                  value={item.currentMileage ? `${Number(item.currentMileage).toLocaleString()} mi` : null}
                />
                <DetailRow
                  label="Date of Purchase"
                  value={item.dateOfPurchase ? new Date(item.dateOfPurchase).toLocaleDateString() : null}
                />
                <DetailRow label="Purchased From" value={item.purchasedFrom} />
                {(item.city || item.state) && (
                  <DetailRow
                    label="Location"
                    value={[item.city, item.state].filter(Boolean).join(", ")}
                  />
                )}
                <DetailRow label="Floor Plan" value={item.floorplan} />
                <DetailRow label="Exterior Color" value={item.exteriorColorScheme} />
                <DetailRow label="Interior Color" value={item.interiorColorScheme} />
                {(item.length || item.width || item.height) && (
                  <DetailRow
                    label="Dimensions"
                    value={[item.length && `${item.length.toFixed(1)}ft L`, item.width && `${item.width.toFixed(1)}ft W`, item.height && `${item.height.toFixed(1)}ft H`].filter(Boolean).join(" · ")}
                  />
                )}
                <DetailRow
                  label="Weight"
                  value={item.weight ? `${Number(item.weight).toLocaleString()} lbs` : null}
                />
                {item.overdueMaintenanceCount > 0 && (
                  <DetailRow
                    label="Overdue Maintenance"
                    value={`${item.overdueMaintenanceCount} item${item.overdueMaintenanceCount > 1 ? "s" : ""}`}
                  />
                )}
                <DetailRow
                  label="Last Maintenance"
                  value={item.lastMaintenanceCheck ? new Date(item.lastMaintenanceCheck).toLocaleDateString() : null}
                />
              </div>

              {/* Card Footer */}
              <div className="px-5 pb-5">
                <Link
                  to="/information"
                  className="block w-full text-center py-2 rounded-xl border-2 border-[#F9B038] text-[#F9B038] font-semibold text-sm hover:bg-[#F9B038] hover:text-black transition-all duration-200"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyRv;
