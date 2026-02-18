import {
  Button,
  ConfigProvider,
  DatePicker,
  Form,
  Input,
  message,
  Select,
  Spin,
} from "antd";
import Dragger from "antd/es/upload/Dragger";
import React, { useEffect, useState } from "react";
import {
  InboxOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Link, useNavigate } from "react-router-dom";
import { useAddChassisMutation } from "../redux/api/routesApi";
import { useGetProfileQuery } from "../redux/api/userApi";
dayjs.extend(customParseFormat);
const dateFormat = "YYYY-MM-DD";
const Information = () => {
  const [addChassisInformation] = useAddChassisMutation();
  const { data: profileData } = useGetProfileQuery();
   const [isFormFilled, setIsFormFilled] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    handleFormChange(); // initial check
  }, []);
  // ✅ Check if any field has value
  const handleFormChange = () => {
    const values = form.getFieldsValue();
   const hasValue =
      Object.values(values).some((value) => value !== undefined && value !== null && value !== "");
    setIsFormFilled(hasValue);
  };
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const handleSubmit = async (values) => {
    console.log(values);
  const rvId = profileData?.user?.selectedRvId?._id;

  if (!rvId) {
    message.error("Please select your RV from the home page before submitting.");
    return; 
  }
    const data = {
      mfg: values.Manufacturer,
      modelNo: values.Model,
      name: values.Name,
      rvId: rvId,
      serialId: values.Serial,
      fuelType: values.FuelType,

      engineModel: values.engineModel || "",
      hp: Number(values.hp) || 0,
      belt:
        values.belts?.map((item) => ({
          name: item.beltName,
          partNo: Number(item.partNumber),
        })) || [],
      oilFilter:
        values.Oil?.map((item) => ({
          name: item.beltName,
          partNo: Number(item.partNumber),
        })) || [],
      fuelFilter:
        values.Fuel?.map((item) => ({
          name: item.beltName,
          partNo: Number(item.partNumber),
        })) || [],
    };
setLoading(true);
    try {
      const res = await addChassisInformation(data).unwrap();
      message.success(res?.message);
      setLoading(false);
      navigate("/insuranceCompanyInfoForm");
    } catch (err) {
      setLoading(false);
      message.error(err?.data?.message);
    }
  };
  useEffect(() => {
    form.setFieldsValue({ cooking: [""], ingredients: [""], nutrition: [""] });
  }, [form]);
  return (
    <div className="container m-auto">
      <div className=" lg:mt-11 mt-6 px-3">
        <div className=" pb-7 lg:pb-0">
          <h1 className="text-3xl font-semibold text-[#F9B038]">
            Add Chassis information
          </h1>
        </div>
        <div className="max-w-4xl m-auto mt-11">
          <Form form={form} onFinish={handleSubmit} onValuesChange={handleFormChange} layout="vertical">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label={<span style={{ color: "#F9B038" }}>Manufacturer</span>}
                name="Manufacturer"
                rules={[{ required: true, message: "Please input Mfg!" }]}
              >
                <Input
                  className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                  placeholder="Mfg"
                />
              </Form.Item>
              <Form.Item
                label={<span style={{ color: "#F9B038" }}>Model</span>}
                name="Model"
                // rules={[{ required: true, message: "Please input Model!" }]}
              >
                <Input
                  className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                  placeholder="Model"
                />
              </Form.Item>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label={<span style={{ color: "#F9B038" }}>Name</span>}
                name="Name"
                // rules={[{ required: true, message: "Please input Name!" }]}
              >
                <Input
                  className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                  placeholder="Name"
                />
              </Form.Item>
              <Form.Item
                label={<span style={{ color: "#F9B038" }}>Serial ID</span>}
                name="Serial"
                // rules={[
                //   {
                //     required: true,
                //     message: "Please input your Fuel Add Oil Filter!",
                //   },
                // ]}
              >
                <Input
                  className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                  placeholder="Serial ID"
                />
              </Form.Item>
            </div>
             <Form.Item
                label={<span style={{ color: "#F9B038" }}>Fuel Type</span>}
                name="FuelType"
              >
                <Select
                  className="custom-select"
                  style={{ height: "40px" }}
                  placeholder="Select Fuel Type"
                >
                  <Select.Option value="">Select</Select.Option>
                  <Select.Option value="Diesel">Diesel</Select.Option>

                  <Select.Option value="Gas">Gas</Select.Option>

                  <Select.Option value="N/A">N/A</Select.Option>

              
                </Select>
              </Form.Item>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label={<span style={{ color: "#F9B038" }}>Engine Model</span>}
                name="engineModel"
                // rules={[
                //   { required: true, message: "Please input Engine Model" },
                // ]}
              >
                <Input
                  className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                  placeholder="Engine Model"
                />
              </Form.Item>
              <Form.Item
                label={<span style={{ color: "#F9B038" }}>Horsepower</span>}
                name="hp"
                // rules={[{ required: true, message: "Please input Horsepower" }]}
              >
                <Input
                  className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                  placeholder="Horsepower"
                />
              </Form.Item>
            </div>
            <h1 className="text-center text-[#F9B038] underline mb-3">Belt</h1>

            <Form.List name="belts" initialValue={[{}]}>
              {(fields, { add, remove }) => (
                <>
                  <div className="grid grid-cols-12">
                    <div className="col-span-11">
                      {fields.map(({ key, name, ...restField }) => (
                        <div
                          key={key}
                          className="grid grid-cols-12 gap-4 mb-3 items-center"
                        >
                          {/* Belt Name with Label */}
                          <Form.Item
                            label={
                              <span style={{ color: "#F9B038" }}>
                                Belt Name
                              </span>
                            }
                            {...restField}
                            name={[name, "beltName"]}
                            className="col-span-6"
                            // rules={[{ required: true, message: "Required" }]}
                          >
                            <Input
                              placeholder="Enter Belt Name"
                              className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                            />
                          </Form.Item>

                          {/* Part Number with Label */}
                          <Form.Item
                            label={
                              <span style={{ color: "#F9B038" }}>
                                Part Number
                              </span>
                            }
                            {...restField}
                            name={[name, "partNumber"]}
                            className="col-span-5"
                            // rules={[{ required: true, message: "Required" }]}
                          >
                            <Input
                            type="number"
                              placeholder="Enter Part Number"
                              className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                            />
                          </Form.Item>

                          {/* Remove Button */}
                          {fields.length > 1 && (
                            <MinusCircleOutlined
                              onClick={() => remove(name)}
                              className="text-red-500 col-span-1 cursor-pointer"
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Add Belt Button */}
                    <Form.Item>
                      <div>
                        <Button
                          style={{
                            backgroundColor: "#00000000",
                            border: "1px solid #F9B038",
                            color: "#F9B038",
                            width: "32px",
                            borderRadius: "50%",
                          }}
                          type="dashed"
                          onClick={() => add()}
                          icon={<PlusOutlined />}
                          className="border-[#F9B038] text-[#F9B038] mt-7 hover:border-[#d89c2f]"
                        ></Button>
                      </div>
                    </Form.Item>
                  </div>
                </>
              )}
            </Form.List>

            <h1 className="text-center text-[#F9B038] underline mb-3">
              Oil Filter
            </h1>

            <Form.List name="Oil" initialValue={[{}]}>
              {(fields, { add, remove }) => (
                <>
                  <div className="grid grid-cols-12">
                    <div className="col-span-11">
                      {fields.map(({ key, name, ...restField }) => (
                        <div
                          key={key}
                          className="grid grid-cols-12 gap-4 mb-3 items-center"
                        >
                          {/* Belt Name with Label */}
                          <Form.Item
                            label={
                              <span style={{ color: "#F9B038" }}>Name</span>
                            }
                            {...restField}
                            name={[name, "beltName"]}
                            className="col-span-6"
                            // rules={[{ required: true, message: "Required" }]}
                          >
                            <Input
                              placeholder="Enter Name"
                              className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                            />
                          </Form.Item>

                          {/* Part Number with Label */}
                          <Form.Item
                            label={
                              <span style={{ color: "#F9B038" }}>
                                Part Number
                              </span>
                            }
                            {...restField}
                            name={[name, "partNumber"]}
                            className="col-span-5"
                            // rules={[{ required: true, message: "Required" }]}
                          >
                            <Input
                            type="number"
                              placeholder="Enter Part Number"
                              className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                            />
                          </Form.Item>

                          {/* Remove Button */}
                          {fields.length > 1 && (
                            <MinusCircleOutlined
                              onClick={() => remove(name)}
                              className="text-red-500 col-span-1 cursor-pointer"
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Add Belt Button */}
                    <Form.Item>
                      <div>
                        <Button
                          style={{
                            backgroundColor: "#00000000",
                            border: "1px solid #F9B038",
                            color: "#F9B038",
                            width: "32px",
                            borderRadius: "50%",
                          }}
                          type="dashed"
                          onClick={() => add()}
                          icon={<PlusOutlined />}
                          className="border-[#F9B038] text-[#F9B038] mt-7 hover:border-[#d89c2f]"
                        ></Button>
                      </div>
                    </Form.Item>
                  </div>
                </>
              )}
            </Form.List>

            <h1 className="text-center text-[#F9B038] underline mb-3">
              Fuel Filter
            </h1>

            <Form.List name="Fuel" initialValue={[{}]}>
              {(fields, { add, remove }) => (
                <>
                  <div className="grid grid-cols-12">
                    <div className="col-span-11">
                      {fields.map(({ key, name, ...restField }) => (
                        <div
                          key={key}
                          className="grid grid-cols-12 gap-4 mb-3 items-center"
                        >
                          {/* Belt Name with Label */}
                          <Form.Item
                            label={
                              <span style={{ color: "#F9B038" }}>Name</span>
                            }
                            {...restField}
                            name={[name, "beltName"]}
                            className="col-span-6"
                            // rules={[{ required: true, message: "Required" }]}
                          >
                            <Input
                              placeholder="Enter Name"
                              className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                            />
                          </Form.Item>

                          {/* Part Number with Label */}
                          <Form.Item
                            label={
                              <span style={{ color: "#F9B038" }}>
                                Part Number
                              </span>
                            }
                            {...restField}
                            name={[name, "partNumber"]}
                            className="col-span-5"
                            // rules={[{ required: true, message: "Required" }]}
                          >
                            <Input
                            type="number"
                              placeholder="Enter Part Number"
                              className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                            />
                          </Form.Item>

                          {/* Remove Button */}
                          {fields.length > 1 && (
                            <MinusCircleOutlined
                              onClick={() => remove(name)}
                              className="text-red-500 col-span-1 cursor-pointer"
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Add Belt Button */}
                    <Form.Item>
                      <div>
                        <Button
                          style={{
                            backgroundColor: "#00000000",
                            border: "1px solid #F9B038",
                            color: "#F9B038",
                            width: "32px",
                            borderRadius: "50%",
                          }}
                          type="dashed"
                          onClick={() => add()}
                          icon={<PlusOutlined />}
                          className="border-[#F9B038] text-[#F9B038] mt-7 hover:border-[#d89c2f]"
                        ></Button>
                      </div>
                    </Form.Item>
                  </div>
                </>
              )}
            </Form.List>

            <Form.Item className=" pt-9">
                     <button
                type="submit"
                disabled={!isFormFilled || loading}
                className={`w-full py-2 rounded flex justify-center items-center gap-2 transition-all duration-300 ${
                  loading
                    ? "bg-[#b37a01] cursor-not-allowed text-white"
                    : isFormFilled
                    ? "bg-[#F9B038] text-black hover:bg-[#d6952f]"
                    : "bg-[#8a6f44] text-white cursor-not-allowed"
                }`}
              >
                {loading ? (
                  <>
                    <Spin size="small" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  "Submit"
                )}
              </button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Information;
