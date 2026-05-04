import React, { useState, useEffect } from "react";
import { MenuOutlined, CloseOutlined, RightOutlined, DownOutlined } from "@ant-design/icons";
import { Drawer, Dropdown } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useGetProfileQuery } from "../Pages/redux/api/userApi";
import logo from "../assets/Home/hero.png";
import NotificationBell from "../components/notifications/NotificationBell";

// ── Hamburger drawer section (small screens) ─────────────────────────────────
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

// ── Desktop dropdown ──────────────────────────────────────────────────────────
const NavDropdown = ({ label, items }) => {
  const menuItems = items.map(({ label: itemLabel, to }) => ({
    key: to,
    label: (
      <Link
        to={to}
        className="block px-1 py-0.5 text-sm text-[#5A5A5A] hover:text-[#3B7D3C] transition-colors duration-200"
      >
        {itemLabel}
      </Link>
    ),
  }));

  return (
    <Dropdown menu={{ items: menuItems }} trigger={["hover"]} placement="bottomLeft">
      <button className="flex items-center gap-1.5 px-3 py-2 text-[#1A1A1A] hover:text-[#3B7D3C] font-medium text-sm transition-colors duration-200 rounded-lg hover:bg-[#F5F5F0] group">
        {label}
        <svg
          className="w-3.5 h-3.5 text-[#D4872D] group-hover:text-[#3B7D3C] transition-colors duration-200 mt-px"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
    </Dropdown>
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

  const { data: profileData, error: profileError } = useGetProfileQuery(undefined, { skip: !token });

  // If the stored token is rejected by the server (expired/invalid), clear it
  useEffect(() => {
    if (profileError?.status === 401) {
      localStorage.removeItem('accessToken');
      setToken(null);
    }
  }, [profileError]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setToken(null);
    navigate("/auth/login");
  };

  // ── Nav sections (shared between desktop dropdowns and hamburger drawer) ──
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
    { label: "Repair Orders", to: "/repairOrders" },
    { label: "Roadside Assistance", to: "/insuranceInfo" },
    { label: "Warranty Documents", to: "/repairOrders" },
    { label: "Registration / Title", to: "/myRv" },
  ];

  const toolsItems = [
    { label: "Smart Suggestions", to: "/smartSuggestions" },
    { label: "Reports", to: "/reports" },
    { label: "Checklists", to: "/checklist" },
    { label: "Campground Reviews", to: "/campgroundReview" },
    { label: "Fuel Log", to: "/fuelList" },
    { label: "Generator Hours", to: "/generatorLog" },
    { label: "Export Data", to: "/reports" },
  ];

  const aboutItems = [
    { label: "Account Settings", to: "/profilePage" },
    { label: "Notifications", to: "/profilePage" },
    { label: "Help & Support", to: "/contactUs" },
    { label: "About My RV Vault (Privacy/TOS)", to: "/aboutUs" },
  ];

  const guestLinks = [
    { label: "Home", to: "/" },
    { label: "About Us", to: "/aboutUs" },
    { label: "Privacy Policy", to: "/privecy" },
    { label: "Terms & Conditions", to: "/terms" },
  ];

  return (
    <div className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm print:hidden">
      <div className="max-w-site mx-auto px-4 lg:px-6 2xl:px-8">
        <nav className="flex items-center justify-between h-24">

          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <img src={logo} alt="My RV Vault" className="h-20 2xl:h-24 w-auto" />
          </Link>

          {/* ── Desktop / Tablet Nav (md and above) ── */}
          <div className="hidden md:flex items-center gap-0.5">
            {token ? (
              <>
                <NavDropdown label="RV Management" items={rvManagementItems} />
                <NavDropdown label="Vault" items={vaultItems} />
                <NavDropdown label="Tools" items={toolsItems} />
                <NavDropdown label="About" items={aboutItems} />
              </>
            ) : (
              guestLinks.map(({ label, to }) => (
                <Link
                  key={label}
                  to={to}
                  className="px-3 py-2 text-sm text-[#5A5A5A] hover:text-[#3B7D3C] font-medium rounded-lg hover:bg-[#F5F5F0] transition-all duration-200"
                >
                  {label}
                </Link>
              ))
            )}
          </div>

          {/* ── Right: Auth + Hamburger ── */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {!token ? (
              <div className="hidden md:flex items-center gap-2">
                <Link to={"/auth/login"} state={{ showModal: true }}>
                  <button className="text-[#5A5A5A] hover:text-[#3B7D3C] font-medium text-sm transition-colors duration-300 px-4 py-2 rounded-full hover:bg-[#F5F5F0]">
                    Sign in
                  </button>
                </Link>
                <Link to={"/auth/signUp"}>
                  <button className="bg-[#D4872D] text-white py-2 px-5 rounded-full text-sm font-medium hover:bg-[#B8721F] transition-colors duration-300">
                    Get started
                  </button>
                </Link>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <NotificationBell />
                <Link to="/profilePage" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
                  {profileData?.user?.profilePic ? (
                    <img
                      className="w-9 h-9 rounded-full object-cover border-2 border-[#E8F0E8]"
                      src={profileData.user.profilePic}
                      alt="profile"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#3B7D3C] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                      {profileData?.user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}
                  <span className="text-[#1A1A1A] text-sm font-medium max-w-[140px] truncate">
                    {profileData?.user?.name || "User"}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-[#5A5A5A] hover:text-[#3B7D3C] font-medium text-sm transition-colors duration-300 px-4 py-1.5 border border-[#E0E0E0] rounded-full hover:border-[#3B7D3C]"
                >
                  Log Out
                </button>
              </div>
            )}

            {/* Hamburger — small screens only */}
            <button
              className="md:hidden text-xl text-[#1A1A1A] hover:text-[#3B7D3C] transition-colors duration-200 p-2 rounded-lg hover:bg-[#F5F5F0]"
              onClick={showDrawer}
              aria-label="Open menu"
            >
              <MenuOutlined />
            </button>
          </div>
        </nav>

        {/* ── Drawer (small screens only) ── */}
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
              <ul className="space-y-1 mb-4">
                {guestLinks.map(({ label, to }) => (
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
