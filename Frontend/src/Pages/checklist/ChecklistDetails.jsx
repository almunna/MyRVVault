import { Checkbox, message } from "antd";
import React from "react";
import { RiDeleteBinLine } from "react-icons/ri";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  useDeleteCheckListMutation,
  useGetSingleCheckListQuery,
  useUpdateCheckListMutation,
} from "../redux/api/routesApi";

const ChecklistDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: singleChecklistData,
    isLoading,
    isError,
  } = useGetSingleCheckListQuery({ id });

  const [completeAll] = useDeleteCheckListMutation();
  const [checkUpdateStatusAndDelete] = useUpdateCheckListMutation();

  if (isLoading) {
    return <div className="text-center text-[#F59B07] py-10">Loading...</div>;
  }

  if (isError || !singleChecklistData?.data) {
    return <div className="text-center text-white">No data.</div>;
  }

  const checklist = singleChecklistData.data;


  const handleStatusChange = async (itemId, checked, itemName) => {
    try {
      const payload = {
        itemOperations: [
          {
            action: "update",
            itemId: itemId,
            updates: { name: itemName, status: checked },
          },
        ],
      };

      const res = await checkUpdateStatusAndDelete({
        id,
        data: payload,
      }).unwrap();

      message.success(res?.message || "Status updated successfully!");
    } catch (err) {
      message.error(err?.data?.message || "Failed to update status");
    }
  };

 
  const handleDeleteItem = async (itemId) => {
    try {
      const payload = {
        itemOperations: [
          {
            action: "remove",
            itemId: itemId,
          },
        ],
      };

      const res = await checkUpdateStatusAndDelete({
        id,
        data: payload,
      }).unwrap();

      message.success(res?.message || "Item deleted successfully!");
    } catch (err) {
      message.error(err?.data?.message || "Failed to delete item");
    }
  };

  // ✅ Complete button
  const handleComplete = async () => {
    
    try {
      const res = await completeAll({id, data: {status:'false'}}).unwrap();
      message.success(res?.message);
      navigate("/checklist");
    } catch (err) {
      message.error(err?.data?.message);
    }
  };

  return (
    <div className="container m-auto py-8">
      <div className="text-[#F59B07]">
        <h1 className="mb-11 flex justify-between items-center">
          <span className="font-semibold text-2xl">{checklist.title}</span>
          <Link to={`/addItems/${id}`}>
            <button className="border border-[#F9B038] py-2 px-5 text-[#F9B038] rounded-md font-medium">
              Add Item
            </button>
          </Link>
        </h1>

        <div className="max-w-4xl mx-auto space-y-4">
          {checklist.items.map((item) => (
            <div
              key={item._id}
              className="flex justify-between border-b border-b-slate-500 pb-4 items-center"
            >
              <Checkbox
                className="text-[#F59B07]"
                defaultChecked={item.status}
                onChange={(e) =>
                  handleStatusChange(item._id, e.target.checked, item.name)
                }
              >
                {item.name}
              </Checkbox>

              <RiDeleteBinLine
                className="text-xl cursor-pointer hover:text-red-500 transition"
                onClick={() => handleDeleteItem(item._id)}
              />
            </div>
          ))}

          <button
            onClick={handleComplete}
            type="button"
            className="w-full text-black bg-[#F9B038] py-2 rounded mt-6"
          >
            Complete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChecklistDetails;
