import React, { useEffect } from "react";
import { Form, Input, message } from "antd";
import { MinusCircleOutlined, PlusOutlined, UnorderedListOutlined, FileTextOutlined } from "@ant-design/icons";
import { useAddCheckListMutation } from "../redux/api/routesApi";
import { useNavigate } from "react-router-dom";

const fieldLabel = (text) => (
  <span className="text-sm font-medium text-[#5A5A5A]">{text}</span>
);

const inputClass =
  "w-full rounded-lg border border-[#E0E0E0] bg-white px-3 py-2 text-[#1A1A1A] placeholder-gray-400 focus:border-[#3B7D3C] focus:ring-1 focus:ring-[#3B7D3C] transition-all duration-200";

const AddChecklist = () => {
  const [addCheckList, { isLoading }] = useAddCheckListMutation();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    form.setFieldsValue({ items: [""] });
  }, [form]);

  const handleSubmit = async (values) => {
    try {
      const data = {
        title: values.title,
        items: values.items.map((item) => ({ name: item })),
      };
      const res = await addCheckList(data);
      if (res?.data?.success) {
        message.success(res?.data?.message || "Checklist created!");
        form.resetFields();
        navigate("/checklist");
      } else {
        message.error(res?.data?.message || "Failed to create checklist");
      }
    } catch {
      message.error("Failed to create checklist");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="max-w-site mx-auto px-4 lg:px-6 2xl:px-8 py-10">

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-8 bg-[#D4872D] rounded-full" />
            <h1 className="text-3xl font-bold text-[#1A1A1A]">Add Checklist</h1>
          </div>
          <p className="text-[#5A5A5A] text-sm ml-4 pl-3">
            Create a custom checklist for your RV.
          </p>
        </div>

        <div className="max-w-2xl">
          <Form form={form} onFinish={handleSubmit} layout="vertical">

            {/* Title Card */}
            <div className="bg-white border border-[#E8F0E8] rounded-2xl p-6 mb-5 shadow-sm">
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-[#E8F0E8]">
                <div className="w-8 h-8 rounded-lg bg-[#E8F0E8] flex items-center justify-center">
                  <FileTextOutlined className="text-[#3B7D3C] text-sm" />
                </div>
                <h2 className="text-base font-semibold text-[#1A1A1A]">Checklist Name</h2>
              </div>

              <Form.Item
                label={fieldLabel("Title")}
                name="title"
                className="mb-0"
                rules={[{ required: true, message: "Please enter a title" }]}
              >
                <Input
                  size="large"
                  className={inputClass}
                  placeholder="e.g. Pre-Departure, Weekend Setup…"
                />
              </Form.Item>
            </div>

            {/* Items Card */}
            <div className="bg-white border border-[#E8F0E8] rounded-2xl p-6 mb-5 shadow-sm">
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-[#E8F0E8]">
                <div className="w-8 h-8 rounded-lg bg-[#E8F0E8] flex items-center justify-center">
                  <UnorderedListOutlined className="text-[#3B7D3C] text-sm" />
                </div>
                <h2 className="text-base font-semibold text-[#1A1A1A]">Items</h2>
              </div>

              <Form.List name="items">
                {(fields, { add, remove }) => (
                  <div className="space-y-2">
                    {fields.map((field, index) => (
                      <div key={field.key} className="flex items-center gap-2">
                        <Form.Item
                          className="flex-1 mb-0"
                          {...field}
                          name={[field.name]}
                          rules={[{ required: true, message: "Item name required" }]}
                        >
                          <Input
                            size="large"
                            className={inputClass}
                            placeholder={`Item ${index + 1}`}
                          />
                        </Form.Item>
                        {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(field.name)}
                            className="text-[#9E9E9E] hover:text-red-500 transition flex-shrink-0 p-1"
                          >
                            <MinusCircleOutlined style={{ fontSize: 18 }} />
                          </button>
                        )}
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => add()}
                      className="mt-2 flex items-center gap-1.5 text-sm text-[#3B7D3C] font-medium hover:text-[#2d6130] transition"
                    >
                      <PlusOutlined style={{ fontSize: 13 }} /> Add another item
                    </button>
                  </div>
                )}
              </Form.List>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate("/checklist")}
                className="flex-1 py-3 rounded-xl border border-[#E0E0E0] text-[#5A5A5A] font-medium text-sm hover:border-[#3B7D3C] hover:text-[#3B7D3C] transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  isLoading
                    ? "bg-[#3B7D3C]/70 text-white cursor-not-allowed"
                    : "bg-[#3B7D3C] text-white hover:bg-[#2d6130] shadow-sm hover:shadow-md"
                }`}
              >
                {isLoading ? "Saving…" : "Save Checklist"}
              </button>
            </div>

          </Form>
        </div>
      </div>
    </div>
  );
};

export default AddChecklist;
