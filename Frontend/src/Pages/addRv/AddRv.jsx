import {
  Button,
  ConfigProvider,
  DatePicker,
  Form,
  Input,
  message,
  Select,
  Spin,
} from "antd";
import Dragger from "antd/es/upload/Dragger";
import React, { useEffect, useState } from "react";
import { InboxOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useNavigate } from "react-router-dom";
import { useAddRvMutation } from "../redux/api/routesApi";
import { useGetProfileQuery } from "../redux/api/userApi";
const states = {
  ALABAMA: "Alabama",
  ALASKA: "Alaska",
  ARIZONA: "Arizona",
  ARKANSAS: "Arkansas",
  CALIFORNIA: "California",
  COLORADO: "Colorado",
  CONNECTICUT: "Connecticut",
  DELAWARE: "Delaware",
  FLORIDA: "Florida",
  GEORGIA: "Georgia",
  HAWAII: "Hawaii",
  IDAHO: "Idaho",
  ILLINOIS: "Illinois",
  INDIANA: "Indiana",
  IOWA: "Iowa",
  KANSAS: "Kansas",
  KENTUCKY: "Kentucky",
  LOUISIANA: "Louisiana",
  MAINE: "Maine",
  MARYLAND: "Maryland",
  MASSACHUSETTS: "Massachusetts",
  MICHIGAN: "Michigan",
  MINNESOTA: "Minnesota",
  MISSISSIPPI: "Mississippi",
  MISSOURI: "Missouri",
  MONTANA: "Montana",
  NEBRASKA: "Nebraska",
  NEVADA: "Nevada",
  NEW_HAMPSHIRE: "New Hampshire",
  NEW_JERSEY: "New Jersey",
  NEW_MEXICO: "New Mexico",
  NEW_YORK: "New York",
  NORTH_CAROLINA: "North Carolina",
  NORTH_DAKOTA: "North Dakota",
  OHIO: "Ohio",
  OKLAHOMA: "Oklahoma",
  OREGON: "Oregon",
  PENNSYLVANIA: "Pennsylvania",
  RHODE_ISLAND: "Rhode Island",
  SOUTH_CAROLINA: "South Carolina",
  SOUTH_DAKOTA: "South Dakota",
  TENNESSEE: "Tennessee",
  TEXAS: "Texas",
  UTAH: "Utah",
  VERMONT: "Vermont",
  VIRGINIA: "Virginia",
  WASHINGTON: "Washington",
  WEST_VIRGINIA: "West Virginia",
  WISCONSIN: "Wisconsin",
  WYOMING: "Wyoming",
};
dayjs.extend(customParseFormat);
const dateFormat = "MM/DD/YYYY";
const AddRv = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [addRv] = useAddRvMutation();
  const { data: profileData } = useGetProfileQuery();
  const [isFormFilled, setIsFormFilled] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    handleFormChange(); // initial check
  }, []);
  // ✅ Check if any field has valuesdf
  const handleFormChange = () => {
    const values = form.getFieldsValue();
    const hasValue = Object.values(values).some(
      (value) => value !== undefined && value !== null && value !== ""
    );
    setIsFormFilled(hasValue);
  };
  const handleSubmit = async (values) => {
    const toFeet = (feet, inches) =>
      parseFloat(feet || 0) + parseFloat(inches || 0) / 12;
    const payload = {
      length: toFeet(values.lengthFeet, values.lengthInches),
      width: toFeet(values.widthFeet, values.widthInches),
      height: toFeet(values.heightFeet, values.heightInches),
    };
    console.log(payload);

    const data = {
      ...payload,
      nickname: values.nickname,
      class: values.class,
      manufacturer: values.manufacturer,
      modelName: values.modelName,
      modelYear: values.modelYear,
      vinNumber: values.vinNumber,
      model: values.model,
      dateOfPurchase: values.dateOfPurchase?.toISOString(),
      amountPaid: values.amountPaid,
      condition: values.condition,
      currentMileage: values.currentMileage,
      purchasedFrom: values.purchasedFrom,
      city: values.city,
      state: values.state,
      phoneNumber: values.phoneNumber,
      floorplan: values.floorplan,
      interiorColorScheme: values.interiorColorScheme,
      exteriorColorScheme: values.exteriorColorScheme,

      weight: values.weight,
    };
    setLoading(true);
    try {
      const res = await addRv(data).unwrap();
      message.success(res?.message || "RV added successfully!");
      form.resetFields();
      setLoading(false);
      setTimeout(() => {
        navigate("/information");
      }, 2000);
    } catch (err) {
      message.error(err?.data?.message || "Something went wrong!");
      setLoading(false);
    }
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

  return (
    <div className="container m-auto py-7 px-3 lg:px-0">
      <div className="gap-4">
        <div className="">
          <h1 className="text-3xl font-semibold text-[#F9B038]">Add RV</h1>
        </div>
        <div className=" max-w-4xl m-auto pt-8">
          <Form
            form={form}
            onFinish={handleSubmit}
            onValuesChange={handleFormChange}
            layout="vertical"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label={<span style={{ color: "#F9B038" }}>RV Nickname</span>}
                name="nickname"
                rules={[{ required: true, message: "Enter RV Nickname" }]}
              >
                <Input
                  className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                  placeholder="Enter RV Nickname"
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: "#F9B038" }}>Class</span>}
                name="class"
              >
                <Select
                  className="custom-select"
                  style={{ height: "40px" }}
                  placeholder="Select Class"
                >
                  <Option value="Class A">Class A</Option>
                  <Option value="Class B">Class B</Option>
                  <Option value="Class C">Class C</Option>
                  <Option value="Super C">Super C</Option>
                  <Option value="5th Wheel">5th Wheel</Option>
                  <Option value="Camper">Camper</Option>
                  <Option value="Other">Other</Option>
                </Select>
              </Form.Item>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label={<span style={{ color: "#F9B038" }}>Manufacturer</span>}
                name="manufacturer"
                rules={[
                  {
                    required: true,
                    message: "Please input Manufacturer",
                  },
                ]}
              >
                <Input
                  className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                  placeholder="Manufacturer"
                />
              </Form.Item>
              <Form.Item
                label={<span style={{ color: "#F9B038" }}>Model Name</span>}
                name="modelName"
                rules={[
                  {
                    required: true,
                    message: "Please input Model Name",
                  },
                ]}
              >
                <Input
                  className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                  placeholder="Model Name"
                />
              </Form.Item>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label={<span style={{ color: "#F9B038" }}>Model Year</span>}
                name="modelYear"
                rules={[
                  {
                    required: true,
                    message: "Please input Model Year!",
                  },
                ]}
              >
                <Input
                  type="number"
                  className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                  placeholder="Model Year"
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: "#F9B038" }}>Model</span>}
                name="model"
                rules={[
                  {
                    required: true,
                    message: "Please input Model!",
                  },
                ]}
              >
                <Input
                  className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                  placeholder="Model"
                />
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Form.Item
                label={<span style={{ color: "#F9B038" }}>Amount Paid</span>}
                name="amountPaid"
                normalize={(value) => parseNumber(value)}
                getValueProps={(value) => ({
                  value: formatWithCommas(value),
                })}
                rules={[
                  {
                    pattern: /^\d+$/,
                    message: "Please enter Amount Paid",
                  },
                ]}
              >
                <Input
                  className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                  placeholder="Amount Paid"
                />
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label={<span style={{ color: "#F9B038" }}>Condition</span>}
                name="condition"
              >
                <Select
                  className="custom-select"
                  style={{ height: "40px" }}
                  placeholder="Select Condition"
                >
                  <Option value="New">New</Option>
                  <Option value="Used">Used</Option>
                </Select>
              </Form.Item>
              <Form.Item
                label={
                  <span style={{ color: "#F9B038" }}>Current Mileage</span>
                }
                name="currentMileage"
                normalize={(value) => parseNumber(value)}
                getValueProps={(value) => ({
                  value: formatWithCommas(value),
                })}
              >
                <Input
                  className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                  placeholder="Current Mileage"
                />
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label={<span style={{ color: "#F9B038" }}>Purchased Form</span>}
                name="purchasedFrom"
              >
                <Input
                  className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                  placeholder="Purchased Form"
                />
              </Form.Item>
              <Form.Item
                label={<span style={{ color: "#F9B038" }}>City</span>}
                name="City"
              >
                <Input
                  className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                  placeholder="City"
                />
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label={<span style={{ color: "#F9B038" }}>States</span>}
                name="state"
              >
                <Select
                  showSearch
                  placeholder="Select State"
                  optionFilterProp="children"
                  className="custom-select"
                  style={{ height: "40px" }}
                >
                  {Object.entries(states).map(([key, value]) => (
                    <Option key={key} value={key}>
                      {value}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label={<span style={{ color: "#F9B038" }}>Phone Number</span>}
                name="phoneNumber"
              >
                <Input
                  type="Number"
                  className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                  placeholder="Phone Number"
                />
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label={<span style={{ color: "#F9B038" }}>Floor Plan</span>}
                name="floorplan"
              >
                <Input
                  className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                  placeholder="Floor Plan"
                />
              </Form.Item>
              <Form.Item
                label={
                  <span style={{ color: "#F9B038" }}>
                    Interior Color Scheme
                  </span>
                }
                name="interiorColorScheme"
              >
                <Input
                  className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                  placeholder="Interior Color Scheme"
                />
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label={
                  <span style={{ color: "#F9B038" }}>
                    Exterior Color Scheme
                  </span>
                }
                name="exteriorColorScheme"
              >
                <Input
                  className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                  placeholder="Exterior Color Scheme"
                />
              </Form.Item>
              <Form.Item
                label={<span style={{ color: "#F9B038" }}>Vin#</span>}
                name="vinNumber"
              >
                <Input
                  className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                  placeholder="Vin#"
                />
              </Form.Item>
            </div>

           
            {/* Length */}
            <div className="grid grid-cols-2 gap-4">
              <p className="mb-2">
                <span style={{ color: "#F9B038" }}>Length</span>
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Form.Item name="lengthFeet">
                <Select
                  className="custom-select"
                  style={{ height: "40px" }}
                  placeholder="Feet"
                >
                  <Option value="5">5</Option>
                  <Option value="6">6</Option>
                  <Option value="7">7</Option>
                  <Option value="8">8</Option>
                  <Option value="9">9</Option>
                  <Option value="10">10</Option>
                  <Option value="11">11</Option>
                  <Option value="12">12</Option>
                  <Option value="13">13</Option>
                  <Option value="14">14</Option>
                  <Option value="15">15</Option>
                  <Option value="16">16</Option>
                  <Option value="17">17</Option>
                  <Option value="18">18</Option>
                  <Option value="19">19</Option>
                  <Option value="20">20</Option>
                  <Option value="21">21</Option>
                  <Option value="22">22</Option>
                  <Option value="23">23</Option>
                  <Option value="24">24</Option>
                  <Option value="25">25</Option>
                  <Option value="26">26</Option>
                  <Option value="27">27</Option>
                  <Option value="28">28</Option>
                  <Option value="29">29</Option>
                  <Option value="30">30</Option>
                  <Option value="31">31</Option>
                  <Option value="32">32</Option>
                  <Option value="33">33</Option>
                  <Option value="34">34</Option>
                  <Option value="35">35</Option>
                  <Option value="36">36</Option>
                  <Option value="37">37</Option>
                  <Option value="38">38</Option>
                  <Option value="39">39</Option>
                  <Option value="40">40</Option>
                  <Option value="41">41</Option>
                  <Option value="42">42</Option>
                  <Option value="43">43</Option>
                  <Option value="44">44</Option>
                  <Option value="45">45</Option>
                  <Option value="46">46</Option>
                  <Option value="47">47</Option>
                  <Option value="48">48</Option>
                  <Option value="49">49</Option>
                  <Option value="50">50</Option>
                </Select>
              </Form.Item>

              <Form.Item name="lengthInches">
                <Select
                  className="custom-select"
                  style={{ height: "40px" }}
                  placeholder="Inches"
                >
                  <Option value="0">0</Option>
                  <Option value="1">1</Option>
                  <Option value="2">2</Option>
                  <Option value="3">3</Option>
                  <Option value="4">4</Option>
                  <Option value="5">5</Option>
                  <Option value="6">6</Option>
                  <Option value="7">7</Option>
                  <Option value="8">8</Option>
                  <Option value="9">9</Option>
                  <Option value="10">10</Option>
                  <Option value="11">11</Option>
                  <Option value="12">12</Option>
                </Select>
              </Form.Item>
            </div>

            {/* Width */}
            {/* Width */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <p className="mb-2">
                <span style={{ color: "#F9B038" }}>Width</span>
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Form.Item name="widthFeet">
                <Select
                  className="custom-select"
                  style={{ height: "40px" }}
                  placeholder="Feet"
                >
                  <Option value="5">5</Option>
                  <Option value="6">6</Option>
                  <Option value="7">7</Option>
                  <Option value="8">8</Option>
                  <Option value="9">9</Option>
                  <Option value="10">10</Option>
                  <Option value="11">11</Option>
                  <Option value="12">12</Option>
                  <Option value="13">13</Option>
                  <Option value="14">14</Option>
                  <Option value="15">15</Option>
                  <Option value="16">16</Option>
                  <Option value="17">17</Option>
                  <Option value="18">18</Option>
                  <Option value="19">19</Option>
                  <Option value="20">20</Option>
                  <Option value="21">21</Option>
                  <Option value="22">22</Option>
                  <Option value="23">23</Option>
                  <Option value="24">24</Option>
                  <Option value="25">25</Option>
                  <Option value="26">26</Option>
                  <Option value="27">27</Option>
                  <Option value="28">28</Option>
                  <Option value="29">29</Option>
                  <Option value="30">30</Option>
                  <Option value="31">31</Option>
                  <Option value="32">32</Option>
                  <Option value="33">33</Option>
                  <Option value="34">34</Option>
                  <Option value="35">35</Option>
                  <Option value="36">36</Option>
                  <Option value="37">37</Option>
                  <Option value="38">38</Option>
                  <Option value="39">39</Option>
                  <Option value="40">40</Option>
                  <Option value="41">41</Option>
                  <Option value="42">42</Option>
                  <Option value="43">43</Option>
                  <Option value="44">44</Option>
                  <Option value="45">45</Option>
                  <Option value="46">46</Option>
                  <Option value="47">47</Option>
                  <Option value="48">48</Option>
                  <Option value="49">49</Option>
                  <Option value="50">50</Option>
                </Select>
              </Form.Item>
              <Form.Item name="widthInches">
                <Select
                  className="custom-select"
                  style={{ height: "40px" }}
                  placeholder="Inches"
                >
                  <Option value="0">0</Option>
                  <Option value="1">1</Option>
                  <Option value="2">2</Option>
                  <Option value="3">3</Option>
                  <Option value="4">4</Option>
                  <Option value="5">5</Option>
                  <Option value="6">6</Option>
                  <Option value="7">7</Option>
                  <Option value="8">8</Option>
                  <Option value="9">9</Option>
                  <Option value="10">10</Option>
                  <Option value="11">11</Option>
                  <Option value="12">12</Option>
                </Select>
              </Form.Item>
            </div>

            {/* Height */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <p className="mb-2">
                <span style={{ color: "#F9B038" }}>Height</span>
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Form.Item name="heightFeet">
                <Select
                  className="custom-select"
                  style={{ height: "40px" }}
                  placeholder="Feet"
                >
                  <Option value="5">5</Option>
                  <Option value="6">6</Option>
                  <Option value="7">7</Option>
                  <Option value="8">8</Option>
                  <Option value="9">9</Option>
                  <Option value="10">10</Option>
                  <Option value="11">11</Option>
                  <Option value="12">12</Option>
                  <Option value="13">13</Option>
                  <Option value="14">14</Option>
                  <Option value="15">15</Option>
                  <Option value="16">16</Option>
                  <Option value="17">17</Option>
                  <Option value="18">18</Option>
                  <Option value="19">19</Option>
                  <Option value="20">20</Option>
                  <Option value="21">21</Option>
                  <Option value="22">22</Option>
                  <Option value="23">23</Option>
                  <Option value="24">24</Option>
                  <Option value="25">25</Option>
                  <Option value="26">26</Option>
                  <Option value="27">27</Option>
                  <Option value="28">28</Option>
                  <Option value="29">29</Option>
                  <Option value="30">30</Option>
                  <Option value="31">31</Option>
                  <Option value="32">32</Option>
                  <Option value="33">33</Option>
                  <Option value="34">34</Option>
                  <Option value="35">35</Option>
                  <Option value="36">36</Option>
                  <Option value="37">37</Option>
                  <Option value="38">38</Option>
                  <Option value="39">39</Option>
                  <Option value="40">40</Option>
                  <Option value="41">41</Option>
                  <Option value="42">42</Option>
                  <Option value="43">43</Option>
                  <Option value="44">44</Option>
                  <Option value="45">45</Option>
                  <Option value="46">46</Option>
                  <Option value="47">47</Option>
                  <Option value="48">48</Option>
                  <Option value="49">49</Option>
                  <Option value="50">50</Option>
                </Select>
              </Form.Item>
              <Form.Item name="heightInches">
                <Select
                  className="custom-select"
                  style={{ height: "40px" }}
                  placeholder="Inches"
                >
                  <Option value="0">0</Option>
                  <Option value="1">1</Option>
                  <Option value="2">2</Option>
                  <Option value="3">3</Option>
                  <Option value="4">4</Option>
                  <Option value="5">5</Option>
                  <Option value="6">6</Option>
                  <Option value="7">7</Option>
                  <Option value="8">8</Option>
                  <Option value="9">9</Option>
                  <Option value="10">10</Option>
                  <Option value="11">11</Option>
                  <Option value="12">12</Option>
                </Select>
              </Form.Item>
            </div>
             <Form.Item
                label={<span style={{ color: "#F9B038" }}>Weight</span>}
                name="weight"
                normalize={(value) => parseNumber(value)}
                getValueProps={(value) => ({
                  value: formatWithCommas(value),
                })}
              >
                <Input
                  className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                  placeholder="Pounds"
                />
              </Form.Item>
            <Form.Item className=" pt-3">
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
        </div>
      </div>
    </div>
  );
};

export default AddRv;
