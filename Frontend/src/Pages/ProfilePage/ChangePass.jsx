import { Button, Form, Input, message } from "antd";
import React, { useState } from "react";

import { useNavigate } from "react-router-dom";
import { useChangePasswordMutation } from "../redux/api/userApi";

export const ChangePass = () => {
  const [changePass] = useChangePasswordMutation();
  const [passError, setPassError] = useState("");
  const navigate = useNavigate();
  const onFinish = (values) => {
    if (values?.newPassword === values.oldPassword) {
      return setPassError("Your old password cannot be your new password");
    }
    if (values?.newPassword !== values?.confirmPassword) {
      return setPassError("Confirm password doesn't match");
    } else {
      setPassError("");
    }
    changePass(values)
      .unwrap()
      .then((payload) => {
        message.success(payload?.message);
        localStorage.removeItem("accessToken");
        navigate("/auth/login");
      })
      .catch((error) => message.error(error?.data?.message));
  };

  return (
    <div>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="oldPassword"
          label={
            <p className="text-[black] text-sm leading-5">Current Password</p>
          }
          rules={[
            {
              required: true,
              message: "Please Enter Current Password!",
            },
          ]}
        >
          <Input.Password
            style={{
              width: "100%",
              height: "42px",

              backgroundColor: "#DBE3EA",
              borderRadius: "8px",
              color: "black",
              outline: "none",
            }}
            type="text"
            placeholder="***************"
          />
        </Form.Item>

        <Form.Item
          name="newPassword"
          rules={[{ required: true, message: "Please Enter New Password!" }]}
          label={<p className="text-[black] text-sm leading-5">New Password</p>}
        >
          <Input.Password
            style={{
              width: "100%",
              height: "42px",

              backgroundColor: "#DBE3EA",
              borderRadius: "8px",
              color: "black",
              outline: "none",
            }}
            type="text"
            placeholder="************"
          />
        </Form.Item>

        <Form.Item
          label={
            <p className="text-[black] text-sm leading-5">Confirm Password</p>
          }
          name="confirmPassword"
          rules={[
            {
              required: true,
              message: "Please Enter Confirm Password!",
            },
          ]}
        >
          <Input.Password
            style={{
              width: "100%",
              height: "42px",

              backgroundColor: "#DBE3EA",
              borderRadius: "8px",
              color: "black",
              outline: "none",
            }}
            type="text"
            placeholder="***************"
          />
        </Form.Item>
        {passError && (
          <p className="text-red-600 -mt-4 mb-2 text-center">{passError}</p>
        )}
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
              color: "#FFFFFF",
              background: "#2E4CB9",
            }}
            className="font-normal text-[16px] leading-6 bg-primary"
          >
            Save Changes
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
