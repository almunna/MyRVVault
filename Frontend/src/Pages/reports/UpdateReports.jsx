import {
  Button,
  ConfigProvider,
  DatePicker,
  Form,
  Input,
  message,
  Select,
  Spin,
  Upload,
} from "antd";
import Dragger from "antd/es/upload/Dragger";
import React, { useEffect, useState } from "react";
import { InboxOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {
  useAddRepairMutation,
  useAddReportsMutation,
  useGetSingleReportsQuery,
  useUpdateReportsMutation,
} from "../redux/api/routesApi";
import { useParams } from "react-router-dom";
import { Navigate } from "../../Navigate";
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
const UpdateReports = () => {
  const { id } = useParams();
   const [fileList, setFileList] = useState([]);
  const { data: singleUpdate } = useGetSingleReportsQuery({ id });
  console.log(singleUpdate);
    const [isFormFilled, setIsFormFilled] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    handleFormChange(); // initial check
  }, [fileList]);
  // ✅ Check if any field has valuesd
  const handleFormChange = () => {
    const values = form.getFieldsValue();
    const hasValue =
      Object.values(values).some((value) => value && value !== "") ||
      fileList.length > 0;
    setIsFormFilled(hasValue);
  };
  const [newRepair] = useUpdateReportsMutation();
  const [form] = Form.useForm();
  const handleSubmit = async (values) => {
    const formData = new FormData();
    formData.append("reportTitle", values.reportTitle || "");
    formData.append("area", values.area || "");
    formData.append("component", values.component || "");
    formData.append("odometerReading", values.odometerReading || "");
    formData.append(
      "dateOfService",
      values.dateOfService ? dayjs(values.dateOfService).format(dateFormat) : ""
    );

    formData.append("cost", values.cost ? Number(values.cost) : "");

    formData.append("note", values.notes || "");

    // Multiple image upload
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
      const admin = singleUpdate?.data;

      // ✅ Form values set
      form.setFieldsValue({
        reportTitle: admin.reportTitle || "",
        component: admin.component || "",
        location: admin.location || "",
        odometerReading: admin.odometerReading || "",
        area: admin.area || "",
        dateOfService: admin.dateOfService ? dayjs(admin.dateOfService) : null,
        effectiveDate: admin.effectiveDate ? dayjs(admin.effectiveDate) : null,
        renewalDate: admin.renewalDate ? dayjs(admin.renewalDate) : null,
        cost: admin.cost || "",
        notes: admin.note || "",
        policyNumber: admin.policyNumber || "",
      });
    }
  }, [singleUpdate, form]);
  return (
    <div className="container m-auto">
      <div className=" lg:mt-11 mt-6 px-3">
        <div className="flex justify-between items-center pb-7 lg:pb-0">
          <h1 className="text-3xl font-semibold text-[#F9B038]">
            Update Reports
          </h1>
          <Navigate  title={'Cancel'}></Navigate>
        </div>
        <div className="max-w-4xl m-auto">
          <Form form={form} onFinish={handleSubmit} onValuesChange={handleFormChange} layout="vertical">
            <div className="">
              <Form.Item
                label={
                  <span style={{ color: "#F9B038" }}>Date Of Service</span>
                }
                name="dateOfService"
                // rules={[
                //   {
                //     required: true,
                //     message: "Please input your company name!",
                //   },
                // ]}
              >
                <DatePicker
                  className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                  format={dateFormat}
                />
              </Form.Item>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label={<span style={{ color: "#F9B038" }}>Area</span>}
                name="area"
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
                label={
                  <span style={{ color: "#F9B038" }}>Odometer Reading</span>
                }
                name="odometerReading"
                // rules={[
                //   { required: true, message: "Please input city/state!" },
                // ]}
              >
                <Input
                  type="number"
                  className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                  placeholder="Odometer Reading"
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
                <Select.Option value="">Select</Select.Option>
                <Select.Option value="chassis">Chassis</Select.Option>
                <Select.Option value="ceilingFans">Ceiling Fans</Select.Option>
                <Select.Option value="airConditioning">
                  Air Conditioning
                </Select.Option>
                <Select.Option value="dishwasher">Dishwasher</Select.Option>
                <Select.Option value="dryer">Dryer</Select.Option>
                <Select.Option value="dvdPlayer">DVD Player</Select.Option>
                <Select.Option value="exhaustFans">Exhaust Fans</Select.Option>
                <Select.Option value="expense">Expense</Select.Option>
                <Select.Option value="gps">GPS</Select.Option>
                <Select.Option value="heater">Heater</Select.Option>
                <Select.Option value="insurance">Insurance</Select.Option>
                <Select.Option value="satelliteInternet">
                  Satellite Internet
                </Select.Option>
                <Select.Option value="maintenanceSchedule">
                  Maintenance Schedule
                </Select.Option>
                <Select.Option value="membership">Membership</Select.Option>
                <Select.Option value="outdoorRadio">
                  Outdoor Radio
                </Select.Option>
                <Select.Option value="rv">RV</Select.Option>
                <Select.Option value="surroundSound">
                  Surround Sound
                </Select.Option>
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
                label={<span style={{ color: "#F9B038" }}>Report Title</span>}
                name="reportTitle"
                // rules={[
                //   {
                //     required: true,
                //     message: "Please input your company name!",
                //   },
                // ]}
              >
                <Input
                  className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                  placeholder="report Title"
                />
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 ">
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

export default UpdateReports;
