import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { message } from "antd";
import { useGetProfileQuery } from "./Pages/redux/api/userApi";

const ProtectedRoute = ({ children }) => {
  const { data: profileData, isLoading } = useGetProfileQuery();
  const location = useLocation();
  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    if (profileData?.user?.rvIds?.length === 0) {
      message.warning("Please add RV first!");
    }
  }, [profileData]);

  if (!accessToken) {
    return <Navigate to={"/auth/login"} state={{ from: location }} />;
  }

  if (profileData?.user?.rvIds?.length === 0) {
    return <Navigate to="/addRv" />;
  }

  return children;
};

export default ProtectedRoute;
