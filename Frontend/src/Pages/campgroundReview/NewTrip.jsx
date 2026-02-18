import { Button, DatePicker, Form, Input, Select, message } from "antd";
import React, { useEffect } from "react"; // ← Added useEffect
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useAddCampMutation } from "../redux/api/routesApi";

const { Option } = Select;

const states = {
  ALABAMA: "Alabama",
  ALASKA: "Alaska",
  ARIZONA: "Arizona",
  ARKANSAS: "Arkansas",
  CALIFORNIA: "California",
  COLORADO: "Colorado",
  CONNECTICUT: "Connecticut",
  DELAWARE: "Delaware",
  FLORIDA: "Florida",
  GEORGIA: "Georgia",
  HAWAII: "Hawaii",
  IDAHO: "Idaho",
  ILLINOIS: "Illinois",
  INDIANA: "Indiana",
  IOWA: "Iowa",
  KANSAS: "Kansas",
  KENTUCKY: "Kentucky",
  LOUISIANA: "Louisiana",
  MAINE: "Maine",
  MARYLAND: "Maryland",
  MASSACHUSETTS: "Massachusetts",
  MICHIGAN: "Michigan",
  MINNESOTA: "Minnesota",
  MISSISSIPPI: "Mississippi",
  MISSOURI: "Missouri",
  MONTANA: "Montana",
  NEBRASKA: "Nebraska",
  NEVADA: "Nevada",
  NEW_HAMPSHIRE: "New Hampshire",
  NEW_JERSEY: "New Jersey",
  NEW_MEXICO: "New Mexico",
  NEW_YORK: "New York",
  NORTH_CAROLINA: "North Carolina",
  NORTH_DAKOTA: "North Dakota",
  OHIO: "Ohio",
  OKLAHOMA: "Oklahoma",
  OREGON: "Oregon",
  PENNSYLVANIA: "Pennsylvania",
  RHODE_ISLAND: "Rhode Island",
  SOUTH_CAROLINA: "South Carolina",
  SOUTH_DAKOTA: "South Dakota",
  TENNESSEE: "Tennessee",
  TEXAS: "Texas",
  UTAH: "Utah",
  VERMONT: "Vermont",
  VIRGINIA: "Virginia",
  WASHINGTON: "Washington",
  WEST_VIRGINIA: "West Virginia",
  WISCONSIN: "Wisconsin",
  WYOMING: "Wyoming",
};

dayjs.extend(customParseFormat);
const dateFormat = "MM/DD/YYYY";

const NewTrip = () => {
  const [addCampNewTrip] = useAddCampMutation();
  const [form] = Form.useForm();
  // ✅ Ensure exactly one state row on initial load
  useEffect(() => {
    const currentStates = form.getFieldValue("states");
    if (!currentStates || currentStates.length === 0) {
      form.setFieldsValue({ states: [{}] }); // Adds one empty row
    }
  }, [form]);
const handleSubmit = async (values) => {
    console.log("Form Values:", values);

    const statesData = values.states.map((item) => ({
      state: states[item.state],
      status: item.status,
    }));

    const payload = {
      title: values.title,
      description: values.feedback,
      startDate: values.start ? values.start.format("YYYY-MM-DD") : null,
      endDate: values.end ? values.end.format("YYYY-MM-DD") : null,
      tripType: values.tripType || "FAMILY_VACATION", // adjust if needed
      states: statesData,
    };

    console.log("Final Payload:", payload);

    try {
      const res = await addCampNewTrip(payload);
      if (res?.data?.success) {
        message.success(res?.data?.message || "Trip added successfully!");
        form.resetFields();
        // After reset, useEffect will add back one empty state row
      } else {
        message.error(res?.error?.data?.message || "Failed to add trip");
      }
    } catch (error) {
      console.error("Error:", error);
      message.error("Something went wrong!");
    }
  };
  return (
    <div className="max-w-4xl m-auto">
      <Form form={form} onFinish={handleSubmit} layout="vertical">
       
        <Form.Item
          label={<span style={{ color: "#F9B038" }}>Trip Title</span>}
          name="title"
        >
          <Input
            className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
            placeholder="Trip title"
          />
        </Form.Item>

        <Form.Item
          label={<span style={{ color: "#F9B038" }}>Description</span>}
          name="feedback"
        >
          <Input.TextArea
            className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
            rows={4}
            placeholder="Write trip details..."
          />
        </Form.Item>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            label={<span style={{ color: "#F9B038" }}>Start Date</span>}
            name="start"
          >
            <DatePicker
              className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
              format={dateFormat}
              placeholder="Start Date"
            />
          </Form.Item>

          <Form.Item
            label={<span style={{ color: "#F9B038" }}>End Date (optional)</span>}
            name="end"
          >
            <DatePicker
              className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
              format={dateFormat}
              placeholder="End Date"
            />
          </Form.Item>
        </div>
         

        {/* Multi Select Fields */}
        <Form.List name="states">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }, index) => (
                <div key={key} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 items-start">
                  {/* State */}
                  <Form.Item
                    {...restField}
                    name={[name, "state"]}
                    label={index === 0 ? <span style={{ color: "#F9B038" }}>State</span> : ""}
                    rules={[{ required: true, message: "Select a state" }]}
                  >
                    <Select
                      placeholder="Select State"
                      className="w-full custom-select"
                      style={{ height: "40px" }}
                    >
                      {Object.entries(states).map(([key, value]) => (
                        <Option key={key} value={key}>
                          {value}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  {/* Visit Status + Remove Button */}
                  <div className="flex items-start gap-2">
                    <Form.Item
                      {...restField}
                      name={[name, "status"]}
                      label={index === 0 ? <span style={{ color: "#F9B038" }}>Visit Status</span> : ""}
                      rules={[{ required: true, message: "Select status" }]}
                      className="flex-1"
                    >
                      <Select
                      
                        placeholder="Select Status"
                        className="w-full custom-select"
                        style={{ height: "40px" }}
                      >
                        <Option value="CAMPED">Camped</Option>
                        <Option value="TRAVELED_THROUGH">Traveled Through</Option>
                        <Option value="PLANNING">Planning To Visit</Option>
                        <Option value="NOT_VISITED">Not Yet Visited</Option>
                      </Select>
                    </Form.Item>

                    {/* Remove button only if more than 1 row */}
                    {fields.length > 1 && (
                      <MinusCircleOutlined
                        className="text-red-500 text-xl mt-2"
                        onClick={() => remove(name)}
                      />
                    )}
                  </div>
                </div>
              ))}

              {/* Add State Button */}
              <Form.Item>
                <button
                  
                  onClick={() => add()}
                  className="border rounded-md w-full border-[#F9B038] text-[#F9B038] px-4 py-2  "
                
                >
                  + Add another state
                </button>
              </Form.Item>
            </>
          )}
        </Form.List>
        {/* Trip Type */}
             <Form.Item
          label={<span style={{ color: "#F9B038" }}>Trip Type</span>}
          name="tripType"
        >
          <Input
            className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2"
            placeholder="Trip type"
          />
        </Form.Item>

        {/* Submit */}
        <Form.Item className="pt-7">
          <button
            type="primary"
            htmlType="submit"
            className="w-full bg-[#F9B038] py-2"
          >
            Save
          </button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default NewTrip;
