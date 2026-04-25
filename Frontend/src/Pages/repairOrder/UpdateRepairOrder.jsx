import { Form, Input, Select, Upload, message, Spin } from "antd";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  InboxOutlined,
  PlusOutlined,
  DeleteOutlined,
  ToolOutlined,
  ShopOutlined,
  FileTextOutlined,
  DollarOutlined,
  LinkOutlined,
  HistoryOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import {
  useGetSingleRepairOrderQuery,
  useUpdateRepairOrderMutation,
} from "../redux/api/routesApi";

const COMPONENT_OPTIONS = [
  "Engine", "Transmission", "Brakes", "Axles", "Suspension", "Steering",
  "Dash AC", "Tires", "Chassis Batteries", "Roof AC", "Furnace",
  "Hydronic Heat", "Water Heater", "Plumbing", "Electrical (12V)",
  "Electrical (120V)", "Inverter", "Converter", "Solar", "Slides",
  "Leveling", "LP System", "Safety Systems", "Appliances", "Roof",
  "Awnings", "Body Panels", "Windows", "Doors", "Generator", "Other",
];

const STATUS = {
  pending:     { label: "Pending",     dot: "bg-amber-400", badge: "bg-amber-100 text-amber-700 border border-amber-200",  icon: <ClockCircleOutlined /> },
  "in-progress":{ label: "In Progress", dot: "bg-blue-500",  badge: "bg-blue-100 text-blue-700 border border-blue-200",    icon: <ExclamationCircleOutlined /> },
  completed:   { label: "Completed",   dot: "bg-green-500", badge: "bg-green-100 text-green-700 border border-green-200", icon: <CheckCircleOutlined /> },
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

const emptyLineItem = () => ({ component: "", description: "", cost: "", quantity: "1" });

const UpdateRepairOrder = () => {
  const { id } = useParams();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [lineItems, setLineItems] = useState([emptyLineItem()]);

  const { data, isLoading } = useGetSingleRepairOrderQuery({ id });
  const [updateRepairOrder] = useUpdateRepairOrderMutation();

  useEffect(() => {
    if (data?.data) {
      const order = data.data;
      form.setFieldsValue({
        title:    order.title    || "",
        vendor:   order.vendor   || "",
        status:   order.status   || "pending",
        notes:    order.notes    || "",
        recallId: order.recallId || "",
      });
      if (Array.isArray(order.lineItems) && order.lineItems.length > 0) {
        setLineItems(
          order.lineItems.map((item) => ({
            id:          item.id || "",
            component:   item.component   || "",
            description: item.description || "",
            cost:        item.cost?.toString()     || "",
            quantity:    item.quantity?.toString() || "1",
          }))
        );
      }
    }
  }, [data, form]);

  const totalCost = lineItems.reduce((sum, item) => {
    return sum + parseFloat(item.cost || 0) * parseInt(item.quantity || 1, 10);
  }, 0);

  const updateLineItem = (index, field, value) => {
    setLineItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addLineItem = () => setLineItems((prev) => [...prev, emptyLineItem()]);
  const removeLineItem = (index) => {
    if (lineItems.length === 1) return;
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (values) => {
    const validItems = lineItems.filter((item) => item.component);
    if (validItems.length === 0) {
      message.error("At least one line item with a component is required.");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title",     values.title     || "");
      formData.append("vendor",    values.vendor    || "");
      formData.append("status",    values.status    || "pending");
      formData.append("statusNote",values.statusNote|| "");
      formData.append("notes",     values.notes     || "");
      formData.append("lineItems", JSON.stringify(validItems));
      if (values.recallId) formData.append("recallId", values.recallId);

      fileList.forEach((file) => {
        if (file.originFileObj) formData.append("images", file.originFileObj);
      });

      const res = await updateRepairOrder({ id, formData }).unwrap();
      message.success(res?.message || "Repair order updated successfully");
      navigate("/repairOrders");
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

  const order = data?.data;
  const statusHistory = order?.statusHistory || [];
  const existingImages = order?.images || [];

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="max-w-site mx-auto px-4 lg:px-6 2xl:px-8 py-10">

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-8 bg-[#D4872D] rounded-full" />
            <h1 className="text-3xl font-bold text-[#1A1A1A]">Edit Repair Order</h1>
          </div>
          <p className="text-[#5A5A5A] text-sm ml-4 pl-3">
            {order?.title ? `Editing: ${order.title}` : "Update repair order details"}
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Form form={form} onFinish={handleSubmit} layout="vertical">

            {/* ── Order Info ── */}
            <Card icon={<ShopOutlined />} title="Order Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Form.Item label={fieldLabel("Order Title")} name="title" className="mb-0">
                  <Input size="large" className={inputClass} placeholder="e.g. Slide motor repair" />
                </Form.Item>
                <Form.Item label={fieldLabel("Vendor / Shop")} name="vendor" className="mb-0">
                  <Input size="large" className={inputClass} placeholder="e.g. RV Repair Pro" />
                </Form.Item>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item label={fieldLabel("Status")} name="status" className="mb-0">
                  <Select size="large" className="w-full">
                    <Select.Option value="pending">Pending</Select.Option>
                    <Select.Option value="in-progress">In Progress</Select.Option>
                    <Select.Option value="completed">Completed</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  label={fieldLabel("Status Change Note")}
                  name="statusNote"
                  className="mb-0"
                  help="Saved to history only when status changes"
                >
                  <Input size="large" className={inputClass} placeholder="e.g. Parts arrived, work started" />
                </Form.Item>
              </div>
            </Card>

            {/* ── Line Items ── */}
            <Card icon={<DollarOutlined />} title="Line Items">
              <div className="space-y-3 mb-4">
                {lineItems.map((item, index) => (
                  <div key={index} className="bg-[#F5F5F0] border border-[#E8F0E8] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-[#5A5A5A] uppercase tracking-wide">
                        Item {index + 1}
                      </span>
                      {lineItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLineItem(index)}
                          className="text-red-400 hover:text-red-600 text-xs flex items-center gap-1 transition-colors"
                        >
                          <DeleteOutlined /> Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <p className="text-xs text-[#5A5A5A] mb-1 font-medium">Component <span className="text-red-500">*</span></p>
                        <Select
                          size="middle"
                          className="w-full"
                          value={item.component || undefined}
                          onChange={(v) => updateLineItem(index, "component", v)}
                          placeholder="Select"
                        >
                          {COMPONENT_OPTIONS.map((c) => (
                            <Select.Option key={c} value={c}>{c}</Select.Option>
                          ))}
                        </Select>
                      </div>
                      <div>
                        <p className="text-xs text-[#5A5A5A] mb-1 font-medium">Description</p>
                        <Input
                          size="middle"
                          className={inputClass}
                          placeholder="What was done?"
                          value={item.description}
                          onChange={(e) => updateLineItem(index, "description", e.target.value)}
                        />
                      </div>
                      <div>
                        <p className="text-xs text-[#5A5A5A] mb-1 font-medium">Cost ($)</p>
                        <Input
                          size="middle"
                          className={inputClass}
                          placeholder="0.00"
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.cost}
                          onChange={(e) => updateLineItem(index, "cost", e.target.value)}
                          prefix={<span className="text-gray-400 text-sm">$</span>}
                        />
                      </div>
                      <div>
                        <p className="text-xs text-[#5A5A5A] mb-1 font-medium">Qty</p>
                        <Input
                          size="middle"
                          className={inputClass}
                          placeholder="1"
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(index, "quantity", e.target.value)}
                        />
                      </div>
                    </div>
                    {item.component && item.cost && (
                      <div className="text-right mt-2">
                        <span className="text-xs text-[#3B7D3C] font-semibold">
                          Subtotal: ${(parseFloat(item.cost || 0) * parseInt(item.quantity || 1, 10)).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={addLineItem}
                  className="flex items-center gap-1.5 text-sm text-[#3B7D3C] border border-[#3B7D3C]/40 px-4 py-2 rounded-lg hover:bg-[#E8F0E8] transition-all font-medium"
                >
                  <PlusOutlined /> Add Line Item
                </button>
                <div className="bg-[#E8F0E8] px-4 py-2 rounded-lg">
                  <span className="text-sm text-[#5A5A5A]">Total: </span>
                  <span className="text-base font-bold text-[#3B7D3C]">${totalCost.toFixed(2)}</span>
                </div>
              </div>
            </Card>

            {/* ── Notes ── */}
            <Card icon={<FileTextOutlined />} title="Notes">
              <Form.Item label={fieldLabel("Additional Notes")} name="notes" className="mb-0">
                <Input.TextArea
                  rows={3}
                  placeholder="Warranty info, parts used, additional context…"
                  className="w-full rounded-lg border border-[#E0E0E0] text-[#1A1A1A] placeholder-gray-400 focus:border-[#3B7D3C] resize-none"
                />
              </Form.Item>
            </Card>

            {/* ── Recall Link ── */}
            <Card icon={<LinkOutlined />} title="Recall Link (Optional)">
              <Form.Item
                label={fieldLabel("Recall ID")}
                name="recallId"
                className="mb-0"
                help="Link this repair to an open recall by entering its ID"
              >
                <Input size="large" className={inputClass} placeholder="e.g. NHTSA recall ID or internal recall reference" />
              </Form.Item>
            </Card>

            {/* ── Existing Photos ── */}
            {existingImages.length > 0 && (
              <Card icon={<InboxOutlined />} title="Existing Photos">
                <div className="flex flex-wrap gap-3">
                  {existingImages.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noreferrer">
                      <img
                        src={url}
                        alt={`photo-${i}`}
                        className="w-20 h-20 object-cover rounded-xl border border-[#E8F0E8] hover:opacity-80 transition-opacity"
                      />
                    </a>
                  ))}
                </div>
              </Card>
            )}

            {/* ── Add More Photos ── */}
            <Card icon={<InboxOutlined />} title="Add More Photos & Documents">
              <Upload.Dragger
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
                  <p className="text-[#5A5A5A] text-xs mt-1">New files will be added to existing photos</p>
                </div>
              </Upload.Dragger>
            </Card>

            {/* ── Status History ── */}
            {statusHistory.length > 0 && (
              <Card icon={<HistoryOutlined />} title="Status History">
                <div className="space-y-3">
                  {[...statusHistory].reverse().map((entry, i) => {
                    const cfg = STATUS[entry.status] || STATUS.pending;
                    return (
                      <div key={i} className="flex items-start gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${cfg.dot}`} />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${cfg.badge}`}>
                              {cfg.icon} {cfg.label}
                            </span>
                            {entry.note && (
                              <span className="text-xs text-[#5A5A5A]">{entry.note}</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(entry.date).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* ── Actions ── */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate("/repairOrders")}
                className="flex-1 py-3 rounded-xl border border-[#E0E0E0] text-[#5A5A5A] font-medium text-sm hover:border-[#3B7D3C] hover:text-[#3B7D3C] transition-all duration-200"
              >
                Cancel
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
                {loading ? <><Spin size="small" /><span>Saving…</span></> : "Save Changes"}
              </button>
            </div>

          </Form>
        </div>
      </div>
    </div>
  );
};

export default UpdateRepairOrder;
