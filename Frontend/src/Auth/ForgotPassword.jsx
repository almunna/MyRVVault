import { Checkbox, ConfigProvider, Form, Input, message, Modal } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Logo from "../assets/Home/hero.png";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { useForgotPasswordMutation, useLoginUserMutation } from "../Pages/redux/api/userApi";
import { Navigate } from "../Navigate";


const ForgotPassword = () => {

  const [loading, setLoading] = useState(false);

  const [forgetPass] = useForgotPasswordMutation()

  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    const data= {
      email : values.email
    }
    try {
      const payload = await forgetPass(data).unwrap();

      if (payload) {
        console.log(payload?.success)
            localStorage.setItem("email", values?.email);
     
        message.success(payload?.message);
        navigate("/auth/verification");
      } else {
        message.error(payload?.message );
      }
    } catch (error) {
      message.error(error?.data?.message || "Something went wrong. Try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
     

      <div className="min-h-screen bg-[#35549B] flex items-center justify-center md:px-4">
        <div className="w-full max-w-[1500px] m-auto">
          <div className="md:flex md:justify-center lg:grid grid-cols-2">
            <div className="  lg:w-full md:px-16 px-5  ">
              <h2 className="text-xl flex font-bold mb-2 text-[#F9B038]">
                <Navigate></Navigate>
               Forgot your password?
              </h2>

              <p className="mb-5 text-[#F9B038] mt-3"> Don’t worry, happens to all of us. Enter your email below to recover your password</p>

              <Form
                name="basic"
                initialValues={{ remember: true }}
                onFinish={onFinish}
                autoComplete="off"
                layout="vertical"
              >
                <Form.Item
                  name="email"
                  label={<span style={{ color: "#F9B038" }}>Email</span>}
                  rules={[
                    { required: true, message: "Please input your Email!" },
                    {
                      type: "email",
                      message: "The input is not valid E-mail!",
                    },
                  ]}
                >
                  <Input
                    type="email"
                    className="bg-[#F9B038] border-none py-3 hover:bg-[#F9B038] "
                    placeholder="Enter your Email"
                  />
                </Form.Item>

               

              

                <Form.Item>
                  <button
                    type="submit"
                    className={`w-full py-3 bg-[#F9B038] text-black rounded focus:ring-2 focus:ring-gray-500 ${
                      loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={loading}
                  >
                    {loading ? "Submited..." : "Submit"}
                  </button>
                </Form.Item>
              </Form>
             

             
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

export default ForgotPassword;
