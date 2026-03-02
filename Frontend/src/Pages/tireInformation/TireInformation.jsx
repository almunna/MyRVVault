import { Form, Input } from 'antd';
import Dragger from 'antd/es/upload/Dragger';
import React from 'react';
import { InboxOutlined } from '@ant-design/icons';
const props = {
    name: 'images',
    multiple: true,
    beforeUpload: () => false,
    onDrop(e) {
        console.log('Dropped files', e.dataTransfer.files);
    },
};
const tireData = [
    {
        title: "Front Left",
        name: "X Line Energy",
        size: "275/80R22.5",
        mfg: "Goodyear",
        dateCode: "3625",
        psi: "xx",
    },
    {
        title: "Front Right",
        name: "X Line Energy",
        size: "275/80R22.5",
        mfg: "Goodyear",
        dateCode: "1 Years",
        psi: "xx",
    },
    {
        title: "Mid Left",
        name: "X Line Energy",
        size: "275/80R22.5",
        mfg: "Goodyear",
        dateCode: "3625",
        psi: "xx",
    },
    {
        title: "Mid Right",
        name: "X Line Energy",
        size: "275/80R22.5",
        mfg: "Goodyear",
        dateCode: "1 Years",
        psi: "xx",
    },
    {
        title: "Rear",
        name: "X Line Energy",
        size: "275/80R22.5",
        mfg: "Goodyear",
        dateCode: "1 Years",
        psi: "xx",
    },
];

const TireInformation = () => {
    const [form] = Form.useForm();
    const handleSubmit = (values) => {
        console.log(values)
    };
    return (
        <div className="container m-auto text-[#F9B038]">
            <h1 className='text-3xl font-semibold pb-7'>Tire Information</h1>
            <div className="flex items-center space-x-4">
                {tireData.map((tire, idx) => (
                    <React.Fragment key={tire.title}>
                        <div className="text-[#F9B038] text-left text-sm w-48 ">
                            <h3 className="font-semibold mb-1">{tire.title}</h3>
                            <p>Name: {tire.name}</p>
                            <p>Size: {tire.size}</p>
                            <p>Mfg: {tire.mfg}</p>
                            <p>Date Code: {tire.dateCode}</p>
                            <p>PSI: {tire.psi}</p>
                        </div>
                        {idx !== tireData.length - 1 && (
                            <div className="text-[#f5af58] font-bold text-2xl select-none">
                                &rarr;
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>

            <div className='mt-11 '>
                <Form form={form} onFinish={handleSubmit} layout="vertical">

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl' >
                       <Dragger {...props}>
                <p className="ant-upload-drag-icon ">
                  <InboxOutlined />
                </p>
                <p className=" text-[#F9B038]">
                  Click or drag file to this area to upload
                </p>
                <p className="text-[#F9B038]">
                  Support for a single or bulk upload. Strictly prohibited from
                  uploading company data or other banned files.
                </p>
              </Dragger>
                         <Form.Item
                label={<span style={{ color: "#F9B038" }}>Notes</span>}
                name="feedback"
                rules={[{ required: true, message: "Please input Notes!" }]}
              >
                <Input.TextArea
                  className="w-full bg-[#F9B038] border border-transparent py-2"
                  rows={4}
                  placeholder="Type Notes..."
                />
              </Form.Item>
                    </div>


                    <div className='flex justify-center gap-3'>
                        <Form.Item className=" pt-7">
                            <button type="primary" htmlType="submit" className=" bg-[#F9B038] py-2 w-[150px]">
                                Add Another
                            </button>
                        </Form.Item>
                        <Form.Item className=" pt-7">
                            <button type="primary" htmlType="submit" className=" bg-[#F9B038] py-2 w-[150px]">
                                Save
                            </button>
                        </Form.Item>
                    </div>
                    <div className='flex justify-center'><button type="primary" htmlType="submit" className=" bg-[#F9B038] py-2 px-7 w-[300px]">
                                next 
                            </button></div>
                </Form>
            </div>
        </div>
    );
};

export default TireInformation;
