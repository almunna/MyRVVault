

import { useState } from "react";
import OTPInput from "react-otp-input";


import { useForgotPasswordMutation, useReSendMutation, useVerifyOtpMutation } from "../Pages/redux/api/userApi";

import { Checkbox, ConfigProvider, Form, Input, message, Modal } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";


import Logo from "../assets/Home/hero.png";
import { Navigate } from "../Navigate";


const SignVerify = () => {
   const [resendVerifyOtp] = useForgotPasswordMutation()
 
    const [otp, setOtp] = useState("");
const [verifyEmail] = useVerifyOtpMutation()
   const navigate = useNavigate()
  const handleVerify = async () => {
    const data = {
        code: otp,
      email: localStorage.getItem("email"),
    };

   

    try {
      const response = await verifyEmail(data).unwrap();
    
      message.success(response?.message);
      navigate("/auth/update-password");
    } catch (error) {
      console.error(error); 
      message.error(error?.data?.message );
    }
  };

  const handleResend =async () => {
    const data = {
      email: localStorage.getItem("email"),
    };
    try {
      const response =await resendVerifyOtp(data).unwrap();
      
      message.success(response.message);
    } catch (error) {
      console.error(error);
      message.error(error?.data?.message || "Failed to resend OTP!");
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[#35549B] flex items-center justify-center md:px-4">
        <div className="w-full max-w-[1500px] m-auto">
          <div className="md:flex md:justify-center lg:grid grid-cols-2">
            <div className="  lg:w-full md:px-16 px-5 text-[#F9B038] ">
                <h2 className="text-2xl flex font-bold text-center mb-6 text-[#F9B038]">
              <Navigate></Navigate> Check your email
            </h2>
            <h3 className="text-[#F9B038] text-center mb-5">
              We sent a reset link to {localStorage.getItem("email")}. Enter the 6-digit
              code mentioned in the email.
            </h3>
            <div className="flex justify-center mb-5">
              <OTPInput
                value={otp}
                onChange={setOtp}
                numInputs={6}
                renderSeparator={<span className="mx-1"></span>}
                renderInput={(props) => (
                  <input
                    {...props}
                    className="w-16 h-16 text-center bg-white text-lg border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    style={{ width: "40px", height: "50px" }}
                  />
                )}
              />
            </div>

           <button
              onClick={handleVerify}
              className="w-full py-2 bg-[#F9B038] text-white rounded-md mb-4"
            >
              Verify Code
            </button>

            <span className="flex justify-center ">
              You have not received the email?{" "}
              <span
                onClick={handleResend}
                className="text-[#F9B038] cursor-pointer pl-2"
              >
                 Resend
              </span>
            </span>
            </div>
            <div className="hidden lg:block">
              <img className="rounded-3xl" src={Logo} alt="" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignVerify;
