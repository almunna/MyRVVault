import React from "react";
import logo1 from "../../assets/Home/logo1.png";
import logo2 from "../../assets/Home/logo2.png";
import logo3 from "../../assets/Home/logo3.png";
import logo4 from "../../assets/Home/logo4.png";
import main from "../../assets/Home/main.png";
import { Link } from "react-router-dom";
import { Dropdown, Space } from "antd";
const WelcomeEdiie = () => {
  const cards = [
    { to: "/addMembership", label: "Memberships", enabled: false },
    { to: "/insuranceInfo", label: "Insurance Info", enabled: false },
    { to: "/recalls", label: "Recalls", enabled: false },
    { to: "/newMaintenance", label: "Maintenance", enabled: false },
    { to: "/checklist", label: "Checklists", enabled: false },
    { to: "/reports", label: "Reports", enabled: false },
    { to: "/campgroundReview", label: "Campground Reviews", enabled: false },
    { to: "/havcApplication", label: "HVAC/Appliances/ Plumbing", enabled: false },
    { to: "/addRv", label: "Add RV", enabled: true },
    { to: "/myRv", label: "My RV", enabled: true },
    { to: "/tire", label: "Tires", enabled: true },
    { to: "/rvSold", label: "Sold RV", enabled: false },
  ];

  return (
    <div className="max-w-site mx-auto py-6 pt-11 px-4 lg:px-6 2xl:px-8">
      <div className="flex justify-center gap-4"></div>

      <div className="pt-5">
        <div className="grid lg:grid-cols-6 md:grid-cols-4 grid-cols-2 gap-4 2xl:gap-5 py-5">
          {cards.map((card, index) => (
            <div
              key={card.to}
              className={`bg-white border border-[#E8F0E8] py-6 rounded-xl hover-lift animate-fadeInUp animate-delay-${(index % 5 + 1) * 100}`}
            >
              {card.enabled ? (
                <Link to={card.to}>
                  <div className="flex justify-center">
                    <img src={logo1} alt="logo" />
                  </div>
                  <p className="text-lg font-semibold text-center pt-5 text-[#1A1A1A]">
                    {card.label}
                  </p>
                </Link>
              ) : (
                <div>
                  <div className="flex justify-center">
                    <img src={logo1} alt="logo" />
                  </div>
                  <p className="text-lg font-semibold text-center pt-5 text-[#1A1A1A]">
                    {card.label}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WelcomeEdiie;
