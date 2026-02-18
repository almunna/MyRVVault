import { Checkbox, Form, Input, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import Logo from "../assets/Home/hero.png";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { useRegisterUserMutation } from "../Pages/redux/api/userApi";
import { Navigate } from "../Navigate";

const SignUp = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [register] = useRegisterUserMutation();



  const onFinish = async (values) => {
    setLoading(true);
    const data = {
      name: values.name,
      email: values.email,
      password: values.password,
      confirmPassword: values.confirmPassword,
    };
    try {
      const payload = await register(data).unwrap();
      console.log(payload);
      if (payload?.success) {

        localStorage.setItem("email", values?.email);
        // dispatch(setToken(payload?.data?.accessToken))
        message.success(payload?.message);
        navigate("/auth/signUp/verify-email");
      } else {
        message.error(payload?.message || "Login failed!");
      }
    } catch (error) {
      message.error(error?.data?.message || "Something went wrong. Try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center px-4">
      <div className="w-full max-w-[1500px] m-auto">
        <div className="md:flex md:justify-center lg:grid grid-cols-2 gap-8">
          <div className="lg:w-full md:px-16 animate-slideInLeft">
            <h2 className="text-xl flex font-bold mb-2 text-[#3B7D3C]">
              <Navigate></Navigate> Sign Up to your account
            </h2>

            <Form
              name="basic"
              initialValues={{ remember: true }}
              onFinish={onFinish}
              autoComplete="off"
              layout="vertical"
            >
              <div className="grid grid-cols-1 gap-3">
                <Form.Item
                  name="name"
                  label={<span style={{ color: "#1A1A1A", fontWeight: 500 }}>Name</span>}
                  rules={[
                    { required: true, message: "Please input your Name!" },
                    { message: "The input is not valid Name!" },
                  ]}
                >
                  <Input
                    className="bg-white border border-[#E8F0E8] py-3 rounded-lg hover:border-[#3B7D3C] focus:border-[#3B7D3C] transition-colors duration-300"
                    placeholder="Enter first Name"
                  />
                </Form.Item>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Form.Item
                  name="email"
                  label={<span style={{ color: "#1A1A1A", fontWeight: 500 }}>Email</span>}
                  rules={[
                    { required: true, message: "Please input your email!" },
                    { message: "The input is not valid email!" },
                  ]}
                >
                  <Input
                    className="bg-white border border-[#E8F0E8] py-3 rounded-lg hover:border-[#3B7D3C] focus:border-[#3B7D3C] transition-colors duration-300"
                    placeholder="Enter first email"
                  />
                </Form.Item>
                <Form.Item
                  name="number"
                  label={<span style={{ color: "#1A1A1A", fontWeight: 500 }}>Phone Number</span>}
                  rules={[
                    { required: true, message: "Please Phone Number!" },
                    { message: "The input is not Phone Number!" },
                  ]}
                >
                  <Input
                    className="bg-white border border-[#E8F0E8] py-3 rounded-lg hover:border-[#3B7D3C] focus:border-[#3B7D3C] transition-colors duration-300"
                    placeholder="Enter Phone Number"
                  />
                </Form.Item>
              </div>

              <Form.Item
                name="password"
                label={<span style={{ color: "#1A1A1A", fontWeight: 500 }}>Password</span>}
                rules={[
                  { required: true, message: "Please set your password!" },
                  {
                    pattern:
                      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,16}$/,
                    message:
                      "Password must be 8–16 characters long and include uppercase, lowercase, number, and special character!",
                  },
                ]}
              >
                <Input.Password
                  placeholder="Enter your password"
                  className="bg-white border border-[#E8F0E8] py-3 rounded-lg hover:border-[#3B7D3C] focus:border-[#3B7D3C] transition-colors duration-300"
                />
              </Form.Item>

              <Form.Item
                label={
                  <span style={{ color: "#1A1A1A", fontWeight: 500 }}>Confirm Password</span>
                }
                name="confirmPassword"
                dependencies={["password"]}
                rules={[
                  { required: true, message: "Please confirm your password!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("The two passwords do not match!")
                      );
                    },
                  }),
                ]}
              >
                <Input.Password
                  placeholder="Re-enter your password"
                  className="bg-white border border-[#E8F0E8] py-3 rounded-lg hover:border-[#3B7D3C] focus:border-[#3B7D3C] transition-colors duration-300"
                />
              </Form.Item>

              <div className="flex items-center justify-between ">
                <Form.Item
                  name="agree"
                  valuePropName="checked"
                  rules={[
                    {
                      validator: (_, value) =>
                        value
                          ? Promise.resolve()
                          : Promise.reject(
                              new Error(
                                "Please agree to all the Terms and Privacy Policies!"
                              )
                            ),
                    },
                  ]}
                >
                  <Checkbox className="text-[#5A5A5A]">
                    I agree to all the Terms and Privacy Policies
                  </Checkbox>
                </Form.Item>
              </div>

              <Form.Item>
                <button
                  type="submit"
                  className={`w-full py-3 bg-[#D4872D] text-white rounded-lg btn-accent hover:bg-[#B8721F] ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Sign Up"}
                </button>
              </Form.Item>
            </Form>

            <h1 className="text-[#5A5A5A] text-center mt-5">
              ----Or Login with----
            </h1>

            <div className="grid grid-cols-2 gap-3 mt-5">
              <button className="border flex gap-2 justify-center border-[#E8F0E8] bg-white w-full py-2 rounded-lg text-xl text-[#1A1A1A] btn-animate hover:border-[#3B7D3C]">
                <FcGoogle className="mt-1" />
                Sign In with Google
              </button>
              <button className="border border-[#E8F0E8] bg-white w-full flex gap-1 justify-center py-2 rounded-lg text-xl text-[#1A1A1A] btn-animate hover:border-[#3B7D3C]">
                <FaApple className="mt-1" />
                Sign In With Apple
              </button>
            </div>

            <div className="text-center mt-5 text-[#5A5A5A]">
              Already have an account?{" "}
              <Link className="text-[#3B7D3C] font-semibold hover:underline" to={"/auth/login"}>
                Sign In
              </Link>
            </div>
          </div>
          <div className="hidden lg:block animate-slideInRight">
            <img className="rounded-3xl shadow-lg" src={Logo} alt="" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
