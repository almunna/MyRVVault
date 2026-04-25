import { DatePicker, Form, Input, message, Select } from "antd";
import React, { useState } from "react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useNavigate } from "react-router-dom";
import { useAddSellRvMutation } from "../redux/api/routesApi";
import { useGetProfileQuery } from "../redux/api/userApi";

dayjs.extend(customParseFormat);
const dateFormat = "MM/DD/YYYY";

const AddSoldRV = () => {
  const [addSellRv] = useAddSellRvMutation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { data: profileData } = useGetProfileQuery();
  const [sellingMileage, setSellingMileage] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");

  const formatWithCommas = (value) => {
    const onlyNumbers = value.replace(/[^\d]/g, "");
    return onlyNumbers.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleMileageChange = (e) => {
    const formatted = formatWithCommas(e.target.value);
    setSellingMileage(formatted);
    form.setFieldsValue({ sellingMileage: formatted });
  };

  const handlePriceChange = (e) => {
    const formatted = formatWithCommas(e.target.value);
    setSellingPrice(formatted);
    form.setFieldsValue({ sellingPrice: formatted });
  };

  const handleSubmit = async (values) => {
    const rvId = profileData?.user?.selectedRvId?.id;

    if (!rvId) {
      message.error(
        "Please select your RV from the home page before submitting."
      );
      return;
    }
    const formData = {
      rvId: values.rv.value,
      rvType: values.rv.label,
      sellingMileage: Number(values.sellingMileage.replace(/,/g, "")),
      sellingPrice: Number(values.sellingPrice.replace(/,/g, "")),
      maintenanceToBePerformed: values.maintenanceToBePerformed,
      sellingDate: values.sellingDate?.toISOString(),
    };
    console.log(formData);
    try {
      const res = await addSellRv(formData).unwrap();
      message.success(res?.message || "Saved successfully");
      form.resetFields();
      setSellingMileage("");
      setSellingPrice("");
      navigate("/"); // Navigate after success
    } catch (err) {
      message.error(err?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="container m-auto">
      <div className="gap-4 lg:mt-8 mt-6 px-3">
        <div className="pb-7 lg:pb-0">
          <h1 className="text-3xl text-[#F9B038] font-semibold mb-6">
            Add Sold RV
          </h1>
        </div>
        <div className="max-w-4xl m-auto text-[#F9B038]">
          <Form form={form} onFinish={handleSubmit} layout="vertical">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item label={<span style={{ color: "#F9B038" }}>Rv Type</span>} name="rv" rules={[{ required: true }]}>
                <Select className="custom-select" labelInValue placeholder="Select category">
                  {profileData?.user?.rvIds?.map((rv) => (
                    <Select.Option key={rv._id} value={rv._id}>
                      {rv.nickname}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label={<span style={{ color: "#F9B038" }}>Selling Date</span>}
                name="sellingDate"
                rules={[{ required: true, message: "Please select a date!" }]}
              >
                <DatePicker
                  className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                  format={dateFormat}
                />
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label={<span style={{ color: "#F9B038" }}>Selling Price</span>}
                name="sellingPrice"
                rules={[
                  { required: true, message: "Please enter Selling Price!" },
                ]}
              >
                <Input
                  className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                  placeholder="Selling Price"
                  value={sellingPrice}
                  onChange={handlePriceChange}
                />
              </Form.Item>

              <Form.Item
                label={
                  <span style={{ color: "#F9B038" }}>Selling Mileage</span>
                }
                name="sellingMileage"
                rules={[
                  { required: true, message: "Please enter Selling Mileage!" },
                ]}
              >
                <Input
                  className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                  placeholder="Selling Mileage"
                  value={sellingMileage}
                  onChange={handleMileageChange}
                />
              </Form.Item>
            </div>

            <Form.Item className="pt-7">
              <button
                type="submit"
                className="w-full bg-[#F9B038] py-2 text-black font-semibold"
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

export default AddSoldRV;
