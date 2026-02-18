import { Form, Input } from 'antd';
import React from 'react'

const AddOtherBelt = () => {
    const [form] = Form.useForm();
    const handleSubmit = (values) => {
        console.log(values)
    };

    return (
        <div className='container m-auto'>
            <h1 className='text-3xl font-semibold pb-4 pt-6 text-[#F9B038]'>Add Other Belt Or Filter</h1>
            <Form form={form} onFinish={handleSubmit} layout="vertical">


                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item
                        label={<span style={{ color: "#F9B038" }}>Enter Item Name</span>}
                        name="type"
                        rules={[{ required: true, message: "Please input Enter Item Name!" }]}
                    >
                        <Input className='w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2' placeholder="Enter Item Name" />
                    </Form.Item>
                    <Form.Item
                        label={<span style={{ color: "#F9B038" }}>Enter Item Part Number</span>}
                        name="type"
                        rules={[{ required: true, message: "Please input Enter Item Part Number!" }]}
                    >
                        <Input className='w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2' placeholder="Enter Item Part Number" />
                    </Form.Item>

                </div>




                <Form.Item className=" pt-3">
                    <div className='flex gap-4'><button type="primary" htmlType="submit" className=" bg-[#F9B038] py-3 px-7">
                        Save
                    </button>
                    <button type="primary" htmlType="submit" className=" bg-[#F9B038] py-3 px-7">
                        Add another belt
                    </button></div>
                </Form.Item>
            </Form>
        </div>
    )
}

export default AddOtherBelt