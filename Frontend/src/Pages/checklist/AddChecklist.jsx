import React, { useEffect } from "react";
import { Button, Form, Input, message } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useAddCheckListMutation } from "../redux/api/routesApi";
import { useNavigate } from "react-router-dom";

const AddChecklist = () => {
  const [addCheckList, { isLoading }] = useAddCheckListMutation();
  const [form] = Form.useForm();
const navigate = useNavigate();
  // 🧠 Default empty field
  useEffect(() => {
    form.setFieldsValue({ ingredients: [""] });
  }, [form]);

  // ✅ Handle Submit
  const handleSubmit = async (values) => {
    try {
      const data = {
        title: values.title,
        items: values.ingredients.map((item) => ({ name: item })),
      };

      console.log("📦 Final Payload:", data);

      const res = await addCheckList(data);
      console.log("✅ Response:", res);


      if (res?.data?.success) {
        message.success(res?.data?.message );
        form.resetFields();
        navigate('/checklist')
      }
    } catch (error) {
      console.error("❌ Error:", error);
    }
  };

  return (
    <div className="container m-auto">
      <div className="gap-4 lg:mt-8 mt-6 px-3">
        <div className="pb-7 lg:pb-0">
          <h1 className="text-3xl text-[#F9B038] font-semibold mb-6">
            Add Checklist
          </h1>
        </div>

        <div className="max-w-4xl m-auto text-[#F9B038]">
          <Form form={form} onFinish={handleSubmit} layout="vertical">
            {/* ✅ Title Input */}
            <Form.Item
              label={<span style={{ color: "#F9B038" }}>Title</span>}
              name="title"
              rules={[{ required: true, message: "Please input title!" }]}
            >
              <Input
                className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                placeholder="Title"
              />
            </Form.Item>

            {/* ✅ Dynamic Item List */}
            <Form.List name="ingredients">
              {(fields, { add, remove }) => (
                <>
                  <div className="pb-2 text-[#F9B038]">Items</div>
                  <div className="grid grid-cols-12">
                    <div className="col-span-11">
                      {fields.map((field) => (
                        <div key={field.key} className="grid grid-cols-12 mb-2">
                          <Form.Item
                            className="col-span-11"
                            {...field}
                            name={[field.name]}
                            rules={[
                              { required: true, message: "Item name required" },
                            ]}
                          >
                            <Input
                              className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                              placeholder="Add Item"
                            />
                          </Form.Item>
                          {fields.length > 1 && (
                            <MinusCircleOutlined
                              onClick={() => remove(field.name)}
                              className="ml-5 text-red-500"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    <Form.Item>
                      <Button
                        style={{
                          backgroundColor: "transparent",
                          border: "1px solid #F9B038",
                          color: "#F9B038",
                          width: "32px",
                          borderRadius: "50%",
                        }}
                        onClick={() => add()}
                        icon={<PlusOutlined />}
                      ></Button>
                    </Form.Item>
                  </div>
                </>
              )}
            </Form.List>

            {/* ✅ Submit */}
            <Form.Item className="pt-7">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#F9B038] py-2 text-white font-semibold"
              >
                {isLoading ? "Saving..." : "Save"}
              </button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default AddChecklist;
