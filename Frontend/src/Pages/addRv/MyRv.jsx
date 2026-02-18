import React from "react";
import ss from "../../assets/Home/cc.jpg";
import { Link } from "react-router-dom";
import { imageUrl } from "../redux/api/baseApi";
import {useGetRvQuery } from "../redux/api/routesApi";

const MyRv = () => {
  const { data, isLoading, isError } = useGetRvQuery();
  console.log(data);

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Something went wrong!</p>;

 
  //d
  return (
    <div className="container m-auto  py-8  px-3 lg:px-0">
      <div className="flex justify-between">
        <h1 className="text-3xl font-semibold text-[#F9B038] mb-6">
          My RVs
        </h1>
       
      </div>
      <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4">
        {data?.data?.map((item) => (
          <div
            key={item._id}
            className="bg-[#F59B07] py-4 w-full rounded gap-8 px-4"
          >
            <div className="text-gray-800 space-y-2 font-semibold">
              {/* Image show only if exists */}
             

              {item.nickname && (
                <div className="gap-4">
                  <span>Nickname :</span>
                  <span className="font-normal">{item.nickname}</span>
                </div>
              )}

              {item.manufacturer && (
                <div className="gap-4">
                  <span>Manufacturer :</span>
                  <span className="font-normal">{item.manufacturer}</span>
                </div>
              )}

              {item.model && (
                <div className="gap-4">
                  <span>Model :</span>
                  <span className="font-normal">{item.model}</span>
                </div>
              )}

          {item.lastMaintenanceCheck && (
                <div className="gap-4">
                  <span>Last Maintenance Check :</span>
                  <span className="font-normal">
                    {new Date(item.lastMaintenanceCheck).toLocaleDateString()}
                  </span>
                </div>
              )}

              {item.dateOfPurchase && (
                <div className="gap-4">
                  <span>Date Of Purchase :</span>
                  <span className="font-normal">
                    {new Date(item.dateOfPurchase).toLocaleDateString()}
                  </span>
                </div>
              )}

              {/* Phone Number */}
              {item.modelName && (
                <div className="gap-4">
                  <span>Model Name :</span>
                  <span className="font-normal">{item.modelName}</span>
                </div>
              )}

               {item.modelYear && (
                <div className="gap-4">
                  <span>Model Year :</span>
                  <span className="font-normal">{item.modelYear}</span>
                </div>
              )}

                {item.exteriorColorScheme && (
                <div className="gap-4">
                  <span>Exterior Color Scheme :</span>
                  <span className="font-normal">{item.exteriorColorScheme}</span>
                </div>
              )}

  {item.floorplan && (
                <div className="gap-4">
                  <span>Floorplan :</span>
                  <span className="font-normal">{item.floorplan}</span>
                </div>
              )}

        {item.overdueMaintenanceCount && (
                <div className="gap-4">
                  <span>Overdue Maintenance Count :</span>
                  <span className="font-normal">{item.overdueMaintenanceCount}</span>
                </div>
              )}
              {item.phoneNumber && (
                <div className="gap-4">
                  <span>Phone Number :</span>
                  <span className="font-normal">{item.phoneNumber}</span>
                </div>
              )}{item.purchasedFrom && (
                <div className="gap-4">
                  <span>Purchased From :</span>
                  <span className="font-normal">{item.purchasedFrom}</span>
                </div>
              )}
              {item.state && (
                <div className="gap-4">
                  <span>State :</span>
                  <span className="font-normal">{item.state}</span>
                </div>
              )}
              {item.vinNumber && (
                <div className="gap-4">
                  <span>VIN Number :</span>
                  <span className="font-normal">{item.vinNumber}</span>
                </div>
              )}
              {item.currentMileage && (
                <div className="gap-4">
                  <span>Current Mileage :</span>
                  <span className="font-normal">{item.currentMileage}</span>
                </div>
              )}
              {item.condition && (
                <div className="gap-4">
                  <span>Condition :</span>
                  <span className="font-normal">{item.condition}</span>
                </div>
              )}
              {item.class && (
                <div className="gap-4">
                  <span>Class :</span>
                  <span className="font-normal">{item.class}</span>
                </div>
              )}
              {item.amountPaid && (
                <div className="gap-4">
                  <span>Amount Paid :</span>
                  <span className="font-normal"> ${Number(item.amountPaid).toLocaleString()}</span>
                </div>
              )}

              {item.location && (
                <div className="gap-4">
                  <span>Location :</span>
                  <span className="font-normal">{item.location}</span>
                </div>
              )}

              {/* Policy Number */}
              {item.policyNumber && (
                <div className="gap-4">
                  <span>Policy Number :</span>
                  <span className="font-normal">{item.policyNumber}</span>
                </div>
              )}

              {/* Cost */}
              {item.cost && (
                <div className="gap-4">
                  <span>Cost :</span>
                  <span className="font-normal"> ${Number(item.cost).toLocaleString()}</span>
                </div>
              )}

               {item.length && (
                <div className="gap-4">
                  <span>Length :</span>
                  <span className="font-normal">{item.length}</span>
                </div>
              )}

               {item.weight && (
                <div className="gap-4">
                  <span>Weight :</span>
                  <span className="font-normal">{item.weight}</span>
                </div>
              )}

               {item.height && (
                <div className="gap-4">
                  <span>Height :</span>
                  <span className="font-normal">{item.height}</span>
                </div>
              )}

 {item.weight && (
                <div className="gap-4">
                  <span>Weight :</span>
                  <span className="font-normal">{item.weight}</span>
                </div>
              )}
              {/* Notes */}
              {item.note && (
                <div className="gap-4">
                  <span>Notes :</span>
                  <span className="font-normal">{item.note}</span>
                </div>
              )}
            </div>

          
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyRv;
