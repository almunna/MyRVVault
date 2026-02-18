import { Button, ConfigProvider, DatePicker, Form, Input, Select } from 'antd'
import Dragger from 'antd/es/upload/Dragger';
import React from 'react'
import { InboxOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
const { Option } = Select;
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
const dateFormat = 'YYYY-MM-DD';
const UpdateExistMaintainanceOrder = () => {
    const [form] = Form.useForm();
    const handleSubmit = (values) => {
        console.log(values)
    };

    return (
        <div className='container m-auto py-7'>

            <div className=' gap-4 '>
                <div className=''>
                    <h1 className='text-3xl font-semibold text-[#F9B038]'>Update Existing Maintenance Order</h1>
                </div>
                <div className=' max-w-4xl m-auto pt-8'>
                    <Form form={form} onFinish={handleSubmit} layout="vertical">


                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Form.Item
                                label={<span style={{ color: "#F9B038" }}>RV Nickname</span>}
                                
                                name="Nickname"
                                rules={[{ required: true, message: "Please input your Fuel Type!" }]}
                            >
                                <Input className='w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2' placeholder="Fuel Type" />
                            </Form.Item>

                            <Form.Item
                                label={<span style={{ color: "#F9B038" }}>Class</span>}
                                name="class"
                               
                            >
                                <ConfigProvider
                                    theme={{
                                        token: {
                                            colorPrimary: '#F9B038',
                                            borderRadius: 8,
                                            controlHeight: 40,

                                        },
                                    }}
                                >
                                    <Select placeholder="Select Inquiry" className="w-full">
                                        <Option value="General_Inquiry">Select</Option>
                                        <Option value="Service_Request">Part</Option>
                                        <Option value="Partnership_Inquiry">Qz</Option>
                                    </Select>
                                </ConfigProvider>
                            </Form.Item>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Form.Item
                                label={<span style={{ color: "#F9B038" }}>Manufacturer</span>}
                                name="Manufacturer"
                                rules={[{ required: true, message: "Please input your Fuel Add another Belt!" }]}
                            >
                                <Input className='w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2' placeholder="Add another Belt" />
                            </Form.Item>
                            <Form.Item
                                label={<span style={{ color: "#F9B038" }}>Model Name</span>}
                                name="Model"
                                rules={[{ required: true, message: "Please input your Fuel Add Oil Filter!" }]}
                            >
                                <Input className='w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2' placeholder="Add Oil Filter" />
                            </Form.Item>

                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Form.Item
                               label={<span style={{ color: "#F9B038" }}>Floorplan</span>}
                                name="Floorplan"
                                rules={[{ required: true, message: "Please input your Add another oil Filter" }]}
                            >
                                <Input className='w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2' placeholder="Add another oil Filter" />
                            </Form.Item>

                            <Form.Item
                                label={<span style={{ color: "#F9B038" }}>Interior color Scheme</span>}
                                name="Interior"
                               
                            >
                                <ConfigProvider
                                    theme={{
                                        token: {
                                            colorPrimary: '#F9B038',
                                            borderRadius: 8,
                                            controlHeight: 40,

                                        },
                                    }}
                                >
                                    <Select placeholder="Select Inquiry" className="w-full">
                                        <Option value="General_Inquiry">Select</Option>
                                        <Option value="Service">Part</Option>
                                        <Option value="Partnership">Qz</Option>
                                    </Select>
                                </ConfigProvider>
                            </Form.Item>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Form.Item
                                label={<span style={{ color: "#F9B038" }}>Mtg</span>}
                                name="Mtg"
                                rules={[{ required: true, message: "Please input your Mtg!" }]}
                            >
                                <Input className='w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2' placeholder="Add Mtg" />
                            </Form.Item>
                            <Form.Item
                                label={<span style={{ color: "#F9B038" }}>Model</span>}
                                name="Model"
                                rules={[{ required: true, message: "Please input your MOdel" }]}
                            >
                                <Input className='w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2' placeholder="Model" />
                            </Form.Item>

                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Form.Item
                                label={<span style={{ color: "#F9B038" }}>Name</span>}
                                name="Name"
                                rules={[{ required: true, message: "Please input your Fuel Name!" }]}
                            >
                                <Input className='w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2' placeholder="Name" />
                            </Form.Item>
                            <Form.Item
                                label={<span style={{ color: "#F9B038" }}>Serial ID</span>}
                                name="Serial"
                                rules={[{ required: true, message: "Please input your Serial ID!" }]}
                            >
                                <Input className='w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2' placeholder="Serial ID" />
                            </Form.Item>

                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Form.Item
                                label={<span style={{ color: "#F9B038" }}>Engine Model</span>}
                                name="Engine"
                                rules={[{ required: true, message: "Please input your Engine Model!" }]}
                            >
                                <Input className='w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2' placeholder="Engine Model" />
                            </Form.Item>
                            <Form.Item
                                label={<span style={{ color: "#F9B038" }}>Horsepower</span>}
                                name="Horsepower"
                                rules={[{ required: true, message: "Please input your horsepower!" }]}
                            >
                                <Input className='w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2' placeholder="Horse Prower" />
                            </Form.Item>

                        </div>


                        <Form.Item className=" pt-3">
                            <button type="primary" htmlType="submit" className="w-full bg-[#F9B038] py-2">
                                Save
                            </button>
                        </Form.Item>
                    </Form>
                </div>
            </div>
        </div>
    )
}

export default UpdateExistMaintainanceOrder