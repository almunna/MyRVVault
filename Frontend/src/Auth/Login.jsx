import { Checkbox, Form, Input, message, Modal } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Logo from "../assets/Home/hero.png";
import { FcGoogle } from "react-icons/fc";
import { FaApple, FaArrowLeft } from "react-icons/fa";
import { useLoginUserMutation } from "../Pages/redux/api/userApi";

const Login = () => {
  const [form] = Form.useForm();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [loginAdmin] = useLoginUserMutation();

  // ✅ Load saved email/password if remember is enabled
  useEffect(() => {
    const savedEmail = localStorage.getItem("savedEmail");
    const savedPassword = localStorage.getItem("savedPassword");

    if (savedEmail && savedPassword) {
      form.setFieldsValue({
        email: savedEmail,
        password: savedPassword,
        remember: true,
      });
    }
  }, [form]);

  // show modal if navigate from login button
  useEffect(() => {
    if (location.state?.showModal) {
      setModalVisible(true);
      const timer = setTimeout(() => {
        setModalVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const payload = await loginAdmin(values).unwrap();

      if (payload?.accessToken) {
        // Save tokens
        localStorage.setItem("accessToken", payload.accessToken);

        // ✅ Handle Remember Me
        if (values.remember) {
          localStorage.setItem("savedEmail", values.email);
          localStorage.setItem("savedPassword", values.password);
        } else {
          localStorage.removeItem("savedEmail");
          localStorage.removeItem("savedPassword");
        }

        message.success(payload?.message || "Login successful!");

        const rvArray = payload?.user?.rv || [];

        if (rvArray.length === 0) {
          navigate("/addRv");
        } else {
          navigate("/");
        }
      } else {
        message.error(payload?.message || "Login failed!");
      }
    } catch (error) {
      message.error(error?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        centered
        open={modalVisible}
        footer={null}
        onCancel={() => setModalVisible(false)}
      >
        <h1 className="text-center pb-3 text-3xl text-[#1A1A1A]">
          Our app is available! You can download it now.
        </h1>
        <p className="text-[#5A5A5A]">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Natus
          aspernatur facilis numquam tempora voluptatibus rerum.
        </p>
        <button className="bg-[#D4872D] text-white w-full py-2 mt-4 rounded-lg btn-accent hover:bg-[#B8721F]">Let's Go</button>
      </Modal>

      {/* Login Form */}
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center md:px-4">
        <div className="w-full max-w-[1500px] m-auto">
          <div className="md:flex md:justify-center lg:grid grid-cols-2 gap-8">
            <div className="lg:w-full md:px-16 px-5 animate-slideInLeft">
              <h2 className="text-xl flex gap-3 mb-6 font-bold text-[#3B7D3C]">
                <Link to={"/"}>
                  <button className="border border-[#3B7D3C] mt-[5px] text-[#3B7D3C] text-sm w-5 h-5 rounded-full flex justify-center items-center hover:bg-[#3B7D3C] hover:text-white transition-colors duration-300">
                    <FaArrowLeft />
                  </button>
                </Link>
                Sign in to your account
              </h2>

              <Form
                form={form}
                name="basic"
                onFinish={onFinish}
                layout="vertical"
                initialValues={{
                  email: "",
                  password: "",
                  remember: false,
                }}
              >
                <Form.Item
                  name="email"
                  label={<span style={{ color: "#1A1A1A", fontWeight: 500 }}>Email</span>}
                  rules={[
                    { required: true, message: "Please input your Email!" },
                    { type: "email", message: "Invalid Email!" },
                  ]}
                >
                  <Input
                    type="email"
                    className="bg-white border border-[#E8F0E8] py-3 rounded-lg hover:border-[#3B7D3C] focus:border-[#3B7D3C] transition-colors duration-300"
                    placeholder="Enter your Email"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label={<span style={{ color: "#1A1A1A", fontWeight: 500 }}>Password</span>}
                  rules={[
                    { required: true, message: "Please input password!" },
                  ]}
                >
                  <Input.Password
                    className="bg-white border border-[#E8F0E8] py-3 rounded-lg hover:border-[#3B7D3C] focus:border-[#3B7D3C] transition-colors duration-300"
                    placeholder="Enter your password"
                  />
                </Form.Item>

                <div className="flex items-center justify-between mb-4">
                  <Form.Item name="remember" valuePropName="checked" noStyle>
                    <Checkbox className="text-[#5A5A5A]">Remember me</Checkbox>
                  </Form.Item>
                  <Link
                    to={"/auth/forgot-password"}
                    className="text-sm text-[#3B7D3C] hover:underline"
                  >
                    Forget password?
                  </Link>
                </div>

                <Form.Item>
                  <button
                    type="submit"
                    className={`w-full py-3 bg-[#D4872D] text-white rounded-lg btn-accent hover:bg-[#B8721F] ${
                      loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={loading}
                  >
                    {loading ? "Logging in..." : "Login"}
                  </button>
                </Form.Item>
              </Form>

              <Link to={"/auth/signUp"}>
                <button className="w-full py-3 bg-white border border-[#3B7D3C] text-[#3B7D3C] rounded-lg btn-animate hover:bg-[#E8F0E8]">
                  Create An Account
                </button>
              </Link>

              <h1 className="text-[#5A5A5A] text-center mt-5">
                ----Or Login with----
              </h1>

              <div className="grid grid-cols-2 gap-3 mt-5">
                <button className="border flex gap-2 justify-center border-[#E8F0E8] bg-white w-full py-2 rounded-lg text-xl text-[#1A1A1A] btn-animate hover:border-[#3B7D3C]">
                  <FcGoogle className="mt-1" />
                  Google
                </button>
                <button className="border border-[#E8F0E8] bg-white w-full flex gap-1 justify-center py-2 rounded-lg text-xl text-[#1A1A1A] btn-animate hover:border-[#3B7D3C]">
                  <FaApple className="mt-1" />
                  Apple
                </button>
              </div>
            </div>

            <div className="hidden lg:block animate-slideInRight">
              <img className="rounded-3xl shadow-lg" src={Logo} alt="hero" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
