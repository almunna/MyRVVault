import React, { useState, useEffect } from "react";
import { MenuOutlined, CloseOutlined } from "@ant-design/icons";
import { Dropdown, Space, Drawer } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useGetProfileQuery } from "../Pages/redux/api/userApi";
import { FaRegUserCircle } from "react-icons/fa";
import logo from "../assets/Home/hero.png";

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
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { data: profileData } = useGetProfileQuery(undefined, {
    skip: !token,
  });

  const dropdownItemsProfile = [
    {
      label: (
        <Link to="/profilePage" rel="noopener noreferrer">
          Profile
        </Link>
      ),
      key: "profilepage",
    },
  ];

  const items = [
    { key: "newExpense", label: <span>New Expense</span> }, // <Link to="/newExpense">New Expense</Link>
    { key: "newRepair", label: <span>New Repair</span> }, // <Link to="/newRepair">New Repair</Link>
    {
      key: "reports",
      label: <span>Favorite Reports</span>, // <Link to="/favouriteReports">Favorite Reports</Link>
    },
    {
      key: "information",
      label: <Link to="/chassisInfo">Chassis Information</Link>,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setToken(null);
    navigate("/auth/login");
  };

  return (
    <div
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-site mx-auto">
        <nav className="flex justify-between items-center py-4 px-4 lg:px-6 2xl:px-8">
          {/* Left: Logo */}
          <Link to="/" className="flex items-center animate-fadeIn">
            <img src={logo} alt="My RV Vault" className="h-20 2xl:h-24 w-auto" />
          </Link>

          {/* Right: Nav Links + Auth */}
          <div className="flex items-center gap-8">
            <ul className="hidden lg:flex items-center gap-8">
              {items.map((item) => (
                <li
                  key={item.key}
                  className="list-none text-[#5A5A5A] hover:text-[#3B7D3C] transition-colors duration-300 text-[15px] font-medium nav-link-hover"
                >
                  {item.label}
                </li>
              ))}
            </ul>

            <div className="hidden lg:block w-px h-5 bg-[#E0E0E0]"></div>

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
              <div className="hidden lg:flex items-center gap-4">
                <button
                  onClick={handleLogout}
                  className="text-[#5A5A5A] hover:text-[#3B7D3C] font-medium text-[15px] transition-colors duration-300 px-3 py-2"
                >
                  Log Out
                </button>
                <Dropdown
                  menu={{ items: dropdownItemsProfile }}
                  trigger={["click"]}
                >
                  <Link onClick={(e) => e.preventDefault()}>
                    <Space className="cursor-pointer">
                      {profileData?.user?.profilePic ? (
                        <img
                          className="w-[38px] h-[38px] rounded-full object-cover border-2 border-[#E8F0E8]"
                          src={profileData.user.profilePic}
                          alt="profile"
                        />
                      ) : (
                        <div className="w-[38px] h-[38px] rounded-full bg-[#3B7D3C] flex items-center justify-center text-white font-semibold text-sm">
                          {profileData?.user?.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                      )}
                      <div className="text-left">
                        <h1 className="text-[#1A1A1A] text-sm font-medium leading-tight">
                          {profileData?.user?.name || "User"}
                        </h1>
                        <p className="text-[#5A5A5A] text-xs leading-tight">
                          {profileData?.user?.email || "No Email"}
                        </p>
                      </div>
                    </Space>
                  </Link>
                </Dropdown>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              className="lg:hidden text-2xl text-[#1A1A1A]"
              onClick={showDrawer}
            >
              <MenuOutlined />
            </button>
          </div>
          </div>
        </nav>

        {/* Drawer for Mobile */}
        <Drawer
          style={{ backgroundColor: "#FFFFFF" }}
          title={
            <div className="flex items-center">
              <img src={logo} alt="My RV Vault" className="h-16 w-auto" />
            </div>
          }
          placement="right"
          onClose={onClose}
          open={drawerOpen}
          closeIcon={<CloseOutlined className="text-[#1A1A1A]" />}
          width={300}
        >
          <ul className="flex flex-col space-y-1">
            {items.map((item) => (
              <li
                key={item.key}
                className="list-none text-[#5A5A5A] hover:text-[#3B7D3C] hover:bg-[#F5F5F0] transition-all duration-300 px-3 py-3 rounded-lg text-[15px] font-medium"
              >
                {item.label}
              </li>
            ))}
          </ul>

          <div className="border-t border-[#E8F0E8] my-4"></div>

          {token ? (
            <div>
              <Dropdown
                menu={{ items: dropdownItemsProfile }}
                trigger={["click"]}
              >
                <Link onClick={(e) => e.preventDefault()}>
                  <div className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-[#F5F5F0] transition-all duration-300">
                    {profileData?.user?.profilePic ? (
                      <img
                        className="w-[40px] h-[40px] rounded-full object-cover"
                        src={profileData.user.profilePic}
                        alt="profile"
                      />
                    ) : (
                      <div className="w-[40px] h-[40px] rounded-full bg-[#3B7D3C] flex items-center justify-center text-white font-semibold">
                        {profileData?.user?.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                    )}
                    <div>
                      <h1 className="text-[#1A1A1A] text-sm font-medium">
                        {profileData?.user?.name || "User"}
                      </h1>
                      <p className="text-[#5A5A5A] text-xs">
                        {profileData?.user?.email || "No Email"}
                      </p>
                    </div>
                  </div>
                </Link>
              </Dropdown>

              <button
                onClick={handleLogout}
                className="w-full mt-3 border border-[#3B7D3C] text-[#3B7D3C] py-2.5 px-4 rounded-full font-medium btn-animate hover:bg-[#3B7D3C] hover:text-white"
              >
                Log Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Link to={"/auth/login"} state={{ showModal: true }}>
                <button className="w-full border border-[#3B7D3C] text-[#3B7D3C] py-2.5 px-4 rounded-full font-medium btn-animate hover:bg-[#3B7D3C] hover:text-white">
                  Sign in
                </button>
              </Link>
              <Link to={"/auth/signUp"}>
                <button className="w-full bg-[#D4872D] text-white py-2.5 px-4 rounded-full font-medium btn-accent hover:bg-[#B8721F]">
                  Get started
                </button>
              </Link>
            </div>
          )}
        </Drawer>
      </div>
    </div>
  );
};
