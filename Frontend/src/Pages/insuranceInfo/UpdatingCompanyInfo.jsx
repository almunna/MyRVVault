
import { Button, DatePicker, Form, Input, message, Spin, Upload } from "antd";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PlusOutlined } from "@ant-design/icons";
import {

  useGetSingleInsuranceCompanyQuery,
  useUpdateInsuranceCompanyMutation,
} from "../redux/api/routesApi";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useGetProfileQuery } from "../redux/api/userApi";
import { Navigate } from "../../Navigate";

dayjs.extend(customParseFormat);
const dateFormat = "MM/DD/YYYY";


const UpdatingCompanyInfo = () => {
  const [form] = Form.useForm();

  const [fileList, setFileList] = useState([]);
  const [updateIinsurance] = useUpdateInsuranceCompanyMutation();
  const { id } = useParams();
  console.log(id);
  const { data: singleInsurance } = useGetSingleInsuranceCompanyQuery({ id });
  console.log(singleInsurance);
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

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const handleRemove = (file) => {
    setFileList(fileList.filter((item) => item.uid !== file.uid));
  };

  useEffect(() => {
    if (singleInsurance?.data) {
      const admin = singleInsurance?.data;

      // ✅ Form values set
      form.setFieldsValue({
        insuranceCompany: admin.insuranceCompany || "",
        websiteLink: admin.websiteLink || "",
        phoneNumber: admin.phoneNumber || "",
        effectiveDate: admin.effectiveDate ? dayjs(admin.effectiveDate) : null,
        renewalDate: admin.renewalDate ? dayjs(admin.renewalDate) : null,
        cost: admin.cost || "",
        notes: admin.notes || "",
        policyNumber: admin.policyNumber || "",
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
  }, [singleInsurance, form]);

  const formatWithCommas = (value) => {
    if (!value) return "";
    const onlyNumbers = value.toString().replace(/[^\d]/g, "");
    return onlyNumbers.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const parseNumber = (value) => {
    if (!value) return "";
    return value.replace(/,/g, "");
  };

  const onChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };
  const { data: profileData } = useGetProfileQuery();

  const handleSubmit = async (values) => {

    console.log("Form Values:", values?.cost);

    const formData = new FormData();
    const rvId = profileData?.user?.selectedRvId?._id;
    if (!rvId) {
      message.error(
        "Please select your RV from the home page before submitting."
      );
      return;
    }
    formData.append("rvId", rvId);
    formData.append("insuranceCompany", values.insuranceCompany || "");
    formData.append("websiteLink", values.websiteLink || "");
    formData.append(
      "effectiveDate",
      values.effectiveDate ? dayjs(values.effectiveDate).format(dateFormat) : ""
    );
    formData.append(
      "renewalDate",
      values.renewalDate ? dayjs(values.renewalDate).format(dateFormat) : ""
    );
    formData.append("phoneNumber", values.phoneNumber || "");
    formData.append("cost", values.cost ? Number(values.cost) : "");

    formData.append("policyNumber", values.policyNumber || "");
    formData.append("notes", values.notes || "");

  fileList.forEach((file) => {
      if (file.originFileObj) {
        formData.append("images", file.originFileObj);
      }
    });
    setLoading(true);
    try {
      const res = await updateIinsurance({ formData, id }).unwrap();
      message.success(res?.message || "Saved successfully");
      form.resetFields();
      setLoading(false);
      setFileList([]);
    } catch (err) {
      setLoading(false);
      message.error(err?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="container m-auto">
      <div className=" gap-4 lg:mt-8  px-3">
        <div className="pb-7 flex justify-between items-center lg:pb-0">
          <h1 className="text-3xl text-[#F9B038] font-semibold ">
            Update Insurance Company Info
          </h1>
          <Navigate  title={'Cancel'}></Navigate>
        </div>
        <div className="max-w-4xl m-auto text-[#F9B038] mt-6">
          <Form form={form} onFinish={handleSubmit} onValuesChange={handleFormChange} layout="vertical">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label={
                  <span style={{ color: "#F9B038" }}>Insurance Company</span>
                }
                name="insuranceCompany"
              >
                <Input
                  className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                  placeholder="Insurance Company"
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: "#F9B038" }}>Website Link</span>}
                name="websiteLink"
              >
                <Input
                  className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                  placeholder="Website Link"
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: "#F9B038" }}>Phone Number</span>}
                name="phoneNumber"
              >
                <Input
                  className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                  placeholder="Type phone"
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: "#F9B038" }}>Effective Date</span>}
                name="effectiveDate"
              >
                <DatePicker
                  className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                  format={dateFormat}
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: "#F9B038" }}>Renewal Date</span>}
                name="renewalDate"
              >
                <DatePicker
                  className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                  format={dateFormat}
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: "#F9B038" }}>Cost</span>}
                name="cost"
                normalize={(value) => parseNumber(value)} // Store unformatted value in form
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

            <Form.Item
              label={<span style={{ color: "#F9B038" }}>Policy Number</span>}
              name="policyNumber"
            >
              <Input
                className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                placeholder="Type account"
              />
            </Form.Item>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
              <div>
                <h1 className="text-[#F9B038]">Upload Image</h1>
             
                <Upload
                  style={{ width: "100%", marginTop: "10px", color: "#F9B038" }}
                  listType="picture-card"
                  fileList={fileList}
                  onChange={handleUploadChange}
                  onRemove={handleRemove}
                  beforeUpload={() => false}
                  multiple
                >
                  {fileList.length >= 1 ? null : (
                    <div className="flex items-center gap-2">
                      <PlusOutlined />
                      <div>Add Image</div>
                    </div>
                  )}
                </Upload>
              </div>

              <Form.Item label="Notes" name="notes">
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

export default UpdatingCompanyInfo;
