import { DatePicker, Form, Input, message, Select, Spin, Tag } from "antd";
import React, { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useNavigate } from "react-router-dom";
import { useLoadScript } from "@react-google-maps/api";
import { useAddRvMutation, useAddChassisMutation } from "../redux/api/routesApi";
import { useGetProfileQuery } from "../redux/api/userApi";
import {
  PlusOutlined,
  CarOutlined,
  ShoppingCartOutlined,
  BgColorsOutlined,
  ExpandOutlined,
  SettingOutlined,
  SearchOutlined,
} from "@ant-design/icons";

const { Option } = Select;

const GOOGLE_MAPS_LIBRARIES = ["places"];

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

const stateLongNameToKey = Object.fromEntries(
  Object.entries(states).map(([k, v]) => [v.toLowerCase(), k])
);

const lengthFeetOptions = Array.from({ length: 46 }, (_, i) => i + 5);
const widthFeetOptions  = Array.from({ length: 5 },  (_, i) => i + 5);
const heightFeetOptions = Array.from({ length: 10 }, (_, i) => i + 5);
const inchOptions       = Array.from({ length: 13 }, (_, i) => i);

const BASE_HOUSE_SYSTEMS = [
  "Air Conditioning", "Awning", "Backup Camera", "Fireplace",
  "Furnace / Heating", "Generator", "Inverter", "Leveling System",
  "Refrigerator (12V)", "Refrigerator (Propane)", "Refrigerator (Residential)",
  "Satellite / TV Antenna", "Slideouts", "Solar Panels", "Washer / Dryer",
  "Water Heater", "Water Pump",
];

const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/i;
dayjs.extend(customParseFormat);
const dateFormat = "MM/DD/YYYY";

// ── Shared styles ────────────────────────────────────────────────────────────
const fieldLabel = (text, hint) => (
  <span className="text-sm font-medium text-[#5A5A5A]">
    {text}
    {hint && <span className="text-gray-400 text-xs font-normal ml-1">{hint}</span>}
  </span>
);

const requiredLabel = (text) => (
  <span className="text-sm font-medium text-[#5A5A5A]">
    {text} <span className="text-red-500">*</span>
  </span>
);

const inputClass =
  "w-full rounded-lg border border-[#E0E0E0] bg-white px-3 py-2 text-[#1A1A1A] placeholder-gray-400 focus:border-[#3B7D3C] focus:ring-1 focus:ring-[#3B7D3C] transition-all duration-200";

// ── Card wrapper ─────────────────────────────────────────────────────────────
const Card = ({ icon, title, children }) => (
  <div className="bg-white border border-[#E8F0E8] rounded-2xl p-6 mb-5 shadow-sm">
    <div className="flex items-center gap-2 mb-5 pb-4 border-b border-[#E8F0E8]">
      <div className="w-8 h-8 rounded-lg bg-[#E8F0E8] flex items-center justify-center">
        <span className="text-[#3B7D3C] text-sm">{icon}</span>
      </div>
      <h2 className="text-base font-semibold text-[#1A1A1A]">{title}</h2>
    </div>
    {children}
  </div>
);

// ── House Systems Selector ───────────────────────────────────────────────────
const ADD_PREFIX = "__new__:";

