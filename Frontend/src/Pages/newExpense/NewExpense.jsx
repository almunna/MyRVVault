import React from "react";
import ss from "../../assets/Home/ss.jpg";
import { Link } from "react-router-dom";
import { useDeleteExpenseMutation, useGetExpenseQuery } from "../redux/api/routesApi";
import { message } from "antd";
const NewExpense = () => {
    const { data } = useGetExpenseQuery();
  const [deleteData] = useDeleteExpenseMutation();
  const handleDelete = async (id) => {
    console.log(id);
    try {
      const res = await deleteData(id).unwrap();
      message.success(res?.message);
    } catch (err) {
      message.error(err?.data?.message);
    }
  };
  return (
    <div className="container m-auto  py-8 px-3 lg:px-0">
      <div className="flex justify-between">
        <h1 className="text-3xl font-semibold text-[#F9B038] mb-6">
          New Expense
        </h1>
        <Link to={"/addNewExpense"}>
          {" "}
          <button className=" border border-[#F9B038] py-2 px-5 text-[#F9B038] rounded-md  font-medium ">
            Add New Expense
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
                    className="w-full rounded object-cover"
                    src={`${item.images[0]}`}
                    alt={item.name || "Insurance"}
                  />
                </div>
              )}
               {item.expenseType && (
                <div className="gap-4">
                  <span>Expense Type :</span>
                  <span className="font-normal">{item.expenseType}</span>
                </div>
              )}
              {item.vendor && (
                <div className="gap-4">
                  <span>Vendor :</span>
                  <span className="font-normal">{item.vendor}</span>
                </div>
              )}
              {/* Website Link */}
              {item.cityOrState && (
                <div className="gap-4">
                  <span>City / State :</span>
                  <span className="font-normal">{item.cityOrState}</span>
                </div>
              )}

              {/* Phone Number */}
              {item.dateOfPurchase && (
                <div className="gap-4">
                  <span>Date Of Purchase :</span>
                  <span className="font-normal">{item.dateOfPurchase}</span>
                </div>
              )}

              {/* Effective Date */}
              {item.date && (
                <div className="gap-4">
                  <span>Date :</span>
                  <span className="font-normal">
                    {new Date(item.date).toLocaleDateString()}
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
              {item.qty && (
                <div className="gap-4">
                  <span>QTY :</span>
                  <span className="font-normal">{item.qty}</span>
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

              {/* Notes */}
              {item.notes && (
                <div className="gap-4">
                  <span>Notes :</span>
                  <span className="font-normal">{item.notes}</span>
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
              <Link to={`/updateNewExpense/${item._id}`}>
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

export default NewExpense;
