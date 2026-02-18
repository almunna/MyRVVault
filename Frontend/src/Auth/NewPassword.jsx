import { Checkbox, ConfigProvider, Form, Input, message, Modal } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Logo from "../assets/Home/hero.png";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import {
  useLoginUserMutation,
  useResetPasswordMutation,
} from "../Pages/redux/api/userApi";
import { Navigate } from "../Navigate";


const NewPassword = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [resetPassword] = useResetPasswordMutation();

  const navigate = useNavigate();
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
    const data = {
      email: localStorage.getItem("email"),
      newPassword: values.newPassword,
      confirmPassword: values.confirmPassword,
    };
    try {
      const payload = await resetPassword(data).unwrap();

      if (payload) {
        console.log(payload?.success);
        message.success(payload?.message);
        navigate("/auth/login");
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
    <>
      <Modal
        centered
        visible={modalVisible}
        footer={null}
        onCancel={() => setModalVisible(false)}
      >
        <h1 className="text-center pb-3 text-3xl">
          Our app is available! You can download it now.
        </h1>
        <p>
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Natus
          aspernatur facilis numquam tempora voluptatibus rerum ex dolorem
          corporis quaerat iste, beatae nisi cum repellat dolore, officiis
          nostrum consectetur doloremque! Accusantium, voluptatum consequuntur
          dignissimos inventore repellat voluptas ipsa eius commodi hic error
          corrupti, deserunt enim. Veritatis nostrum aliquam illo quibusdam
          commodi.
        </p>
        <button className="bg-[#27E2F5] w-full py-2 mt-4">Let's Go</button>
      </Modal>

      <div className="min-h-screen bg-[#35549B] flex items-center justify-center md:px-4">
        <div className="w-full max-w-[1500px] m-auto">
          <div className="md:flex md:justify-center lg:grid grid-cols-2">
            <div className="  lg:w-full md:px-16 px-5  ">
              <h2 className="text-xl flex font-bold mb-2 text-[#F9B038]">
                <Navigate></Navigate> Sign in to your account
              </h2>

              <Form
                name="basic"
                initialValues={{ remember: true }}
                onFinish={onFinish}
                autoComplete="off"
                layout="vertical"
              >
              
                

                <Form.Item
                  name="newPassword"
                  rules={[
                    { required: true, message: "Please set your newPassword!" },
                    {
                      min: 8,
                      max: 10,
                      message: "newPassword must be 8-10 characters long!",
                    },
                  ]}
                >
                  <Input.Password
                    placeholder="Enter your newPassword"
                    className="bg-[#F9B038] border-none py-3"
                  />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  dependencies={["newPassword"]}
                  rules={[
                    {
                      required: true,
                      message: "Please confirm your newPassword!",
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("newPassword") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error("The two newPassword do not match!")
                        );
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    placeholder="Re-enter your password"
                    className="bg-[#F9B038] border-none py-3"
                  />
                </Form.Item>

                <div className="flex items-center justify-between mb-4">
                  <Form.Item name="remember" valuePropName="checked" noStyle>
                    <Checkbox className="text-[#F9B038]">
                      I agree to all the Terms and Privacy Policies
                    </Checkbox>
                  </Form.Item>
                </div>

                <Form.Item>
                  <button
                    type="submit"
                    className={`w-full py-3 bg-[#F9B038] text-black rounded focus:ring-2 focus:ring-gray-500 ${
                      loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={loading}
                  >
                    {loading ? "Logging in..." : "Sign Up"}
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

export default NewPassword;
