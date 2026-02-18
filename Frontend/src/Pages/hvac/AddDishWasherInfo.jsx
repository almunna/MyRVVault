import {
  Button,
  ConfigProvider,
  DatePicker,
  Form,
  Input,
  message,
  Select,
  Spin,
  Upload,
} from "antd";
import Dragger from "antd/es/upload/Dragger";
import React, { useEffect, useState } from "react";
import { InboxOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Link, useNavigate } from "react-router-dom";
import { useAddDisherInfoMutation, useAddDriyerMutation, useAddWasherMutation, useAddWaterPumpMutation } from "../redux/api/routesApi";
import { useGetProfileQuery } from "../redux/api/userApi";
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
const AddDishWasherInfo = () => {
  const navigate = useNavigate();
  const [addHeater] = useAddDisherInfoMutation();
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const {data:profileData} = useGetProfileQuery();
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
  const handleSubmit = async (values) => {
    const formData = new FormData();
    const rvId = profileData?.user?.selectedRvId?._id;

    if (!rvId) {
      message.error(
        "Please select your RV from the home page before submitting."
      );
      return;
    }
    formData.append("rvId", rvId);
    formData.append("name", values.name || "");
    // formData.append("location", values.location || "");
    formData.append("modelNumber", values.modelNumber || "");
    formData.append(
      "dateOfPurchase",
      values.dateOfPurchase
        ? dayjs(values.dateOfPurchase).format(dateFormat)
        : ""
    );
formData.append("phoneNumber", values.phoneNumber || "");
    formData.append("cost", values.cost ? Number(values.cost) : "");

    formData.append("notes", values.notes || "");

    // Multiple image upload
    fileList.forEach((file) => {
      if (file.originFileObj) {
        formData.append("images", file.originFileObj);
      }
    });
setLoading(true);
    try {
      const res = await addHeater(formData).unwrap();
      message.success(res?.message || "Saved successfully");
     
      form.resetFields();
      setFileList([]);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      message.error(err?.data?.message || "Something went wrong");
    }
  };
  const onChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
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

  //   const handleChange = (e) => {
  //     const input = e.target.value;
  //     const formatted = formatWithCommas(input);
  //     setMileage(formatted);
  //     form.setFieldsValue({ qty: formatted });
  //   };

  return (
    <div className="container m-auto">
      <div className=" lg:mt-11 mt-6 px-3">
        <div className=" pb-7 lg:pb-0">
          <h1 className="text-3xl font-semibold text-[#F9B038]">
          Add Dishwasher Information
          </h1>
        </div>
        <div className="max-w-4xl m-auto mt-11">
          <Form form={form} onFinish={handleSubmit} onValuesChange={handleFormChange} layout="vertical">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label={<span style={{ color: "#F9B038" }}>Name</span>}
                name="name"
                // rules={[{ required: true, message: "Please input Name!" }]}
              >
                <Input
                  className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                  placeholder="Name"
                />
              </Form.Item>
              <Form.Item
                label={
                  <span style={{ color: "#F9B038" }}>Date of Purchase</span>
                }
                name="dateOfPurchase"
              >
                <DatePicker
                  className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                  format={dateFormat}
                />
              </Form.Item>
            </div>
            <Form.Item
              label={<span style={{ color: "#F9B038" }}>Serial Number</span>}
              name="serialNumber"
            >
              <Input
              
                className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                placeholder="Type serial"
              />
            </Form.Item>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label={<span style={{ color: "#F9B038" }}>Model Number</span>}
                name="modelNumber"
                //   rules={[
                //     { required: true, message: "Please input Model Number!" },
                //   ]}
              >
                <Input
                  className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                  placeholder="Model Number"
                />
              </Form.Item>
              <Form.Item
                label={<span style={{ color: "#F9B038" }}>Cost</span>}
                name="cost"
                normalize={(value) => parseNumber(value)}
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
                  {fileList.length < 5 && "+ Upload"}
                </Upload>
              </div>
              <Form.Item
                label={<span style={{ color: "#F9B038" }}>Notes</span>}
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
            <Link to={"/details/AddCellingFans"}>
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

export default AddDishWasherInfo;
