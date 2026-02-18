import React from 'react'
import car from '../../assets/Home/car.png'
import { Link } from 'react-router-dom';
const TripDetails = () => {
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
                status: "Never miss a service again. Get reminders, log expenses, and store important documents — so you can focus on the adventure, not the admin.",
                image: car,
            },
         
    
        ];
  return (
    <div className='container m-auto'>
            <div className=' py-2'>
                <h1 className="text-xl font-semibold ">Details of the Trip</h1>
                
            </div>
            <div className="  ">
                {rvData.map((rv) => (
                    <div
                        key={rv.id}
                        className="grid grid-cols-2 bg-[#F9B038] border-b gap-4 p-8  "
                    >
                        <img
                            src={rv.image}
                            alt={rv.name}
                            className="w-full h-[50vh] object-cover rounded"
                        />
                        <div className=" ">
                            <div className="text-xl py-2 font-semibold text-gray-900 ">
                                <p>
                                    {rv.name}
                                </p>

                            </div>
                            
                            <p className=" text-gray-500">{rv.vin}</p>
                            <p className=" text-gray-500">{rv.serial}</p>

                            <div className="text-sm text-gray-900 space-y-1">
                                <p>
                                    <span className="font-semibold">RV Name :</span> {rv.name}
                                </p>
                                <p>
                                    <span className="font-semibold">VIN Number :</span> {rv.vin}
                                    <span className="ml-20 font-semibold">Serial / ID Number :</span> {rv.serial}
                                </p>
                                <p>
                                    <span className="font-semibold">RV Name :</span> {rv.name}
                                    <span className="ml-20 font-semibold">Fuel Type :</span> {rv.fuelType}
                                </p>
                                <p>
                                    <span className="font-semibold">Size / Horsepower (HP) :</span> {rv.size}
                                    <span className="ml-20 font-semibold">Oil Filter Number :</span> {rv.oilFilter}
                                </p>
                                <p>
                                    <span className="font-semibold">Fuel Filter Number :</span> {rv.fuelFilter}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
  )
}

export default TripDetails