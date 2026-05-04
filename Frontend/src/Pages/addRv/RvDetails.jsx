import React from "react";
import { Link, useParams } from "react-router-dom";
import { useGetSingleRvQuery } from "../redux/api/routesApi";

const states = {
  ALABAMA: "Alabama", ALASKA: "Alaska", ARIZONA: "Arizona",
  ARKANSAS: "Arkansas", CALIFORNIA: "California", COLORADO: "Colorado",
  CONNECTICUT: "Connecticut", DELAWARE: "Delaware", FLORIDA: "Florida",
  GEORGIA: "Georgia", HAWAII: "Hawaii", IDAHO: "Idaho",
  ILLINOIS: "Illinois", INDIANA: "Indiana", IOWA: "Iowa",
  KANSAS: "Kansas", KENTUCKY: "Kentucky", LOUISIANA: "Louisiana",
  MAINE: "Maine", MARYLAND: "Maryland", MASSACHUSETTS: "Massachusetts",
  MICHIGAN: "Michigan", MINNESOTA: "Minnesota", MISSISSIPPI: "Mississippi",
  MISSOURI: "Missouri", MONTANA: "Montana", NEBRASKA: "Nebraska",
  NEVADA: "Nevada", NEW_HAMPSHIRE: "New Hampshire", NEW_JERSEY: "New Jersey",
  NEW_MEXICO: "New Mexico", NEW_YORK: "New York",
  NORTH_CAROLINA: "North Carolina", NORTH_DAKOTA: "North Dakota",
  OHIO: "Ohio", OKLAHOMA: "Oklahoma", OREGON: "Oregon",
  PENNSYLVANIA: "Pennsylvania", RHODE_ISLAND: "Rhode Island",
  SOUTH_CAROLINA: "South Carolina", SOUTH_DAKOTA: "South Dakota",
  TENNESSEE: "Tennessee", TEXAS: "Texas", UTAH: "Utah",
  VERMONT: "Vermont", VIRGINIA: "Virginia", WASHINGTON: "Washington",
  WEST_VIRGINIA: "West Virginia", WISCONSIN: "Wisconsin", WYOMING: "Wyoming",
};

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
      <span className="text-gray-900 text-sm font-medium text-right max-w-[60%]">{value}</span>
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

const getTagAlert = (tagExpirationDate) => {
  if (!tagExpirationDate) return null;
  const daysLeft = Math.ceil((new Date(tagExpirationDate) - new Date()) / 86400000);
  if (daysLeft < 0) return { label: "Tag Expired", color: "#ef4444" };
  if (daysLeft <= 30) return { label: `Tag expires in ${daysLeft}d`, color: "#f97316" };
  return null;
};

const fmtFeet = (decimal) => {
  if (!decimal && decimal !== 0) return null;
  const ft = Math.floor(decimal);
  const inch = Math.round((decimal - ft) * 12);
  return inch > 0 ? `${ft}' ${inch}"` : `${ft}'`;
};

