import { Form, Input, DatePicker, Select, Spin, message, Image } from "antd";
import { Upload } from "antd";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ToolOutlined, CalendarOutlined, DollarOutlined,
  FileTextOutlined, InboxOutlined, SafetyCertificateOutlined,
  ClockCircleOutlined, CloseCircleFilled,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { COMPONENT_TYPES } from "./componentConfig";
import {
  useGetSingleComponentQuery,
  useUpdateComponentMutation,
} from "../redux/api/routesApi";

const { Dragger } = Upload;
const dateFormat = "MM/DD/YYYY";

const fieldLabel = (text) => <span className="text-sm font-medium text-[#5A5A5A]">{text}</span>;
const inputClass = "w-full rounded-lg border border-[#E0E0E0] bg-white px-3 py-2 text-[#1A1A1A] placeholder-gray-400 focus:border-[#3B7D3C] focus:ring-1 focus:ring-[#3B7D3C] transition-all duration-200";

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

const ComponentUpdate = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const cfg = COMPONENT_TYPES[type];
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const { data, isLoading } = useGetSingleComponentQuery(
    { urlPath: cfg?.urlPath, id },
    { skip: !cfg || !id }
  );
  const [updateComponent] = useUpdateComponentMutation();

  useEffect(() => {
    if (!data?.data) return;
    const item = data.data;
    setExistingImages(item.images || []);
    form.setFieldsValue({
      name:              item.name            || "",
      location:          item.location        || undefined,
      modelNumber:       item.modelNumber     || "",
      serialNumber:      item.serialNumber    || "",
      dateOfPurchase:    item.dateOfPurchase  ? dayjs(item.dateOfPurchase)  : null,
      installDate:       item.installDate     ? dayjs(item.installDate)     : null,
      installMileage:    item.installMileage  ?? "",
      installHours:      item.installHours    ?? "",
      cost:              item.cost            ?? "",
      warrantyStartDate: item.warrantyStartDate ? dayjs(item.warrantyStartDate) : null,
      warrantyEndDate:   item.warrantyEndDate   ? dayjs(item.warrantyEndDate)   : null,
      warrantyProvider:  item.warrantyProvider || "",
      warrantyTerms:     item.warrantyTerms    || "",
      notes:             item.notes           || "",
    });
  }, [data, form]);

  if (!cfg) return null;

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();
      const fields = [
        "name", "modelNumber", "serialNumber", "location",
        "notes", "warrantyProvider", "warrantyTerms",
      ];
      fields.forEach(f => { if (values[f]) formData.append(f, values[f]); });

      if (values.dateOfPurchase)    formData.append("dateOfPurchase",    values.dateOfPurchase.toISOString());
      if (values.installDate)       formData.append("installDate",       values.installDate.toISOString());
      if (values.warrantyStartDate) formData.append("warrantyStartDate", values.warrantyStartDate.toISOString());
      if (values.warrantyEndDate)   formData.append("warrantyEndDate",   values.warrantyEndDate.toISOString());
      if (values.cost)              formData.append("cost",              values.cost);
      if (values.installMileage)    formData.append("installMileage",    values.installMileage);
      if (cfg.hasHours && values.installHours) formData.append("installHours", values.installHours);

      formData.append("keepImages", JSON.stringify(existingImages));
      const newFiles = fileList.filter(f => f.originFileObj);
      newFiles.forEach(f => formData.append("images", f.originFileObj));

      const res = await updateComponent({ urlPath: cfg.urlPath, id, data: formData }).unwrap();
      message.success(res?.message || "Component updated");
      navigate(`/components/${type}`);
    } catch (err) {
      message.error(err?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="max-w-site mx-auto px-4 lg:px-6 2xl:px-8 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-8 bg-[#D4872D] rounded-full" />
            <h1 className="text-3xl font-bold text-[#1A1A1A]">
              <span className="mr-2">{cfg.icon}</span>Edit {cfg.label}
            </h1>
          </div>
          <p className="text-[#5A5A5A] text-sm ml-4 pl-3">Update component details, warranty, and install info</p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Form form={form} onFinish={handleSubmit} layout="vertical">

            {/* Card 1: Basic Info */}
            <Card icon={<ToolOutlined />} title="Component Details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item label={fieldLabel("Name")} name="name" className="mb-0">
                  <Input size="large" placeholder={`e.g. ${cfg.label} Unit 1`} className={inputClass} />
                </Form.Item>
                <Form.Item label={fieldLabel("Location")} name="location" className="mb-0">
                  <Select size="large" placeholder="Select location" className="w-full">
                    <Select.Option value="Front">Front</Select.Option>
                    <Select.Option value="Mid">Mid</Select.Option>
                    <Select.Option value="Rear">Rear</Select.Option>
                    <Select.Option value="Roof">Roof</Select.Option>
                    <Select.Option value="Exterior">Exterior</Select.Option>
                    <Select.Option value="Other">Other</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item label={fieldLabel("Model Number")} name="modelNumber" className="mb-0">
                  <Input size="large" placeholder="e.g. ABC-1234" className={inputClass} />
                </Form.Item>
                <Form.Item label={fieldLabel("Serial Number")} name="serialNumber" className="mb-0">
                  <Input size="large" placeholder="e.g. SN00123456" className={inputClass} />
                </Form.Item>
              </div>
            </Card>

            {/* Card 2: Install & Purchase */}
            <Card icon={<CalendarOutlined />} title="Install & Purchase Info">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item label={fieldLabel("Date of Purchase")} name="dateOfPurchase" className="mb-0">
                  <DatePicker size="large" format={dateFormat} className="w-full rounded-lg border-[#E0E0E0]" placeholder="MM/DD/YYYY" />
                </Form.Item>
                <Form.Item label={fieldLabel("Install Date")} name="installDate" className="mb-0">
                  <DatePicker size="large" format={dateFormat} className="w-full rounded-lg border-[#E0E0E0]" placeholder="MM/DD/YYYY" />
                </Form.Item>
                <Form.Item label={fieldLabel("Odometer at Install (mi)")} name="installMileage" className="mb-0">
                  <Input size="large" type="number" min="0" placeholder="e.g. 45,000" className={inputClass}
                    suffix={<span className="text-gray-400 text-sm">mi</span>} />
                </Form.Item>
                {cfg.hasHours && (
                  <Form.Item label={fieldLabel("Generator Hours at Install")} name="installHours" className="mb-0">
                    <Input size="large" type="number" min="0" placeholder="e.g. 250"
                      className={inputClass} suffix={<ClockCircleOutlined className="text-gray-400" />} />
                  </Form.Item>
                )}
                <Form.Item label={fieldLabel("Purchase Cost ($)")} name="cost" className="mb-0">
                  <Input size="large" type="number" min="0" placeholder="e.g. 450"
                    prefix={<span className="text-gray-400 text-sm">$</span>} className={inputClass} />
                </Form.Item>
              </div>
            </Card>

            {/* Card 3: Warranty */}
            <Card icon={<SafetyCertificateOutlined />} title="Warranty Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item label={fieldLabel("Warranty Start Date")} name="warrantyStartDate" className="mb-0">
                  <DatePicker size="large" format={dateFormat} className="w-full rounded-lg border-[#E0E0E0]" placeholder="MM/DD/YYYY" />
                </Form.Item>
                <Form.Item label={fieldLabel("Warranty End Date")} name="warrantyEndDate" className="mb-0">
                  <DatePicker size="large" format={dateFormat} className="w-full rounded-lg border-[#E0E0E0]" placeholder="MM/DD/YYYY" />
                </Form.Item>
                <Form.Item label={fieldLabel("Warranty Provider")} name="warrantyProvider" className="mb-0">
                  <Input size="large" placeholder="e.g. Manufacturer, extended plan" className={inputClass} />
                </Form.Item>
                <Form.Item label={fieldLabel("Warranty Terms")} name="warrantyTerms" className="mb-0">
                  <Input size="large" placeholder="e.g. Parts & labor, 2 years" className={inputClass} />
                </Form.Item>
              </div>
            </Card>

            {/* Card 4: Notes */}
            <Card icon={<FileTextOutlined />} title="Notes">
              <Form.Item label={fieldLabel("Additional Notes")} name="notes" className="mb-0">
                <Input.TextArea rows={3} placeholder="Any additional details…"
                  className="w-full rounded-lg border border-[#E0E0E0] text-[#1A1A1A] focus:border-[#3B7D3C] resize-none" />
              </Form.Item>
            </Card>

            {/* Card 5: Photos */}
            <Card icon={<InboxOutlined />} title="Photos & Documents">
              {existingImages.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-[#5A5A5A] mb-2">Existing Photos</p>
                  <Image.PreviewGroup>
                    <div className="flex gap-2 flex-wrap">
                      {existingImages.map((url, i) => (
                        <div key={i} className="relative group">
                          <Image
                            src={url}
                            width={80}
                            height={80}
                            style={{ objectFit: "cover", borderRadius: 8 }}
                          />
                          <button
                            type="button"
                            onClick={() => setExistingImages(prev => prev.filter((_, idx) => idx !== i))}
                            className="absolute -top-2 -right-2 z-10 text-red-500 bg-white rounded-full shadow"
                          >
                            <CloseCircleFilled style={{ fontSize: 18 }} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </Image.PreviewGroup>
                </div>
              )}
              <Dragger fileList={fileList} onChange={({ fileList: l }) => setFileList(l)}
                beforeUpload={() => false} multiple accept="image/*,application/pdf"
                className="rounded-xl border-2 border-dashed border-[#E0E0E0] hover:border-[#3B7D3C] transition-colors">
                <div className="py-6">
                  <p className="mb-2"><InboxOutlined style={{ fontSize: 32, color: "#3B7D3C" }} /></p>
                  <p className="text-[#1A1A1A] font-medium text-sm">Click or drag to add more photos</p>
                  <p className="text-[#5A5A5A] text-xs mt-1">Photos (JPG, PNG) and documents (PDF)</p>
                </div>
              </Dragger>
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
              <button type="button" onClick={() => navigate(`/components/${type}`)}
                className="flex-1 py-3 rounded-xl border border-[#E0E0E0] text-[#5A5A5A] font-medium text-sm hover:border-[#3B7D3C] hover:text-[#3B7D3C] transition-all duration-200">
                Cancel
              </button>
              <button type="submit" disabled={loading}
                className={`flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                  loading ? "bg-[#3B7D3C]/70 text-white cursor-not-allowed"
                  : "bg-[#3B7D3C] text-white hover:bg-[#2d6130] shadow-sm hover:shadow-md"
                }`}>
                {loading ? <><Spin size="small" /><span>Saving…</span></> : `Update ${cfg.label}`}
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default ComponentUpdate;
