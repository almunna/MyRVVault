import {
  Button,
  ConfigProvider,
  DatePicker,
  Form,
  Input,
  message,
  Select,
} from "antd";
import Dragger from "antd/es/upload/Dragger";
import React, { useState } from "react";
import {
  DeleteOutlined,
  EyeOutlined,
  HeartOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import AddReports from "./AddReports";
import { Link } from "react-router-dom";
import { BsHeartFill } from "react-icons/bs";
import { imageUrl } from "../redux/api/baseApi";
import {
  useAddFavouriteReportsMutation,
  useDeleteReportsMutation,
  useGetReportsQuery,
} from "../redux/api/routesApi";
dayjs.extend(customParseFormat);
const dateFormat = "YYYY-MM-DD";
const props = {
  name: "images",
  multiple: true,
  beforeUpload: () => false,
  onDrop(e) {
    console.log("Dropped files", e.dataTransfer.files);
  },
};
const Reports = () => {
  const { data, isLoading, isError } = useGetReportsQuery();
  console.log(data);
  const [deleteInsurance] = useDeleteReportsMutation();
  const [favourite] = useAddFavouriteReportsMutation();
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

  const handleFavourite = async (id) => {
    console.log(id);
    try {
      const res = await favourite(id).unwrap();
      message.success(res?.message);
    } catch (err) {
      message.error(err?.data?.message);
    }
  };
  return (
    <div className="container m-auto  py-8 px-3 lg:px-0">
      <div className="flex justify-between">
        <h1 className="text-3xl font-semibold text-[#F9B038] mb-6">Reports</h1>{" "}
        <div>
          <Link to={"/addReports"}>
            <button className="border border-[#F9B038] py-2 px-5 text-[#F9B038] rounded-md  font-medium ">
              Add Report
            </button>
          </Link>
        </div>
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
                    alt={item.insuranceCompany || "Insurance"}
                  />
                </div>
              )}
              {item.reportTitle && (
                <div className="gap-4">
                  <span>Report Title :</span>
                  <span className="font-normal">{item.reportTitle}</span>
                </div>
              )}
              {item.component && (
                <div className="gap-4">
                  <span>Component :</span>
                  <span className="font-normal">{item.component}</span>
                </div>
              )}
              {item.odometerReading && (
                <div className="gap-4">
                  <span>Odometer Reading :</span>
                  <span className="font-normal">{item.odometerReading}</span>
                </div>
              )}
              {/* Effective Date */}
              {item.dateOfService && (
                <div className="gap-4">
                  <span>Date Of Service :</span>
                  <span className="font-normal">
                    {new Date(item.dateOfService).toLocaleDateString()}
                  </span>
                </div>
              )}
              {item.area && (
                <div className="gap-4">
                  <span>Area :</span>
                  <span className="font-normal">{item.area}</span>
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

              <Link to={`/updateReports/${item._id}`}>
                <button className="border border-black py-1 px-5 rounded-md font-medium">
                  Update
                </button>
              </Link>

              {/* Favourite Button */}
              <button
                onClick={() => handleFavourite(item?._id)}
                className="border py-1 px-5 border-black rounded-md font-medium flex items-center justify-center"
              >
                {item.isFavorite ? (
                  <BsHeartFill className="text-red-500" />
                ) : (
                  <HeartOutlined className="text-gray-600" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;
