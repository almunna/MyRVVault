import { Form, Input, message, Radio, DatePicker, Spin, Select } from "antd";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAddMaintanceMutation } from "../redux/api/routesApi";
import { useGetProfileQuery } from "../redux/api/userApi";
import dayjs from "dayjs";
const dateFormat = "MM/DD/YYYY";
const AddNewMaintanceSchedule = () => {
  const [form] = Form.useForm();
  const [rvType, setRvType] = useState("New"); // Default selected value
  const navigate = useNavigate();
  const [addMaintance] = useAddMaintanceMutation();
  const { data: profileData } = useGetProfileQuery();
  const rvId = profileData?.user?.selectedRvId?._id;
  const [isFormFilled, setIsFormFilled] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    handleFormChange(); // initial check
  }, []);
  // ✅ Check if any field has value
  const handleFormChange = () => {
    const values = form.getFieldsValue();
    const hasValue = Object.values(values).some(
      (value) => value !== undefined && value !== null && value !== ""
    );
    setIsFormFilled(hasValue);
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

  const handleSubmit = async (values) => {
    const formData = {
      component: values.component,
initialMilage: Number(values.cost),
      maintenanceToBePerformed: values.maintenanceToBePerformed,
      dateOfMaintenance: values.dateOfMaintenance?.toISOString(),
      notes: values.notes,
    };

    // Conditionally add fields based on rvType
    if (rvType === "New") {
      formData.initial = values.initial;
    } else if (rvType === "Old") {
      formData.dateOfMaintenance =
        values.dateOfMaintenance.format("YYYY-MM-DD");
      formData.milageAtMaintenance = values.milageAtMaintenance;
    }
    setLoading(true);
    try {
      const res = await addMaintance(formData).unwrap();
      message.success(res?.message || "Saved successfully");
      setLoading(false);
      form.resetFields();
      navigate("/"); // Navigate after success
    } catch (err) {
      setLoading(false);
      message.error(err?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="container m-auto">
      <div className="gap-4 lg:mt-8 mt-6 px-3">
        <div className="pb-7 lg:pb-0">
          <h1 className="text-4xl m-auto font-semibold text-[#F9B038]">
            New Maintenance Schedule
          </h1>
        </div>
        <div className="max-w-4xl m-auto w-full mt-6">
          <Form
            form={form}
            onFinish={handleSubmit}
            onValuesChange={handleFormChange}
            layout="vertical"
          >
            {/* Component */}
            {/* <Form.Item
              label={<span style={{ color: "#F9B038" }}>Component</span>}
              name="component"
              rules={[{ required: true, message: "Please input Component!" }]}
            >
              <Input
                className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                placeholder="Component Name"
              />
            </Form.Item> */}

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

            <Form.Item
              label={
                <span style={{ color: "#F9B038" }}>
                  Maintenance to be Performed
                </span>
              }
              name="maintenanceToBePerformed"
            >
              <Input
                className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                placeholder="Maintenance to be Performed"
              />
            </Form.Item>
            <Form.Item
              label={<span style={{ color: "#F9B038" }}>Date of Purchase</span>}
              name="dateOfMaintenance"
            >
              <DatePicker
                className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                format={dateFormat}
              />
            </Form.Item>
             <Form.Item
                label={<span style={{ color: "#F9B038" }}>Initial Milage</span>}
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
            {/* <Form.Item
              label={<span style={{ color: "#F9B038" }}>Rv Type</span>}
              name="rvType"
              rules={[{ required: true, message: "Please select Rv Type!" }]}
            >
              <Radio.Group
                value={rvType}
                onChange={(e) => setRvType(e.target.value)}
                options={[
                  { value: "New", label: "New" },
                  { value: "Old", label: "USED" },
                ]}
              />
            </Form.Item>

          
            {rvType === "New" && (
             <>
              <Form.Item
                  label={
                    <span style={{ color: "#F9B038" }}>
                      Date of Maintenance
                    </span>
                  }
                  name="dateOfMaintenance"
                  rules={[
                    {
                      required: true,
                      message: "Please select Date of Maintenance!",
                    },
                  ]}
                >
                  <DatePicker
                    className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                    format={dateFormat}
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <span style={{ color: "#F9B038" }}>
                      Milage at Maintenance
                    </span>
                  }
                  name="milageAtMaintenance"
                  rules={[
                    {
                      required: true,
                      message: "Please input Milage at Maintenance!",
                    },
                  ]}
                >
                  <Input
                    type="number"
                    className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                    placeholder="Milage at Maintenance"
                  />
                </Form.Item></>
              
            )}

            {rvType === "Old" && (
              <>
                <Form.Item
                  label={
                    <span style={{ color: "#F9B038" }}>
                      Date of Maintenance
                    </span>
                  }
                  name="dateOfMaintenance"
                  rules={[
                    {
                      required: true,
                      message: "Please select Date of Maintenance!",
                    },
                  ]}
                >
                  <DatePicker
                    className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                    format={dateFormat}
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <span style={{ color: "#F9B038" }}>
                      Milage at Maintenance
                    </span>
                  }
                  name="milageAtMaintenance"
                  rules={[
                    {
                      required: true,
                      message: "Please input Milage at Maintenance!",
                    },
                  ]}
                >
                  <Input
                    type="number"
                    className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
                    placeholder="Milage at Maintenance"
                  />
                </Form.Item>
              </>
            )} */}

            {/* Notes */}
            <Form.Item
              label={<span style={{ color: "#F9B038" }}>Notes</span>}
              name="notes"
              rules={[{ required: true, message: "Please input Notes!" }]}
            >
              <Input.TextArea
                className="w-full bg-[#F9B038] border border-transparent py-2"
                rows={4}
                placeholder="Type Notes..."
              />
            </Form.Item>

            <Form.Item className="pt-7">
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

          <Link to="/addMembershipForm">
            <button
              type="button"
              className="w-full bg-[#F9B038] py-2 text-black mt-4"
            >
              next
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AddNewMaintanceSchedule;
