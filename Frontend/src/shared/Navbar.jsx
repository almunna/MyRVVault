import React, { useState, useEffect } from "react";
import { MenuOutlined, CloseOutlined, RightOutlined } from "@ant-design/icons";
import { Drawer } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useGetProfileQuery } from "../Pages/redux/api/userApi";
import logo from "../assets/Home/hero.png";

const NavSection = ({ title, items, onClose }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="mb-1">
      <button
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-[#F5F5F0] transition-all duration-200"
        onClick={() => setExpanded((e) => !e)}
      >
        <span className="text-xs font-bold uppercase tracking-widest text-[#D4872D]">{title}</span>
        <RightOutlined
          className={`text-[#D4872D] text-xs transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
        />
      </button>
      {expanded && (
        <ul className="ml-3 mt-1 space-y-0.5 border-l-2 border-[#F9B038]/30 pl-3">
          {items.map(({ label, to }) => (
            <li key={label}>
              <Link
                to={to}
                onClick={onClose}
                className="block px-2 py-2 text-sm text-[#5A5A5A] hover:text-[#3B7D3C] hover:bg-[#F5F5F0] rounded-md transition-all duration-200"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [token, setToken] = useState(null);
  const navigate = useNavigate();

  const showDrawer = () => setDrawerOpen(true);
  const onClose = () => setDrawerOpen(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    setToken(storedToken);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { data: profileData } = useGetProfileQuery(undefined, { skip: !token });

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setToken(null);
    navigate("/auth/login");
  };

  // ── Hamburger menu sections ──────────────────────────────
  const rvManagementItems = [
    { label: "My RV (Full RV Profile)", to: "/myRv" },
    { label: "Chassis Info", to: "/chassisInfo" },
    { label: "Tires", to: "/tire" },
    { label: "Components", to: "/havcApplication" },
    { label: "Recalls", to: "/recalls" },
    { label: "Add Another RV", to: "/addRv" },
    { label: "Sold RV (Archive)", to: "/rvSold" },
  ];

  const vaultItems = [
    { label: "Insurance", to: "/insuranceInfo" },
    { label: "Memberships", to: "/addMembership" },
    { label: "Roadside Assistance", to: "/insuranceInfo" },
    { label: "Warranty Documents", to: "/newRepair" },
    { label: "Registration / Title", to: "/myRv" },
  ];

  const toolsItems = [
    { label: "Reports", to: "/reports" },
    { label: "Checklists", to: "/checklist" },
    { label: "Campground Reviews", to: "/campgroundReview" },
    { label: "Export Data", to: "/reports" },
  ];

  const aboutItems = [
    { label: "Account Settings", to: "/profilePage" },
    { label: "Notifications", to: "/profilePage" },
    { label: "Help & Support", to: "/contactUs" },
    { label: "About My RV Vault (Privacy/TOS)", to: "/aboutUs" },
  ];

  return (
    <div
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/90 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-site mx-auto">
        <nav className="flex justify-between items-center py-4 px-4 lg:px-6 2xl:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center animate-fadeIn">
            <img src={logo} alt="My RV Vault" className="h-20 2xl:h-24 w-auto" />
          </Link>

          {/* Right: Auth + Hamburger */}
          <div className="flex items-center gap-4">
            {!token ? (
              <div className="hidden lg:flex items-center gap-3">
                <Link to={"/auth/login"} state={{ showModal: true }}>
                  <button className="text-[#5A5A5A] hover:text-[#3B7D3C] font-medium text-[15px] transition-colors duration-300 px-3 py-2">
                    Sign in
                  </button>
                </Link>
                <Link to={"/auth/signUp"}>
                  <button className="bg-[#D4872D] text-white py-2 px-6 rounded-full text-[15px] font-medium btn-accent hover:bg-[#B8721F]">
                    Get started
                  </button>
                </Link>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {profileData?.user?.profilePic ? (
                    <img
                      className="w-[36px] h-[36px] rounded-full object-cover border-2 border-[#E8F0E8]"
                      src={profileData.user.profilePic}
                      alt="profile"
                    />
                  ) : (
                    <div className="w-[36px] h-[36px] rounded-full bg-[#3B7D3C] flex items-center justify-center text-white font-semibold text-sm">
                      {profileData?.user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}
                  <span className="text-[#1A1A1A] text-sm font-medium">
                    {profileData?.user?.name || "User"}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-[#5A5A5A] hover:text-[#3B7D3C] font-medium text-[14px] transition-colors duration-300 px-3 py-1.5 border border-[#E0E0E0] rounded-full"
                >
                  Log Out
                </button>
              </div>
            )}

            {/* Hamburger — always visible */}
            <button
              className="text-2xl text-[#1A1A1A] hover:text-[#3B7D3C] transition-colors duration-200 p-1"
              onClick={showDrawer}
              aria-label="Open menu"
            >
              <MenuOutlined />
            </button>
          </div>
        </nav>

        {/* ── Drawer ── */}
        <Drawer
          style={{ backgroundColor: "#FFFFFF" }}
          title={
            <Link to="/" onClick={onClose}>
              <img src={logo} alt="My RV Vault" className="h-16 w-auto" />
            </Link>
          }
          placement="right"
          onClose={onClose}
          open={drawerOpen}
          closeIcon={<CloseOutlined className="text-[#1A1A1A]" />}
          width={320}
        >
          {/* Profile info */}
          {token && (
            <div className="flex items-center gap-3 px-3 py-3 mb-3 bg-[#F5F5F0] rounded-xl">
              {profileData?.user?.profilePic ? (
                <img
                  className="w-[42px] h-[42px] rounded-full object-cover flex-shrink-0"
                  src={profileData.user.profilePic}
                  alt="profile"
                />
              ) : (
                <div className="w-[42px] h-[42px] rounded-full bg-[#3B7D3C] flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {profileData?.user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-[#1A1A1A] text-sm font-semibold truncate">
                  {profileData?.user?.name || "User"}
                </p>
                <p className="text-[#5A5A5A] text-xs truncate">
                  {profileData?.user?.email || ""}
                </p>
              </div>
            </div>
          )}

          {/* Sections */}
          {token ? (
            <>
              <NavSection title="RV Management" items={rvManagementItems} onClose={onClose} />
              <div className="h-px bg-[#E8F0E8] my-2" />
              <NavSection title="Vault" items={vaultItems} onClose={onClose} />
              <div className="h-px bg-[#E8F0E8] my-2" />
              <NavSection title="Tools" items={toolsItems} onClose={onClose} />
              <div className="h-px bg-[#E8F0E8] my-2" />
              <NavSection title="About" items={aboutItems} onClose={onClose} />

              <div className="mt-4 pt-4 border-t border-[#E8F0E8]">
                <button
                  onClick={() => { handleLogout(); onClose(); }}
                  className="w-full border border-[#3B7D3C] text-[#3B7D3C] py-2.5 px-4 rounded-full font-medium hover:bg-[#3B7D3C] hover:text-white transition-all duration-300"
                >
                  Log Out
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Guest: show limited nav + auth buttons */}
              <ul className="space-y-1 mb-4">
                {[
                  { label: "Home", to: "/" },
                  { label: "About Us", to: "/aboutUs" },
                  { label: "Privacy Policy", to: "/privecy" },
                  { label: "Terms & Conditions", to: "/terms" },
                ].map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      onClick={onClose}
                      className="block px-3 py-3 rounded-lg text-[#5A5A5A] hover:text-[#3B7D3C] hover:bg-[#F5F5F0] transition-all duration-200 text-sm font-medium"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="border-t border-[#E8F0E8] pt-4 flex flex-col gap-3">
                <Link to={"/auth/login"} state={{ showModal: true }} onClick={onClose}>
                  <button className="w-full border border-[#3B7D3C] text-[#3B7D3C] py-2.5 px-4 rounded-full font-medium hover:bg-[#3B7D3C] hover:text-white transition-all duration-300">
                    Sign in
                  </button>
                </Link>
                <Link to={"/auth/signUp"} onClick={onClose}>
                  <button className="w-full bg-[#D4872D] text-white py-2.5 px-4 rounded-full font-medium hover:bg-[#B8721F] transition-all duration-300">
                    Get started
                  </button>
                </Link>
              </div>
            </>
          )}
        </Drawer>
      </div>
    </div>
  );
};
