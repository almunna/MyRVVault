import React from "react";
import ss from "../../assets/Home/rv.png";
import { Link } from "react-router-dom";
import {
  useDeleteInsuranceCompanyMutation,
  useDeleteMemberShipMutation,
  useGetMemberShipQuery,
} from "../redux/api/routesApi";
import { message } from "antd";
const AddMembership = () => {
  const { data, isLoading, isError } = useGetMemberShipQuery();
  console.log(data);
  const [deleteInsurance] = useDeleteMemberShipMutation();
  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Something went wrong!</p>;

  const handleDelete = async (id) => {
    console.log(id);
    try {
      const res = await deleteInsurance(id).unwrap();
      message.success(res?.message);
    } catch (err) {
      message.error(err?.data?.message);
    }
  };
  return (
    <div className="container m-auto py-8 px-3 lg:px-0">
      <div className="flex justify-between">
        <h1 className="text-3xl text-[#F9B038] font-semibold pb-6">
          Memberships
        </h1>
        <Link to={"/addMembershipForm"}>
          {" "}
          <button className=" border border-[#F9B038] py-2 px-5 text-[#F9B038] rounded-md  font-medium ">
            New Membership
          </button>
        </Link>
      </div>
      <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4">
        {data?.data?.map((item) => (
          <div
            key={item._id}
            className="bg-[#F59B07] py-4 w-full rounded gap-8 px-4"
          >
            <div className="text-gray-800 space-y-2 font-semibold">
              {/* Image show only if exists */}
              {item.images?.length > 0 && (
                <div className="flex justify-center">
                  <img
                    className="w-full rounded object-cover h-[300px]"
                    src={`${item.images[0]}`}
                    alt={item.insuranceCompany || "Insurance"}
                  />
                </div>
              )}

              {item.name && (
                <div className="gap-4">
                  <span>Name :</span>
                  <span className="font-normal"> {item.name}</span>
                </div>
              )}

              {/* Website Link */}
              {item.websiteLink && (
                <div className="gap-4">
                  <span>Website Link :</span>
                 <Link to={item.websiteLink}> <span className="font-normal"> {item.websiteLink}</span></Link>
                </div>
              )}

              {/* Phone Number */}
              {item.amountPaid && (
                <div className="gap-4">
                  <span className="">Amount :</span>
                  <span className="font-normal">
                    {" "}
                    ${Number(item.amountPaid).toLocaleString()}
                  </span>
                </div>
              )}

              {/* Effective Date */}
              {item.dateOfPurchase && (
                <div className="gap-4">
                  <span>Date Of Purchasee :</span>
                  <span className="font-normal">
                    {new Date(item.dateOfPurchase).toLocaleDateString()}
                  </span>
                </div>
              )}

              {/* Renewal Date */}
              {item.membershipExpirationDate && (
                <div className="gap-4">
                  <span>Membership Expiration Date :</span>
                  <span className="font-normal">
                    {new Date(
                      item.membershipExpirationDate
                    ).toLocaleDateString()}
                  </span>
                </div>
              )}

              {/* Policy Number */}
              {item.accountNo && (
                <div className="gap-4">
                  <span>Account No :</span>

                  <span className="font-normal">{item.accountNo}</span>
                </div>
              )}

              {item.phoneNo && (
                <div className="gap-4">
                  <span>Mobile No :</span>
                  <span className="font-normal cursor-pointer">{item.phoneNo}</span>
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
              {item.note && (
                <div className="gap-4">
                  <span>Notes :</span>
                  <span className="font-normal">{item.note}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => handleDelete(item?._id)}
                className="border py-1 px-5 border-black rounded-md font-medium"
              >
                Delete
              </button>
              <Link to={`/updateMembership/${item._id}`}>
                <button className="border border-black py-1 px-5 rounded-md font-medium">
                  Update
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddMembership;
