import { Form, Input, DatePicker, message, Spin } from "antd";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ClockCircleOutlined, FileTextOutlined } from "@ant-design/icons";
import {
  useGetSingleGeneratorLogQuery,
  useUpdateGeneratorLogMutation,
} from "../redux/api/routesApi";
import dayjs from "dayjs";

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

const UpdateGeneratorLog = () => {
  const { id } = useParams();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { data, isLoading } = useGetSingleGeneratorLogQuery({ id });
  const [updateGeneratorLog] = useUpdateGeneratorLogMutation();

  useEffect(() => {
    if (data?.data) {
      const log = data.data;
      form.setFieldsValue({
        hours: log.hours?.toString() || "",
        notes: log.notes || "",
        date: log.date ? dayjs(log.date) : null,
      });
    }
  }, [data, form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = {
        hours: Number(values.hours),
        notes: values.notes || "",
        date: values.date ? dayjs(values.date).toISOString() : undefined,
      };

      const res = await updateGeneratorLog({ id, data: payload }).unwrap();
      message.success(res?.message || "Updated successfully");
      navigate("/generatorLog");
    } catch (err) {
      message.error(err?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="max-w-site mx-auto px-4 lg:px-6 2xl:px-8 py-10">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-8 bg-[#D4872D] rounded-full" />
            <h1 className="text-3xl font-bold text-[#1A1A1A]">Update Generator Log</h1>
          </div>
          <p className="text-[#5A5A5A] text-sm ml-4 pl-3">
            Editing this entry will recalculate your total generator hours automatically.
          </p>
        </div>

        <div className="max-w-2xl">
          <Form form={form} onFinish={handleSubmit} layout="vertical">

            <Card icon={<ClockCircleOutlined />} title="Hour Entry">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item label={fieldLabel("Date")} name="date" className="mb-0">
                  <DatePicker
                    size="large"
                    format={dateFormat}
                    className="w-full rounded-lg border-[#E0E0E0]"
                    placeholder="MM/DD/YYYY"
                  />
                </Form.Item>
                <Form.Item
                  label={fieldLabel("Hours Run")}
                  name="hours"
                  className="mb-0"
                  rules={[
                    { required: true, message: "Hours is required" },
                    { pattern: /^\d+(\.\d+)?$/, message: "Enter a valid number" },
                  ]}
                >
                  <Input
                    size="large"
                    className={inputClass}
                    placeholder="e.g. 4.5"
                    type="number"
                    min="0.1"
                    step="0.1"
                    suffix={<span className="text-gray-400 text-sm">hrs</span>}
                  />
                </Form.Item>
              </div>
            </Card>

            <Card icon={<FileTextOutlined />} title="Notes">
              <Form.Item label={fieldLabel("Notes")} name="notes" className="mb-0">
                <Input.TextArea
                  rows={3}
                  placeholder="Reason for running, location, notes…"
                  className="w-full rounded-lg border border-[#E0E0E0] text-[#1A1A1A] focus:border-[#3B7D3C] resize-none"
                />
              </Form.Item>
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate("/generatorLog")}
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
                {loading ? <><Spin size="small" /><span>Saving…</span></> : "Update Generator Log"}
              </button>
            </div>

          </Form>
        </div>
      </div>
    </div>
  );
};

export default UpdateGeneratorLog;
