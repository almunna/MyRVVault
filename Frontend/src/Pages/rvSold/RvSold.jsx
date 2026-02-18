import React from "react";
import ss from "../../assets/Home/ss.jpg";
import { Link } from "react-router-dom";
import { useGetSellRvQuery } from "../redux/api/routesApi";
const RvSold = () => {
  const { data, isLoading, isError } = useGetSellRvQuery();
  console.log(data);
  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Something went wrong!</p>;

  return (
    <div className="container m-auto py-8 px-3 lg:px-0">
      <div className="flex justify-between">
        <h1 className="text-3xl font-semibold text-[#F9B038] mb-6">Sell RV</h1>
        <Link to={"/addSoldRv"}>
          {" "}
          <button className=" border border-[#F9B038] py-2 px-5 text-[#F9B038] rounded-md  font-medium ">
            New RV
          </button>
        </Link>
      </div>
      <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4">
        {data?.soldRvs?.map((item) => (
          <div
            key={item._id}
            className="bg-[#F59B07] py-4 w-full rounded gap-8 px-4"
          >
            <div className="text-gray-800 space-y-2 font-semibold">
              {/* Image show only if exists */}
              {item.images?.length > 0 && (
                <div className="flex justify-center">
                  <img
                    className="w-full h-[280px] rounded object-cover"
                    src={`${item.images[0]}`}
                    alt={item.insuranceCompany || "Insurance"}
                  />
                </div>
              )}
              {item.sellingPrice && (
                <div className="gap-4">
                  <span>Selling Price :</span>
                  <span className="font-normal">{item.sellingPrice}</span>
                </div>
              )}
              {item.modelNumber && (
                <div className="gap-4">
                  <span>Model Number :</span>
                  <span className="font-normal">{item.modelNumber}</span>
                </div>
              )}
              {/* Effective Date */}
              {item.sellingDate && (
                <div className="gap-4">
                  <span>Selling Date :</span>
                  <span className="font-normal">
                    {new Date(item.sellingDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              {item.name && (
                <div className="gap-4">
                  <span>Rv Type :</span>
                  <span className="font-normal">{item.name}</span>
                </div>
              )}

              {/* Website Link */}
              {item.websiteLink && (
                <div className="gap-4">
                  <span>Website Link :</span>
                  <Link to={item.websiteLink}>
                    <span className="font-normal">{item.websiteLink}</span>
                  </Link>
                </div>
              )}

              {/* Phone Number */}
              {item.phoneNumber && (
                <div className="gap-4">
                  <span>Phone Number :</span>
                  <span className="font-normal">{item.phoneNumber}</span>
                </div>
              )}

              {/* Effectie Date */}
              {item.effectiveDate && (
                <div className="gap-4">
                  <span>Effective Date :</span>
                  <span className="font-normal">
                    {new Date(item.effectiveDate).toLocaleDateString()}
                  </span>
                </div>
              )}

              {/* Renewal Date */}
              {item.renewalDate && (
                <div className="gap-4">
                  <span>Renewal Date :</span>
                  <span className="font-normal">
                    {new Date(item.renewalDate).toLocaleDateString()}
                  </span>
                </div>
              )}

              {/* Policy Number */}
              {item.sellingMileage && (
                <div className="gap-4">
                  <span>Selling Mileage :</span>
                  <span className="font-normal">{item.sellingMileage}</span>
                </div>
              )}

              {/* Cost */}
              {item.cost && (
                <div className="gap-4">
                  <span>Cost :</span>
                  <span className="font-normal">
                    {" "}
                    ${Number(item.cost).toLocaleString()}
                  </span>
                </div>
              )}

              {/* Notes */}
              {item.notes && (
                <div className="gap-4">
                  <span>Notes :</span>
                  <span className="font-normal">{item.notes}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RvSold;
