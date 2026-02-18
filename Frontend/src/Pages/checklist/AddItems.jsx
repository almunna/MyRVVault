import React, { useEffect } from "react";
import { Button, Form, Input, message } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useUpdateCheckListMutation } from "../redux/api/routesApi";
import { useNavigate, useParams } from "react-router-dom";

const AddItems = () => {
  const [checkUpdateStatus, { isLoading }] = useUpdateCheckListMutation();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams(); // ✅ get checklist id from URL

  // 🧠 Default field value
  useEffect(() => {
    form.setFieldsValue({ ingredients: [""] });
  }, [form]);

  // ✅ Handle Submit
  const handleSubmit = async (values) => {
    try {
      // ✅ Format payload as per API requirement
      const payload = {
        itemOperations: [
          {
            action: "add",
            items: values.ingredients.map((item) => ({ name: item })),
          },
        ],
      };

      console.log("📦 Final Payload:", payload);

      // ✅ Send update request with ID
      const res = await checkUpdateStatus({ id, data: payload });

      console.log("✅ Response:", res);

      if (res?.data?.success) {
        message.success("✅ Items added successfully!");
        form.resetFields();
        navigate(`/checklistDetails/${id}`); // ✅ Redirect to checklist details after success
      } else {
        message.error("❌ Something went wrong!");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      message.error("Failed to add items!");
    }
  };

  return (
    <div className="container m-auto">
      <div className="gap-4 lg:mt-8 mt-6 px-3">
        <div className="pb-7 lg:pb-0">
          <h1 className="text-3xl text-[#F9B038] font-semibold mb-6">
            Add Items
          </h1>
        </div>

        <div className="max-w-4xl m-auto text-[#F9B038]">
          <Form form={form} onFinish={handleSubmit} layout="vertical">
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

            {/* ✅ Submit Button */}
            <Form.Item className="pt-7">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#F9B038] py-2 text-white font-semibold rounded"
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

export default AddItems;