const HouseSystemsSelector = ({ value = [], onChange, extraSystems = [], onAddExtraSystem }) => {
  const [selectedType, setSelectedType] = useState(undefined);
  const [location, setLocation] = useState("");
  const [searchValue, setSearchValue] = useState("");

  const allSystems = [...BASE_HOUSE_SYSTEMS, ...extraSystems].sort();
  const trimmed = searchValue.trim();
  const showAddOption =
    trimmed.length > 0 &&
    !allSystems.some((s) => s.toLowerCase() === trimmed.toLowerCase());

  const handleTypeChange = (val) => {
    if (val && val.startsWith(ADD_PREFIX)) {
      const name = val.slice(ADD_PREFIX.length).trim();
      if (name.toLowerCase() === "other") {
        message.error('Cannot be named "Other" — give it a specific name so it can be tracked and reported on');
        return;
      }
      onAddExtraSystem(name);
      setSelectedType(name);
    } else {
      setSelectedType(val);
    }
    setSearchValue("");
  };

  const isDuplicate = (value || []).some((s) =>
    (typeof s === "string" ? s : s.type) === selectedType
  );

  const handleAdd = () => {
    if (!selectedType) { message.warning("Please select a system type"); return; }
    if (isDuplicate && !location.trim()) {
      message.warning(`You already have "${selectedType}" — please specify a location (e.g. Front, Bedroom) to distinguish them`);
      return;
    }
    onChange([...(value || []), { type: selectedType, location: location.trim() }]);
    setSelectedType(undefined);
    setLocation("");
  };

  const handleRemove = (idx) => {
    const next = [...(value || [])];
    next.splice(idx, 1);
    onChange(next);
  };

  const displayLabel = (sys) =>
    typeof sys === "string" ? sys : `${sys.type}${sys.location ? ` (${sys.location})` : ""}`;

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        <Select
          className="custom-select"
          style={{ height: 40, minWidth: 220 }}
          placeholder="Select or type a system"
          value={selectedType}
          onChange={handleTypeChange}
          showSearch
          searchValue={searchValue}
          onSearch={setSearchValue}
          filterOption={(input, option) => {
            if (option.value?.startsWith(ADD_PREFIX)) return true;
            return (option.children ?? "").toLowerCase().includes(input.toLowerCase());
          }}
        >
          {showAddOption && (
            <Option key={ADD_PREFIX + trimmed} value={ADD_PREFIX + trimmed}>
              + Add "{trimmed}"
            </Option>
          )}
          {allSystems.map((s) => <Option key={s} value={s}>{s}</Option>)}
        </Select>
        <Input
          className={`rounded-lg ${isDuplicate ? "border-red-400" : "border-[#E0E0E0]"}`}
          style={{ height: 40, width: 180 }}
          placeholder={isDuplicate ? "Location required (e.g. Front)" : "Location (optional)"}
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onPressEnter={handleAdd}
        />
        <button
          type="button"
          onClick={handleAdd}
          className="h-10 px-4 bg-[#3B7D3C] text-white font-medium rounded-lg hover:bg-[#2d6130] transition-colors flex items-center gap-1"
        >
          <PlusOutlined />
          Add
        </button>
      </div>

      {(value || []).length > 0 && (
        <div className="flex flex-wrap gap-2 mt-1">
          {(value || []).map((sys, i) => (
            <Tag
              key={i}
              closable
              onClose={(e) => { e.preventDefault(); handleRemove(i); }}
              className="flex items-center gap-1 px-3 py-1 rounded-full border border-[#3B7D3C] bg-[#E8F0E8] text-[#3B7D3C] font-medium text-sm"
            >
              {displayLabel(sys)}
            </Tag>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const AddRv = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [addRv] = useAddRvMutation();
  const [addChassis] = useAddChassisMutation();
  const { data: profileData } = useGetProfileQuery();
  const [isFormFilled, setIsFormFilled] = useState(false);
  const [loading, setLoading] = useState(false);

  const [vinStatus, setVinStatus] = useState("idle");
  const [vinLength, setVinLength] = useState(0);
  const [chassisData, setChassisData] = useState(null);
  const [decodedSummary, setDecodedSummary] = useState(null);
  const [extraSystems, setExtraSystems] = useState([]);

  const purchasedFromRef = useRef(null);
  const autocompleteRef = useRef(null);

  const { isLoaded: mapsLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_KEY || "",
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  useEffect(() => {
    if (!mapsLoaded || !purchasedFromRef.current) return;
    const inputEl = purchasedFromRef.current.input;
    if (!inputEl) return;

    const autocomplete = new window.google.maps.places.Autocomplete(inputEl, {
      types: ["establishment"],
      fields: ["name", "address_components", "formatted_phone_number", "website"],
    });
    autocompleteRef.current = autocomplete;

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place) return;
      let city = "";
      let stateLongName = "";
      (place.address_components || []).forEach((comp) => {
        if (comp.types.includes("locality")) city = comp.long_name;
        if (comp.types.includes("administrative_area_level_1")) stateLongName = comp.long_name;
      });
      const stateKey = stateLongNameToKey[stateLongName.toLowerCase()] || undefined;
      form.setFieldsValue({
        purchasedFrom: place.name || form.getFieldValue("purchasedFrom"),
        city: city || form.getFieldValue("city"),
        ...(stateKey && { state: stateKey }),
        phoneNumber: place.formatted_phone_number?.replace(/\D/g, "") || form.getFieldValue("phoneNumber"),
        dealerWebsite: place.website || form.getFieldValue("dealerWebsite"),
      });
      handleFormChange();
    });
  }, [mapsLoaded]);

  useEffect(() => { handleFormChange(); }, []);

  const handleFormChange = () => {
    const values = form.getFieldsValue();
    const hasValue = Object.values(values).some(
      (v) => v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0)
    );
    setIsFormFilled(hasValue);
  };

  const decodeVin = async (vin) => {
    setVinStatus("loading");
    try {
      const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`);
      const json = await res.json();
      const get = (variable) =>
        json.Results?.find((r) => r.Variable === variable)?.Value?.trim() || "";

      const make              = get("Make");
      const mfrName           = get("Manufacturer Name");
      const model             = get("Model") || get("Series") || get("Trim");
      const year              = get("Model Year");
      const engineModel       = get("Engine Model");
      const engineMfr         = get("Engine Manufacturer");
      const fuelType          = get("Fuel Type - Primary");
      const cylinders         = get("Engine Number of Cylinders");
      const displacement      = get("Displacement (L)");
      const engineConfig      = get("Engine Configuration");
      const turbo             = get("Turbo");
      const hpFrom            = get("Engine Brake (hp) From");
      const hpTo              = get("Engine Brake (hp) To");
      const transmissionStyle = get("Transmission Style");
      const transmissionSpeeds= get("Transmission Speeds");
      const driveType         = get("Drive Type");
      const bodyClass         = get("Body Class");
      const vehicleType       = get("Vehicle Type");
      const gvwr              = get("Gross Vehicle Weight Rating From");
      const curbWeight        = get("Curb Weight (lbs)");
      const overallLength     = get("Overall Length (inches)");
      const overallWidth      = get("Overall Width (inches)");
      const overallHeight     = get("Overall Height (inches)");

      if (!make && !model && !year) {
        setVinStatus("error");
        message.error("No vehicle data found for this VIN.");
        return;
      }

      const mapToRvClass = (bc) => {
        if (!bc) return undefined;
        const s = bc.toLowerCase();
        if (s.includes("class a"))                                return "Class A";
        if (s.includes("class b") || s.includes("van camper"))   return "Class B";
        if (s.includes("class c"))                                return "Class C";
        if (s.includes("super c"))                                return "Super C";
        if (s.includes("5th wheel") || s.includes("fifth wheel"))return "5th Wheel";
        if (s.includes("camper"))                                 return "Camper";
        if (s.includes("motor home") || s.includes("motorhome")) return "Class A";
        return undefined;
      };
      const rvClass = mapToRvClass(bodyClass) || mapToRvClass(vehicleType);

      let parsedWeight = curbWeight ? curbWeight.replace(/,/g, "") : "";
      if (!parsedWeight && gvwr) {
        const m = gvwr.match(/[\d,]+(?=\s*lb)/g);
        if (m?.length) parsedWeight = m[m.length - 1].replace(/,/g, "");
      }

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
      const transmissionStr = [transmissionSpeeds, transmissionStyle].filter(Boolean).join("-speed ") || "";

      const toFeetInches = (totalInchesStr) => {
        const total = parseFloat(totalInchesStr);
        if (!totalInchesStr || isNaN(total) || total <= 0) return null;
        const ft = Math.floor(total / 12);
        const inch = Math.round(total % 12);
        if (ft < 5 || ft > 50) return null;
        return { feet: String(ft), inches: String(Math.min(inch, 12)) };
      };

      const lengthDim = toFeetInches(overallLength);
      const widthDim  = toFeetInches(overallWidth);
      const heightDim = toFeetInches(overallHeight);

      form.setFieldsValue({
        chassisManufacturer: make      || undefined,
        chassisName:         model     || undefined,
        modelName:           model     || undefined,
        modelYear:           year      || undefined,
        weight:              parsedWeight || undefined,
        class:               rvClass   || undefined,
        ...(lengthDim && { lengthFeet: lengthDim.feet, lengthInches: lengthDim.inches }),
        ...(widthDim  && { widthFeet:  widthDim.feet,  widthInches:  widthDim.inches  }),
        ...(heightDim && { heightFeet: heightDim.feet, heightInches: heightDim.inches }),
      });

      setChassisData({
        mfg:         make,
        name:        mfrName || make,
        modelNo:     model,
        engineModel: engineStr,
        fuelType,
        hp:          hpTo ? Number(hpTo) : (hpFrom ? Number(hpFrom) : undefined),
      });

      const fmtDim = (d) => d ? `${d.feet}' ${d.inches}"` : "";
      setDecodedSummary({
        year, make, model,
        bodyClass: bodyClass || vehicleType,
        engine: engineStr, fuel: fuelType,
        weight: parsedWeight ? `${Number(parsedWeight).toLocaleString()} lbs` : "",
        hp: hpTo || hpFrom ? `${hpTo || hpFrom} hp` : "",
        transmission: transmissionStr, drive: driveType, rvClass,
        length: fmtDim(lengthDim), width: fmtDim(widthDim), height: fmtDim(heightDim),
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

  const handleSubmit = async (values) => {
    const toFeet = (ft, inches) => parseFloat(ft || 0) + parseFloat(inches || 0) / 12;
    const data = {
      length:              toFeet(values.lengthFeet, values.lengthInches),
      width:               toFeet(values.widthFeet,  values.widthInches),
      height:              toFeet(values.heightFeet, values.heightInches),
      nickname:            values.nickname,
      class:               values.class,
      manufacturer:        values.chassisManufacturer,
      chassisManufacturer: values.chassisManufacturer,
      chassisName:         values.chassisName,
      rvManufacturer:      values.rvManufacturer,
      modelName:           values.modelName,
      modelYear:           values.modelYear,
      vinNumber:           values.vinNumber,
      floorplan:           values.floorplan,
      dateOfPurchase:      values.dateOfPurchase?.toISOString(),
      amountPaid:          values.amountPaid     ? Number(String(values.amountPaid).replace(/[^\d.]/g, ""))      : undefined,
      condition:           values.condition,
      currentMileage:      values.currentMileage ? Number(String(values.currentMileage).replace(/[^\d.]/g, "")) : undefined,
      purchasedFrom:       values.purchasedFrom,
      dealerWebsite:       values.dealerWebsite,
      city:                values.city,
      state:               values.state,
      phoneNumber:         values.phoneNumber,
      interiorColorScheme: values.interiorColorScheme,
      exteriorColorScheme: values.exteriorColorScheme,
      weight:              values.weight         ? Number(String(values.weight).replace(/[^\d.]/g, ""))          : undefined,
      tireCount:           values.tireCount      ? Number(values.tireCount)                                       : undefined,
      generatorHours:      values.generatorHours ? Number(values.generatorHours)                                  : undefined,
      houseSystems:        values.houseSystems   || [],
    };

    setLoading(true);
    try {
      const res = await addRv(data).unwrap();
      if (chassisData && (chassisData.mfg || chassisData.engineModel)) {
        try { await addChassis(chassisData).unwrap(); } catch { /* ignore */ }
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
    if (vinStatus === "success") return <span className="text-green-500 font-bold text-base">✓</span>;
    if (vinStatus === "error")   return <span className="text-red-500 font-bold text-base">✗</span>;
    return null;
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="max-w-site mx-auto px-4 lg:px-6 2xl:px-8 py-10">

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-8 bg-[#D4872D] rounded-full" />
            <h1 className="text-3xl font-bold text-[#1A1A1A]">Add RV</h1>
          </div>
          <p className="text-[#5A5A5A] text-sm ml-4 pl-3">Fill in your RV details below</p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Form form={form} onFinish={handleSubmit} onValuesChange={handleFormChange} layout="vertical">

            {/* ── VIN Lookup ── */}
            <Card icon={<SearchOutlined />} title="VIN Lookup">
              <Form.Item
                label={fieldLabel("VIN #", "— 17 characters, auto-decodes on entry")}
                name="vinNumber"
                rules={[{
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    if (value.length !== 17) return Promise.reject(new Error("VIN must be exactly 17 characters"));
                    if (!VIN_REGEX.test(value)) return Promise.reject(new Error("Invalid VIN — I, O, Q are not allowed"));
                    return Promise.resolve();
                  },
                }]}
                className="mb-0"
              >
                <Input
                  className={inputClass}
                  placeholder="e.g. 1FDAF57P97EA12345"
                  maxLength={17}
                  onChange={handleVinChange}
                  suffix={
                    <span className="flex items-center gap-2 text-gray-400 text-xs select-none">
                      <span className={vinLength === 17 ? "text-[#3B7D3C] font-semibold" : ""}>{vinLength}/17</span>
                      <VinStatusIcon />
                    </span>
                  }
                />
              </Form.Item>

              {vinStatus === "success" && decodedSummary && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <p className="text-green-700 font-semibold text-sm">VIN Decoded Successfully</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1.5 text-xs">
                    {decodedSummary.year      && <span className="text-gray-500">Year: <strong className="text-gray-700">{decodedSummary.year}</strong></span>}
                    {decodedSummary.make      && <span className="text-gray-500">Make: <strong className="text-gray-700">{decodedSummary.make}</strong></span>}
                    {decodedSummary.model     && <span className="text-gray-500">Model: <strong className="text-gray-700">{decodedSummary.model}</strong></span>}
                    {decodedSummary.rvClass   && <span className="text-gray-500">RV Class: <strong className="text-gray-700">{decodedSummary.rvClass}</strong></span>}
                    {decodedSummary.engine    && <span className="text-gray-500">Engine: <strong className="text-gray-700">{decodedSummary.engine}</strong></span>}
                    {decodedSummary.hp        && <span className="text-gray-500">Power: <strong className="text-gray-700">{decodedSummary.hp}</strong></span>}
                    {decodedSummary.fuel      && <span className="text-gray-500">Fuel: <strong className="text-gray-700">{decodedSummary.fuel}</strong></span>}
                    {decodedSummary.bodyClass && <span className="text-gray-500">Body: <strong className="text-gray-700">{decodedSummary.bodyClass}</strong></span>}
                    {decodedSummary.weight    && <span className="text-gray-500">Weight: <strong className="text-gray-700">{decodedSummary.weight}</strong></span>}
                    {decodedSummary.length    && <span className="text-gray-500">Length: <strong className="text-gray-700">{decodedSummary.length}</strong></span>}
                    {decodedSummary.width     && <span className="text-gray-500">Width: <strong className="text-gray-700">{decodedSummary.width}</strong></span>}
                    {decodedSummary.height    && <span className="text-gray-500">Height: <strong className="text-gray-700">{decodedSummary.height}</strong></span>}
                  </div>
                  <p className="text-green-600 text-xs mt-2 italic">
                    Fields below are pre-filled from VIN. Chassis info will be saved automatically when you submit.
                  </p>
                </div>
              )}

              {vinStatus === "error" && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                  <span className="text-red-500 font-bold">✗</span>
                  <p className="text-red-600 text-sm">Could not decode this VIN. You can still fill in the fields manually below.</p>
                </div>
              )}
            </Card>

            {/* ── Basic Information ── */}
            <Card icon={<CarOutlined />} title="Basic Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  label={requiredLabel("RV Nickname")}
                  name="nickname"
                  rules={[{ required: true, message: "Enter RV Nickname" }]}
                  className="mb-0"
                >
                  <Input size="large" className={inputClass} placeholder="Enter RV Nickname" />
                </Form.Item>

                <Form.Item label={fieldLabel("Class")} name="class" className="mb-0">
                  <Select size="large" className="w-full" placeholder="Select Class">
                    {["Class A","Class B","Class C","Super C","5th Wheel","Camper","Other"].map((c) => (
                      <Option key={c} value={c}>{c}</Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item label={fieldLabel("Chassis Manufacturer")} name="chassisManufacturer" className="mb-0">
                  <Input size="large" className={inputClass} placeholder="e.g. Spartan RV Chassis" />
                </Form.Item>

                <Form.Item label={fieldLabel("Chassis Name")} name="chassisName" className="mb-0">
                  <Input size="large" className={inputClass} placeholder="e.g. K3" />
                </Form.Item>

                <Form.Item label={fieldLabel("RV Manufacturer")} name="rvManufacturer" className="mb-0">
                  <Input size="large" className={inputClass} placeholder="e.g. Thor, Winnebago, Forest River" />
                </Form.Item>

                <Form.Item
                  label={requiredLabel("Model Year")}
                  name="modelYear"
                  rules={[{ required: true, message: "Please input Model Year!" }]}
                  className="mb-0"
                >
                  <Input size="large" type="number" className={inputClass} placeholder="e.g. 2022" />
                </Form.Item>

                <Form.Item
                  label={requiredLabel("Model Name")}
                  name="modelName"
                  rules={[{ required: true, message: "Please input Model Name!" }]}
                  className="mb-0"
                >
                  <Input size="large" className={inputClass} placeholder="e.g. Magnitude" />
                </Form.Item>

                <Form.Item label={fieldLabel("Floorplan")} name="floorplan" className="mb-0">
                  <Input size="large" className={inputClass} placeholder="e.g. BH35" />
                </Form.Item>
              </div>
            </Card>

            {/* ── Purchase Details ── */}
            <Card icon={<ShoppingCartOutlined />} title="Purchase Details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item label={fieldLabel("Date of Purchase")} name="dateOfPurchase" className="mb-0">
                  <DatePicker size="large" format={dateFormat} className="w-full rounded-lg border-[#E0E0E0]" placeholder="MM/DD/YYYY" />
                </Form.Item>

                <Form.Item
                  label={fieldLabel("Amount Paid")}
                  name="amountPaid"
                  normalize={parseNumber}
                  getValueProps={(v) => ({ value: formatWithCommas(v) })}
                  rules={[{ pattern: /^\d+$/, message: "Please enter Amount Paid" }]}
                  className="mb-0"
                >
                  <Input size="large" className={inputClass} placeholder="Amount Paid" prefix={<span className="text-gray-400 text-sm">$</span>} />
                </Form.Item>

                <Form.Item label={fieldLabel("Condition")} name="condition" className="mb-0">
                  <Select size="large" className="w-full" placeholder="Select Condition">
                    <Option value="New">New</Option>
                    <Option value="Used">Used</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  label={fieldLabel("Current Mileage")}
                  name="currentMileage"
                  normalize={parseNumber}
                  getValueProps={(v) => ({ value: formatWithCommas(v) })}
                  className="mb-0"
                >
                  <Input size="large" className={inputClass} placeholder="e.g. 45,000" suffix={<span className="text-gray-400 text-sm">mi</span>} />
                </Form.Item>

                <Form.Item
                  label={fieldLabel("Purchased From", mapsLoaded ? "— type to search places" : "")}
                  name="purchasedFrom"
                  className="mb-0"
                >
                  <Input ref={purchasedFromRef} size="large" className={inputClass} placeholder="Dealership or seller name" />
                </Form.Item>

                <Form.Item label={fieldLabel("Dealer Website")} name="dealerWebsite" className="mb-0">
                  <Input size="large" className={inputClass} placeholder="Auto-filled from search or enter manually" />
                </Form.Item>

                <Form.Item label={fieldLabel("City")} name="city" className="mb-0">
                  <Input size="large" className={inputClass} placeholder="City" />
                </Form.Item>

                <Form.Item label={fieldLabel("State")} name="state" className="mb-0">
                  <Select showSearch size="large" className="w-full" placeholder="Select State" optionFilterProp="children">
                    {Object.entries(states).map(([key, val]) => (
                      <Option key={key} value={key}>{val}</Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item label={fieldLabel("Phone Number")} name="phoneNumber" className="mb-0">
                  <Input size="large" type="number" className={inputClass} placeholder="Phone Number" />
                </Form.Item>
              </div>
            </Card>

            {/* ── Appearance ── */}
            <Card icon={<BgColorsOutlined />} title="Appearance">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item label={fieldLabel("Interior Color Scheme")} name="interiorColorScheme" className="mb-0">
                  <Input size="large" className={inputClass} placeholder="Interior Color Scheme" />
                </Form.Item>
                <Form.Item label={fieldLabel("Exterior Color Scheme")} name="exteriorColorScheme" className="mb-0">
                  <Input size="large" className={inputClass} placeholder="Exterior Color Scheme" />
                </Form.Item>
              </div>
            </Card>

            {/* ── Dimensions & Weight ── */}
            <Card icon={<ExpandOutlined />} title="Dimensions & Weight">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {[
                  { label: "Length", feet: "lengthFeet", inches: "lengthInches", feetOpts: lengthFeetOptions },
                  { label: "Width",  feet: "widthFeet",  inches: "widthInches",  feetOpts: widthFeetOptions  },
                  { label: "Height", feet: "heightFeet", inches: "heightInches", feetOpts: heightFeetOptions },
                ].map(({ label, feet, inches, feetOpts }) => (
                  <div key={label}>
                    <p className="text-sm font-medium text-[#5A5A5A] mb-2">{label}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Form.Item name={feet} className="mb-0">
                        <Select size="large" className="w-full" placeholder="Feet">
                          {feetOpts.map((n) => <Option key={n} value={String(n)}>{n} ft</Option>)}
                        </Select>
                      </Form.Item>
                      <Form.Item name={inches} className="mb-0">
                        <Select size="large" className="w-full" placeholder="In">
                          {inchOptions.map((n) => <Option key={n} value={String(n)}>{n} in</Option>)}
                        </Select>
                      </Form.Item>
                    </div>
                  </div>
                ))}
              </div>

              <div className="max-w-xs">
                <Form.Item
                  label={fieldLabel("Weight")}
                  name="weight"
                  normalize={parseNumber}
                  getValueProps={(v) => ({ value: formatWithCommas(v) })}
                  className="mb-0"
                >
                  <Input size="large" className={inputClass} placeholder="Pounds" suffix={<span className="text-gray-400 text-sm">lbs</span>} />
                </Form.Item>
              </div>
            </Card>

            {/* ── House Systems & Setup ── */}
            <Card icon={<SettingOutlined />} title="House Systems & Setup">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Form.Item label={fieldLabel("Tire Layout")} name="tireCount" className="mb-0">
                  <Select size="large" className="w-full" placeholder="Number of Tires">
                    {[2, 4, 6, 8].map((n) => <Option key={n} value={n}>{n} Tires</Option>)}
                  </Select>
                </Form.Item>

                <Form.Item label={fieldLabel("Generator Hours (initial)")} name="generatorHours" className="mb-0">
                  <Input size="large" type="number" className={inputClass} placeholder="e.g. 450" min={0} />
                </Form.Item>
              </div>

              <Form.Item
                label={fieldLabel("House Systems", "— add multiple of same system with location")}
                name="houseSystems"
                className="mb-0"
              >
                <HouseSystemsSelector
                  extraSystems={extraSystems}
                  onAddExtraSystem={(name) => setExtraSystems((prev) => [...prev, name])}
                />
              </Form.Item>
            </Card>

            {/* ── Actions ── */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 py-3 rounded-xl border border-[#E0E0E0] text-[#5A5A5A] font-medium text-sm hover:border-[#3B7D3C] hover:text-[#3B7D3C] transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isFormFilled || loading}
                className={`flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                  loading
                    ? "bg-[#3B7D3C]/70 text-white cursor-not-allowed"
                    : isFormFilled
                    ? "bg-[#3B7D3C] text-white hover:bg-[#2d6130] shadow-sm hover:shadow-md"
                    : "bg-[#E0E0E0] text-[#9E9E9E] cursor-not-allowed"
                }`}
              >
                {loading ? <><Spin size="small" /><span>Saving…</span></> : "Add RV"}
              </button>
            </div>

          </Form>
        </div>
      </div>
    </div>
  );
};

export default AddRv;
