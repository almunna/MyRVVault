import { Button, Form, Input, message, Select, Spin } from "antd";
import React, { useEffect, useState } from "react";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useAddChassisMutation } from "../redux/api/routesApi";
import { useGetProfileQuery } from "../redux/api/userApi";

const { Option } = Select;

const SectionHeading = ({ title }) => (
  <div className="flex items-center gap-3 mb-5 mt-6">
    <div className="w-1 h-5 rounded-full bg-[#F9B038]" />
    <h2 className="text-sm font-semibold text-[#F9B038] uppercase tracking-widest">
      {title}
    </h2>
    <div className="flex-1 h-px bg-[#F9B038]/20" />
  </div>
);

const inputClass = "w-full bg-white border-2 border-[#F9B038] text-gray-900 placeholder-gray-400 rounded-md py-2";
const labelStyle = { color: "#F9B038", fontWeight: 500 };

const FilterList = ({ name, label }) => (
  <>
    <SectionHeading title={label} />
    <Form.List name={name} initialValue={[{}]}>
      {(fields, { add, remove }) => (
        <div className="space-y-3">
          {fields.map(({ key, name: fieldName, ...restField }) => (
            <div key={key} className="grid grid-cols-12 gap-3 items-end">
              <Form.Item
                label={<span style={labelStyle}>Name</span>}
                {...restField}
                name={[fieldName, "beltName"]}
                className="col-span-5 mb-0"
              >
                <Input placeholder="Enter name" className={inputClass} />
              </Form.Item>
              <Form.Item
                label={<span style={labelStyle}>Part Number</span>}
                {...restField}
                name={[fieldName, "partNumber"]}
                className="col-span-5 mb-0"
              >
                <Input type="number" placeholder="Enter part number" className={inputClass} />
              </Form.Item>
              <div className="col-span-2 flex items-center gap-1 pb-1">
                <button
                  type="button"
                  onClick={() => add()}
                  className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-[#F9B038] text-[#F9B038] hover:bg-[#F9B038] hover:text-black transition-all duration-200 text-sm font-bold"
                >
                  +
                </button>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(fieldName)}
                    className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-red-300 text-red-400 hover:bg-red-50 transition-all duration-200 text-sm font-bold"
                  >
                    −
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Form.List>
  </>
);

const Information = () => {
  const [addChassisInformation] = useAddChassisMutation();
  const { data: profileData } = useGetProfileQuery();
  const [isFormFilled, setIsFormFilled] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  useEffect(() => {
    handleFormChange();
  }, []);

  const handleFormChange = () => {
    const values = form.getFieldsValue();
    const hasValue = Object.values(values).some(
      (value) => value !== undefined && value !== null && value !== ""
    );
    setIsFormFilled(hasValue);
  };

  const handleSubmit = async (values) => {
    const data = {
      mfg: values.Manufacturer,
      modelNo: values.Model,
      name: values.Name,
      serialId: values.Serial,
      fuelType: values.FuelType,
      engineModel: values.engineModel || "",
      hp: Number(values.hp) || 0,
      belt: values.belts?.map((item) => ({ name: item.beltName, partNo: Number(item.partNumber) })) || [],
      oilFilter: values.Oil?.map((item) => ({ name: item.beltName, partNo: Number(item.partNumber) })) || [],
      fuelFilter: values.Fuel?.map((item) => ({ name: item.beltName, partNo: Number(item.partNumber) })) || [],
    };
    setLoading(true);
    try {
      const res = await addChassisInformation(data).unwrap();
      message.success(res?.message);
      setLoading(false);
      navigate("/chassisInfo");
    } catch (err) {
      setLoading(false);
      message.error(err?.data?.message);
    }
  };

  return (
    <div className="py-10 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            to="/chassisInfo"
            className="flex items-center justify-center w-9 h-9 rounded-full border-2 border-[#F9B038]/40 text-[#F9B038] hover:bg-[#F9B038] hover:text-black transition-all duration-200 text-lg font-bold"
          >
            ←
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-[#F9B038]">Add Chassis Info</h1>
            <p className="text-gray-500 text-sm mt-0.5">Fill in the chassis details for your RV</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-md border border-[#F9B038]/20 p-8">
          <Form form={form} onFinish={handleSubmit} onValuesChange={handleFormChange} layout="vertical">

            {/* Basic Info */}
            <SectionHeading title="Basic Information" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <Form.Item
                label={<span style={labelStyle}>Manufacturer <span className="text-red-500">*</span></span>}
                name="Manufacturer"
                rules={[{ required: true, message: "Please input Manufacturer!" }]}
              >
                <Input className={inputClass} placeholder="e.g. Ford, Freightliner" />
              </Form.Item>
              <Form.Item label={<span style={labelStyle}>Model</span>} name="Model">
                <Input className={inputClass} placeholder="Model" />
              </Form.Item>
              <Form.Item label={<span style={labelStyle}>Name</span>} name="Name">
                <Input className={inputClass} placeholder="Chassis name" />
              </Form.Item>
              <Form.Item label={<span style={labelStyle}>Serial ID</span>} name="Serial">
                <Input className={inputClass} placeholder="Serial ID" />
              </Form.Item>
            </div>

            <Form.Item label={<span style={labelStyle}>Fuel Type</span>} name="FuelType">
              <Select className="custom-select-orange" style={{ height: 40 }} placeholder="Select Fuel Type">
                <Option value="Diesel">Diesel</Option>
                <Option value="Gas">Gas</Option>
                <Option value="N/A">N/A</Option>
              </Select>
            </Form.Item>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <Form.Item label={<span style={labelStyle}>Engine Model</span>} name="engineModel">
                <Input className={inputClass} placeholder="Engine Model" />
              </Form.Item>
              <Form.Item label={<span style={labelStyle}>Horsepower</span>} name="hp">
                <Input type="number" className={inputClass} placeholder="e.g. 350" />
              </Form.Item>
            </div>

            {/* Filter Lists */}
            <FilterList name="belts" label="Belt" />
            <FilterList name="Oil" label="Oil Filter" />
            <FilterList name="Fuel" label="Fuel Filter" />

            {/* Submit */}
            <div className="pt-6 border-t border-gray-100 mt-6">
              <button
                type="submit"
                disabled={!isFormFilled || loading}
                className={`w-full py-3 rounded-xl font-semibold text-base flex justify-center items-center gap-2 transition-all duration-300 ${
                  loading
                    ? "bg-[#b37a01] cursor-not-allowed text-white"
                    : isFormFilled
                    ? "bg-[#F9B038] text-black hover:bg-[#d6952f] shadow-md hover:shadow-lg"
                    : "bg-[#e8d5b0] text-[#a08040] cursor-not-allowed"
                }`}
              >
                {loading ? (<><Spin size="small" /><span>Submitting...</span></>) : "Save Chassis Info"}
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Information;
