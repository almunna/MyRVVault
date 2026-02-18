import React from "react";
import logo1 from "../../assets/Home/logo1.png";
import logo2 from "../../assets/Home/logo2.png";
import logo3 from "../../assets/Home/logo3.png";
import logo4 from "../../assets/Home/logo4.png";
import main from "../../assets/Home/main.png";
import { Link } from "react-router-dom";
import { Dropdown, Space } from "antd";


const HavcApplication = () => {


  return (
    <div className="container m-auto py-6 pt-11">
      <h1 className="text-3xl text-[#F9B038] font-semibold ">
        HAVC/Appliances/Plumbing
      </h1>
      {/* <h1 className='text-6xl font-bold text-[#484848]'>Welcome Eddie!</h1>
      <p className='max-w-2xl pt-4'>Welcome to My RV Vault. Get started by tracking your latest expenses, managing repairs, or reviewing your checklists. We've got everything you need to maintain your RV life in one place!"</p> */}

      <div className="flex justify-center gap-4"></div>
      {/* <div className='flex justify-center py-5'>
        <img src={main} alt="" />
      </div> */}

      <div className="pt-5">
        {/* <h1 className='text-xl font-semibold'>Manage Your RV Effortlessly</h1>
        <p className=' pt-2'>Welcome to your all-in-one RV management hub! From tracking your maintenance schedules and repairs to reviewing campgrounds and adding your RV details, we've made it easy for you to stay organized. Whether you're updating your insurance information or preparing for your next trip, all the tools you need are right here. Start managing your RV experience like a pro!</p> */}

        <div className="grid lg:grid-cols-6 md:grid-cols-4 grid-cols-2 gap-4 py-5 px-3 lg:px-0">
          <div className="bg-[#F59B07] py-6 rounded-lg">
            <Link to={"/details/airConditioner"}>
              <div className="flex justify-center">
                <img src={logo1} alt="logo" />
              </div>
              <p className="text-lg font-semibold text-center pt-5">
                Air Conditioner Information
              </p>
            </Link>
          </div>
          <div className="bg-[#F59B07] py-6 rounded-lg">
            <Link to={"/details/Heater"}>
              <div className="flex justify-center">
                <img src={logo1} alt="logo" />
              </div>
              <p className="text-lg font-semibold text-center pt-5">
                Heater Information
              </p>
            </Link>
          </div>
          <div className="bg-[#F59B07] py-6 rounded-lg">
            <Link to={"/details/WaterPump"}>
              <div className="flex justify-center">
                <img src={logo1} alt="logo" />
              </div>
              <p className="text-lg font-semibold text-center pt-5">
                Water Pump Information
              </p>
            </Link>
          </div>
          <div className="bg-[#F59B07] py-6 rounded-lg">
            <Link to={"/details/Washer"}>
              <div className="flex justify-center">
                <img src={logo1} alt="logo" />
              </div>
              <p className="text-lg font-semibold text-center pt-5">
                Washer Information
              </p>
            </Link>
          </div>
          <div className="bg-[#F59B07] py-6 rounded-lg">
            <Link to={"/details/WaterHeater"}>
              <div className="flex justify-center">
                <img src={logo1} alt="logo" />
              </div>
              <p className="text-lg font-semibold text-center pt-5">
                Water Heater Information
              </p>
            </Link>
          </div>
          <div className="bg-[#F59B07] py-6 rounded-lg">
            <Link to={"/details/Toilet"}>
              <div className="flex justify-center">
                <img src={logo1} alt="logo" />
              </div>
              <p className="text-lg font-semibold text-center pt-5">
                Toilet Information
              </p>
            </Link>
          </div>
          <div className="bg-[#F59B07] py-6 rounded-lg">
            <Link to={"/details/TVInfo"}>
              <div className="flex justify-center">
                <img src={logo1} alt="logo" />
              </div>
              <p className="text-lg font-semibold text-center pt-5">
                TV Information
              </p>
            </Link>
          </div>
          <div className="bg-[#F59B07] py-6 rounded-lg">
            <Link to={"/details/Dryer"}>
              <div className="flex justify-center">
                <img src={logo1} alt="logo" />
              </div>
              <p className="text-lg font-semibold text-center pt-5">
                Dryer Information
              </p>
            </Link>
          </div>
          <div className="bg-[#F59B07] py-6 rounded-lg">
            <Link to={"/details/Exhaust"}>
              <div className="flex justify-center">
                <img src={logo1} alt="logo" />
              </div>
              <p className="text-lg font-semibold text-center pt-5">
                Exhaust Fans Information
              </p>
            </Link>
          </div>
          <div className="bg-[#F59B07] py-6 rounded-lg">
            <Link to={"/details/VentFans"}>
              <div className="flex justify-center">
                <img src={logo1} alt="logo" />
              </div>
              <p className="text-lg font-semibold text-center pt-5">
                Vent Fans Information
              </p>
            </Link>
          </div>
          <div className="bg-[#F59B07] py-6 rounded-lg">
            <Link to={"/details/Dishwasher"}>
              <div className="flex justify-center">
                <img src={logo1} alt="logo" />
              </div>
              <p className="text-lg font-semibold text-center pt-5">
                Dishwasher Information
              </p>
            </Link>
          </div>

          <div className="bg-[#F59B07] py-6 rounded-lg">
            <Link to={"/details/Celling"}>
              <div className="flex justify-center">
                <img src={logo1} alt="logo" />
              </div>
              <p className="text-lg font-semibold text-center pt-5">
                Celling Fans Information
              </p>
            </Link>
          </div>

          <div className="bg-[#F59B07] py-6 rounded-lg">
            <Link to={"/details/DVD"}>
              <div className="flex justify-center">
                <img src={logo1} alt="logo" />
              </div>
              <p className="text-lg font-semibold text-center pt-5">
                DVD Information
              </p>
            </Link>
          </div>

          <div className="bg-[#F59B07] py-6 rounded-lg">
            <Link to={"/details/GPS"}>
              <div className="flex justify-center">
                <img src={logo1} alt="logo" />
              </div>
              <p className="text-lg font-semibold text-center pt-5">
                {" "}
                GPS Information
              </p>
            </Link>
          </div>
          <div className="bg-[#F59B07] py-6 rounded-lg">
            <Link to={"/details/Outdoor"}>
              <div className="flex justify-center">
                <img src={logo1} alt="logo" />
              </div>
              <p className="text-lg font-semibold text-center pt-5">
                Outdoor Radio Information
              </p>
            </Link>
          </div>
          <div className="bg-[#F59B07] py-6 rounded-lg">
            <Link to={"/details/Surround"}>
              <div className="flex justify-center">
                <img src={logo1} alt="logo" />
              </div>
              <p className="text-lg font-semibold text-center pt-5">
                Surround Sound Information
              </p>
            </Link>
          </div>

          <div className="bg-[#F59B07] py-6 rounded-lg">
            <Link to={"/details/Internet_Satellite"}>
              <div className="flex justify-center">
                <img src={logo1} alt="logo" />
              </div>
              <p className="text-lg font-semibold text-center pt-5">
                Internet/Satellite Information
              </p>
            </Link>
          </div>
          <div className="bg-[#F59B07] py-6 rounded-lg">
            <Link to={"/details/Router"}>
              <div className="flex justify-center">
                <img src={logo1} alt="logo" />
              </div>
              <p className="text-lg font-semibold text-center pt-5">
                Router Information
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HavcApplication;
