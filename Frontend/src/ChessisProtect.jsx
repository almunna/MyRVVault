import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { message } from "antd";
import { useGetProfileQuery } from "./Pages/redux/api/userApi";
import { useGetChassisQuery } from "./Pages/redux/api/routesApi";

const ChessisProtect = ({ children }) => {
  const { data: chassisData, isLoading: chassisLoading } = useGetChassisQuery();
  const { data: profileData } = useGetProfileQuery();

  const location = useLocation();
  const accessToken = localStorage.getItem("accessToken");

  // Warn user if no RV added
  useEffect(() => {
    if (profileData?.user?.rvIds?.length === 0) {
      message.warning("Please add RV first!");
    }
  }, [profileData]);

  // No token → login
  if (!accessToken) {
    return <Navigate to={"/auth/login"} state={{ from: location }} />;
  }

  // No RV → go to RV add page
  if (profileData?.user?.rvIds?.length === 0) {
    return <Navigate to="/addRv" />;
  }

  // ⭐ NEW — check if chassis NOT FOUND
  if (!chassisLoading && chassisData?.message === "No chassis found") {
    return <Navigate to="/information" />;
  }

  return children;
};

export default ChessisProtect;
