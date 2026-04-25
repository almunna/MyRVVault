import React from "react";
import logo1 from "../../assets/Home/logo1.png";
import { Link } from "react-router-dom";

const ACTIVE = [
  { to: "/newMaintenance", label: "Maintenance" },
  { to: "/repairOrders",   label: "Repair Orders" },
  { to: "/addRv",          label: "Add RV" },
  { to: "/myRv",           label: "My RV" },
  { to: "/rvSold",         label: "Sold RV" },
  { to: "/havcApplication",label: "Components" },
];

const INACTIVE = [
  "Memberships",
  "Insurance Info",
  "Recalls",
  "Checklists",
  "Reports",
  "Campground Reviews",
];

const WelcomeEdiie = () => (
  <div className="max-w-site mx-auto py-6 pt-11 px-4 lg:px-6 2xl:px-8">
    <div className="pt-5">
      <div className="grid lg:grid-cols-6 md:grid-cols-4 grid-cols-2 gap-4 2xl:gap-5 py-5">

        {/* Clickable cards */}
        {ACTIVE.map((card, i) => (
          <Link
            key={card.to}
            to={card.to}
            className={`bg-white border border-[#E8F0E8] py-6 rounded-xl hover:shadow-md hover:border-[#3B7D3C] transition-all duration-200 block animate-fadeInUp animate-delay-${(i % 5 + 1) * 100}`}
          >
            <div className="flex justify-center">
              <img src={logo1} alt="logo" />
            </div>
            <p className="text-lg font-semibold text-center pt-5 text-[#1A1A1A]">
              {card.label}
            </p>
          </Link>
        ))}

        {/* Non-clickable display cards */}
        {INACTIVE.map((label) => (
          <div
            key={label}
            className="bg-white border border-[#E8F0E8] py-6 rounded-xl opacity-50 cursor-not-allowed select-none"
          >
            <div className="flex justify-center">
              <img src={logo1} alt="logo" />
            </div>
            <p className="text-lg font-semibold text-center pt-5 text-[#1A1A1A]">
              {label}
            </p>
          </div>
        ))}

      </div>
    </div>
  </div>
);

export default WelcomeEdiie;
