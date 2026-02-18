import React, { useEffect, useState } from "react";
import { Button, Form, Input, message } from "antd";
import { CiEdit } from "react-icons/ci";
import { useNavigate } from "react-router-dom";

import { ChangePass } from "./ChangePass";
import { useGetProfileQuery, useUpdateProfileMutation } from "../redux/api/userApi";
import { imageUrl } from "../redux/api/baseApi";

const ProfilePage = () => {

  const[updateProfile] = useUpdateProfileMutation()
  const {data:profileData} = useGetProfileQuery();
  console.log(profileData)
  const navigate = useNavigate();
  const [image, setImage] = useState();
  const [form] = Form.useForm();
  const [tab, setTab] = useState(
    new URLSearchParams(window.location.search).get("tab") || "Profile"
  );

  const handlePageChange = (tab) => {
    setTab(tab);
    const params = new URLSearchParams(window.location.search);
    params.set("tab", tab);
    window.history.pushState(null, "", `?${params.toString()}`);
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
  };

  useEffect(() => {
    if (profileData?.user) {
      const admin = profileData.user;
      form.setFieldsValue({
        name: admin.name,
        email: admin.email,
        phoneNumber: admin.phoneNumber || "",
        // address: admin.address || "",
      });
    }
  }, [profileData, form]);
  const onFinish = (values) => {
    const formData = new FormData();
    if (image) {
      formData.append("profilePic", image);
    }
    formData.append("name", values?.name);
    formData.append("phone_number", values?.phoneNumber);
    // formData.append("address", values?.address);
    // formData.append("designation", values?.designation);
    updateProfile(formData)
      .unwrap()
      .then((payload) => message.success(payload?.message))
      .catch((error) => message.error(error?.data?.message));
  };

//s

  return (
    <div className="container m-auto">

      <div className="bg-[#F9B038] md:border-l-[40px] border-t-[10px] md:border-t-0 border-white shadow-2xl md:rounded-3xl rounded-xl my-16 py-6 mx-3 md:mx-0 lg:px-0">
        <div className=" max-w-7xl m-auto  py-9 px-10 rounded-3xl  gap-6">
          <div className="flex justify-center items-center gap-5">
            <div>
              <div className="relative w-[140px] h-[124px] mx-auto">
                <input
                  type="file"
                  onInput={handleChange}
                  id="img"
                  style={{ display: "none" }}
                />
                <img
                  style={{ width: 140, height: 140, borderRadius: "100%" }}
                  src={`${image
                      ? URL.createObjectURL(image)
                      : `${profileData?.user?.profilePic}`
                    }`}
                  // src={img}
                  alt=""
                  className="shadow-2xl object-cover"
                />

                {tab === "Profile" && (
                  <label
                    htmlFor="img"
                    className="
                            absolute top-1/2 -right-2
                            bg-white
                            rounded-full
                            w-6 h-6
                            flex items-center justify-center
                            cursor-pointer
                        "
                  >
                    <CiEdit color="#929394" />
                  </label>
                )}
              </div>
            </div>
            <div className="">
              <div>
                <h2 className="text-sm text-blue-500">Hello</h2>
                <h1 className="text-2xl ">fgg </h1>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-start max-w-xl m-auto px-4 gap-6 my-6">
          <p
            onClick={() => handlePageChange("Profile")}
            className={`${tab === "Profile"
                ? "border-white border-b-2 font-bold text-white "
                : "border-b-2 border-transparent font-normal text-white"
              } pb-2 cursor-pointer text-[16px] leading-5`}
          >
            Edit Profile
          </p>
          <p
            onClick={() => handlePageChange("Change Password")}
            className={`${tab === "Change Password"
                ? "border-white border-b-2 font-bold text-white "
                : "border-b-2 border-transparent font-normal text-white"
              } pb-2 cursor-pointer text-base leading-[18px]`}
          >
            Change Password
          </p>
        </div>

        <div className="max-w-xl m-auto px-4">
          <div className=" ">
            {tab === "Profile" ? (
              <div className="max-w-[481px] mx-auto rounded-lg md:p-6">
                <h1 className="text-center text-secondary leading-7 text-2xl font-medium mb-7">
                  Edit Profile
                </h1>
                <Form onFinish={onFinish} layout="vertical" form={form}>
                  <Form.Item
                    name="name"
                    label={
                      <p className="text-[black] text-[16px] leading-5 font-normal">
                        User Name
                      </p>
                    }
                  >
                    <Input
                      style={{
                        width: "100%",
                        height: 40,

                        borderRadius: "8px",
                        color: "#919191",
                        backgroundColor: "#DBE3EA",
                        outline: "none",
                      }}
                      className="text-[16px] leading-5"
                      placeholder="name123"
                    />
                  </Form.Item>
                  <Form.Item
                    name="email"
                    label={
                      <p className="text-[black] text-[16px] leading-5 font-normal">
                        Email
                      </p>
                    }
                  >
                    <Input
                      style={{
                        width: "100%",
                        height: 48,

                        borderRadius: "8px",
                        color: "#919191",
                        backgroundColor: "#DBE3EA",
                        outline: "none",
                      }}
                      disabled
                      className="text-[16px] leading-5"
                      placeholder="xyz@gmail.com"
                    />
                  </Form.Item>

                  <Form.Item
                    name="phoneNumber"
                    label={
                      <p className="text-[black] text-[16px] leading-5 font-normal">
                        Contact Number
                      </p>
                    }
                  >
                    <Input
                      style={{
                        width: "100%",
                        height: 48,

                        borderRadius: "8px",
                        color: "#919191",
                        backgroundColor: "#DBE3EA",
                        outline: "none",
                      }}
                      className="text-[16px] leading-5"
                      placeholder="+9900700007"
                    />
                  </Form.Item>



                  <Form.Item
                    style={{
                      marginBottom: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Button
                      type="primary"
                      htmlType="submit"
                      block
                      style={{
                        width: 197,
                        height: 48,
                        color: "#FCFCFC",
                        background: "#2E4CB9",
                      }}
                      className="font-normal text-[16px] leading-6 bg-[#2E4CB9]"
                    >
                      Save Changes
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            ) : (
              <div className="max-w-[481px] mx-auto rounded-lg md:p-6">
                <h1 className="text-center text-secondary leading-7 text-2xl font-medium mb-7">
                  Change Password
                </h1>
                <ChangePass></ChangePass>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;