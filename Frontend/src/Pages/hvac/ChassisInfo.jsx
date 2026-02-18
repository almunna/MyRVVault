import React from "react";
import { Link } from "react-router-dom";
import {
  useDeleteChassisMutation,
  useGetChassisQuery,
} from "../redux/api/routesApi";
import { message } from "antd";
import { useGetProfileQuery } from "../redux/api/userApi";

const ChassisInfo = () => {
  const { data, isLoading, isError } = useGetChassisQuery();
  console.log(data);
  const { data: profileData } = useGetProfileQuery();
  console.log(profileData);
  const [deleteChassis] = useDeleteChassisMutation();

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Something went wrong!</p>;

 
  if (!data?.data) return <p>No chassis data available.</p>;

 
  const chassis = data.data;

  return (
    <div className="container m-auto">
      <div className="flex justify-between">
        <h1 className="text-3xl font-semibold text-[#F9B038] mb-6">
          Chassis Information
        </h1>
      </div>

      <div
        key={chassis._id}
        className="bg-[#F59B07] py-4 w-full rounded gap-8 px-4 mb-6"
      >
        <div className="text-gray-800 space-y-2 font-semibold">
          <div className="flex gap-4">
            <span>Name:</span>
            <span className="font-normal">{chassis.name || "N/A"}</span>
          </div>
          <div className="flex gap-4">
            <span>Manufacturer:</span>
            <span className="font-normal">{chassis.mfg || "N/A"}</span>
          </div>
          <div className="flex gap-4">
            <span>Fuel Type:</span>
            <span className="font-normal">{chassis.fuelType || "N/A"}</span>
          </div>

          <div className="flex gap-4">
            <span>Serial Id:</span>
            <span className="font-normal">{chassis.serialId || "N/A"}</span>
          </div>
          <div className="flex gap-4">
            <span>Model:</span>
            <span className="font-normal">{chassis.modelNo || "N/A"}</span>
          </div>

          <div className="flex gap-4">
            <span>Engine Model:</span>
            <span className="font-normal">{chassis.engineModel || "N/A"}</span>
          </div>

          <div className="flex gap-4">
            <span>Horsepower:</span>
            <span className="font-normal">{chassis.hp}</span>
          </div>

          {/* Belt */}
          <div>
            <h1 className="text-center text-xl pt-7 pb-2 font-normal">Belt</h1>
            {chassis.belt?.length > 0 ? (
              chassis.belt.map((belt) => (
                <div key={belt._id} className="flex gap-4">
                  <span>{belt?.name || 'No name'}</span>
                  <span className="font-normal">{belt.partNo || "N/A"}</span>
                </div>
              ))
            ) : (
              <p className="font-normal">No belt information available.</p>
            )}
          </div>

          {/* Oil Filter */}
          <div>
            <h1 className="text-center text-xl pt-7 pb-2 font-normal">
              Oil Filter
            </h1>
            {chassis.oilFilter?.length > 0 ? (
              chassis.oilFilter.map((oil) => (
                <div key={oil._id} className="flex gap-4">
                  <span>{oil?.name || 'No name'}</span>
                  <span className="font-normal">{oil.partNo || "N/A"}</span>
                </div>
              ))
            ) : (
              <p className="font-normal">
                No oil filter information available.
              </p>
            )}
          </div>

          {/* Fuel Filter */}
          <div>
            <h1 className="text-center text-xl pt-7 pb-2 font-normal">
              Fuel Filter
            </h1>
            {chassis.fuelFilter?.length > 0 ? (
              chassis.fuelFilter.map((fuel) => (
                <div key={fuel._id} className="flex gap-4">
                  <span>{fuel?.name || 'No name'}</span>
                  <span className="font-normal">{fuel.partNo || "N/A"}</span>
                </div>
              ))
            ) : (
              <p className="font-normal">
                No fuel filter information available.
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-3">
          {/* <button
            onClick={() => handleDelete(chassis._id)}
            className="border py-1 px-5 border-black rounded-md font-medium"
          >
            Delete
          </button> */}
          <Link to={`/chassisInfo/update-chassis/${chassis._id}`}>
            <button className="border border-black py-1 px-5 rounded-md font-medium">
              Update
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ChassisInfo;
