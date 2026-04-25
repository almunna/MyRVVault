import { Form, Input, message, DatePicker, Spin, Select } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  InboxOutlined,
  ToolOutlined,
  CalendarOutlined,
  DollarOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { Upload } from "antd";
import {
  useGetSingleMaintanceQuery,
  useUpdateMaintanceMutation,
} from "../redux/api/routesApi";
import dayjs from "dayjs";

const { Dragger } = Upload;
const dateFormat = "MM/DD/YYYY";

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

const UpdateMaintanceSchedule = () => {
  const [form] = Form.useForm();
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: singleData } = useGetSingleMaintanceQuery({ id });
  const [updateMaintance] = useUpdateMaintanceMutation();
  const [isFormFilled, setIsFormFilled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);

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
    return value.toString().replace(/,/g, "");
  };

  // Pre-populate form when data loads
  useEffect(() => {
    if (singleData?.data) {
      const d = singleData.data;
      form.setFieldsValue({
        component: d.component || undefined,
        maintenanceToBePerformed: d.maintenanceToBePerformed || "",
        dateOfMaintenance: d.dateOfMaintenance ? dayjs(d.dateOfMaintenance) : null,
        milage: d.initialMilage ? String(d.initialMilage) : "",
        cost_amount: d.cost ? String(d.cost) : "",
        hoursAtMaintenance: d.hoursAtMaintenance ? String(d.hoursAtMaintenance) : "",
        notes: d.notes || "",
      });
      setIsFormFilled(true);
    }
  }, [singleData, form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();
      if (values.component)                formData.append("component", values.component);
      if (values.milage)                   formData.append("initialMilage", parseNumber(values.milage));
      if (values.maintenanceToBePerformed) formData.append("maintenanceToBePerformed", values.maintenanceToBePerformed);
      if (values.dateOfMaintenance)        formData.append("dateOfMaintenance", values.dateOfMaintenance.toISOString());
      if (values.notes)                    formData.append("notes", values.notes);
      if (values.cost_amount)              formData.append("cost", parseNumber(values.cost_amount));
      if (values.hoursAtMaintenance)       formData.append("hoursAtMaintenance", values.hoursAtMaintenance);

      fileList.forEach((file) => {
        if (file.originFileObj) formData.append("images", file.originFileObj);
      });

      const res = await updateMaintance({ formData, id }).unwrap();
      message.success(res?.message || "Updated successfully");
      navigate("/newMaintenance");
    } catch (err) {
      message.error(err?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="max-w-site mx-auto px-4 lg:px-6 2xl:px-8 py-10">

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-8 bg-[#D4872D] rounded-full" />
            <h1 className="text-3xl font-bold text-[#1A1A1A]">Edit Maintenance Record</h1>
          </div>
          <p className="text-[#5A5A5A] text-sm ml-4 pl-3">Update the details for this maintenance entry</p>
        </div>

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

            {/* Card 3 — Cost & Hours */}
            <Card icon={<DollarOutlined />} title="Cost & Generator Hours">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  label={fieldLabel("Cost ($)")}
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
              </div>
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
                {loading ? <><Spin size="small" /><span>Saving…</span></> : "Update Maintenance Record"}
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default UpdateMaintanceSchedule;
