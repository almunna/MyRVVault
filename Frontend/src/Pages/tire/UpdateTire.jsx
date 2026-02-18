import { DatePicker, Form, Input, message, Select, Spin, Upload } from "antd";

import React, { useEffect, useState } from "react";

import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useNavigate, useParams } from "react-router-dom";
import {
  useAddTireMutation,
  useGetSingleTireQuery,
  useUpdateTireMutation,
} from "../redux/api/routesApi";
import { imageUrl } from "../redux/api/baseApi";
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

const UpdateTire = () => {
  const { id } = useParams();
  const { data: singleUpdate } = useGetSingleTireQuery({ id });
  console.log(singleUpdate);
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();
  const [cost, setCost] = useState("");
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

  const [addTire] = useUpdateTireMutation();

  const onChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const navigate = useNavigate();
  const formatWithCommas = (value) => {
    if (!value) return "";
    const onlyNumbers = value.toString().replace(/[^\d]/g, "");
    return onlyNumbers.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const parseNumber = (value) => {
    if (!value) return "";
    return value.replace(/,/g, "");
  };

  const handleSubmit = async (values) => {
    console.log("Form Values:", values?.cost);

    const formData = new FormData();
    formData.append("manufacturer", values.Manufacturer || "");
    formData.append("tireSize", values.size || "");
    formData.append("location", values.location || "");
    formData.append(
      "dateOfPurchase",
      values.dateOfPurchase
        ? dayjs(values.dateOfPurchase).format(dateFormat)
        : ""
    );

    formData.append("cost", values.cost ? Number(values.cost) : "");

    formData.append("note", values.notes || "");

    // Multiple image upload
    fileList.forEach((file) => {
      if (file.originFileObj) {
        formData.append("images", file.originFileObj);
      }
    });
    setLoading(true);
    try {
      const res = await addTire({ formData, id }).unwrap();
      setLoading(false);
      message.success(res?.message || "Saved successfully");
      form.resetFields();
      setFileList([]);
    } catch (err) {
      setLoading(false);
      message.error(err?.data?.message || "Something went wrong");
    }
  };

  useEffect(() => {
    if (singleUpdate?.data) {
      const admin = singleUpdate?.data;

      // ✅ Form values set
      form.setFieldsValue({
        Manufacturer: admin.manufacturer || "",
        size: admin.tireSize || "",
        location: admin.location || "",
        modelNumber: admin.modelNumber || "",
        phoneNumber: admin.phoneNumber || "",
        dateOfPurchase: admin.dateOfPurchase
          ? dayjs(admin.dateOfPurchase)
          : null,
        effectiveDate: admin.effectiveDate ? dayjs(admin.effectiveDate) : null,
        renewalDate: admin.renewalDate ? dayjs(admin.renewalDate) : null,
        cost: admin.cost || "",
        notes: admin.note || "",
        policyNumber: admin.policyNumber || "",
      });

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
        <div className="flex justify-between items-center pb-7 lg:pb-0">
          <h1 className="text-3xl font-semibold text-[#F9B038]">
            Update Tire
          </h1>
          <Navigate title={'Cancel'}></Navigate>
        </div>
        <div className="max-w-4xl m-auto text-[#F9B038]">
          <Form
            form={form}
            onFinish={handleSubmit}
            onValuesChange={handleFormChange}
            layout="vertical"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label={<span style={{ color: "#F9B038" }}>Manufacturer</span>}
                name="Manufacturer"
              >
                <Input
                  className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                  placeholder="Manufacturer"
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: "#F9B038" }}>Date Purchase</span>}
                name="dateOfPurchase"
              >
                <DatePicker
                  className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                  format={dateFormat}
                />
              </Form.Item>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label={<span style={{ color: "#F9B038" }}>Tire Size</span>}
                name="size"
              >
                <Input
                  className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                  placeholder="Tire Size"
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: "#F9B038" }}>Location</span>}
                name="location"
              >
                <Select
                  className="custom-select"
                  style={{ height: "40px" }}
                  placeholder="Select Location"
                >
                  <Select.Option value="">Select</Select.Option>
                  <Select.Option value="Front Left">Front Left</Select.Option>

                  <Select.Option value="Front Right">Front Right</Select.Option>

                  <Select.Option value="Mid Front Left">
                    Mid Front Left
                  </Select.Option>

                  <Select.Option value="Mid Front Right">
                    Mid Front Right
                  </Select.Option>
                  <Select.Option value="Mid Left Outside">
                    Mid Left Outside
                  </Select.Option>
                  <Select.Option value="Mid Left Inside">
                    Mid Left Inside
                  </Select.Option>
                  <Select.Option value="Mid Right Outside">
                    Mid Right Outside
                  </Select.Option>
                  <Select.Option value="Mid Right Inside">
                    Mid Right Inside
                  </Select.Option>
                  <Select.Option value="Mid Rear Left">
                    Mid Rear Left
                  </Select.Option>
                  <Select.Option value="Mid Rear Right">
                    Mid Rear Right
                  </Select.Option>
                  <Select.Option value="Rear Front">Rear Front</Select.Option>
                </Select>
              </Form.Item>
            </div>

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

export default UpdateTire;
