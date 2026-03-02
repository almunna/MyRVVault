import { DatePicker, Form, Input, message, Select, Spin } from "antd";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useNavigate } from "react-router-dom";
import { useAddRvMutation, useAddChassisMutation } from "../redux/api/routesApi";
import { useGetProfileQuery } from "../redux/api/userApi";

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

// VIN: 17 chars, no I O Q
const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/i;

dayjs.extend(customParseFormat);
const dateFormat = "MM/DD/YYYY";

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

const AddRv = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [addRv] = useAddRvMutation();
  const [addChassis] = useAddChassisMutation();
  const { data: profileData } = useGetProfileQuery();
  const [isFormFilled, setIsFormFilled] = useState(false);
  const [loading, setLoading] = useState(false);

  // VIN decode state
  const [vinStatus, setVinStatus] = useState("idle"); // idle | loading | success | error
  const [vinLength, setVinLength] = useState(0);
  const [chassisData, setChassisData] = useState(null);
  const [decodedSummary, setDecodedSummary] = useState(null);

  useEffect(() => {
    handleFormChange();
  }, []);

  const handleFormChange = () => {
    const values = form.getFieldsValue();
    const hasValue = Object.values(values).some(
      (v) => v !== undefined && v !== null && v !== ""
    );
    setIsFormFilled(hasValue);
  };

  // ── VIN decode ─────────────────────────────────────────────
  const decodeVin = async (vin) => {
    setVinStatus("loading");
    try {
      const res = await fetch(
        `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`
      );
      const json = await res.json();

      const get = (variable) =>
        json.Results?.find((r) => r.Variable === variable)?.Value?.trim() || "";

      const make             = get("Make");
      const mfrName          = get("Manufacturer Name"); // full legal name
      const model            = get("Model") || get("Series") || get("Trim");
      const year             = get("Model Year");
      const engineModel      = get("Engine Model");
      const engineMfr        = get("Engine Manufacturer");
      const fuelType         = get("Fuel Type - Primary");
      const cylinders        = get("Engine Number of Cylinders");
      const displacement     = get("Displacement (L)");
      const engineConfig     = get("Engine Configuration"); // V, Inline, etc.
      const turbo            = get("Turbo");
      const hpFrom           = get("Engine Brake (hp) From");
      const hpTo             = get("Engine Brake (hp) To");
      const transmissionStyle= get("Transmission Style");
      const transmissionSpeeds= get("Transmission Speeds");
      const driveType        = get("Drive Type");
      const bodyClass        = get("Body Class");
      const vehicleType      = get("Vehicle Type");
      const gvwr             = get("Gross Vehicle Weight Rating From");
      const curbWeight       = get("Curb Weight (lbs)");
      const overallLength    = get("Overall Length (inches)");
      const overallWidth     = get("Overall Width (inches)");
      const overallHeight    = get("Overall Height (inches)");

      // Only fail if NHTSA returned truly no data at all
      if (!make && !model && !year) {
        setVinStatus("error");
        message.error("No vehicle data found for this VIN.");
        return;
      }

      // ── Map Body Class → RV Class dropdown ──────────────────
      const mapToRvClass = (bc) => {
        if (!bc) return undefined;
        const s = bc.toLowerCase();
        if (s.includes("class a"))                          return "Class A";
        if (s.includes("class b") || s.includes("van camper")) return "Class B";
        if (s.includes("class c"))                          return "Class C";
        if (s.includes("super c"))                          return "Super C";
        if (s.includes("5th wheel") || s.includes("fifth wheel")) return "5th Wheel";
        if (s.includes("camper"))                           return "Camper";
        if (s.includes("motor home") || s.includes("motorhome")) return "Class A";
        return undefined;
      };
      const rvClass = mapToRvClass(bodyClass) || mapToRvClass(vehicleType);

      // ── Parse weight ─────────────────────────────────────────
      // Prefer curb weight, fallback to GVWR upper bound
      let parsedWeight = curbWeight ? curbWeight.replace(/,/g, "") : "";
      if (!parsedWeight && gvwr) {
        const m = gvwr.match(/[\d,]+(?=\s*lb)/g);
        if (m?.length) parsedWeight = m[m.length - 1].replace(/,/g, "");
      }

      // ── Build engine string ──────────────────────────────────
      const buildEngineStr = () => {
        if (engineModel) return engineModel;
        const parts = [];
        if (cylinders)    parts.push(`${cylinders}-cyl`);
        if (engineConfig) parts.push(engineConfig);
        if (displacement) parts.push(`${parseFloat(displacement).toFixed(1)}L`);
        if (turbo === "Yes") parts.push("Turbo");
        return parts.join(" ");
      };
      const engineStr = buildEngineStr();

      // ── Build transmission string ────────────────────────────
      const transmissionStr = [transmissionSpeeds, transmissionStyle]
        .filter(Boolean).join("-speed ") || "";

      // ── Convert total inches → { feet, inches } for dropdowns ─
      const toFeetInches = (totalInchesStr) => {
        const total = parseFloat(totalInchesStr);
        if (!totalInchesStr || isNaN(total) || total <= 0) return null;
        const ft = Math.floor(total / 12);
        const inch = Math.round(total % 12);
        // Clamp to our dropdown range (5–50 ft, 0–12 in)
        if (ft < 5 || ft > 50) return null;
        return { feet: String(ft), inches: String(Math.min(inch, 12)) };
      };

      const lengthDim = toFeetInches(overallLength);
      const widthDim  = toFeetInches(overallWidth);
      const heightDim = toFeetInches(overallHeight);

      // ── Auto-fill RV form fields ─────────────────────────────
      form.setFieldsValue({
        manufacturer:  make         || undefined,
        model:         model        || undefined,
        modelName:     model        || undefined,
        modelYear:     year         || undefined,
        weight:        parsedWeight || undefined,
        class:         rvClass      || undefined,
        ...(lengthDim && { lengthFeet: lengthDim.feet, lengthInches: lengthDim.inches }),
        ...(widthDim  && { widthFeet:  widthDim.feet,  widthInches:  widthDim.inches  }),
        ...(heightDim && { heightFeet: heightDim.feet, heightInches: heightDim.inches }),
      });

      // ── Build chassis payload ────────────────────────────────
      const chassis = {
        mfg:         make,
        name:        mfrName || make,
        modelNo:     model,
        engineModel: engineStr,
        fuelType,
        hp:          hpTo ? Number(hpTo) : (hpFrom ? Number(hpFrom) : undefined),
      };
      setChassisData(chassis);

      const fmtDim = (d) => d ? `${d.feet}' ${d.inches}"` : "";
      setDecodedSummary({
        year, make, model,
        bodyClass: bodyClass || vehicleType,
        engine:    engineStr,
        fuel:      fuelType,
        weight:    parsedWeight ? `${Number(parsedWeight).toLocaleString()} lbs` : "",
        hp:        hpTo || hpFrom ? `${hpTo || hpFrom} hp` : "",
        transmission: transmissionStr,
        drive:     driveType,
        rvClass,
        length:    fmtDim(lengthDim),
        width:     fmtDim(widthDim),
        height:    fmtDim(heightDim),
      });

      setVinStatus("success");
      handleFormChange();
      message.success(`VIN decoded: ${[year, make, model].filter(Boolean).join(" ")}`);
    } catch {
      setVinStatus("error");
      message.error("Failed to reach NHTSA. Check your connection and try again.");
    }
  };

  const handleVinChange = (e) => {
    // Strip I, O, Q and non-alphanumeric; uppercase; cap at 17
    const sanitized = e.target.value
      .toUpperCase()
      .replace(/[IOQ]/g, "")
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 17);

    form.setFieldValue("vinNumber", sanitized);
    setVinLength(sanitized.length);

    if (sanitized.length === 17 && VIN_REGEX.test(sanitized)) {
      decodeVin(sanitized);
    } else if (vinStatus !== "idle") {
      setVinStatus("idle");
      setChassisData(null);
      setDecodedSummary(null);
    }
  };
  // ───────────────────────────────────────────────────────────

  const handleSubmit = async (values) => {
    const toFeet = (feet, inches) =>
      parseFloat(feet || 0) + parseFloat(inches || 0) / 12;

    const data = {
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
      amountPaid:          values.amountPaid     ? Number(String(values.amountPaid).replace(/[^\d.]/g, ""))     : undefined,
      condition:           values.condition,
      currentMileage:      values.currentMileage ? Number(String(values.currentMileage).replace(/[^\d.]/g, "")): undefined,
      purchasedFrom:       values.purchasedFrom,
      city:                values.city,
      state:               values.state,
      phoneNumber:         values.phoneNumber,
      floorplan:           values.floorplan,
      interiorColorScheme: values.interiorColorScheme,
      exteriorColorScheme: values.exteriorColorScheme,
      weight:              values.weight         ? Number(String(values.weight).replace(/[^\d.]/g, ""))         : undefined,
      tireCount:           values.tireCount      ? Number(values.tireCount)                                      : undefined,
      generatorHours:      values.generatorHours ? Number(values.generatorHours)                                 : undefined,
      houseSystems:        values.houseSystems   || [],
    };

    setLoading(true);
    try {
      const res = await addRv(data).unwrap();

      // After RV is created it becomes selectedRv — submit chassis against it
      if (chassisData && (chassisData.mfg || chassisData.engineModel)) {
        try {
          await addChassis(chassisData).unwrap();
        } catch (chassisErr) {
          console.warn("Chassis auto-save skipped:", chassisErr);
        }
      }

      message.success(res?.message || "RV added successfully!");
      form.resetFields();
      setVinStatus("idle");
      setChassisData(null);
      setDecodedSummary(null);
      setVinLength(0);
      setLoading(false);
      setTimeout(() => navigate("/information"), 2000);
    } catch (err) {
      message.error(err?.data?.message || "Something went wrong!");
      setLoading(false);
    }
  };

  const formatWithCommas = (value) => {
    if (!value) return "";
    return value.toString().replace(/[^\d]/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const parseNumber = (value) => (value ? value.replace(/,/g, "") : "");

  const VinStatusIcon = () => {
    if (vinStatus === "loading") return <Spin size="small" />;
    if (vinStatus === "success") return <span className="text-green-500 font-bold">✓</span>;
    if (vinStatus === "error")   return <span className="text-red-500 font-bold">✗</span>;
    return null;
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] py-10 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#F9B038]">Add RV</h1>
          <p className="text-gray-500 text-sm mt-1">Fill in your RV details below</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-md border border-[#F9B038]/20 p-8">
          <Form
            form={form}
            onFinish={handleSubmit}
            onValuesChange={handleFormChange}
            layout="vertical"
          >
            {/* ── VIN Lookup ── */}
            <SectionHeading title="VIN Lookup" />
            <div className="mb-2">
              <Form.Item
                label={
                  <span style={labelStyle}>
                    VIN #{" "}
                    <span className="text-gray-400 text-xs font-normal normal-case tracking-normal">
                      — 17 characters, auto-decodes on entry
                    </span>
                  </span>
                }
                name="vinNumber"
                rules={[
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      if (value.length !== 17)
                        return Promise.reject(new Error("VIN must be exactly 17 characters"));
                      if (!VIN_REGEX.test(value))
                        return Promise.reject(new Error("Invalid VIN — I, O, Q are not allowed"));
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input
                  className={inputClass}
                  placeholder="e.g. 1FDAF57P97EA12345"
                  maxLength={17}
                  onChange={handleVinChange}
                  suffix={
                    <span className="flex items-center gap-2 text-gray-400 text-xs select-none">
                      <span className={vinLength === 17 ? "text-[#F9B038] font-semibold" : ""}>
                        {vinLength}/17
                      </span>
                      <VinStatusIcon />
                    </span>
                  }
                />
              </Form.Item>

              {/* Decoded success banner */}
              {vinStatus === "success" && decodedSummary && (
                <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-green-500 font-bold text-base">✓</span>
                    <p className="text-green-700 font-semibold text-sm">VIN Decoded Successfully</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1.5 text-xs">
                    {decodedSummary.year         && <span className="text-gray-500">Year: <strong className="text-gray-700">{decodedSummary.year}</strong></span>}
                    {decodedSummary.make         && <span className="text-gray-500">Make: <strong className="text-gray-700">{decodedSummary.make}</strong></span>}
                    {decodedSummary.model        && <span className="text-gray-500">Model: <strong className="text-gray-700">{decodedSummary.model}</strong></span>}
                    {decodedSummary.rvClass      && <span className="text-gray-500">RV Class: <strong className="text-gray-700">{decodedSummary.rvClass}</strong></span>}
                    {decodedSummary.engine       && <span className="text-gray-500">Engine: <strong className="text-gray-700">{decodedSummary.engine}</strong></span>}
                    {decodedSummary.hp           && <span className="text-gray-500">Power: <strong className="text-gray-700">{decodedSummary.hp}</strong></span>}
                    {decodedSummary.fuel         && <span className="text-gray-500">Fuel: <strong className="text-gray-700">{decodedSummary.fuel}</strong></span>}
                    {decodedSummary.transmission && <span className="text-gray-500">Transmission: <strong className="text-gray-700">{decodedSummary.transmission}</strong></span>}
                    {decodedSummary.drive        && <span className="text-gray-500">Drive: <strong className="text-gray-700">{decodedSummary.drive}</strong></span>}
                    {decodedSummary.bodyClass    && <span className="text-gray-500">Body: <strong className="text-gray-700">{decodedSummary.bodyClass}</strong></span>}
                    {decodedSummary.weight       && <span className="text-gray-500">Weight: <strong className="text-gray-700">{decodedSummary.weight}</strong></span>}
                    {decodedSummary.length       && <span className="text-gray-500">Length: <strong className="text-gray-700">{decodedSummary.length}</strong></span>}
                    {decodedSummary.width        && <span className="text-gray-500">Width: <strong className="text-gray-700">{decodedSummary.width}</strong></span>}
                    {decodedSummary.height       && <span className="text-gray-500">Height: <strong className="text-gray-700">{decodedSummary.height}</strong></span>}
                  </div>
                  <p className="text-green-600 text-xs mt-2 italic">
                    Fields below are pre-filled from VIN. Chassis info will be saved automatically when you submit.
                  </p>
                </div>
              )}

              {/* Error banner */}
              {vinStatus === "error" && (
                <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                  <span className="text-red-500 font-bold text-base">✗</span>
                  <p className="text-red-600 text-sm">
                    Could not decode this VIN. You can still fill in the fields manually below.
                  </p>
                </div>
              )}
            </div>

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
                rules={[{ pattern: /^\d+$/, message: "Please enter Amount Paid" }]}
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

              <Form.Item label={<span style={labelStyle}>Generator Hours (initial)</span>} name="generatorHours">
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
                    "Air Conditioning",
                    "Furnace / Heating",
                    "Water Heater",
                    "Refrigerator (12V)",
                    "Refrigerator (Propane)",
                    "Refrigerator (Residential)",
                    "Generator",
                    "Solar Panels",
                    "Inverter",
                    "Water Pump",
                    "Slideouts",
                    "Awning",
                    "Washer / Dryer",
                    "Fireplace",
                    "Leveling System",
                    "Backup Camera",
                    "Satellite / TV Antenna",
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
                    <span>Submitting...</span>
                  </>
                ) : (
                  "Add RV"
                )}
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default AddRv;
