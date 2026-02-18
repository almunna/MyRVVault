import React from "react";
import { HiHeart } from "react-icons/hi";

const MyReport = () => {
    return (
        <div className="container m-auto  lg:flex gap-4 lg:mt-11 mt-6 px-3">
            <div className='lg:w-[300px] pb-7 lg:pb-0'>
                <h1 className='text-3xl font-semibold text-[#F9B038]'>Report Details</h1>
            </div>
            <div className=" bg-[#F9B038] flex flex-col items-center justify-center w-full h-[70vh] gap-8 px-4">
                <div className="text-center text-gray-800 space-y-3 text-lg md:text-xl font-semibold">
                    <div className="flex justify-center gap-4">
                        <span>Report Name :</span>
                        <span className="font-normal">Repair</span>
                    </div>
                    <div className="flex justify-center gap-4">
                        <span>Date Created :</span>
                        <span className="font-normal">21-10-2025</span>
                    </div>
                    <div className="flex justify-center gap-4">
                        <span>Last Updated :</span>
                        <span className="font-normal">21-24-2025</span>
                    </div>
                    <div className="flex justify-center gap-4">
                        <span>Report Type :</span>
                        <span className="font-normal">State Visit</span>
                    </div>
                </div>

                <div className="flex gap-6">
                    <button className="bg-cyan-400 text-white px-12 py-3 rounded-md text-lg font-medium hover:bg-cyan-500 transition">
                       <HiHeart></HiHeart>
                    </button>
                   
                </div>

                {/* <button className="border border-black px-12 py-3 rounded-md text-lg font-semibold hover:bg-black hover:text-white transition">
                    New Report Create
                </button> */}
            </div>
        </div>
    );
};

export default MyReport;
