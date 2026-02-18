import { Button, ConfigProvider, DatePicker, Form, Input, message, Select, Spin, Upload } from "antd";
import Dragger from "antd/es/upload/Dragger";
import React, { useEffect, useState } from "react";
import { InboxOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useAddRepairMutation, useGetSingleRepairQuery, useUpdateRepairMutation } from "../redux/api/routesApi";
import { imageUrl } from "../redux/api/baseApi";
import { useParams } from "react-router-dom";
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
const UpdateRepairOrder = () => {
  const {id} = useParams();
    const {data:singleUpdate} = useGetSingleRepairQuery({id})
    console.log(singleUpdate)
const [fileList, setFileList] = useState([]);
  const[newRepair] = useUpdateRepairMutation()
    const [isFormFilled, setIsFormFilled] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    handleFormChange(); // initial check
  }, [fileList]);
  // ✅ Check if any field has value
  const handleFormChange = () => {
    const values = form.getFieldsValue();
    const hasValue =
      Object.values(values).some((value) => value && value !== "") ||
      fileList.length > 0;
    setIsFormFilled(hasValue);
  };
  const [form] = Form.useForm();
  const {data:profileData} = useGetProfileQuery();
  const handleSubmit = async (values) => {
   
     const formData = new FormData();
     const rvId = profileData?.user?.selectedRvId?._id;

    if (!rvId) {
      message.error(
        "Please select your RV from the home page before submitting."
      );
      return;
    }
    formData.append("rvId", rvId);
    formData.append("vendor", values.vendor || "");
    formData.append("component", values.component || "");
    formData.append("cityState", values.cityState || "");
    formData.append(
      "date",
      values.date
        ? dayjs(values.date).format(dateFormat)
        : ""
    );

    formData.append("cost", values.cost ? Number(values.cost) : "");
    formData.append("qty", values.cost ? Number(values.qty) : "");

    formData.append("notes", values.notes || "");

    // Multiple image upload
    fileList.forEach((file) => {
      if (file.originFileObj) {
        formData.append("images", file.originFileObj);
      }
    });
setLoading(true);
    try {
      const res = await newRepair({formData,id}).unwrap();
      message.success(res?.message || "Saved successfully");
      setLoading(false);
      form.resetFields();
      setFileList([]);
    } catch (err) {
      setLoading(false);
      message.error(err?.data?.message || "Something went wrong");
    }
  };
  
   const onChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };


  const formatWithCommas = (value) => {
    if (!value) return "";
    const onlyNumbers = value.toString().replace(/[^\d]/g, "");
    return onlyNumbers.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const parseNumber = (value) => {
    if (!value) return "";
    return value.replace(/,/g, "");
  };

     useEffect(() => {
      if (singleUpdate?.data) {
        const admin = singleUpdate?.data


  ;
    
        // ✅ Form values set
        form.setFieldsValue({
          qty: admin.qty || '',
          vendor: admin.vendor || '',
          component: admin.component || '',
          modelNumber: admin.modelNumber || '',
          phoneNumber: admin.phoneNumber || "",
          date: admin.date ? dayjs(admin.date) : null,
          effectiveDate: admin.effectiveDate ? dayjs(admin.effectiveDate) : null,
          renewalDate: admin.renewalDate ? dayjs(admin.renewalDate) : null,
          cost: admin.cost || "",
          notes: admin.notes || "",
          cityState: admin.cityState || "",
        });
    
        // ✅ Image list set for Upload component
        if (admin.images && admin.images.length > 0) {
          const formattedImages = admin.images.map((img, index) => ({
            uid: String(index),
            name: img.split("\\").pop(), 
            status: "done",
            url: `${img}`, 
          }));
          setFileList(formattedImages);
        }
      }
    }, [singleUpdate, form]);
  return (
    <div className="container m-auto">
      <div className=" lg:mt-11 mt-6 px-3">
        <div className=" pb-7 lg:pb-0">
          <h1 className="text-3xl font-semibold text-[#F9B038]">
            Update New Repair
          </h1>
        </div>
        <div className="max-w-4xl m-auto">
          <Form form={form} onFinish={handleSubmit} onValuesChange={handleFormChange} layout="vertical">
            <div className="">
             
              <Form.Item
                label={<span style={{ color: "#F9B038" }}>Date</span>}
                name="date"
             
              >
                <DatePicker
                  className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                  format={dateFormat}
                />
              </Form.Item>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label={<span style={{ color: "#F9B038" }}>Vendor</span>}
                name="vendor"
                // rules={[
                //   { required: true, message: "Please input vendor!" },
                // ]}
              >
                <Input
                  className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                  placeholder="Eddlie"
                />
              </Form.Item>
                

              <Form.Item
                label={<span style={{ color: "#F9B038" }}>City/State</span>}
                name="cityState"
                // rules={[
                //   { required: true, message: "Please input city/state!" },
                // ]}
              >
                <Input
                  className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                  placeholder="Type city/state"
                />
              </Form.Item>
            </div>
             <Form.Item
                                          label={<span style={{ color: "#F9B038" }}>Component</span>}
                                          name="component"
                                        >
                                          <Select
                                            className="custom-select"
                                            style={{ height: "40px" }}
                                            placeholder="Select Component"
                                          >
                                            <Option value="Chassis">Chassis</Option>
                                            <Option value="Celling Fans">Celling Fans</Option>
                                            <Option value="Air Condition">Air Condition</Option>
                                            <Option value="Dish washer">Dish washer</Option>
                                            <Option value="Dryer">Dryer</Option>
                                            <Option value="DVD">DVD</Option>
                                            <Option value="Exhaust Fans">Exhaust Fans</Option>
                                            <Option value="Gps">Gps</Option>
                                            <Option value="Heater">Heater</Option>
                                            <Option value="Insurance">Insurance</Option>
                                            <Option value="Internet Satelite">Internet Satelite</Option>
                                            <Option value="Maintenance Schedule">Maintenance Schedule</Option>
                                            <Option value="Membership">Membership</Option>
                                            <Option value="Outdoor Radio">Outdoor Radio</Option>
                                            <Option value="RV">RV</Option>
                                            <Option value="Surround Sound">Surround Sound</Option>
                                            <Option value="Tire">Tire</Option>
                                            <Option value="Toilet">Toilet</Option>
                                            <Option value="Water Heater">Water Heater</Option>
                                            <Option value="Wahser">Wahser</Option>
                                            <Option value="Vent Fans">Vent Fans</Option>
                                            <Option value="Tv">Tv</Option>
                                            <Option value="Water Pump">Water Pump</Option>
                                            <Option value="Wifi Router">Wifi Router</Option>
                                          </Select>
                                        </Form.Item>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label={<span style={{ color: "#F9B038" }}>Cost</span>}
                name="cost"
                normalize={(value) => parseNumber(value)}
                getValueProps={(value) => ({
                  value: formatWithCommas(value),
                })}
                rules={[
                  {
                    pattern: /^\d+$/,
                    message: "Please enter a valid number",
                  },
                ]}
              >
                <Input
                  className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                  placeholder="$"
                />
              </Form.Item>

             <Form.Item
                label={<span style={{ color: "#F9B038" }}>QTY</span>}
                name="qty"
                normalize={(value) => parseNumber(value)}
                getValueProps={(value) => ({
                  value: formatWithCommas(value),
                })}
                rules={[
                  {
                    pattern: /^\d+$/,
                    message: "Please enter a valid number",
                  },
                ]}
              >
                <Input
                  className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                  placeholder="$"
                />
              </Form.Item>
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
              <div>
                <h1 className="text-[#F9B038]">Upload Image</h1>
                <Upload
                  style={{ width: "100%", marginTop: "10px", color: "#F9B038" }}
                  listType="picture-card"
                  fileList={fileList}
                  onChange={onChange}
                  onPreview={onPreview}
                  multiple={true}
                >
                  {fileList.length < 5 && "+ Upload"}
                </Upload>
              </div>
              <Form.Item
                label={<span style={{ color: "#F9B038" }}>Notes</span>}
                name="notes"
                // rules={[{ required: true, message: "Please input Notes!" }]}
              >
                <Input.TextArea
                  className="w-full bg-[#F9B038] border border-transparent py-2"
                  rows={4}
                  placeholder="Type Notes..."
                />
              </Form.Item>
            </div>

            <Form.Item className=" pt-7">
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

export default UpdateRepairOrder;
