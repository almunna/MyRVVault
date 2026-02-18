import { DatePicker, Form, Input, message, Select, Spin, Upload } from "antd";

import React, { useEffect, useState } from "react";

import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Link, useNavigate } from "react-router-dom";
import { useAddMemberMutation } from "../redux/api/routesApi";
dayjs.extend(customParseFormat);
const dateFormat = "MM/DD/YYYY";

const onPreview = async (file) => {
  let src =
    file.url ||
    (await new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file.originFileObj);
      reader.onload = () => resolve(reader.result);
    }));
  const image = new Image();
  image.src = src;
  const imgWindow = window.open(src);
  imgWindow?.document.write(image.outerHTML);
};

const AddMembershipForm = () => {
  const [form] = Form.useForm();
  const [cost, setCost] = useState("");
  const navigate = useNavigate();
  const [fileList, setFileList] = useState([]);
  const [addInsurance] = useAddMemberMutation();
  const [isFormFilled, setIsFormFilled] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    handleFormChange(); // initial check
  }, [fileList]);
  // ✅ Check if any field has value
  const handleFormChange = () => {
    const values = form.getFieldsValue();
    const hasValue =
      Object.values(values).some((value) => value && value !== "") ||
      fileList.length > 0;
    setIsFormFilled(hasValue);
  };
  const formatWithCommas = (value) => {
    if (!value) return "";
    const onlyNumbers = value.toString().replace(/[^\d]/g, "");
    return onlyNumbers.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const parseNumber = (value) => {
    if (!value) return "";
    return value.replace(/,/g, "");
  };

  const onChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const handleCostChange = (e) => {
    const input = e.target.value;
    const onlyNumbers = input.replace(/[^\d]/g, "");
    const formatted = formatWithCommas(onlyNumbers);
    setCost(formatted);
    form.setFieldsValue({ cost: onlyNumbers });
  };
  const handleSubmit = async (values) => {
    console.log("Form Values:", values?.cost);

    const formData = new FormData();
    formData.append("name", values.name || "");
    formData.append("websiteLink", values.websiteLink || "");
    formData.append(
      "dateOfPurchase",
      values.dateOfPurchase
        ? dayjs(values.dateOfPurchase).format(dateFormat)
        : ""
    );

    formData.append(
      "membershipExpirationDate",
      values.membershipExpiration
        ? dayjs(values.membershipExpiration).format(dateFormat)
        : ""
    );
    formData.append("phoneNo", values.phoneNumber || "");
    formData.append(
      "amountPaid",
      values.amountPaid ? Number(values.amountPaid) : ""
    );

    formData.append("accountNo", values.accountNumber || "");
    formData.append("note", values.notes || "");

    // Multiple image upload
    fileList.forEach((file) => {
      if (file.originFileObj) {
        formData.append("images", file.originFileObj);
      }
    });
setLoading(true);
    try {
      const res = await addInsurance(formData).unwrap();
      setLoading(false);
      message.success(res?.message || "Saved successfully");
      form.resetFields();
      setFileList([]);
    } catch (err) {
      setLoading(false);
      message.error(err?.data?.message || "Something went wrong");
    }
  };
  return (
    <div className="container m-auto">
      <div className=" lg:mt-11 mt-6 px-3">
        <div className=" pb-7 lg:pb-0">
          <h1 className="text-3xl text-[#F9B038] font-semibold ">
            Add Membership
          </h1>
        </div>
        <div className="max-w-4xl m-auto mt-11 text-[#F9B038]">
          <Form form={form} onFinish={handleSubmit} onValuesChange={handleFormChange} layout="vertical">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label={<span style={{ color: "#F9B038" }}>Name</span>}
                name="name"
                // rules={[{ required: true, message: "Please input your name!" }]}
              >
                <Input
                  className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                  placeholder="Name"
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: "#F9B038" }}>Date Purchase</span>}
                name="dateOfPurchase"
                // rules={[
                //   {
                //     required: true,
                //     message: "Please input your Date Purchase!",
                //   },
                // ]}
              >
                <DatePicker
                  className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                  format={dateFormat}
                />
              </Form.Item>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label={<span style={{ color: "#F9B038" }}>Website Link</span>}
                name="websiteLink"
                // rules={[
                //   { required: true, message: "Please input your website!" },
                // ]}
              >
                <Input
                  className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                  placeholder="Type link"
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: "#F9B038" }}>Phone Number</span>}
                name="phoneNumber"
                // rules={[
                //   {
                //     required: true,
                //     message: "Please input your Phone Number!",
                //   },
                // ]}
              >
                <Input
                  className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                  placeholder="Type phone"
                />
              </Form.Item>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label={<span style={{ color: "#F9B038" }}>Account Number</span>}
                name="accountNumber"
                // rules={[
                //   { required: true, message: "Please input your account!" },
                // ]}
              >
                <Input
                  className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                  placeholder="Type account"
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: "#F9B038" }}>Amount</span>}
                name="amountPaid"
                normalize={(value) => parseNumber(value)} // Store unformatted value in form
                getValueProps={(value) => ({
                  value: formatWithCommas(value),
                })}
                rules={[
                  {
                    pattern: /^\d+$/,
                    message: "Please enter a valid number",
                  },
                ]}
              >
                <Input
                  className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                  placeholder="$"
                />
              </Form.Item>
            </div>

            <Form.Item
              label={
                <span style={{ color: "#F9B038" }}>Membership Expiration</span>
              }
              name="membershipExpiration"
              // rules={[
              //   { required: true, message: "Please input your expiration!" },
              // ]}
            >
              <DatePicker
                className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                format={dateFormat}
              />
            </Form.Item>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
              <div>
                <h1 className="text-[#F9B038]">Upload Image</h1>
                <Upload
                  style={{ width: "100%", marginTop: "10px", color: "#F9B038" }}
                  listType="picture-card"
                  fileList={fileList}
                  onChange={onChange}
                  onPreview={onPreview}
                  multiple={true}
                >
                  {fileList.length < 1 && "+ Upload"}
                </Upload>
              </div>
              <Form.Item
                label="Notes"
                name="notes"
                // rules={[{ required: true, message: "Please input Notes!" }]}
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
                type="submit"
                disabled={!isFormFilled || loading}
                className={`w-full py-2 rounded flex justify-center items-center gap-2 transition-all duration-300 ${
                  loading
                    ? "bg-[#b37a01] cursor-not-allowed text-white"
                    : isFormFilled
                    ? "bg-[#F9B038] text-black hover:bg-[#d6952f]"
                    : "bg-[#8a6f44] text-white cursor-not-allowed"
                }`}
              >
                {loading ? (
                  <>
                    <Spin size="small" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  "Submit"
                )}
              </button>
            </Form.Item>
          </Form>
          <Link to={"/"}>
            <button
              type="primary"
              htmlType="submit"
              className="w-full bg-[#F9B038] py-2 text-black"
            >
              next 
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AddMembershipForm;
