import React, { useState, useEffect, useRef } from "react";
import hero from "../../assets/Home/hero.png";
import rvRoad from "../../assets/Home/rv.png";
import rvCamp from "../../assets/Home/car.png";
import { Dropdown, Form, Input, message, Modal, Space, Drawer } from "antd";
import { Link } from "react-router-dom";
import { useGetProfileQuery, useUpdateProfileMutation } from "../../Pages/redux/api/userApi";
import {
  useDeleteRvMutation,
  useUpdateMileagoMutation,
  useUpdateSelectRvMutation,
  useGetMaintanceAllQuery,
} from "../../Pages/redux/api/routesApi";
import { DeleteOutlined, CameraOutlined, CloseOutlined } from "@ant-design/icons";
import {
  FaRoute,
  FaTools,
  FaClipboardList,
  FaShieldAlt,
  FaWrench,
  FaCalendarAlt,
} from "react-icons/fa";

const Hero = () => {
  const { data: profileData } = useGetProfileQuery();
  const [updateProfile] = useUpdateProfileMutation();
  const [openAddModal, setOpenAddModal] = useState(false);
  const [selectedRv, setSelectedRv] = useState(null);
  const [updateMileago] = useUpdateMileagoMutation();
  const [updateSelectRv] = useUpdateSelectRvMutation();
  const [token, setToken] = useState(null);
  const [deleteRv] = useDeleteRvMutation();
  const [form] = Form.useForm();
  const [selectedMaintItem, setSelectedMaintItem] = useState(null);
  const [maintDrawerOpen, setMaintDrawerOpen] = useState(false);
  const picInputRef = useRef(null);

  const { data: maintData } = useGetMaintanceAllQuery(undefined, { skip: !token });

  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    setToken(storedToken);
  }, []);

  useEffect(() => {
    if (profileData?.user?.selectedRvId) {
      setSelectedRv(profileData.user.selectedRvId);
    }
  }, [profileData]);

  const rv = profileData?.user?.selectedRvId;

  const statusColor = rv?.isOverdueForMaintenance
    ? "bg-red-400"
    : rv?.isUpcomingMaintenance
    ? "bg-orange-400"
    : "bg-green-400";

  const statusLabel = rv?.isOverdueForMaintenance
    ? "Overdue"
    : rv?.isUpcomingMaintenance
    ? "Upcoming"
    : "All Good";

  // Safely extract maintenance array regardless of response shape
  const maintArray = Array.isArray(maintData)
    ? maintData
    : Array.isArray(maintData?.data)
    ? maintData.data
    : [];

  // Get upcoming maintenance items (max 3)
  const upcomingItems = maintArray
    .filter((item) => item.status !== "completed")
    .slice(0, 3);

  const hasMoreThan3 =
    maintArray.filter((item) => item.status !== "completed").length > 3;

  const handleDelete = async (id) => {
    try {
      await deleteRv(id).unwrap();
      message.success("Delete successful");
    } catch (err) {
      message.error(err?.data?.message);
    }
  };

  const dropdownItemsProfile =
    profileData?.user?.rvIds?.map((rv) => ({
      key: rv._id,
      label: (
        <div className="flex justify-between items-center w-[300px] p-2 border border-[#E8F0E8] rounded-lg">
          <span className="text-[#1A1A1A]">{rv.nickname}</span>
          {rv?.isSold === true && (
            <span className="text-red-500 bg-red-100 px-2 rounded">Sold</span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(rv._id);
            }}
            className="text-red-500 hover:text-red-700"
          >
            <DeleteOutlined />
          </button>
        </div>
      ),
      onClick: () => handleSelectRv(rv),
    })) || [];

  const handleSelectRv = async (rv) => {
    try {
      setSelectedRv(rv);
      await updateSelectRv({ rvId: rv._id }).unwrap();
      message.success("RV switched successfully");
    } catch (error) {
      console.error("Error updating selected RV:", error);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const data = { currentMileage: Number(values.currentMileage) };
      await updateMileago({ data, id: selectedRv._id }).unwrap();
      message.success("Mileage updated");
      setOpenAddModal(false);
      form.resetFields();
    } catch (error) {
      console.error("Error updating mileage:", error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setOpenAddModal(false);
  };

  // Profile picture upload
  const handlePicChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("profilePic", file);
    try {
      await updateProfile(formData).unwrap();
      message.success("Profile picture updated");
    } catch (err) {
      message.error("Failed to update picture");
    }
  };

  const handleMaintItemClick = (item) => {
    setSelectedMaintItem(item);
    setMaintDrawerOpen(true);
  };

  const features = [
    { icon: <FaTools />, label: "Maintenance" },
    { icon: <FaRoute />, label: "Trip Logs" },
    { icon: <FaClipboardList />, label: "Checklists" },
    { icon: <FaShieldAlt />, label: "Insurance" },
  ];

  return (
    <>
      {/* ── Hero Section ── */}
      <div className="relative overflow-hidden pt-6 pb-14 md:pt-10 md:pb-20">
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <h1 className="text-[14vw] font-bold text-[#3B7D3C]/[0.03] whitespace-nowrap leading-none tracking-tight animate-float">
            My RV Vault
          </h1>
        </div>

        <div className="relative z-10 max-w-site mx-auto px-4 lg:px-6 2xl:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">

            {/* ── LEFT: Welcome / Hero Text ── */}
            <div className="text-center lg:text-left">

              {/* Logged-in welcome (two lines: Welcome, / Name) */}
              {token && profileData?.user?.name ? (
                <div className="mb-4 animate-fadeIn">
                  <p className="text-[#3B7D3C] font-semibold text-2xl md:text-3xl leading-tight">
                    Welcome,
                  </p>
                  <p className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1A1A1A] leading-tight">
                    {profileData.user.name}
                  </p>
                </div>
              ) : (
                <h1 className="text-4xl md:text-5xl lg:text-6xl 2xl:text-7xl font-bold text-[#1A1A1A] leading-[1.1] animate-fadeInUp">
                  Your RV Life,
                  <br />
                  <span className="text-[#D4872D]">Simplified</span>
                </h1>
              )}

              {!token && (
                <p className="text-[#5A5A5A] text-base md:text-lg 2xl:text-xl mt-5 max-w-lg 2xl:max-w-xl mx-auto lg:mx-0 leading-relaxed animate-fadeInUp animate-delay-100">
                  Track maintenance, manage repairs, log expenses, and keep
                  everything organized — all in one place.
                </p>
              )}

              {/* RV Selector for logged-in users */}
              {token && (
                <div className="flex flex-wrap items-center gap-3 mt-3 mb-5 animate-fadeInUp">
                  <span className="text-[#5A5A5A] font-medium text-base">
                    {selectedRv?.nickname || "No RV Selected"}
                  </span>
                  <Dropdown menu={{ items: dropdownItemsProfile }} trigger={["click"]}>
                    <Link onClick={(e) => e.preventDefault()}>
                      <button className="bg-[#E8F0E8] text-[#3B7D3C] px-4 py-1.5 rounded-full text-sm font-medium hover:bg-[#3B7D3C] hover:text-white transition-all duration-300">
                        Switch RV
                      </button>
                    </Link>
                  </Dropdown>
                </div>
              )}

              {/* Logged-in: Mileage + Maintenance + Upcoming list — above buttons */}
              {token && (
                <div className="flex flex-col gap-3 mt-4 animate-fadeInUp animate-delay-150">
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      className="bg-[#F5F5F0] rounded-xl p-4 cursor-pointer hover:shadow-md transition-all duration-300"
                      onClick={() => selectedRv && setOpenAddModal(true)}
                    >
                      <p className="text-[#5A5A5A] text-xs font-medium">Current Mileage</p>
                      <p className="text-xl font-bold text-[#D4872D] mt-1">
                        {selectedRv?.currentMileage
                          ? `${Number(selectedRv.currentMileage).toLocaleString()} mi`
                          : "N/A"}
                      </p>
                      <p className="text-[#5A5A5A] text-xs mt-1">Click to update</p>
                    </div>
                    <Link to="/maintenanceOverdue">
                      <div className="bg-[#F5F5F0] rounded-xl p-4 hover:shadow-md transition-all duration-300 h-full">
                        <p className="text-[#5A5A5A] text-xs font-medium">Maintenance Status</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${statusColor}`}></div>
                          <p className="text-base font-semibold text-[#1A1A1A]">{statusLabel}</p>
                        </div>
                        {upcomingItems[0] ? (
                          <p className="text-[#5A5A5A] text-xs mt-1 truncate">
                            Next:{" "}
                            <span className="text-[#1A1A1A] font-medium">
                              {upcomingItems[0].component || upcomingItems[0].maintenanceToBePerformed || "Service"}
                            </span>
                            {upcomingItems[0].daysUntilDue
                              ? ` in ${upcomingItems[0].daysUntilDue} days`
                              : upcomingItems[0].nextMaintenanceMileage
                              ? ` at ${Number(upcomingItems[0].nextMaintenanceMileage).toLocaleString()} mi`
                              : upcomingItems[0].nextMaintenanceDate
                              ? ` on ${new Date(upcomingItems[0].nextMaintenanceDate).toLocaleDateString()}`
                              : ""}
                          </p>
                        ) : (
                          <p className="text-[#5A5A5A] text-xs mt-1">View details</p>
                        )}
                      </div>
                    </Link>
                  </div>

                  {upcomingItems.length > 0 && (
                    <div className="bg-white rounded-xl border border-[#E8F0E8] p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold text-[#1A1A1A] flex items-center gap-2">
                          <FaCalendarAlt className="text-[#D4872D]" />
                          Upcoming Maintenance
                        </p>
                        {hasMoreThan3 && (
                          <Link to="/newMaintenance" className="text-xs text-[#3B7D3C] font-medium hover:underline">
                            View All
                          </Link>
                        )}
                      </div>
                      <ul className="space-y-2">
                        {upcomingItems.map((item, i) => (
                          <li
                            key={item._id || i}
                            className="flex items-center justify-between p-2.5 rounded-lg bg-[#F5F5F0] hover:bg-[#E8F0E8] cursor-pointer transition-colors duration-200"
                            onClick={() => handleMaintItemClick(item)}
                          >
                            <div className="flex items-center gap-2">
                              <FaWrench className="text-[#D4872D] text-xs flex-shrink-0" />
                              <span className="text-sm text-[#1A1A1A] font-medium">
                                {item.component || item.maintenanceToBePerformed || "Service"}
                              </span>
                            </div>
                            <span className="text-xs text-[#5A5A5A] whitespace-nowrap ml-2">
                              {item.daysUntilDue
                                ? `Due in ${item.daysUntilDue} days`
                                : item.nextMaintenanceDate
                                ? new Date(item.nextMaintenanceDate).toLocaleDateString()
                                : item.nextMaintenanceMileage
                                ? `Due at ${Number(item.nextMaintenanceMileage).toLocaleString()} mi`
                                : ""}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3 mt-4 animate-fadeInUp animate-delay-200">
                {!token ? (
                  <>
                    <Link to="/auth/signUp">
                      <button className="bg-[#D4872D] text-white py-3 px-8 rounded-full text-base font-medium btn-accent hover:bg-[#B8721F]">
                        Start Your Journey
                      </button>
                    </Link>
                    <Link to="/auth/login">
                      <button className="text-[#5A5A5A] hover:text-[#3B7D3C] py-3 px-6 rounded-full text-base font-medium transition-colors duration-300 border border-[#E0E0E0] hover:border-[#3B7D3C]">
                        Sign in
                      </button>
                    </Link>
                  </>
                ) : (
                  <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                    <Link to="/addNewRepair">
                      <button className="bg-[#D4872D] text-white py-3 px-6 rounded-lg text-sm font-semibold hover:bg-[#B8721F] transition-colors duration-300 shadow-sm">
                        New Repair
                      </button>
                    </Link>
                    <Link to="/checklist">
                      <button className="bg-[#c4a265] text-white py-3 px-6 rounded-lg text-sm font-semibold hover:bg-[#a8884f] transition-colors duration-300 shadow-sm">
                        Checklists
                      </button>
                    </Link>
                    <Link to="/AddNewMaintanceSchedule">
                      <button className="bg-[#D4872D] text-white py-3 px-6 rounded-lg text-sm font-semibold hover:bg-[#B8721F] transition-colors duration-300 shadow-sm">
                        New Maintenance
                      </button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Feature Pills — always visible */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mt-6 animate-fadeInUp animate-delay-300">
                {features.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 bg-white border border-[#E8F0E8] rounded-full px-4 py-2 text-sm text-[#5A5A5A] hover:border-[#3B7D3C] hover:text-[#3B7D3C] transition-all duration-300 cursor-default"
                  >
                    <span className="text-[#3B7D3C]">{f.icon}</span>
                    {f.label}
                  </div>
                ))}
              </div>

              {/* App Store Badges */}
              <div className="flex items-center justify-center lg:justify-start gap-3 mt-6 animate-fadeInUp animate-delay-400">
                <div className="bg-[#1A1A1A] text-white rounded-lg px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-black transition-colors duration-300">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                  </svg>
                  <div className="text-left">
                    <p className="text-[8px] leading-tight opacity-70">GET IT ON</p>
                    <p className="text-xs font-semibold leading-tight">Google Play</p>
                  </div>
                </div>
                <div className="bg-[#1A1A1A] text-white rounded-lg px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-black transition-colors duration-300">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71,19.5C17.88,20.5 17,21.4 15.66,21.41C14.32,21.42 13.87,20.6 12.37,20.6C10.87,20.6 10.37,21.37 9.1,21.42C7.79,21.47 6.8,20.45 5.96,19.46C4.25,17.42 2.94,13.84 4.7,11.37C5.57,10.14 6.9,9.38 8.32,9.36C9.61,9.34 10.82,10.24 11.58,10.24C12.34,10.24 13.82,9.16 15.38,9.31C16.06,9.34 17.63,9.6 18.62,11.05C18.53,11.1 16.57,12.25 16.59,14.67C16.62,17.55 19.12,18.5 19.15,18.51C19.12,18.56 18.79,19.68 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z" />
                  </svg>
                  <div className="text-left">
                    <p className="text-[8px] leading-tight opacity-70">Download on the</p>
                    <p className="text-xs font-semibold leading-tight">App Store</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── RIGHT: Image Collage ── */}
            {token ? (
              <div className="relative hidden lg:flex flex-col animate-slideInRight">
                <div className="relative">
                  {/* Main changeable image */}
                  <div
                    className="relative group w-full h-[380px] 2xl:h-[440px] rounded-3xl overflow-hidden shadow-xl cursor-pointer"
                    onClick={() => picInputRef.current?.click()}
                  >
                    <img
                      src={profileData?.user?.profilePic || rvRoad}
                      alt="Your RV"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center rounded-3xl">
                      <CameraOutlined className="text-white text-3xl mb-1" />
                      <span className="text-white text-sm font-medium">Change Photo</span>
                    </div>
                  </div>

                  {/* Fixed small overlay — bottom-left */}
                  <div className="absolute -bottom-8 -left-8 w-[200px] h-[200px] 2xl:w-[240px] 2xl:h-[240px] rounded-2xl overflow-hidden shadow-xl border-4 border-[#F5F5F0] animate-fadeInUp animate-delay-300">
                    <img src={rvCamp} alt="RV camping" className="w-full h-full object-cover" />
                  </div>

                  {/* Trusted by badge — top-right */}
                  <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-lg p-4 animate-fadeInUp animate-delay-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#E8F0E8] rounded-full flex items-center justify-center">
                        <FaTools className="text-[#3B7D3C]" />
                      </div>
                      <div>
                        <p className="text-xs text-[#5A5A5A]">Trusted by</p>
                        <p className="text-lg font-bold text-[#1A1A1A]">10K+ RV Owners</p>
                      </div>
                    </div>
                  </div>

                  {/* All-in-One Hub pill — bottom-right */}
                  <div className="absolute bottom-4 right-6 bg-[#D4872D] text-white rounded-full px-4 py-2 shadow-lg text-sm font-medium animate-scaleIn animate-delay-400">
                    All-in-One Hub
                  </div>
                </div>
                <input
                  ref={picInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePicChange}
                />
              </div>
            ) : (
              /* Guest: Image Collage */
              <div className="relative hidden lg:block animate-slideInRight">
                <div className="relative">
                  <img
                    src={rvRoad}
                    alt="RV on the road"
                    className="w-full h-[380px] 2xl:h-[440px] object-cover rounded-3xl shadow-xl"
                  />
                  <div className="absolute -bottom-8 -left-8 w-[200px] h-[200px] 2xl:w-[240px] 2xl:h-[240px] rounded-2xl overflow-hidden shadow-xl border-4 border-[#F5F5F0] animate-fadeInUp animate-delay-300">
                    <img src={rvCamp} alt="RV camping" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-lg p-4 animate-fadeInUp animate-delay-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#E8F0E8] rounded-full flex items-center justify-center">
                        <FaTools className="text-[#3B7D3C]" />
                      </div>
                      <div>
                        <p className="text-xs text-[#5A5A5A]">Trusted by</p>
                        <p className="text-lg font-bold text-[#1A1A1A]">10K+ RV Owners</p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-4 right-6 bg-[#D4872D] text-white rounded-full px-4 py-2 shadow-lg text-sm font-medium animate-scaleIn animate-delay-400">
                    All-in-One Hub
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats Strip ── */}
      <div className="bg-[#3B7D3C] py-6">
        <div className="max-w-site mx-auto px-4 lg:px-6 2xl:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
            <div><p className="text-2xl md:text-3xl font-bold text-[#F0A84D]">10K+</p><p className="text-white/70 text-sm mt-1">RV Owners</p></div>
            <div><p className="text-2xl md:text-3xl font-bold text-[#F0A84D]">50K+</p><p className="text-white/70 text-sm mt-1">Maintenance Logs</p></div>
            <div><p className="text-2xl md:text-3xl font-bold text-[#F0A84D]">25K+</p><p className="text-white/70 text-sm mt-1">Trips Tracked</p></div>
            <div><p className="text-2xl md:text-3xl font-bold text-[#F0A84D]">4.8</p><p className="text-white/70 text-sm mt-1">User Rating</p></div>
          </div>
        </div>
      </div>

      {/* ── Non-logged-in section title ── */}
      {!token && (
        <div className="text-center py-14 max-w-site mx-auto px-4 lg:px-6 2xl:px-8 animate-fadeInUp">
          <h2 className="text-3xl md:text-4xl 2xl:text-5xl font-bold text-[#1A1A1A]">
            Everything You Need to Manage Your{" "}
            <span className="text-[#D4872D]">Trips</span>
          </h2>
          <p className="text-[#5A5A5A] mt-3 text-lg max-w-2xl mx-auto">
            Effortlessly document all your journeys, from weekend getaways to
            epic adventures across the country.
          </p>
        </div>
      )}

      {/* ── Mileage Modal ── */}
      <Modal centered open={openAddModal} onCancel={handleCancel} footer={null} width={450}>
        <h2 className="text-center font-bold text-xl mb-6 text-[#1A1A1A]">Update Mileage</h2>
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            label={<span className="text-[#5A5A5A] font-medium">Enter current mileage</span>}
            name="currentMileage"
            rules={[{ required: true, message: "Please input current mileage!" }]}
          >
            <Input
              className="w-full bg-[#F5F5F0] border border-[#E8F0E8] text-[#1A1A1A] py-3 rounded-lg"
              placeholder="Enter current mileage"
              defaultValue={selectedRv?.currentMileage}
              type="number"
            />
          </Form.Item>
          <Form.Item className="pt-2 mb-0">
            <button
              type="submit"
              className="w-full bg-[#3B7D3C] text-white py-3 rounded-full hover:bg-[#2D5F2D] font-medium"
            >
              Save Mileage
            </button>
          </Form.Item>
        </Form>
      </Modal>

      {/* ── Maintenance Item Slide-up Drawer ── */}
      <Drawer
        placement="bottom"
        open={maintDrawerOpen}
        onClose={() => setMaintDrawerOpen(false)}
        height="auto"
        closeIcon={<CloseOutlined />}
        title={
          <span className="font-semibold text-[#1A1A1A]">
            {selectedMaintItem?.component || selectedMaintItem?.maintenanceToBePerformed || "Maintenance Details"}
          </span>
        }
        styles={{ body: { paddingBottom: 24 } }}
      >
        {selectedMaintItem && (
          <div className="space-y-3 max-w-lg mx-auto">
            {selectedMaintItem.component && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-[#5A5A5A] text-sm">Component</span>
                <span className="font-medium text-sm text-[#1A1A1A]">{selectedMaintItem.component}</span>
              </div>
            )}
            {selectedMaintItem.maintenanceToBePerformed && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-[#5A5A5A] text-sm">Service</span>
                <span className="font-medium text-sm text-[#1A1A1A]">{selectedMaintItem.maintenanceToBePerformed}</span>
              </div>
            )}
            {selectedMaintItem.status && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-[#5A5A5A] text-sm">Status</span>
                <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${
                  selectedMaintItem.status === "overdue" ? "bg-red-100 text-red-600" :
                  selectedMaintItem.status === "upcoming" ? "bg-orange-100 text-orange-600" :
                  "bg-green-100 text-green-600"
                }`}>{selectedMaintItem.status}</span>
              </div>
            )}
            {selectedMaintItem.nextMaintenanceDate && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-[#5A5A5A] text-sm">Next Service Date</span>
                <span className="font-medium text-sm text-[#1A1A1A]">
                  {new Date(selectedMaintItem.nextMaintenanceDate).toLocaleDateString()}
                </span>
              </div>
            )}
            {selectedMaintItem.daysUntilDue && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-[#5A5A5A] text-sm">Days Until Due</span>
                <span className="font-medium text-sm text-[#D4872D]">{selectedMaintItem.daysUntilDue} days</span>
              </div>
            )}
            {selectedMaintItem.nextMaintenanceMileage && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-[#5A5A5A] text-sm">Due at Mileage</span>
                <span className="font-medium text-sm text-[#1A1A1A]">
                  {Number(selectedMaintItem.nextMaintenanceMileage).toLocaleString()} mi
                </span>
              </div>
            )}
            {selectedMaintItem.notes && (
              <div className="py-2">
                <span className="text-[#5A5A5A] text-sm block mb-1">Notes</span>
                <p className="text-sm text-[#1A1A1A]">{selectedMaintItem.notes}</p>
              </div>
            )}
            <Link to={`/UpdateMaintanceSchedule/${selectedMaintItem._id}`}>
              <button className="w-full mt-2 bg-[#D4872D] text-white py-3 rounded-full font-medium hover:bg-[#B8721F]">
                View Full Details
              </button>
            </Link>
          </div>
        )}
      </Drawer>
    </>
  );
};

export default Hero;
