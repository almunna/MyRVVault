import { message } from "antd";
import React from "react";
import { Link } from "react-router-dom";
import { useDeleteCampMutation, useGetCampQuery } from "../redux/api/routesApi";

const ViewTrips = () => {
  const { data: campData, isLoading, isError } = useGetCampQuery();
const [deleteCamp] = useDeleteCampMutation()
  if (isLoading) {
    return <p className="text-center text-[#F9B038] text-xl">Loading trips...</p>;
  }

  if (isError) {
    return <p className="text-center text-red-500 text-xl">Failed to load trips!</p>;
  }

  const trips = campData?.data || [];

    const handleDelete = async (id) => {
    console.log(id);
    try {
      const res = await deleteCamp(id).unwrap();
      message.success(res?.message);
    } catch (err) {
      message.error(err?.data?.message);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-semibold text-[#F9B038]">View Trips</h1>
      </div>

      {trips.length === 0 ? (
        <p className="text-gray-500 text-center">No trips found!</p>
      ) : (
        <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-6">
          {trips.map((trip) => (
            <div
              key={trip._id}
              className="bg-[#F59B07] py-4 px-4 rounded-md text-gray-800 font-semibold space-y-2"
            >
              <div>
                <span>Trip Title: </span>
                <span className="font-normal">{trip.title}</span>
              </div>

              <div>
                <span>Start Date: </span>
                <span className="font-normal">
                  {trip.startDate ? new Date(trip.startDate).toLocaleDateString() : "N/A"}
                </span>
              </div>

              <div>
                <span>End Date: </span>
                <span className="font-normal">
                  {trip.endDate ? new Date(trip.endDate).toLocaleDateString() : "N/A"}
                </span>
              </div>

              {/* States & Status */}
              <div>
                <span>States: </span>
                <div className="pl-2 font-normal">
                  {trip.states?.map((s, idx) => (
                    <div key={idx} className="flex justify-between border-b border-black/10 py-1">
                      <span>{s.state}</span>
                      <span className="text-sm italic">{s.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span>Trip Type: </span>
                <span className="font-normal">{trip.tripType}</span>
              </div>

              <div>
                <span>Notes: </span>
                <span className="font-normal">{trip.description}</span>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2 mt-4">
                <button
                 onClick={() => handleDelete(trip?._id)}
                  className="border py-1 px-5 border-black rounded-md font-medium"
                >
                  Delete
                </button>
                <Link to={`/campgroundReview?tab=updateState&id=${trip._id}`}>
                  <button className="border border-black py-1 px-5 rounded-md font-medium">
                    Update
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewTrips;
