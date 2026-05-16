import { DatePicker, Form, Input, Select, message, Spin } from "antd";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {
  FileTextOutlined,
  CalendarOutlined,
  DashboardOutlined,
  GlobalOutlined,
  PictureOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import { FiCamera, FiX } from "react-icons/fi";
import compressImage from "../../utils/compressImage";

dayjs.extend(customParseFormat);

const { Option } = Select;
const dateFormat = "MM/DD/YYYY";
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5002/api";

const US_STATES = {
  ALABAMA: "Alabama", ALASKA: "Alaska", ARIZONA: "Arizona", ARKANSAS: "Arkansas",
  CALIFORNIA: "California", COLORADO: "Colorado", CONNECTICUT: "Connecticut", DELAWARE: "Delaware",
  FLORIDA: "Florida", GEORGIA: "Georgia", HAWAII: "Hawaii", IDAHO: "Idaho",
  ILLINOIS: "Illinois", INDIANA: "Indiana", IOWA: "Iowa", KANSAS: "Kansas",
  KENTUCKY: "Kentucky", LOUISIANA: "Louisiana", MAINE: "Maine", MARYLAND: "Maryland",
  MASSACHUSETTS: "Massachusetts", MICHIGAN: "Michigan", MINNESOTA: "Minnesota", MISSISSIPPI: "Mississippi",
  MISSOURI: "Missouri", MONTANA: "Montana", NEBRASKA: "Nebraska", NEVADA: "Nevada",
  NEW_HAMPSHIRE: "New Hampshire", NEW_JERSEY: "New Jersey", NEW_MEXICO: "New Mexico", NEW_YORK: "New York",
  NORTH_CAROLINA: "North Carolina", NORTH_DAKOTA: "North Dakota", OHIO: "Ohio", OKLAHOMA: "Oklahoma",
  OREGON: "Oregon", PENNSYLVANIA: "Pennsylvania", RHODE_ISLAND: "Rhode Island", SOUTH_CAROLINA: "South Carolina",
  SOUTH_DAKOTA: "South Dakota", TENNESSEE: "Tennessee", TEXAS: "Texas", UTAH: "Utah",
  VERMONT: "Vermont", VIRGINIA: "Virginia", WASHINGTON: "Washington", WEST_VIRGINIA: "West Virginia",
  WISCONSIN: "Wisconsin", WYOMING: "Wyoming",
};

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

const NewTrip = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    const current = form.getFieldValue("states");
    if (!current || current.length === 0) {
      form.setFieldsValue({ states: [{}] });
    }
  }, [form]);

  const handlePhotoChange = async (e) => {
    const raw = Array.from(e.target.files || []);
    const compressed = await Promise.all(raw.map(f => compressImage(f)));
    const all = [...photos, ...compressed];
    setPhotos(all);
    setPreviews(all.map(f => URL.createObjectURL(f)));
  };

  const removePhoto = (idx) => {
    const p = photos.filter((_, i) => i !== idx);
    setPhotos(p);
    setPreviews(p.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const statesData = (values.states || []).map(item => ({
        state: US_STATES[item.state] || item.state,
        status: item.status,
      }));

      const formData = new FormData();
      formData.append("title", values.title || "");
      if (values.feedback) formData.append("description", values.feedback);
      if (values.start) formData.append("startDate", values.start.format("YYYY-MM-DD"));
      if (values.end) formData.append("endDate", values.end.format("YYYY-MM-DD"));
      if (values.startOdometer) formData.append("startOdometer", values.startOdometer);
      if (values.endOdometer) formData.append("endOdometer", values.endOdometer);
      formData.append("states", JSON.stringify(statesData));
      photos.forEach(p => formData.append("photos", p));

      const res = await fetch(`${BASE_URL}/trips`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        message.success(data.message || "Trip saved successfully!");
        form.resetFields();
        form.setFieldsValue({ states: [{}] });
        setPhotos([]);
        setPreviews([]);
      } else {
        message.error(data.message || "Failed to save trip");
      }
    } catch {
      message.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <Form form={form} onFinish={handleSubmit} layout="vertical">

        {/* Trip Details */}
        <Card icon={<FileTextOutlined />} title="Trip Details">
          <div className="space-y-4">
            <Form.Item
              label={fieldLabel("Trip Title")}
              name="title"
              className="mb-0"
              rules={[{ required: true, message: "Trip title is required" }]}
            >
              <Input size="large" className={inputClass} placeholder="e.g. Summer Road Trip 2026" />
            </Form.Item>
            <Form.Item
              label={fieldLabel("Description / Notes")}
              name="feedback"
              className="mb-0"
            >
              <Input.TextArea
                rows={3}
                placeholder="Write trip details…"
                className="w-full rounded-lg border border-[#E0E0E0] text-[#1A1A1A] placeholder-gray-400 focus:border-[#3B7D3C] resize-none"
              />
            </Form.Item>
          </div>
        </Card>

        {/* Dates */}
        <Card icon={<CalendarOutlined />} title="Dates">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item label={fieldLabel("Start Date")} name="start" className="mb-0">
              <DatePicker size="large" format={dateFormat} placeholder="MM/DD/YYYY" className="w-full rounded-lg border-[#E0E0E0]" />
            </Form.Item>
            <Form.Item label={fieldLabel("End Date")} name="end" className="mb-0">
              <DatePicker size="large" format={dateFormat} placeholder="MM/DD/YYYY" className="w-full rounded-lg border-[#E0E0E0]" />
            </Form.Item>
          </div>
        </Card>

        {/* Mileage */}
        <Card icon={<DashboardOutlined />} title="Odometer">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item label={fieldLabel("Start Odometer (miles)")} name="startOdometer" className="mb-0">
              <Input size="large" type="number" className={inputClass} placeholder="e.g. 45000" />
            </Form.Item>
            <Form.Item label={fieldLabel("End Odometer (miles)")} name="endOdometer" className="mb-0">
              <Input size="large" type="number" className={inputClass} placeholder="e.g. 45800" />
            </Form.Item>
          </div>
          <p className="text-xs text-[#9E9E9E] mt-3">Miles driven will be auto-calculated from odometer readings.</p>
        </Card>

        {/* States */}
        <Card icon={<GlobalOutlined />} title="States Visited">
          <Form.List name="states">
            {(fields, { add, remove }) => (
              <div className="space-y-3">
                {fields.map(({ key, name, ...restField }, index) => (
                  <div key={key} className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
                    <Form.Item
                      {...restField}
                      name={[name, "state"]}
                      label={index === 0 ? fieldLabel("State") : null}
                      rules={[{ required: true, message: "Select a state" }]}
                      className="mb-0"
                    >
                      <Select size="large" placeholder="Select State" className="w-full">
                        {Object.entries(US_STATES).map(([key, value]) => (
                          <Option key={key} value={key}>{value}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <div className="flex items-start gap-2">
                      <Form.Item
                        {...restField}
                        name={[name, "status"]}
                        label={index === 0 ? fieldLabel("Visit Status") : null}
                        rules={[{ required: true, message: "Select status" }]}
                        className="mb-0 flex-1"
                      >
                        <Select size="large" placeholder="Select Status" className="w-full">
                          <Option value="CAMPED">Camped</Option>
                          <Option value="TRAVELED_THROUGH">Traveled Through</Option>
                          <Option value="PLANNING">Planning To Visit</Option>
                          <Option value="NOT_VISITED">Not Yet Visited</Option>
                        </Select>
                      </Form.Item>
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(name)}
                          className="text-[#9E9E9E] hover:text-red-500 transition flex-shrink-0 mt-1 p-1"
                        >
                          <MinusCircleOutlined style={{ fontSize: 18 }} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => add()}
                  className="mt-1 w-full py-2 rounded-xl border border-dashed border-[#C8D8C8] text-[#3B7D3C] text-sm font-medium hover:border-[#3B7D3C] hover:bg-[#E8F0E8]/30 transition-all duration-200"
                >
                  + Add another state
                </button>
              </div>
            )}
          </Form.List>
        </Card>

        {/* Photos */}
        <Card icon={<PictureOutlined />} title="Trip Photos">
          <div className="flex flex-wrap gap-3">
            {previews.map((src, idx) => (
              <div key={idx} className="relative">
                <img src={src} alt="" className="w-24 h-24 object-cover rounded-xl border border-[#E0E0E0]" />
                <button
                  type="button"
                  onClick={() => removePhoto(idx)}
                  className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow"
                >
                  <FiX size={10} />
                </button>
              </div>
            ))}
            <label className="w-24 h-24 border-2 border-dashed border-[#E0E0E0] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#3B7D3C] hover:bg-[#E8F0E8]/30 transition-all duration-200">
              <FiCamera size={22} className="text-[#9E9E9E]" />
              <span className="text-xs text-[#9E9E9E] mt-1">Add Photo</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoChange} />
            </label>
          </div>
          <p className="text-xs text-[#9E9E9E] mt-3">Images are compressed automatically.</p>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => { form.resetFields(); form.setFieldsValue({ states: [{}] }); setPhotos([]); setPreviews([]); }}
            className="flex-1 py-3 rounded-xl border border-[#E0E0E0] text-[#5A5A5A] font-medium text-sm hover:border-[#3B7D3C] hover:text-[#3B7D3C] transition-all duration-200"
          >
            Clear
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
              loading
                ? "bg-[#3B7D3C]/70 text-white cursor-not-allowed"
                : "bg-[#3B7D3C] text-white hover:bg-[#2d6130] shadow-sm hover:shadow-md"
            }`}
          >
            {loading ? <><Spin size="small" /><span>Saving…</span></> : "Save Trip"}
          </button>
        </div>

      </Form>
    </div>
  );
};

export default NewTrip;
