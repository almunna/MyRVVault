import React from "react";
import car from "../../assets/Home/car.png";
import car1 from "../../assets/Home/car1.png";
import car2 from "../../assets/Home/car2.png";
const ViewAllTrip = () => {
  const rvData = [
    {
      id: 1,
      name: "Winnebago Minnie 2500FL",
      vin: "UK",
      serial: "542151",
      fuelType: "Gasoline",
      size: "27ft / 400 HP",
      oilFilter: "OF-1234",
      fuelFilter: "FF-5678",
      status:
        "Never miss a service again. Get reminders, log expenses, and store important documents — so you can focus on the adventure, not the admin.",
      image: car,
    },
    {
      id: 2,
      name: "Winnebago Minnie 2500FL",
      vin: "Canada",
      serial: "542151",
      fuelType: "Gasoline",
      size: "27ft / 400 HP",
      oilFilter: "OF-1234",
      fuelFilter: "FF-5678",
      status:
        "Never miss a service again. Get reminders, log expenses, and store important documents — so you can focus on the adventure, not the admin.",
      image: car1,
    },
    {
      id: 3,
      name: "Winnebago Minnie 2500FL",
      vin: "USA",
      serial: "542151",
      fuelType: "Gasoline",
      size: "27ft / 400 HP",
      oilFilter: "OF-1234",
      fuelFilter: "FF-5678",
      status:
        "Never miss a service again. Get reminders, log expenses, and store important documents — so you can focus on the adventure, not the admin.",
      image: car2,
    },
    {
      id: 4,
      name: "Winnebago Minnie 2500FL",
      vin: "USA",
      serial: "542151",
      fuelType: "Gasoline",
      size: "27ft / 400 HP",
      oilFilter: "OF-1234",
      fuelFilter: "FF-5678",
      status:
        "Never miss a service again. Get reminders, log expenses, and store important documents — so you can focus on the adventure, not the admin.",
      image: car1,
    },
    {
      id: 4,
      name: "Winnebago Minnie 2500FL",
      vin: "USA",
      serial: "542151",
      fuelType: "Gasoline",
      size: "27ft / 400 HP",
      oilFilter: "OF-1234",
      fuelFilter: "FF-5678",
      status:
        "Never miss a service again. Get reminders, log expenses, and store important documents — so you can focus on the adventure, not the admin.",
      image: car1,
    },
    {
      id: 4,
      name: "Winnebago Minnie 2500FL",
      vin: "USA",
      serial: "542151",
      fuelType: "Gasoline",
      size: "27ft / 400 HP",
      oilFilter: "OF-1234",
      fuelFilter: "FF-5678",
      status:
        "Never miss a service again. Get reminders, log expenses, and store important documents — so you can focus on the adventure, not the admin.",
      image: car1,
    },
    {
      id: 4,
      name: "Winnebago Minnie 2500FL",
      vin: "USA",
      serial: "542151",
      fuelType: "Gasoline",
      size: "27ft / 400 HP",
      oilFilter: "OF-1234",
      fuelFilter: "FF-5678",
      status:
        "Never miss a service again. Get reminders, log expenses, and store important documents — so you can focus on the adventure, not the admin.",
      image: car1,
    },
    {
      id: 4,
      name: "Winnebago Minnie 2500FL",
      vin: "USA",
      serial: "542151",
      fuelType: "Gasoline",
      size: "27ft / 400 HP",
      oilFilter: "OF-1234",
      fuelFilter: "FF-5678",
      status:
        "Never miss a service again. Get reminders, log expenses, and store important documents — so you can focus on the adventure, not the admin.",
      image: car1,
    },
    {
      id: 4,
      name: "Winnebago Minnie 2500FL",
      vin: "USA",
      serial: "542151",
      fuelType: "Gasoline",
      size: "27ft / 400 HP",
      oilFilter: "OF-1234",
      fuelFilter: "FF-5678",
      status:
        "Never miss a service again. Get reminders, log expenses, and store important documents — so you can focus on the adventure, not the admin.",
      image: car1,
    },
  ];
  return (
    <div className="container m-auto">
      <div>
        <div className="flex justify-between py-2">
          <h1 className="text-xl font-semibold px-3 lg:px-0 text-[#F9B038]">
            Vew All Trip
          </h1>
        </div>
        <div className=" md:grid lg:grid-cols-4 md:grid-cols-2 gap-2">
          {rvData.map((rv) => (
            <div
              key={rv.id}
              className="flex border-b border-[#F9B038] gap-4 p-2  "
            >
              <img
                src={rv.image}
                alt={rv.name}
                className="w-[80px] h-[80px] object-cover rounded"
              />
              <div className=" ">
                <div className="text-lg font-semibold text-gray-900 ">
                  <p>{rv.name}</p>
                </div>

                <p className=" text-gray-500">{rv.vin}</p>
                <p className=" text-gray-500">{rv.serial}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ViewAllTrip;
