import { DatePicker, Form, Input, message, Select, Spin } from "antd";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useGetSingleRvQuery, useUpdateRvMutation } from "../redux/api/routesApi";

dayjs.extend(customParseFormat);
const dateFormat = "MM/DD/YYYY";
const { Option } = Select;

const states = {
  ALABAMA: "Alabama", ALASKA: "Alaska", ARIZONA: "Arizona",
  ARKANSAS: "Arkansas", CALIFORNIA: "California", COLORADO: "Colorado",
  CONNECTICUT: "Connecticut", DELAWARE: "Delaware", FLORIDA: "Florida",
  GEORGIA: "Georgia", HAWAII: "Hawaii", IDAHO: "Idaho",
  ILLINOIS: "Illinois", INDIANA: "Indiana", IOWA: "Iowa",
  KANSAS: "Kansas", KENTUCKY: "Kentucky", LOUISIANA: "Louisiana",
  MAINE: "Maine", MARYLAND: "Maryland", MASSACHUSETTS: "Massachusetts",
  MICHIGAN: "Michigan", MINNESOTA: "Minnesota", MISSISSIPPI: "Mississippi",
  MISSOURI: "Missouri", MONTANA: "Montana", NEBRASKA: "Nebraska",
  NEVADA: "Nevada", NEW_HAMPSHIRE: "New Hampshire", NEW_JERSEY: "New Jersey",
  NEW_MEXICO: "New Mexico", NEW_YORK: "New York",
  NORTH_CAROLINA: "North Carolina", NORTH_DAKOTA: "North Dakota",
  OHIO: "Ohio", OKLAHOMA: "Oklahoma", OREGON: "Oregon",
  PENNSYLVANIA: "Pennsylvania", RHODE_ISLAND: "Rhode Island",
  SOUTH_CAROLINA: "South Carolina", SOUTH_DAKOTA: "South Dakota",
  TENNESSEE: "Tennessee", TEXAS: "Texas", UTAH: "Utah",
  VERMONT: "Vermont", VIRGINIA: "Virginia", WASHINGTON: "Washington",
  WEST_VIRGINIA: "West Virginia", WISCONSIN: "Wisconsin", WYOMING: "Wyoming",
};

const feetOptions = Array.from({ length: 46 }, (_, i) => i + 5);
const inchOptions = Array.from({ length: 13 }, (_, i) => i);

const SectionHeading = ({ title }) => (
  <div className="flex items-center gap-3 mb-5 mt-2">
    <div className="w-1 h-5 rounded-full bg-[#F9B038]" />
    <h2 className="text-sm font-semibold text-[#F9B038] uppercase tracking-widest">
      {title}
    </h2>
    <div className="flex-1 h-px bg-[#F9B038]/20" />
  </div>
);

const inputClass =
  "w-full bg-white border-2 border-[#F9B038] text-gray-900 placeholder-gray-400 rounded-md py-2";
const labelStyle = { color: "#F9B038", fontWeight: 500 };

const toFeetParts = (decimal) => {
  if (!decimal && decimal !== 0) return {};
  const ft = Math.floor(decimal);
  const inch = Math.round((decimal - ft) * 12);
  return { feet: String(ft), inches: String(Math.min(inch, 12)) };
};

