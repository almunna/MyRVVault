import { Form, Input, message, DatePicker, Spin, Select } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  InboxOutlined,
  ToolOutlined,
  CalendarOutlined,
  DollarOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  BulbOutlined,
  PlusOutlined,
  SyncOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import { Upload } from "antd";
import { useAddMaintanceMutation } from "../redux/api/routesApi";
import { useGetProfileQuery } from "../redux/api/userApi";

const { Dragger } = Upload;
const dateFormat = "MM/DD/YYYY";

// Related component suggestions map
const RELATED_COMPONENTS = {
  chassis:          ["tire", "waterPump", "exhaustFans"],
  tire:             ["chassis", "waterPump"],
  airConditioning:  ["exhaustFans", "ventFans", "heater"],
  heater:           ["airConditioning", "waterHeater", "exhaustFans"],
  waterHeater:      ["waterPump", "heater", "toilet"],
  waterPump:        ["waterHeater", "toilet", "washer"],
  generator:        ["exhaustFans", "ventFans", "waterPump"],
  exhaustFans:      ["ventFans", "airConditioning", "heater"],
  ventFans:         ["exhaustFans", "airConditioning", "ceilingFans"],
  ceilingFans:      ["ventFans", "exhaustFans"],
  washer:           ["waterPump", "dryer", "waterHeater"],
  dryer:            ["washer", "exhaustFans"],
  toilet:           ["waterPump", "waterHeater"],
  dishwasher:       ["waterPump", "waterHeater", "washer"],
  tv:               ["dvdPlayer", "surroundSound", "wifiRouter"],
  dvdPlayer:        ["tv", "surroundSound"],
  surroundSound:    ["tv", "dvdPlayer"],
  wifiRouter:       ["tv", "satelliteInternet", "internetSatellite"],
  satelliteInternet:["wifiRouter", "tv", "outdoorRadio"],
  gps:              ["wifiRouter", "satelliteInternet"],
  outdoorRadio:     ["surroundSound", "tv"],
};

const COMPONENT_LABELS = {
  chassis: "Chassis", ceilingFans: "Ceiling Fans", airConditioning: "Air Conditioning",
  dishwasher: "Dishwasher", dryer: "Dryer", dvdPlayer: "DVD Player",
  exhaustFans: "Exhaust Fans", gps: "GPS", heater: "Heater",
  insurance: "Insurance", satelliteInternet: "Satellite Internet",
  maintenanceSchedule: "Maintenance Schedule", membership: "Membership",
  outdoorRadio: "Outdoor Radio", rv: "RV", surroundSound: "Surround Sound",
  tire: "Tire", toilet: "Toilet", waterHeater: "Water Heater",
  washer: "Washer", ventFans: "Vent Fans", tv: "TV",
  waterPump: "Water Pump", wifiRouter: "WiFi Router",
};

// Components that can have multiple instances (Front A/C, Rear A/C, etc.)
const MULTI_INSTANCE_COMPONENTS = [
  "airConditioning", "heater", "exhaustFans", "ventFans", "ceilingFans",
  "tv", "waterHeater", "waterPump", "tire", "toilet",
];
const UNIT_SUGGESTIONS = ["Front", "Rear", "Bedroom", "Living Room", "Master", "Upper", "Lower"];

const fieldLabel = (text) => (
  <span className="text-sm font-medium text-[#5A5A5A]">{text}</span>
);

const inputClass =
  "w-full rounded-lg border border-[#E0E0E0] bg-white px-3 py-2 text-[#1A1A1A] placeholder-gray-400 focus:border-[#3B7D3C] focus:ring-1 focus:ring-[#3B7D3C] transition-all duration-200";

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

