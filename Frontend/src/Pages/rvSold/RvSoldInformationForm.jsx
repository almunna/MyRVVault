import { Button, ConfigProvider, DatePicker, Form, Input, Select } from "antd";
import Dragger from "antd/es/upload/Dragger";
import React from "react";
import { InboxOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);
const dateFormat = "YYYY-MM-DD";
const props = {
  name: "file",
  multiple: true,
  action: "https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload",
  onChange(info) {
    const { status } = info.file;
    if (status !== "uploading") {
      console.log(info.file, info.fileList);
    }
    if (status === "done") {
      message.success(`${info.file.name} file uploaded successfully.`);
    } else if (status === "error") {
      message.error(`${info.file.name} file upload failed.`);
    }
  },
  onDrop(e) {
    console.log("Dropped files", e.dataTransfer.files);
  },
};

const RvSoldInformationForm = () => {
  const [form] = Form.useForm();
  const handleSubmit = (values) => {
    console.log(values);
  };
  return (
    <div className="container m-auto">
      <div className="flex gap-4">
        <div className="w-[400px]">
          <h1 className="text-3xl font-semibold text-[#F9B038]">
            Insurance Company Info
          </h1>
        </div>

        <div className="w-full max-w-4xl">
          <Form form={form} onFinish={handleSubmit} layout="vertical">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label="RV Selection"
                name="name"
                rules={[{ required: true, message: "Please input your name!" }]}
              >
                <Input
                  className="w-full bg-transparent border border-black py-2"
                  placeholder="Name"
                />
              </Form.Item>

              <Form.Item
                label="Date Sold"
                name="ExpirationDate"
                rules={[
                  { required: true, message: "Please input Expiration Date!" },
                ]}
              >
                <DatePicker
                  className="w-full bg-transparent border border-black py-2"
                  defaultValue={dayjs("2019-09-03", dateFormat)}
                  minDate={dayjs("2019-08-01", dateFormat)}
                  maxDate={dayjs("2020-10-31", dateFormat)}
                />
              </Form.Item>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label="Current Maileage"
                name="link"
                rules={[
                  { required: true, message: "Please input your website!" },
                ]}
              >
                <Input
                  className="w-full bg-transparent border border-black py-2"
                  placeholder="Type link"
                />
              </Form.Item>

              <Form.Item
                label="Amount"
                name="phone"
                rules={[
                  {
                    required: true,
                    message: "Please input your Phone Number!",
                  },
                ]}
              >
                <Input
                  className="w-full bg-transparent border border-black py-2"
                  placeholder="Type phone"
                />
              </Form.Item>
            </div>
            <Form.Item className=" pt-7">
              <button
                type="primary"
                htmlType="submit"
                className="w-full bg-[#F9B038] py-2"
              >
                Save
              </button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default RvSoldInformationForm;
