import React from "react";
import { Link } from "react-router-dom";
import { useDeleteChassisMutation, useGetChassisQuery } from "../redux/api/routesApi";
import { message } from "antd";
import { useGetProfileQuery } from "../redux/api/userApi";

const SectionHeading = ({ title }) => (
  <div className="flex items-center gap-3 mb-4 mt-6">
    <div className="w-1 h-5 rounded-full bg-[#F9B038]" />
    <h2 className="text-sm font-semibold text-[#F9B038] uppercase tracking-widest">
      {title}
    </h2>
    <div className="flex-1 h-px bg-[#F9B038]/20" />
  </div>
);

const InfoRow = ({ label, value }) => {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between items-start gap-4 py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-gray-500 text-sm">{label}</span>
      <span className="text-gray-900 text-sm font-medium text-right">{value}</span>
    </div>
  );
};

const ChassisInfo = () => {
  const { data, isLoading, isError } = useGetChassisQuery();
  const { data: profileData } = useGetProfileQuery();
  const [deleteChassis] = useDeleteChassisMutation();

  if (isLoading) {
    return (
      <div className="py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="h-8 w-48 bg-[#F9B038]/20 rounded-lg mb-8 animate-pulse" />
          <div className="bg-white rounded-2xl border border-[#F9B038]/20 p-8 animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-5 bg-gray-100 rounded w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500 text-lg">Something went wrong loading chassis info.</p>
      </div>
    );
  }

  if (!data?.data) {
    return (
      <div className="py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-[#F9B038]">Chassis Information</h1>
            <Link
              to="/information"
              className="px-5 py-2 bg-[#F9B038] text-black font-semibold rounded-xl text-sm hover:bg-[#d6952f] transition-all duration-200 shadow-sm"
            >
              + Add Chassis
            </Link>
          </div>
          <div className="bg-white rounded-2xl border border-[#F9B038]/20 shadow-sm p-16 text-center">
            <div className="text-5xl mb-4">🔧</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No chassis data yet</h2>
            <p className="text-gray-400 mb-6">Add chassis information for your selected RV</p>
            <Link
              to="/information"
              className="inline-block bg-[#F9B038] hover:bg-[#d6952f] text-black font-semibold px-6 py-2.5 rounded-xl transition-all duration-200"
            >
              Add Chassis Info
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const chassis = data.data;

  return (
    <div className="py-10 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#F9B038]">Chassis Information</h1>
            <p className="text-gray-500 text-sm mt-1">{chassis.name || "Chassis details"}</p>
          </div>
          <Link
            to={`/chassisInfo/update-chassis/${chassis.id}`}
            className="px-5 py-2 bg-[#F9B038] text-black font-semibold rounded-xl text-sm hover:bg-[#d6952f] transition-all duration-200 shadow-sm"
          >
            Edit Chassis
          </Link>
        </div>

        {/* Details Card */}
        <div className="bg-white rounded-2xl border border-[#F9B038]/20 shadow-sm p-6 lg:p-8">

          {/* Basic Info */}
          <SectionHeading title="Basic Information" />
          <InfoRow label="Name" value={chassis.name} />
          <InfoRow label="Manufacturer" value={chassis.mfg} />
          <InfoRow label="Model" value={chassis.modelNo} />
          <InfoRow label="Serial ID" value={chassis.serialId} />
          <InfoRow label="Fuel Type" value={chassis.fuelType} />
          <InfoRow label="Engine Model" value={chassis.engineModel} />
          <InfoRow label="Horsepower" value={chassis.hp ? `${chassis.hp} hp` : null} />

          {/* Belt */}
          {chassis.belt?.length > 0 && (
            <>
              <SectionHeading title="Belt" />
              <div className="space-y-0">
                {chassis.belt.map((belt, i) => (
                  <div key={i} className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-0">
                    <span className="text-gray-500 text-sm">{belt.name || `Belt ${i + 1}`}</span>
                    <span className="text-gray-900 text-sm font-medium">Part #{belt.partNo || "N/A"}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Oil Filter */}
          {chassis.oilFilter?.length > 0 && (
            <>
              <SectionHeading title="Oil Filter" />
              <div className="space-y-0">
                {chassis.oilFilter.map((oil, i) => (
                  <div key={i} className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-0">
                    <span className="text-gray-500 text-sm">{oil.name || `Filter ${i + 1}`}</span>
                    <span className="text-gray-900 text-sm font-medium">Part #{oil.partNo || "N/A"}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Fuel Filter */}
          {chassis.fuelFilter?.length > 0 && (
            <>
              <SectionHeading title="Fuel Filter" />
              <div className="space-y-0">
                {chassis.fuelFilter.map((fuel, i) => (
                  <div key={i} className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-0">
                    <span className="text-gray-500 text-sm">{fuel.name || `Filter ${i + 1}`}</span>
                    <span className="text-gray-900 text-sm font-medium">Part #{fuel.partNo || "N/A"}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Bottom Edit Button */}
        <div className="mt-6 flex justify-end">
          <Link
            to={`/chassisInfo/update-chassis/${chassis.id}`}
            className="px-8 py-2.5 bg-[#F9B038] text-black font-semibold rounded-xl text-sm hover:bg-[#d6952f] transition-all duration-200 shadow-sm"
          >
            Edit Chassis
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ChassisInfo;
