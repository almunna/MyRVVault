import React from 'react'
import back from '../../assets/Home/back.png'
import { Form, Input } from 'antd';
const UpcomingMaintenance = () => {
    const [form] = Form.useForm();
    const handleSubmit = (values) => {
        console.log(values)
    };
    return (
        <div className='container m-auto'>
            <h1 className='text-xl font-semibold py-2 text-[#F9B038]'>Upcoming Maintenance </h1>
            <div
                className="relative bg-cover bg-center py-16 "
                style={{ backgroundImage: `url(${back})` }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black to-black opacity-50"></div>

                <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-6">
                    <div className='text-white'>
                        <Form form={form} onFinish={handleSubmit} layout="vertical">
                            <div className='' >
                                <label className='text-xl font-semibold text-[#F9B038]' htmlFor="Upload">Upload</label>

                                <Form.Item
                                    label={<span style={{ color: "#F9B038" }}>Description</span>}
                               
                                    name="feedback"
                                    rules={[{ required: true, message: "Please input description!" }]}
                                >
                                    <Input.TextArea className='w-[300px] bg-[#F9B038] border border-black py-2' rows={4} placeholder="Type Here..." />
                                </Form.Item>
                            </div>
                        </Form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UpcomingMaintenance