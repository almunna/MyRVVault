import { Button, ConfigProvider, DatePicker, Form, Input, Select } from "antd";
import Dragger from "antd/es/upload/Dragger";
import React, { useState } from "react";
import { InboxOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Navigate } from "../../Navigate";
dayjs.extend(customParseFormat);
const dateFormat = "MM/DD/YYYY";
const dateFormatt = "MM/DD/YYYY";
const props = {
  name: "images",
  multiple: true,
  beforeUpload: () => false,
  onDrop(e) {
    console.log("Dropped files", e.dataTransfer.files);
  },
};
const UpdateExisting = () => {
  const [form] = Form.useForm();
  const [cost, setCost] = useState("");
  const formatWithCommas = (value) => {
    const onlyNumbers = value.replace(/[^\d]/g, "");
    return onlyNumbers.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleCostChange = (e) => {
    const input = e.target.value;
    const formatted = formatWithCommas(input);
    setCost(formatted);
    form.setFieldsValue({ cost: formatted });
  };

  const handleSubmit = (values) => {
    console.log(values);
  };
  //sss
  return (
    <div className="container m-auto">
     <div className=" lg:mt-11 mt-6 px-3">
        <div className="flex justify-between items-center pb-7 lg:pb-0">
          <h1 className="text-3xl font-semibold text-[#F9B038]">
            Update Existing Merprisum
          </h1>
          <Navigate title={'Cancel'}></Navigate>
        </div>
        <div className="max-w-4xl ">
          <Form form={form} onFinish={handleSubmit} layout="vertical">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label={<span style={{ color: "#F9B038" }}>Renewal Date</span>}
                name="renewall"
                rules={[
                  { required: true, message: "Please input Renewal Date!" },
                ]}
              >
                <DatePicker
                  className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                  format={dateFormat}
                  defaultValue={dayjs("09/03/2019", dateFormatt)}
                  minDate={dayjs("08/01/2019", dateFormatt)}
                  maxDate={dayjs("10/31/2020", dateFormatt)}
                />
              </Form.Item>
              <Form.Item
                label={
                  <span style={{ color: "#F9B038" }}>Expiration Date</span>
                }
                name="ExpirationDate"
                rules={[
                  { required: true, message: "Please input Expiration Date!" },
                ]}
              >
                <DatePicker
                  className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                  format={dateFormat}
                  defaultValue={dayjs("09/03/2019", dateFormat)}
                  minDate={dayjs("08/01/2019", dateFormat)}
                  maxDate={dayjs("10/31/2020", dateFormat)}
                />
              </Form.Item>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label={<span style={{ color: "#F9B038" }}>Cost</span>}
                name="cost"
                rules={[{ required: true, message: "Please input your cost!" }]}
              >
                <Input
                  className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                  placeholder="$"
                  value={cost}
                  onChange={handleCostChange}
                />
              </Form.Item>

              <Form.Item
                label={
                  <span style={{ color: "#F9B038" }}>
                    Update Membership Number
                  </span>
                }
                name="MembershipNumber"
                rules={[
                  {
                    required: true,
                    message: "Please input Update Membership Number!",
                  },
                ]}
              >
                <Input
                  className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                  placeholder="Type Update Membership Number"
                />
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
              <Dragger {...props}>
                <p className="ant-upload-drag-icon ">
                  <InboxOutlined />
                </p>
                <p className=" text-[#F9B038]">
                  Click or drag file to this area to upload
                </p>
                <p className="text-[#F9B038]">
                  Support for a single or bulk upload. Strictly prohibited from
                  uploading company data or other banned files.
                </p>
              </Dragger>
              <Form.Item
                label={<span style={{ color: "#F9B038" }}>Notes</span>}
                name="feedback"
                rules={[{ required: true, message: "Please input Notes!" }]}
              >
                <Input.TextArea
                  className="w-full bg-[#F9B038] border border-transparent py-2"
                  rows={4}
                  placeholder="Type Notes..."
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

export default UpdateExisting;