const RvDetails = () => {
  const { id } = useParams();
  const { data, isLoading, isError } = useGetSingleRvQuery({ id });

  if (isLoading) {
    return (
      <div className="py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="h-8 w-40 bg-[#F9B038]/20 rounded-lg mb-8 animate-pulse" />
          <div className="bg-white rounded-2xl border border-[#F9B038]/20 p-8 animate-pulse space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-5 bg-gray-100 rounded w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">Could not load RV details.</p>
          <Link
            to="/myRv"
            className="px-5 py-2 bg-[#F9B038] text-black font-semibold rounded-xl hover:bg-[#d6952f]"
          >
            Back to My RVs
          </Link>
        </div>
      </div>
    );
  }

  const rv = data.data;
  const stateName = rv.state ? (states[rv.state] || rv.state) : null;

  return (
    <div className="py-10 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Link
              to="/myRv"
              className="flex items-center justify-center w-9 h-9 rounded-full border-2 border-[#F9B038]/40 text-[#F9B038] hover:bg-[#F9B038] hover:text-black transition-all duration-200 text-lg font-bold"
            >
              ←
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {rv.nickname || "Unnamed RV"}
              </h1>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {rv.modelYear && (
                  <span className="text-sm font-semibold text-[#F9B038]">{rv.modelYear}</span>
                )}
                {rv.manufacturer && (
                  <span className="text-sm text-gray-500">{rv.manufacturer}</span>
                )}
                {rv.class && (
                  <span className="text-xs bg-[#F9B038]/10 text-[#c97d00] font-medium px-2 py-0.5 rounded-md">
                    {rv.class}
                  </span>
                )}
                {rv.isSold && <Badge color="#ef4444">Sold</Badge>}
                {rv.isOverdueForMaintenance && <Badge color="#f97316">Overdue</Badge>}
                {rv.condition && (
                  <Badge color={rv.condition === "New" ? "#22c55e" : "#F9B038"}>
                    {rv.condition}
                  </Badge>
                )}
                {(() => {
                  const alert = getTagAlert(rv.tagExpirationDate);
                  return alert ? <Badge color={alert.color}>{alert.label}</Badge> : null;
                })()}
              </div>
            </div>
          </div>
          <Link
            to={`/editRv/${id}`}
            className="flex-shrink-0 px-5 py-2 bg-[#F9B038] text-black font-semibold rounded-xl text-sm hover:bg-[#d6952f] transition-all duration-200 shadow-sm"
          >
            Edit RV
          </Link>
        </div>

        {/* Details Card */}
        <div className="bg-white rounded-2xl border border-[#F9B038]/20 shadow-sm p-6 lg:p-8">

          {/* Overview */}
          <SectionHeading title="Overview" />
          <InfoRow label="Manufacturer" value={rv.manufacturer} />
          <InfoRow label="Model Name" value={rv.modelName} />
          <InfoRow label="Model" value={rv.model} />
          <InfoRow label="Model Year" value={rv.modelYear} />
          <InfoRow label="Class" value={rv.class} />
          <InfoRow label="VIN #" value={rv.vinNumber} />

          {/* Purchase Details */}
          <SectionHeading title="Purchase Details" />
          <InfoRow
            label="Date of Purchase"
            value={rv.dateOfPurchase ? new Date(rv.dateOfPurchase).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : null}
          />
          <InfoRow
            label="Amount Paid"
            value={rv.amountPaid ? `$${Number(rv.amountPaid).toLocaleString()}` : null}
          />
          <InfoRow label="Condition" value={rv.condition} />
          <InfoRow
            label="Current Mileage"
            value={rv.currentMileage ? `${Number(rv.currentMileage).toLocaleString()} mi` : null}
          />
          <InfoRow label="Purchased From" value={rv.purchasedFrom} />
          <InfoRow label="Tag #" value={rv.tagNumber} />
          {rv.tagExpirationDate && (() => {
            const alert = getTagAlert(rv.tagExpirationDate);
            const dateStr = new Date(rv.tagExpirationDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
            return (
              <div className="flex justify-between items-start gap-4 py-2.5 border-b border-gray-100">
                <span className="text-gray-500 text-sm">Tag Expiration</span>
                <span className={`text-sm font-medium text-right ${alert?.color === "#ef4444" ? "text-red-600" : alert ? "text-orange-500" : "text-gray-900"}`}>
                  {dateStr}
                  {alert && <span className="ml-2 text-xs font-semibold" style={{ color: alert.color }}>({alert.label})</span>}
                </span>
              </div>
            );
          })()}

          {/* Location */}
          {(rv.city || rv.state || rv.phoneNumber) && (
            <>
              <SectionHeading title="Location & Contact" />
              <InfoRow label="City" value={rv.city} />
              <InfoRow label="State" value={stateName} />
              <InfoRow label="Phone" value={rv.phoneNumber} />
            </>
          )}

          {/* Appearance */}
          {(rv.floorplan || rv.exteriorColorScheme || rv.interiorColorScheme) && (
            <>
              <SectionHeading title="Appearance" />
              <InfoRow label="Floor Plan" value={rv.floorplan} />
              <InfoRow label="Exterior Color" value={rv.exteriorColorScheme} />
              <InfoRow label="Interior Color" value={rv.interiorColorScheme} />
            </>
          )}

          {/* Dimensions & Weight */}
          {(rv.length || rv.width || rv.height || rv.weight) && (
            <>
              <SectionHeading title="Dimensions & Weight" />
              <InfoRow label="Length" value={fmtFeet(rv.length)} />
              <InfoRow label="Width" value={fmtFeet(rv.width)} />
              <InfoRow label="Height" value={fmtFeet(rv.height)} />
              <InfoRow
                label="Weight"
                value={rv.weight ? `${Number(rv.weight).toLocaleString()} lbs` : null}
              />
            </>
          )}

          {/* House Systems */}
          {(rv.tireCount || rv.generatorHours || rv.houseSystems?.length > 0) && (
            <>
              <SectionHeading title="House Systems & Setup" />
              <InfoRow label="Tire Layout" value={rv.tireCount ? `${rv.tireCount} Tires` : null} />
              <InfoRow label="Generator Hours" value={rv.generatorHours ? `${rv.generatorHours} hrs` : null} />
              {rv.houseSystems?.length > 0 && (
                <div className="py-2.5 border-b border-gray-100">
                  <p className="text-gray-500 text-sm mb-2">House Systems</p>
                  <div className="flex flex-wrap gap-1.5">
                    {rv.houseSystems.map((s, i) => {
                      const label = typeof s === "string"
                        ? s
                        : `${s.type}${s.location ? ` (${s.location})` : ""}`;
                      return (
                        <span
                          key={i}
                          className="text-xs bg-[#F9B038]/10 text-[#c97d00] font-medium px-2.5 py-1 rounded-full"
                        >
                          {label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Maintenance */}
          {(rv.lastMaintenanceCheck || rv.overdueMaintenanceCount > 0) && (
            <>
              <SectionHeading title="Maintenance" />
              <InfoRow
                label="Last Maintenance Check"
                value={rv.lastMaintenanceCheck ? new Date(rv.lastMaintenanceCheck).toLocaleDateString() : null}
              />
              {rv.overdueMaintenanceCount > 0 && (
                <InfoRow
                  label="Overdue Items"
                  value={`${rv.overdueMaintenanceCount} item${rv.overdueMaintenanceCount > 1 ? "s" : ""}`}
                />
              )}
            </>
          )}
        </div>

        {/* Bottom Edit Button */}
        <div className="mt-6 flex justify-end">
          <Link
            to={`/editRv/${id}`}
            className="px-8 py-2.5 bg-[#F9B038] text-black font-semibold rounded-xl text-sm hover:bg-[#d6952f] transition-all duration-200 shadow-sm"
          >
            Edit RV
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RvDetails;