const AddNewMaintanceSchedule = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [addMaintance] = useAddMaintanceMutation();
  const { data: profileData } = useGetProfileQuery();
  const [isFormFilled, setIsFormFilled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [savedComponent, setSavedComponent] = useState(null); // shown after submit

  useEffect(() => { handleFormChange(); }, []);

  const handleFormChange = () => {
    const values = form.getFieldsValue();
    const hasValue = Object.values(values).some(
      (v) => v !== undefined && v !== null && v !== ""
    );
    setIsFormFilled(hasValue);
  };

  const formatWithCommas = (value) => {
    if (!value) return "";
    return value.toString().replace(/[^\d]/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const parseNumber = (value) => {
    if (!value) return "";
    return value.replace(/,/g, "");
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();
      if (values.component)               formData.append("component", values.component);
      if (values.componentInstance)       formData.append("componentInstance", values.componentInstance);
      if (values.milage)                  formData.append("initialMilage", parseNumber(values.milage));
      if (values.maintenanceToBePerformed) formData.append("maintenanceToBePerformed", values.maintenanceToBePerformed);
      if (values.dateOfMaintenance)       formData.append("dateOfMaintenance", values.dateOfMaintenance.toISOString());
      if (values.notes)                   formData.append("notes", values.notes);
      if (values.cost_amount)             formData.append("cost", parseNumber(values.cost_amount));
      if (values.vendor)                  formData.append("vendor", values.vendor);
      if (values.hoursAtMaintenance)      formData.append("hoursAtMaintenance", values.hoursAtMaintenance);
      if (values.recurringMiles)          formData.append("recurringMiles", values.recurringMiles);
      if (values.recurringMonths)         formData.append("recurringMonths", values.recurringMonths);

      fileList.forEach((file) => {
        if (file.originFileObj) formData.append("images", file.originFileObj);
      });

      const res = await addMaintance(formData).unwrap();
      message.success(res?.message || "Saved successfully");
      setSavedComponent(values.component || null);
      form.resetFields();
      setFileList([]);
      setSelectedComponent(null);
      setIsFormFilled(false);
    } catch (err) {
      message.error(err?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const relatedSuggestions = savedComponent ? (RELATED_COMPONENTS[savedComponent] || []) : [];

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="max-w-site mx-auto px-4 lg:px-6 2xl:px-8 py-10">

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-8 bg-[#D4872D] rounded-full" />
            <h1 className="text-3xl font-bold text-[#1A1A1A]">New Maintenance Schedule</h1>
          </div>
          <p className="text-[#5A5A5A] text-sm ml-4 pl-3">Log a new maintenance entry for your RV</p>
        </div>

        {/* Related component suggestions — shown after successful save */}
        {savedComponent && relatedSuggestions.length > 0 && (
          <div className="max-w-3xl mx-auto mb-6">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <BulbOutlined className="text-amber-600 text-base" />
                <p className="text-amber-800 font-semibold text-sm">
                  Entry saved! Consider also scheduling maintenance for related components:
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {relatedSuggestions.map((comp) => (
                  <button
                    key={comp}
                    type="button"
                    onClick={() => {
                      form.setFieldValue("component", comp);
                      setSelectedComponent(comp);
                      setSavedComponent(null);
                      setIsFormFilled(true);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-800 hover:bg-amber-100 transition-colors font-medium"
                  >
                    <PlusOutlined className="text-xs" />
                    {COMPONENT_LABELS[comp] || comp}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => { setSavedComponent(null); navigate("/newMaintenance"); }}
                  className="text-sm px-3 py-1.5 rounded-lg text-amber-700 hover:text-amber-900 transition-colors"
                >
                  No thanks, view all →
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-3xl mx-auto">
          <Form
            form={form}
            onFinish={handleSubmit}
            onValuesChange={handleFormChange}
            layout="vertical"
          >
            {/* Card 1 — Service Details */}
            <Card icon={<ToolOutlined />} title="Service Details">
              <Form.Item label={fieldLabel("Component")} name="component" className="mb-4">
                <Select
                  placeholder="Select Component"
                  size="large"
                  className="w-full"
                  onChange={(val) => setSelectedComponent(val)}
                >
                  <Select.Option value="chassis">Chassis</Select.Option>
                  <Select.Option value="ceilingFans">Ceiling Fans</Select.Option>
                  <Select.Option value="airConditioning">Air Conditioning</Select.Option>
                  <Select.Option value="dishwasher">Dishwasher</Select.Option>
                  <Select.Option value="dryer">Dryer</Select.Option>
                  <Select.Option value="dvdPlayer">DVD Player</Select.Option>
                  <Select.Option value="exhaustFans">Exhaust Fans</Select.Option>
                  <Select.Option value="gps">GPS</Select.Option>
                  <Select.Option value="heater">Heater</Select.Option>
                  <Select.Option value="insurance">Insurance</Select.Option>
                  <Select.Option value="satelliteInternet">Satellite Internet</Select.Option>
                  <Select.Option value="maintenanceSchedule">Maintenance Schedule</Select.Option>
                  <Select.Option value="membership">Membership</Select.Option>
                  <Select.Option value="outdoorRadio">Outdoor Radio</Select.Option>
                  <Select.Option value="rv">RV</Select.Option>
                  <Select.Option value="surroundSound">Surround Sound</Select.Option>
                  <Select.Option value="tire">Tire</Select.Option>
                  <Select.Option value="toilet">Toilet</Select.Option>
                  <Select.Option value="waterHeater">Water Heater</Select.Option>
                  <Select.Option value="washer">Washer</Select.Option>
                  <Select.Option value="ventFans">Vent Fans</Select.Option>
                  <Select.Option value="tv">TV</Select.Option>
                  <Select.Option value="waterPump">Water Pump</Select.Option>
                  <Select.Option value="wifiRouter">WiFi Router</Select.Option>
                </Select>
              </Form.Item>

              {/* Specific unit selector for multi-instance components */}
              {selectedComponent && MULTI_INSTANCE_COMPONENTS.includes(selectedComponent) && (
                <div className="mb-4">
                  <Form.Item label={fieldLabel("Specific Unit (optional)")} name="componentInstance" className="mb-1">
                    <Input size="large" placeholder="e.g. Front, Rear, Bedroom…" className={inputClass} />
                  </Form.Item>
                  <div className="flex flex-wrap gap-1.5">
                    {UNIT_SUGGESTIONS.map((unit) => (
                      <button
                        key={unit}
                        type="button"
                        onClick={() => form.setFieldValue("componentInstance", unit)}
                        className="text-xs px-2.5 py-1 rounded-full bg-[#F5F5F0] border border-[#E0E0E0] text-[#5A5A5A] hover:border-[#3B7D3C] hover:text-[#3B7D3C] transition-all"
                      >
                        {unit}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Inline related hint while selecting */}
              {selectedComponent && (RELATED_COMPONENTS[selectedComponent] || []).length > 0 && !savedComponent && (
                <div className="mb-4 flex flex-wrap gap-1.5 items-center">
                  <span className="text-xs text-[#5A5A5A]">Often done together:</span>
                  {(RELATED_COMPONENTS[selectedComponent] || []).map((comp) => (
                    <span key={comp} className="text-xs px-2 py-0.5 rounded-full bg-[#E8F0E8] text-[#3B7D3C] border border-[#3B7D3C]/20 font-medium">
                      {COMPONENT_LABELS[comp] || comp}
                    </span>
                  ))}
                </div>
              )}

              <Form.Item label={fieldLabel("Maintenance to be Performed")} name="maintenanceToBePerformed" className="mb-0">
                <Input size="large" placeholder="e.g. Oil change, tire rotation…" className={inputClass} />
              </Form.Item>
            </Card>

            {/* Card 2 — Date & Mileage */}
            <Card icon={<CalendarOutlined />} title="Date & Mileage">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item label={fieldLabel("Due Date")} name="dateOfMaintenance" className="mb-0">
                  <DatePicker
                    size="large"
                    format={dateFormat}
                    className="w-full rounded-lg border-[#E0E0E0]"
                    placeholder="MM/DD/YYYY"
                  />
                </Form.Item>

                <Form.Item
                  label={fieldLabel("Due at Odometer (mi)")}
                  name="milage"
                  normalize={parseNumber}
                  getValueProps={(v) => ({ value: formatWithCommas(v) })}

                  rules={[
                    { pattern: /^\d+$/, message: "Numbers only" },
                    {
                      validator: (_, value) => {
                        if (!value) return Promise.resolve();
                        if (Number(parseNumber(value)) < 0) return Promise.reject("Mileage must be 0 or greater");
                        return Promise.resolve();
                      },
                    },
                  ]}
                  className="mb-0"
                >
                  <Input
                    size="large"
                    placeholder="e.g. 48,000 (odometer reading)"
                    suffix={<span className="text-gray-400 text-sm">mi</span>}
                    className={inputClass}
                  />
                </Form.Item>
              </div>
            </Card>

            {/* Card 3 — Recurrence */}
            <Card icon={<SyncOutlined />} title="Recurrence (Optional)">
              <p className="text-xs text-[#5A5A5A] mb-4">
                Set an interval and the next service auto-schedules when this one is marked complete.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Form.Item label={fieldLabel("Every ___ miles")} name="recurringMiles" className="mb-0">
                  <Input
                    size="large"
                    type="number"
                    min="0"
                    placeholder="e.g. 5000"
                    suffix={<span className="text-gray-400 text-sm">mi</span>}
                    className={inputClass}
                  />
                </Form.Item>
                <Form.Item label={fieldLabel("Every ___ months")} name="recurringMonths" className="mb-0">
                  <Input
                    size="large"
                    type="number"
                    min="1"
                    placeholder="e.g. 6"
                    suffix={<span className="text-gray-400 text-sm">mo</span>}
                    className={inputClass}
                  />
                </Form.Item>
              </div>
            </Card>

            {/* Card 5 — Cost & Repair Info */}
            <Card icon={<DollarOutlined />} title="Cost & Repair Info">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Form.Item
                  label={fieldLabel("Actual Cost ($)")}
                  name="cost_amount"
                  normalize={parseNumber}
                  getValueProps={(v) => ({ value: formatWithCommas(v) })}
                  rules={[
                    { pattern: /^\d+(\.\d{1,2})?$/, message: "Enter a valid positive amount" },
                    {
                      validator: (_, value) => {
                        if (!value) return Promise.resolve();
                        if (parseFloat(parseNumber(value)) < 0) return Promise.reject("Cost must be 0 or greater");
                        return Promise.resolve();
                      },
                    },
                  ]}
                  className="mb-0"
                >
                  <Input
                    size="large"
                    placeholder="e.g. 250.00"
                    prefix={<span className="text-gray-400 text-sm">$</span>}
                    className={inputClass}
                  />
                </Form.Item>

                <Form.Item label={fieldLabel("Repair Shop / Vendor")} name="vendor" className="mb-0">
                  <Input
                    size="large"
                    placeholder="e.g. Camping World, Local Shop…"
                    prefix={<ShopOutlined className="text-gray-400" />}
                    className={inputClass}
                  />
                </Form.Item>
              </div>

              {/* Generator Hours — only relevant for generator component */}
              {selectedComponent === "generator" && (
                <Form.Item
                  label={fieldLabel("Generator Hours at Service")}
                  name="hoursAtMaintenance"
                  rules={[
                    {
                      validator: (_, value) => {
                        if (!value) return Promise.resolve();
                        if (isNaN(value) || Number(value) < 0) return Promise.reject("Hours must be 0 or greater");
                        return Promise.resolve();
                      },
                    },
                  ]}
                  className="mb-0"
                >
                  <Input
                    size="large"
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="e.g. 250"
                    suffix={<ClockCircleOutlined className="text-gray-400" />}
                    className={inputClass}
                  />
                </Form.Item>
              )}
            </Card>

            {/* Card 4 — Notes */}
            <Card icon={<FileTextOutlined />} title="Notes">
              <Form.Item label={fieldLabel("Additional Notes")} name="notes" className="mb-0">
                <Input.TextArea
                  rows={4}
                  placeholder="Add any relevant notes about this maintenance…"
                  className="w-full rounded-lg border border-[#E0E0E0] text-[#1A1A1A] placeholder-gray-400 focus:border-[#3B7D3C] resize-none"
                />
              </Form.Item>
            </Card>

            {/* Card 5 — Photos & Documents */}
            <Card icon={<InboxOutlined />} title="Photos & Documents">
              <Dragger
                fileList={fileList}
                onChange={({ fileList: newList }) => setFileList(newList)}
                beforeUpload={() => false}
                multiple
                accept="image/*,application/pdf"
                className="rounded-xl border-2 border-dashed border-[#E0E0E0] hover:border-[#3B7D3C] transition-colors duration-200"
              >
                <div className="py-6">
                  <p className="mb-2">
                    <InboxOutlined style={{ fontSize: 32, color: "#3B7D3C" }} />
                  </p>
                  <p className="text-[#1A1A1A] font-medium text-sm">Click or drag files here</p>
                  <p className="text-[#5A5A5A] text-xs mt-1">Photos (JPG, PNG) and documents (PDF)</p>
                </div>
              </Dragger>
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate("/newMaintenance")}
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
                {loading ? <><Spin size="small" /><span>Saving…</span></> : "Save Maintenance Record"}
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default AddNewMaintanceSchedule;
