import React, { useState } from "react";
import Logo from "../assets/Home/hero.png";
import face from "../assets/Home/face.png";
import mes from "../assets/Home/mes.png";
import ins from "../assets/Home/ins.png";
import inc from "../assets/Home/in.png";
import { Link } from "react-router-dom";
import { FaTools, FaRoute, FaClipboardList, FaChevronDown, FaChevronUp } from "react-icons/fa";

const FooterSection = ({ title, links }) => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        className="flex items-center justify-between w-full text-left"
        onClick={() => setOpen((o) => !o)}
      >
        <h3 className="text-[#D4872D] font-semibold mb-0 text-xs uppercase tracking-widest">
          {title}
        </h3>
        <span className="text-[#D4872D] md:hidden">
          {open ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
        </span>
      </button>
      <ul className={`mt-3 space-y-2 ${open ? "block" : "hidden md:block"}`}>
        {links.map(({ label, to }) => (
          <li key={label}>
            <Link
              to={to}
              className="text-[#888] hover:text-white transition-colors duration-300 text-sm"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const Footer = () => {
  const maintenanceLinks = [
    { label: "Maintenance Schedule", to: "/newMaintenance" },
    { label: "Past Due",             to: "/maintenanceOverdue" },
    { label: "Add Maintenance",      to: "/AddNewMaintanceSchedule" },
    { label: "Components",           to: "/havcApplication" },
    { label: "Generator Hours",      to: "/generatorLog" },
    { label: "Smart Suggestions",    to: "/smartSuggestions" },
  ];

  const repairLinks = [
    { label: "All Repair Orders",  to: "/repairOrders" },
    { label: "Add Repair Order",   to: "/addRepairOrder" },
    { label: "Component Warranty", to: "/havcApplication" },
    { label: "Smart Suggestions",  to: "/smartSuggestions" },
  ];

  const expenseLinks = [
    { label: "Add Expense",      to: "/addNewExpense" },
    { label: "Expense History",  to: "/newExpense" },
    { label: "Fuel Log",         to: "/fuelList" },
    { label: "Add Fuel Entry",   to: "/addFuel" },
  ];

  const tripLinks = [
    { label: "Trip Logs", to: "/viewAllTrip" },
    { label: "Add Trip", to: "/campgroundReview" },
    { label: "Campground Stays", to: "/campgroundReview" },
    { label: "Add Campground Review", to: "/campgroundReview" },
  ];

  return (
    <footer className="mt-20 print:hidden">
      {/* Newsletter CTA */}
      <div className="max-w-site mx-auto px-4 lg:px-6 2xl:px-8 mb-[-1px]">
        <div className="bg-[#1A1A1A] rounded-t-2xl py-10 px-6 md:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h2 className="text-xl md:text-2xl font-bold text-white">Stay in the Loop</h2>
              <p className="text-white/60 mt-1 text-sm">Get tips, updates, and RV maintenance reminders.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <input
                className="flex-1 md:w-[280px] bg-white/10 border border-white/20 text-white rounded-full px-5 py-3 placeholder-white/40 focus:outline-none focus:border-[#D4872D]/60 text-sm"
                placeholder="Enter your email"
              />
              <button className="bg-[#D4872D] text-white font-semibold rounded-full px-8 py-3 btn-accent hover:bg-[#B8721F] whitespace-nowrap text-sm">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="bg-[#1A1A1A] text-white">
        <div className="max-w-site mx-auto px-6 lg:px-8 pt-10 pb-14">
          <div className="border-t border-white/10 mb-10"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-6">
            {/* Brand */}
            <div className="lg:col-span-3">
              <Link to="/">
                <img src={Logo} alt="My RV Vault" className="h-14 w-auto mb-4" />
              </Link>
              <p className="text-[#888] text-sm leading-relaxed max-w-xs">
                Your all-in-one RV management hub. Track maintenance, manage repairs, log expenses,
                and keep your RV life organized.
              </p>
              <div className="flex items-center gap-3 mt-5">
                <a href="#" className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center hover:bg-[#D4872D] transition-colors duration-300">
                  <img src={face} alt="Facebook" className="w-4 h-4" />
                </a>
                <a href="#" className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center hover:bg-[#D4872D] transition-colors duration-300">
                  <img src={ins} alt="Instagram" className="w-4 h-4" />
                </a>
                <a href="#" className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center hover:bg-[#D4872D] transition-colors duration-300">
                  <img src={inc} alt="LinkedIn" className="w-4 h-4" />
                </a>
                <a href="#" className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center hover:bg-[#D4872D] transition-colors duration-300">
                  <img src={mes} alt="Messenger" className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Maintenance */}
            <div className="lg:col-span-2">
              <FooterSection title="Maintenance" links={maintenanceLinks} />
            </div>

            {/* Repairs */}
            <div className="lg:col-span-2">
              <FooterSection title="Repairs" links={repairLinks} />
            </div>

            {/* Expenses */}
            <div className="lg:col-span-2">
              <FooterSection title="Expenses" links={expenseLinks} />
            </div>

            {/* Trips */}
            <div className="lg:col-span-2">
              <FooterSection title="Trips" links={tripLinks} />
            </div>

            {/* Company */}
            <div className="lg:col-span-1">
              <FooterSection
                title="Company"
                links={[
                  { label: "About Us", to: "/aboutUs" },
                  { label: "Privacy Policy", to: "/privecy" },
                  { label: "Terms & Conditions", to: "/terms" },
                ]}
              />
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/10 mt-10 pt-5 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-[#555] text-xs">
              &copy; {new Date().getFullYear()} My RV Vault. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link to="/privecy" className="text-[#555] hover:text-[#888] text-xs transition-colors duration-300">Privacy</Link>
              <Link to="/terms" className="text-[#555] hover:text-[#888] text-xs transition-colors duration-300">Terms</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