const formatWithCommas = (value) => {
  if (!value) return "";
  return value.toString().replace(/[^\d]/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const parseNumber = (value) => (value ? value.replace(/,/g, "") : "");

const EditRv = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [updateRv] = useUpdateRvMutation();
  const [loading, setLoading] = useState(false);
  const [isFormFilled, setIsFormFilled] = useState(false);

  const { data, isLoading, isError } = useGetSingleRvQuery({ id });

  // Pre-populate form once data loads
  useEffect(() => {
    const rv = data?.data;
    if (!rv) return;

    const length = toFeetParts(rv.length);
    const width  = toFeetParts(rv.width);
    const height = toFeetParts(rv.height);

    form.setFieldsValue({
      nickname:            rv.nickname,
      class:               rv.class,
      manufacturer:        rv.manufacturer,
      modelName:           rv.modelName,
      modelYear:           rv.modelYear,
      model:               rv.model,
      vinNumber:           rv.vinNumber,
      dateOfPurchase:      rv.dateOfPurchase ? dayjs(rv.dateOfPurchase) : undefined,
      amountPaid:          rv.amountPaid ? formatWithCommas(String(rv.amountPaid)) : undefined,
      condition:           rv.condition,
      currentMileage:      rv.currentMileage ? formatWithCommas(String(rv.currentMileage)) : undefined,
      purchasedFrom:       rv.purchasedFrom,
      city:                rv.city,
      state:               rv.state,
      phoneNumber:         rv.phoneNumber,
      floorplan:           rv.floorplan,
      interiorColorScheme: rv.interiorColorScheme,
      exteriorColorScheme: rv.exteriorColorScheme,
      weight:              rv.weight ? formatWithCommas(String(rv.weight)) : undefined,
      tireCount:           rv.tireCount,
      generatorHours:      rv.generatorHours,
      houseSystems:        rv.houseSystems || [],
      ...(length.feet && { lengthFeet: length.feet, lengthInches: length.inches }),
      ...(width.feet  && { widthFeet:  width.feet,  widthInches:  width.inches  }),
      ...(height.feet && { heightFeet: height.feet, heightInches: height.inches }),
    });
    setIsFormFilled(true);
  }, [data]);

  const handleFormChange = () => {
    const values = form.getFieldsValue();
    const hasValue = Object.values(values).some(
      (v) => v !== undefined && v !== null && v !== ""
    );
    setIsFormFilled(hasValue);
  };

  const handleSubmit = async (values) => {
    const toFeet = (feet, inches) =>
      parseFloat(feet || 0) + parseFloat(inches || 0) / 12;

    const formData = {
      length:              toFeet(values.lengthFeet, values.lengthInches),
      width:               toFeet(values.widthFeet,  values.widthInches),
      height:              toFeet(values.heightFeet, values.heightInches),
      nickname:            values.nickname,
      class:               values.class,
      manufacturer:        values.manufacturer,
      modelName:           values.modelName,
      modelYear:           values.modelYear,
      vinNumber:           values.vinNumber,
      model:               values.model,
      dateOfPurchase:      values.dateOfPurchase?.toISOString(),
      amountPaid:          values.amountPaid ? Number(String(values.amountPaid).replace(/[^\d.]/g, "")) : undefined,
      condition:           values.condition,
      currentMileage:      values.currentMileage ? Number(String(values.currentMileage).replace(/[^\d.]/g, "")) : undefined,
      purchasedFrom:       values.purchasedFrom,
      city:                values.city,
      state:               values.state,
      phoneNumber:         values.phoneNumber,
      floorplan:           values.floorplan,
      interiorColorScheme: values.interiorColorScheme,
      exteriorColorScheme: values.exteriorColorScheme,
      weight:              values.weight ? Number(String(values.weight).replace(/[^\d.]/g, "")) : undefined,
      tireCount:           values.tireCount ? Number(values.tireCount) : undefined,
      generatorHours:      values.generatorHours ? Number(values.generatorHours) : undefined,
      houseSystems:        values.houseSystems || [],
    };

    setLoading(true);
    try {
      const res = await updateRv({ formData, id }).unwrap();
      message.success(res?.message || "RV updated successfully!");
      setLoading(false);
      navigate(`/rvDetails/${id}`);
    } catch (err) {
      message.error(err?.data?.message || "Something went wrong!");
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="h-9 w-40 bg-[#F9B038]/20 rounded-lg mb-8 animate-pulse" />
          <div className="bg-white rounded-2xl border border-[#F9B038]/20 p-8 animate-pulse space-y-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-gray-100 rounded-md w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">Could not load RV data.</p>
          <Link
            to="/myRv"
            className="px-5 py-2 bg-[#F9B038] text-black font-semibold rounded-xl hover:bg-[#d6952f]"
          >
            Back to My RVs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Page Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            to={`/rvDetails/${id}`}
            className="flex items-center justify-center w-9 h-9 rounded-full border-2 border-[#F9B038]/40 text-[#F9B038] hover:bg-[#F9B038] hover:text-black transition-all duration-200 text-lg font-bold"
          >
            ←
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-[#F9B038]">Edit RV</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {data.data.nickname || "Unnamed RV"}
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-md border border-[#F9B038]/20 p-8">
          <Form
            form={form}
            onFinish={handleSubmit}
            onValuesChange={handleFormChange}
            layout="vertical"
          >
            {/* ── Basic Information ── */}
            <SectionHeading title="Basic Information" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <Form.Item
                label={<span style={labelStyle}>RV Nickname <span className="text-red-500">*</span></span>}
                name="nickname"
                rules={[{ required: true, message: "Enter RV Nickname" }]}
              >
                <Input className={inputClass} placeholder="Enter RV Nickname" />
              </Form.Item>

              <Form.Item label={<span style={labelStyle}>Class</span>} name="class">
                <Select className="custom-select-orange" style={{ height: 40 }} placeholder="Select Class">
                  {["Class A", "Class B", "Class C", "Super C", "5th Wheel", "Camper", "Other"].map((c) => (
                    <Option key={c} value={c}>{c}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label={<span style={labelStyle}>Manufacturer <span className="text-red-500">*</span></span>}
                name="manufacturer"
                rules={[{ required: true, message: "Please input Manufacturer" }]}
              >
                <Input className={inputClass} placeholder="Manufacturer" />
              </Form.Item>

              <Form.Item
                label={<span style={labelStyle}>Model Name <span className="text-red-500">*</span></span>}
                name="modelName"
                rules={[{ required: true, message: "Please input Model Name" }]}
              >
                <Input className={inputClass} placeholder="Model Name" />
              </Form.Item>

              <Form.Item
                label={<span style={labelStyle}>Model Year <span className="text-red-500">*</span></span>}
                name="modelYear"
                rules={[{ required: true, message: "Please input Model Year!" }]}
              >
                <Input type="number" className={inputClass} placeholder="e.g. 2022" />
              </Form.Item>

              <Form.Item
                label={<span style={labelStyle}>Model <span className="text-red-500">*</span></span>}
                name="model"
                rules={[{ required: true, message: "Please input Model!" }]}
              >
                <Input className={inputClass} placeholder="Model" />
              </Form.Item>

              <Form.Item label={<span style={labelStyle}>VIN #</span>} name="vinNumber">
                <Input className={inputClass} placeholder="17-character VIN" maxLength={17} />
              </Form.Item>
            </div>

            {/* ── Purchase Details ── */}
            <SectionHeading title="Purchase Details" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <Form.Item label={<span style={labelStyle}>Date of Purchase</span>} name="dateOfPurchase">
                <DatePicker
                  className="w-full bg-white border-2 border-[#F9B038] rounded-md py-2"
                  format={dateFormat}
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item
                label={<span style={labelStyle}>Amount Paid</span>}
                name="amountPaid"
                normalize={parseNumber}
                getValueProps={(v) => ({ value: formatWithCommas(v) })}
              >
                <Input className={inputClass} placeholder="Amount Paid" />
              </Form.Item>

              <Form.Item label={<span style={labelStyle}>Condition</span>} name="condition">
                <Select className="custom-select-orange" style={{ height: 40 }} placeholder="Select Condition">
                  <Option value="New">New</Option>
                  <Option value="Used">Used</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label={<span style={labelStyle}>Current Mileage</span>}
                name="currentMileage"
                normalize={parseNumber}
                getValueProps={(v) => ({ value: formatWithCommas(v) })}
              >
                <Input className={inputClass} placeholder="Current Mileage" />
              </Form.Item>

              <Form.Item label={<span style={labelStyle}>Purchased From</span>} name="purchasedFrom">
                <Input className={inputClass} placeholder="Dealership or seller name" />
              </Form.Item>

              <Form.Item label={<span style={labelStyle}>City</span>} name="city">
                <Input className={inputClass} placeholder="City" />
              </Form.Item>

              <Form.Item label={<span style={labelStyle}>State</span>} name="state">
                <Select
                  showSearch
                  className="custom-select-orange"
                  style={{ height: 40 }}
                  placeholder="Select State"
                  optionFilterProp="children"
                >
                  {Object.entries(states).map(([key, val]) => (
                    <Option key={key} value={key}>{val}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item label={<span style={labelStyle}>Phone Number</span>} name="phoneNumber">
                <Input type="number" className={inputClass} placeholder="Phone Number" />
              </Form.Item>
            </div>

            {/* ── Appearance ── */}
            <SectionHeading title="Appearance" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <Form.Item label={<span style={labelStyle}>Floor Plan</span>} name="floorplan">
                <Input className={inputClass} placeholder="Floor Plan" />
              </Form.Item>

              <Form.Item label={<span style={labelStyle}>Interior Color Scheme</span>} name="interiorColorScheme">
                <Input className={inputClass} placeholder="Interior Color Scheme" />
              </Form.Item>

              <Form.Item label={<span style={labelStyle}>Exterior Color Scheme</span>} name="exteriorColorScheme">
                <Input className={inputClass} placeholder="Exterior Color Scheme" />
              </Form.Item>
            </div>

            {/* ── Dimensions & Weight ── */}
            <SectionHeading title="Dimensions & Weight" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6">
              {[
                { label: "Length", feet: "lengthFeet", inches: "lengthInches" },
                { label: "Width",  feet: "widthFeet",  inches: "widthInches"  },
                { label: "Height", feet: "heightFeet", inches: "heightInches" },
              ].map(({ label, feet, inches }) => (
                <div key={label}>
                  <p className="text-sm font-medium mb-2" style={labelStyle}>{label}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Form.Item name={feet} className="mb-4">
                      <Select className="custom-select-orange" style={{ height: 40 }} placeholder="Feet">
                        {feetOptions.map((n) => <Option key={n} value={String(n)}>{n} ft</Option>)}
                      </Select>
                    </Form.Item>
                    <Form.Item name={inches} className="mb-4">
                      <Select className="custom-select-orange" style={{ height: 40 }} placeholder="In">
                        {inchOptions.map((n) => <Option key={n} value={String(n)}>{n} in</Option>)}
                      </Select>
                    </Form.Item>
                  </div>
                </div>
              ))}
            </div>

            <div className="max-w-xs">
              <Form.Item
                label={<span style={labelStyle}>Weight</span>}
                name="weight"
                normalize={parseNumber}
                getValueProps={(v) => ({ value: formatWithCommas(v) })}
              >
                <Input className={inputClass} placeholder="Pounds" />
              </Form.Item>
            </div>

            {/* ── House Systems & Setup ── */}
            <SectionHeading title="House Systems & Setup" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <Form.Item label={<span style={labelStyle}>Tire Layout</span>} name="tireCount">
                <Select className="custom-select-orange" style={{ height: 40 }} placeholder="Number of Tires">
                  {[2, 4, 6, 8].map((n) => (
                    <Option key={n} value={n}>{n} Tires</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item label={<span style={labelStyle}>Generator Hours</span>} name="generatorHours">
                <Input type="number" className={inputClass} placeholder="e.g. 450" min={0} />
              </Form.Item>

              <Form.Item
                label={<span style={labelStyle}>House Systems</span>}
                name="houseSystems"
                className="md:col-span-2"
              >
                <Select
                  mode="multiple"
                  className="custom-select-orange"
                  style={{ minHeight: 40 }}
                  placeholder="Select all systems present in your RV"
                  allowClear
                >
                  {[
                    "Air Conditioning", "Furnace / Heating", "Water Heater",
                    "Refrigerator (12V)", "Refrigerator (Propane)", "Refrigerator (Residential)",
                    "Generator", "Solar Panels", "Inverter", "Water Pump",
                    "Slideouts", "Awning", "Washer / Dryer", "Fireplace",
                    "Leveling System", "Backup Camera", "Satellite / TV Antenna",
                  ].map((s) => (
                    <Option key={s} value={s}>{s}</Option>
                  ))}
                </Select>
              </Form.Item>
            </div>

            {/* ── Submit ── */}
            <div className="pt-6 border-t border-gray-100 mt-2">
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
                {loading ? (
                  <>
                    <Spin size="small" />
                    <span>Saving...</span>
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default EditRv;
