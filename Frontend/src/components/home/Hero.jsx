import React, { useState, useEffect } from "react";
import hero from "../../assets/Home/hero.png";
import rvRoad from "../../assets/Home/rv.png";
import rvCamp from "../../assets/Home/car.png";
import { Dropdown, Form, Input, message, Modal, Space } from "antd";
import { Link } from "react-router-dom";
import { useGetProfileQuery } from "../../Pages/redux/api/userApi";
import {
  useDeleteRvMutation,
  useUpdateMileagoMutation,
  useUpdateSelectRvMutation,
} from "../../Pages/redux/api/routesApi";
import { DeleteOutlined } from "@ant-design/icons";
import {
  FaRoute,
  FaTools,
  FaClipboardList,
  FaShieldAlt,
} from "react-icons/fa";

const Hero = () => {
  const { data: profileData } = useGetProfileQuery();
  const [openAddModal, setOpenAddModal] = useState(false);
  const [selectedRv, setSelectedRv] = useState(null);
  const [updateMileago] = useUpdateMileagoMutation();
  const [updateSelectRv] = useUpdateSelectRvMutation();
  const [token, setToken] = useState(null);
  const [deleteRv] = useDeleteRvMutation();
  const [form] = Form.useForm();

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

  const handleDelete = async (id) => {
    try {
      const res = await deleteRv(id).unwrap();
      message.success("delete Successfull");
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
      message.success("Update successfull");
    } catch (error) {
      console.error("Error updating selected RV:", error);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const data = {
        currentMileage: Number(values.currentMileage),
      };
      await updateMileago({ data, id: selectedRv._id }).unwrap();
      message.success("Update successfull");
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

  const features = [
    { icon: <FaTools />, label: "Maintenance" },
    { icon: <FaRoute />, label: "Trip Logs" },
    { icon: <FaClipboardList />, label: "Checklists" },
    { icon: <FaShieldAlt />, label: "Insurance" },
  ];

  return (
    <>
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-6 pb-14 md:pt-10 md:pb-20">
        {/* Watermark Background Text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <h1 className="text-[14vw] font-bold text-[#3B7D3C]/[0.03] whitespace-nowrap leading-none tracking-tight animate-float">
            My RV Vault
          </h1>
        </div>

        <div className="relative z-10 max-w-site mx-auto px-4 lg:px-6 2xl:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left: Text Content */}
            <div className="text-center lg:text-left">
              {token && profileData?.user?.name && (
                <p className="inline-block text-[#3B7D3C] font-medium text-sm mb-4 bg-[#E8F0E8] px-4 py-1.5 rounded-full animate-fadeIn">
                  Welcome back, {profileData.user.name}
                </p>
              )}

              <h1 className="text-4xl md:text-5xl lg:text-6xl 2xl:text-7xl font-bold text-[#1A1A1A] leading-[1.1] animate-fadeInUp">
                Your RV Life,
                <br />
                <span className="text-[#D4872D]">Simplified</span>
              </h1>

              <p className="text-[#5A5A5A] text-base md:text-lg 2xl:text-xl mt-5 max-w-lg 2xl:max-w-xl mx-auto lg:mx-0 leading-relaxed animate-fadeInUp animate-delay-100">
                Track maintenance, manage repairs, log expenses, and keep
                everything organized — all in one place.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3 mt-8 animate-fadeInUp animate-delay-200">
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
                  <>
                    <Link to="/addRv">
                      <button className="bg-[#D4872D] text-white py-3 px-8 rounded-full text-base font-medium btn-accent hover:bg-[#B8721F]">
                        Add New RV
                      </button>
                    </Link>
                    <Link to="/newMaintenance">
                      <button className="text-[#5A5A5A] hover:text-[#3B7D3C] py-3 px-6 rounded-full text-base font-medium transition-colors duration-300 border border-[#E0E0E0] hover:border-[#3B7D3C]">
                        New Maintenance
                      </button>
                    </Link>
                  </>
                )}
              </div>

              {/* Feature Pills */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mt-8 animate-fadeInUp animate-delay-300">
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
              <div className="flex items-center justify-center lg:justify-start gap-3 mt-8 animate-fadeInUp animate-delay-400">
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

            {/* Right: Image Collage */}
            <div className="relative hidden lg:block animate-slideInRight">
              {/* Main Image */}
              <div className="relative">
                <img
                  src={rvRoad}
                  alt="RV on the road"
                  className="w-full h-[380px] 2xl:h-[440px] object-cover rounded-3xl shadow-xl"
                />
                {/* Overlay small image */}
                <div className="absolute -bottom-8 -left-8 w-[200px] h-[200px] 2xl:w-[240px] 2xl:h-[240px] rounded-2xl overflow-hidden shadow-xl border-4 border-[#F5F5F0] animate-fadeInUp animate-delay-300">
                  <img
                    src={rvCamp}
                    alt="RV camping"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Floating stat card */}
                <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-lg p-4 animate-fadeInUp animate-delay-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#E8F0E8] rounded-full flex items-center justify-center">
                      <FaTools className="text-[#3B7D3C]" />
                    </div>
                    <div>
                      <p className="text-xs text-[#5A5A5A]">Trusted by</p>
                      <p className="text-lg font-bold text-[#1A1A1A]">
                        10K+ RV Owners
                      </p>
                    </div>
                  </div>
                </div>

                {/* Floating badge */}
                <div className="absolute bottom-4 right-6 bg-[#D4872D] text-white rounded-full px-4 py-2 shadow-lg text-sm font-medium animate-scaleIn animate-delay-400">
                  All-in-One Hub
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="bg-[#3B7D3C] py-6">
        <div className="max-w-site mx-auto px-4 lg:px-6 2xl:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
            <div className="animate-fadeInUp">
              <p className="text-2xl md:text-3xl 2xl:text-4xl font-bold text-[#F0A84D]">10K+</p>
              <p className="text-white/70 text-sm mt-1">RV Owners</p>
            </div>
            <div className="animate-fadeInUp animate-delay-100">
              <p className="text-2xl md:text-3xl 2xl:text-4xl font-bold text-[#F0A84D]">50K+</p>
              <p className="text-white/70 text-sm mt-1">Maintenance Logs</p>
            </div>
            <div className="animate-fadeInUp animate-delay-200">
              <p className="text-2xl md:text-3xl 2xl:text-4xl font-bold text-[#F0A84D]">25K+</p>
              <p className="text-white/70 text-sm mt-1">Trips Tracked</p>
            </div>
            <div className="animate-fadeInUp animate-delay-300">
              <p className="text-2xl md:text-3xl 2xl:text-4xl font-bold text-[#F0A84D]">4.8</p>
              <p className="text-white/70 text-sm mt-1">User Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* RV Dashboard Section - For logged-in users */}
      {token && (
        <div className="max-w-site mx-auto px-4 lg:px-6 2xl:px-8 py-14">
          <div className="text-center mb-8 animate-fadeInUp">
            <h2 className="text-3xl md:text-4xl 2xl:text-5xl font-bold text-[#1A1A1A]">
              Everything You Need to Manage Your{" "}
              <span className="text-[#D4872D]">RV</span>
            </h2>
            <p className="text-[#5A5A5A] mt-3 text-lg">
              Effortlessly manage all your RV needs, from maintenance tracking
              to expense logging and beyond.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-[#E8F0E8] p-6 md:p-8 animate-fadeInUp animate-delay-200">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-full md:w-1/3">
                <img
                  className="w-full h-[200px] object-cover rounded-xl"
                  src={hero}
                  alt="Your RV"
                />
              </div>

              <div className="flex-1 w-full">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <h3 className="text-2xl font-bold text-[#1A1A1A]">
                    {selectedRv?.nickname || "No RV Selected"}
                  </h3>
                  <Dropdown
                    menu={{ items: dropdownItemsProfile }}
                    trigger={["click"]}
                  >
                    <Link onClick={(e) => e.preventDefault()}>
                      <button className="bg-[#E8F0E8] text-[#3B7D3C] px-4 py-1.5 rounded-full text-sm font-medium hover:bg-[#3B7D3C] hover:text-white transition-all duration-300">
                        Switch RV
                      </button>
                    </Link>
                  </Dropdown>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    className="bg-[#F5F5F0] rounded-xl p-4 cursor-pointer hover:shadow-md transition-all duration-300"
                    onClick={() => selectedRv && setOpenAddModal(true)}
                  >
                    <p className="text-[#5A5A5A] text-sm font-medium">
                      Current Mileage
                    </p>
                    <p className="text-2xl font-bold text-[#D4872D] mt-1">
                      {selectedRv?.currentMileage
                        ? `${Number(
                            selectedRv.currentMileage
                          ).toLocaleString()} mi`
                        : "N/A"}
                    </p>
                    <p className="text-[#5A5A5A] text-xs mt-1">
                      Click to update
                    </p>
                  </div>

                  <Link to="/maintenanceOverdue">
                    <div className="bg-[#F5F5F0] rounded-xl p-4 hover:shadow-md transition-all duration-300 h-full">
                      <p className="text-[#5A5A5A] text-sm font-medium">
                        Maintenance Status
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <div
                          className={`w-3 h-3 rounded-full ${statusColor}`}
                        ></div>
                        <p className="text-lg font-semibold text-[#1A1A1A]">
                          {rv?.isOverdueForMaintenance
                            ? "Overdue"
                            : rv?.isUpcomingMaintenance
                            ? "Upcoming"
                            : "All Good"}
                        </p>
                      </div>
                      <p className="text-[#5A5A5A] text-xs mt-1">
                        {rv?.nickname || "View details"}
                      </p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section Title for non-logged in */}
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

      {/* Modal for updating mileage */}
      <Modal
        centered
        open={openAddModal}
        onCancel={handleCancel}
        footer={null}
        width={450}
      >
        <h2 className="text-center font-bold text-xl mb-6 text-[#1A1A1A]">
          Update Mileage
        </h2>
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            label={
              <span className="text-[#5A5A5A] font-medium">
                Enter current mileage
              </span>
            }
            name="currentMileage"
            rules={[
              { required: true, message: "Please input current mileage!" },
            ]}
          >
            <Input
              className="w-full bg-[#F5F5F0] border border-[#E8F0E8] text-[#1A1A1A] py-3 rounded-lg hover:border-[#3B7D3C] focus:border-[#3B7D3C]"
              placeholder="Enter current mileage"
              defaultValue={selectedRv?.currentMileage}
              type="number"
            />
          </Form.Item>
          <Form.Item className="pt-2 mb-0">
            <button
              type="submit"
              className="w-full bg-[#3B7D3C] text-white py-3 rounded-full btn-animate hover:bg-[#2D5F2D] font-medium"
            >
              Save Mileage
            </button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Hero;
