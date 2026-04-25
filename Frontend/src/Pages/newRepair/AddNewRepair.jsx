import {
  DatePicker,
  Form,
  Input,
  message,
  Select,
  Spin,
  Upload,
} from "antd";
import React, { useEffect, useState } from "react";
import {
  InboxOutlined,
  ToolOutlined,
  CalendarOutlined,
  DollarOutlined,
  ShopOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useNavigate } from "react-router-dom";
import { useAddRepairMutation } from "../redux/api/routesApi";
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

const fieldLabel = (text) => (
  <span className="text-sm font-medium text-[#5A5A5A]">{text}</span>
);

const AddNewRepair = () => {
  const [newRepair] = useAddRepairMutation();
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { data: profileData } = useGetProfileQuery();
  const [isFormFilled, setIsFormFilled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    handleFormChange();
  }, [fileList]);

  const handleFormChange = () => {
    const values = form.getFieldsValue();
    const hasValue =
      Object.values(values).some((value) => value && value !== "") ||
      fileList.length > 0;
    setIsFormFilled(hasValue);
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    const rvId = profileData?.user?.selectedRvId?.id;
    if (!rvId) {
      message.error("Please select your RV from the home page before submitting.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("rvId", rvId);
    formData.append("vendor", values.vendor || "");
    formData.append("component", values.component || "");
    formData.append("cityState", values.cityState || "");
    formData.append("date", values.date ? dayjs(values.date).format(dateFormat) : "");

    const cleanedCost = values.cost ? values.cost.toString().replace(/,/g, "") : "";
    const cleanedQty = values.qty ? values.qty.toString().replace(/,/g, "") : "";
    formData.append("cost", cleanedCost ? Number(cleanedCost) : "");
    formData.append("qty", cleanedQty ? Number(cleanedQty) : "");
    formData.append("notes", values.notes || "");

    fileList.forEach((file) => {
      if (file.originFileObj) formData.append("images", file.originFileObj);
    });

    try {
      const res = await newRepair(formData).unwrap();
      message.success(res?.message || "Saved successfully");
      form.resetFields();
      setFileList([]);
      setIsFormFilled(false);
      navigate("/newRepair");
    } catch (err) {
      message.error(err?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const formatWithCommas = (value) => {
    if (!value) return "";
    return value.toString().replace(/[^\d]/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const parseNumber = (value) => {
    if (!value) return "";
    return value.replace(/,/g, "");
  };

  const inputClass =
    "w-full rounded-lg border border-[#E0E0E0] bg-white px-3 py-2 text-[#1A1A1A] placeholder-gray-400 focus:border-[#3B7D3C] focus:ring-1 focus:ring-[#3B7D3C] transition-all duration-200";

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="max-w-site mx-auto px-4 lg:px-6 2xl:px-8 py-10">

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-8 bg-[#D4872D] rounded-full" />
            <h1 className="text-3xl font-bold text-[#1A1A1A]">Add New Repair</h1>
          </div>
          <p className="text-[#5A5A5A] text-sm ml-4 pl-3">
            Log a repair order for your RV
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Form
            form={form}
            onFinish={handleSubmit}
            onValuesChange={handleFormChange}
            layout="vertical"
          >

            {/* Card 1 — Vendor & Location */}
            <div className="bg-white border border-[#E8F0E8] rounded-2xl p-6 mb-5 shadow-sm">
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-[#E8F0E8]">
                <div className="w-8 h-8 rounded-lg bg-[#E8F0E8] flex items-center justify-center">
                  <ShopOutlined className="text-[#3B7D3C] text-sm" />
                </div>
                <h2 className="text-base font-semibold text-[#1A1A1A]">Vendor &amp; Location</h2>
              </div>

              <Form.Item label={fieldLabel("Date of Repair")} name="date" className="mb-4">
                <DatePicker
                  size="large"
                  format={dateFormat}
                  className="w-full rounded-lg border-[#E0E0E0]"
                  placeholder="MM/DD/YYYY"
                />
              </Form.Item>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item label={fieldLabel("Vendor")} name="vendor" className="mb-0">
                  <Input
                    size="large"
                    placeholder="e.g. Eddie's RV Service"
                    className={inputClass}
                  />
                </Form.Item>
                <Form.Item label={fieldLabel("City / State")} name="cityState" className="mb-0">
                  <Input
                    size="large"
                    placeholder="e.g. Austin, TX"
                    className={inputClass}
                  />
                </Form.Item>
              </div>
            </div>

            {/* Card 2 — Repair Details */}
            <div className="bg-white border border-[#E8F0E8] rounded-2xl p-6 mb-5 shadow-sm">
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-[#E8F0E8]">
                <div className="w-8 h-8 rounded-lg bg-[#E8F0E8] flex items-center justify-center">
                  <ToolOutlined className="text-[#3B7D3C] text-sm" />
                </div>
                <h2 className="text-base font-semibold text-[#1A1A1A]">Repair Details</h2>
              </div>

              <Form.Item label={fieldLabel("Component")} name="component" className="mb-0">
                <Select
                  size="large"
                  placeholder="Select Component"
                  className="w-full"
                  popupClassName="rounded-lg"
                >
                  <Select.Option value="Chassis">Chassis</Select.Option>
                  <Select.Option value="Celling Fans">Ceiling Fans</Select.Option>
                  <Select.Option value="Air Condition">Air Conditioning</Select.Option>
                  <Select.Option value="Dish washer">Dishwasher</Select.Option>
                  <Select.Option value="Dryer">Dryer</Select.Option>
                  <Select.Option value="DVD">DVD Player</Select.Option>
                  <Select.Option value="Exhaust Fans">Exhaust Fans</Select.Option>
                  <Select.Option value="Gps">GPS</Select.Option>
                  <Select.Option value="Heater">Heater</Select.Option>
                  <Select.Option value="Insurance">Insurance</Select.Option>
                  <Select.Option value="Internet Satelite">Satellite Internet</Select.Option>
                  <Select.Option value="Maintenance Schedule">Maintenance Schedule</Select.Option>
                  <Select.Option value="Membership">Membership</Select.Option>
                  <Select.Option value="Outdoor Radio">Outdoor Radio</Select.Option>
                  <Select.Option value="RV">RV</Select.Option>
                  <Select.Option value="Surround Sound">Surround Sound</Select.Option>
                  <Select.Option value="Tire">Tire</Select.Option>
                  <Select.Option value="Toilet">Toilet</Select.Option>
                  <Select.Option value="Water Heater">Water Heater</Select.Option>
                  <Select.Option value="Wahser">Washer</Select.Option>
                  <Select.Option value="Vent Fans">Vent Fans</Select.Option>
                  <Select.Option value="Tv">TV</Select.Option>
                  <Select.Option value="Water Pump">Water Pump</Select.Option>
                  <Select.Option value="Wifi Router">WiFi Router</Select.Option>
                </Select>
              </Form.Item>
            </div>

            {/* Card 3 — Cost & Quantity */}
            <div className="bg-white border border-[#E8F0E8] rounded-2xl p-6 mb-5 shadow-sm">
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-[#E8F0E8]">
                <div className="w-8 h-8 rounded-lg bg-[#E8F0E8] flex items-center justify-center">
                  <DollarOutlined className="text-[#3B7D3C] text-sm" />
                </div>
                <h2 className="text-base font-semibold text-[#1A1A1A]">Cost &amp; Quantity</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  label={fieldLabel("Cost ($)")}
                  name="cost"
                  normalize={parseNumber}
                  getValueProps={(v) => ({ value: formatWithCommas(v) })}
                  rules={[{ pattern: /^\d+$/, message: "Numbers only" }]}
                  className="mb-0"
                >
                  <Input
                    size="large"
                    placeholder="e.g. 250"
                    prefix={<span className="text-gray-400 text-sm">$</span>}
                    className={inputClass}
                  />
                </Form.Item>

                <Form.Item
                  label={fieldLabel("Quantity")}
                  name="qty"
                  normalize={parseNumber}
                  getValueProps={(v) => ({ value: formatWithCommas(v) })}
                  rules={[{ pattern: /^\d+$/, message: "Numbers only" }]}
                  className="mb-0"
                >
                  <Input
                    size="large"
                    placeholder="e.g. 1"
                    className={inputClass}
                  />
                </Form.Item>
              </div>
            </div>

            {/* Card 4 — Notes */}
            <div className="bg-white border border-[#E8F0E8] rounded-2xl p-6 mb-5 shadow-sm">
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-[#E8F0E8]">
                <div className="w-8 h-8 rounded-lg bg-[#E8F0E8] flex items-center justify-center">
                  <FileTextOutlined className="text-[#3B7D3C] text-sm" />
                </div>
                <h2 className="text-base font-semibold text-[#1A1A1A]">Notes</h2>
              </div>

              <Form.Item label={fieldLabel("Additional Notes")} name="notes" className="mb-0">
                <Input.TextArea
                  rows={4}
                  placeholder="Describe the repair, parts used, or any other details…"
                  className="w-full rounded-lg border border-[#E0E0E0] text-[#1A1A1A] placeholder-gray-400 focus:border-[#3B7D3C] resize-none"
                />
              </Form.Item>
            </div>

            {/* Card 5 — Photos */}
            <div className="bg-white border border-[#E8F0E8] rounded-2xl p-6 mb-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-[#E8F0E8]">
                <div className="w-8 h-8 rounded-lg bg-[#E8F0E8] flex items-center justify-center">
                  <InboxOutlined className="text-[#3B7D3C] text-sm" />
                </div>
                <h2 className="text-base font-semibold text-[#1A1A1A]">Photos &amp; Documents</h2>
              </div>

              <Upload
                listType="picture-card"
                fileList={fileList}
                onChange={({ fileList: newList }) => setFileList(newList)}
                onPreview={onPreview}
                beforeUpload={() => false}
                multiple
                className="upload-modern"
              >
                {fileList.length < 5 && (
                  <div className="flex flex-col items-center gap-1">
                    <InboxOutlined className="text-[#3B7D3C] text-xl" />
                    <span className="text-xs text-[#5A5A5A]">Upload</span>
                  </div>
                )}
              </Upload>
              <p className="text-xs text-[#5A5A5A] mt-2">Up to 5 images — JPG, PNG, PDF</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate("/newRepair")}
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
                {loading ? (
                  <>
                    <Spin size="small" />
                    <span>Saving…</span>
                  </>
                ) : (
                  "Save Repair Record"
                )}
              </button>
            </div>

          </Form>
        </div>
      </div>
    </div>
  );
};

export default AddNewRepair;
