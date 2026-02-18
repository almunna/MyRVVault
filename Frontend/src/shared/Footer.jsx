import React from "react";
import Logo from "../assets/Home/hero.png";
import face from "../assets/Home/face.png";
import mes from "../assets/Home/mes.png";
import ins from "../assets/Home/ins.png";
import inc from "../assets/Home/in.png";
import { Link } from "react-router-dom";
import { FaTools, FaRoute, FaClipboardList } from "react-icons/fa";

export const Footer = () => {
  return (
    <footer className="mt-20">
      {/* Newsletter CTA - Separate from footer body */}
      <div className="max-w-site mx-auto px-4 lg:px-6 2xl:px-8 mb-[-1px]">
        <div className="bg-[#1A1A1A] rounded-t-2xl py-10 px-6 md:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h2 className="text-xl md:text-2xl font-bold text-white">
                Stay in the Loop
              </h2>
              <p className="text-white/60 mt-1 text-sm">
                Get tips, updates, and RV maintenance reminders.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <input
                className="flex-1 md:w-[280px] bg-white/10 border border-white/20 text-white rounded-full px-5 py-3 placeholder-white/40 focus:outline-none focus:border-[#D4872D]/60 transition-colors duration-300 text-sm"
                placeholder="Enter your email"
              />
              <button className="bg-[#D4872D] text-white font-semibold rounded-full px-8 py-3 btn-accent hover:bg-[#B8721F] whitespace-nowrap text-sm">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer body */}
      <div className="bg-[#1A1A1A] text-white">
        <div className="max-w-site mx-auto px-6 lg:px-8 pt-10 pb-14">
          {/* Divider between newsletter and content */}
          <div className="border-t border-white/10 mb-10"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
            {/* Brand - wider column */}
            <div className="lg:col-span-4">
              <Link to="/">
                <img src={Logo} alt="My RV Vault" className="h-14 w-auto mb-4" />
              </Link>
              <p className="text-[#888] text-sm leading-relaxed max-w-xs">
                Your all-in-one RV management hub. Track maintenance, manage
                repairs, log expenses, and keep your RV life organized.
              </p>

              {/* Social Icons */}
              <div className="flex items-center gap-3 mt-5">
                <a
                  href="#"
                  className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center hover:bg-[#D4872D] transition-colors duration-300"
                >
                  <img src={face} alt="Facebook" className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center hover:bg-[#D4872D] transition-colors duration-300"
                >
                  <img src={ins} alt="Instagram" className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center hover:bg-[#D4872D] transition-colors duration-300"
                >
                  <img src={inc} alt="LinkedIn" className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center hover:bg-[#D4872D] transition-colors duration-300"
                >
                  <img src={mes} alt="Messenger" className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="lg:col-span-2">
              <h3 className="text-[#D4872D] font-semibold mb-4 text-xs uppercase tracking-widest">
                Quick Links
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <Link
                    to="/newMaintenance"
                    className="text-[#888] hover:text-white transition-colors duration-300 text-sm"
                  >
                    Maintenance
                  </Link>
                </li>
                <li>
                  <Link
                    to="/newExpense"
                    className="text-[#888] hover:text-white transition-colors duration-300 text-sm"
                  >
                    Expenses
                  </Link>
                </li>
                <li>
                  <Link
                    to="/newRepair"
                    className="text-[#888] hover:text-white transition-colors duration-300 text-sm"
                  >
                    Repairs
                  </Link>
                </li>
                <li>
                  <Link
                    to="/campgroundReview"
                    className="text-[#888] hover:text-white transition-colors duration-300 text-sm"
                  >
                    Campground Reviews
                  </Link>
                </li>
                <li>
                  <Link
                    to="/reports"
                    className="text-[#888] hover:text-white transition-colors duration-300 text-sm"
                  >
                    Reports
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div className="lg:col-span-2">
              <h3 className="text-[#D4872D] font-semibold mb-4 text-xs uppercase tracking-widest">
                Company
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <Link
                    to="/aboutUs"
                    className="text-[#888] hover:text-white transition-colors duration-300 text-sm"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/privecy"
                    className="text-[#888] hover:text-white transition-colors duration-300 text-sm"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms"
                    className="text-[#888] hover:text-white transition-colors duration-300 text-sm"
                  >
                    Terms & Conditions
                  </Link>
                </li>
              </ul>
            </div>

            {/* Get in Touch */}
            <div className="lg:col-span-4">
              <h3 className="text-[#D4872D] font-semibold mb-4 text-xs uppercase tracking-widest">
                Get in Touch
              </h3>
              <p className="text-[#888] text-sm mb-4">support@myrvvault.com</p>

              {/* Mini feature highlights */}
              <div className="flex flex-wrap gap-2 mb-5">
                <span className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-xs text-[#888]">
                  <FaTools className="text-[#D4872D] text-[10px]" />
                  Maintenance
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-xs text-[#888]">
                  <FaRoute className="text-[#D4872D] text-[10px]" />
                  Trip Logs
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-xs text-[#888]">
                  <FaClipboardList className="text-[#D4872D] text-[10px]" />
                  Checklists
                </span>
              </div>

              <Link to="/auth/signUp">
                <button className="bg-[#D4872D] text-white rounded-full px-6 py-2.5 text-sm font-medium btn-accent hover:bg-[#B8721F]">
                  Get Started Free
                </button>
              </Link>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/10 mt-10 pt-5 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-[#555] text-xs">
              &copy; {new Date().getFullYear()} My RV Vault. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link
                to="/privecy"
                className="text-[#555] hover:text-[#888] text-xs transition-colors duration-300"
              >
                Privacy
              </Link>
              <Link
                to="/terms"
                className="text-[#555] hover:text-[#888] text-xs transition-colors duration-300"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
