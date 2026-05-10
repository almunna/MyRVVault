import { Button, DatePicker, Form, Input, Select, message } from "antd";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import compressImage from "../../utils/compressImage";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { FiCamera, FiX } from "react-icons/fi";

const { Option } = Select;

const states = {
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

dayjs.extend(customParseFormat);
const dateFormat = "MM/DD/YYYY";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5002/api";

const NewTrip = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    const currentStates = form.getFieldValue("states");
    if (!currentStates || currentStates.length === 0) {
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
        state: states[item.state] || item.state,
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
        message.success(data.message || "Trip added successfully!");
        form.resetFields();
        setPhotos([]);
        setPreviews([]);
      } else {
        message.error(data.message || "Failed to add trip");
      }
    } catch {
      message.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl m-auto">
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <Form.Item label={<span style={{ color: "#F9B038" }}>Trip Title</span>} name="title">
          <Input className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2" placeholder="Trip title" />
        </Form.Item>

        <Form.Item label={<span style={{ color: "#F9B038" }}>Description / Notes</span>} name="feedback">
          <Input.TextArea className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2" rows={3} placeholder="Write trip details..." />
        </Form.Item>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item label={<span style={{ color: "#F9B038" }}>Start Date</span>} name="start">
            <DatePicker className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2" format={dateFormat} placeholder="Start Date" />
          </Form.Item>
          <Form.Item label={<span style={{ color: "#F9B038" }}>End Date</span>} name="end">
            <DatePicker className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2" format={dateFormat} placeholder="End Date" />
          </Form.Item>
        </div>

        {/* Mileage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item label={<span style={{ color: "#F9B038" }}>Start Odometer (miles)</span>} name="startOdometer">
            <Input
              type="number"
              className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
              placeholder="e.g., 45000"
            />
          </Form.Item>
          <Form.Item label={<span style={{ color: "#F9B038" }}>End Odometer (miles)</span>} name="endOdometer">
            <Input
              type="number"
              className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
              placeholder="e.g., 45800"
            />
          </Form.Item>
        </div>
        <p className="text-gray-500 text-xs -mt-3 mb-4">Miles driven will be auto-calculated from odometer readings.</p>

        {/* States */}
        <Form.List name="states">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }, index) => (
                <div key={key} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 items-start">
                  <Form.Item
                    {...restField}
                    name={[name, "state"]}
                    label={index === 0 ? <span style={{ color: "#F9B038" }}>State</span> : ""}
                    rules={[{ required: true, message: "Select a state" }]}
                  >
                    <Select placeholder="Select State" className="w-full custom-select" style={{ height: "40px" }}>
                      {Object.entries(states).map(([key, value]) => (
                        <Option key={key} value={key}>{value}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <div className="flex items-start gap-2">
                    <Form.Item
                      {...restField}
                      name={[name, "status"]}
                      label={index === 0 ? <span style={{ color: "#F9B038" }}>Visit Status</span> : ""}
                      rules={[{ required: true, message: "Select status" }]}
                      className="flex-1"
                    >
                      <Select placeholder="Select Status" className="w-full custom-select" style={{ height: "40px" }}>
                        <Option value="CAMPED">Camped</Option>
                        <Option value="TRAVELED_THROUGH">Traveled Through</Option>
                        <Option value="PLANNING">Planning To Visit</Option>
                        <Option value="NOT_VISITED">Not Yet Visited</Option>
                      </Select>
                    </Form.Item>
                    {fields.length > 1 && (
                      <MinusCircleOutlined className="text-red-500 text-xl mt-2" onClick={() => remove(name)} />
                    )}
                  </div>
                </div>
              ))}
              <Form.Item>
                <button onClick={() => add()} className="border rounded-md w-full border-[#F9B038] text-[#F9B038] px-4 py-2">
                  + Add another state
                </button>
              </Form.Item>
            </>
          )}
        </Form.List>

        {/* Photo Upload */}
        <div className="mb-6">
          <label className="text-[#F9B038] text-sm font-medium block mb-2">Trip Photos</label>
          <div className="flex flex-wrap gap-2">
            {previews.map((src, idx) => (
              <div key={idx} className="relative">
                <img src={src} alt="" className="w-20 h-20 object-cover rounded-lg border border-gray-600" />
                <button type="button" onClick={() => removePhoto(idx)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                  <FiX size={8} />
                </button>
              </div>
            ))}
            <label className="w-20 h-20 border-2 border-dashed border-[#F9B038] rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-yellow-900/10 transition-colors">
              <FiCamera size={20} className="text-[#F9B038]" />
              <span className="text-xs text-[#F9B038] mt-1">Add</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoChange} />
            </label>
          </div>
        </div>

        <Form.Item className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#F9B038] py-2 text-black font-semibold disabled:opacity-60 rounded-md"
          >
            {loading ? "Saving..." : "Save Trip"}
          </button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default NewTrip;
