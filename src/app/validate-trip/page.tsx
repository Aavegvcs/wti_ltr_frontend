"use client";
import { useEffect, useState } from "react";

export default function ValidateTrip() {
  const [tripData, setTripData] = useState<any>(null);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("tripSheet") || "{}");
    setTripData(data);
  }, []);

  if (!tripData) return <p className="text-center mt-10">Loading...</p>;

  const handleFinalSubmit = () => {
    console.log("Submitting Trip:", tripData);
    alert("Trip submitted successfully!");
    localStorage.removeItem("tripSheet");
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-semibold text-center mb-4">Validate Trip</h1>

        <div className="text-sm space-y-2">
          <p><strong>Driver:</strong> {tripData.driverName}</p>
          <p><strong>Mobile:</strong> {tripData.mobile}</p>
          <p><strong>Corporate:</strong> {tripData.corporateName}</p>
          <p><strong>Vehicle:</strong> {tripData.vehicleNo}</p>
          <p><strong>Start Location:</strong> {tripData.startLocation}</p>
          <p><strong>End Location:</strong> {tripData.endLocation}</p>
          <p><strong>Start Time:</strong> {tripData.startTime}</p>
          <p><strong>End Time:</strong> {tripData.endTime}</p>
          <p><strong>Odometer Start:</strong> {tripData.odometerStart}</p>
          <p><strong>Odometer End:</strong> {tripData.odometerEnd}</p>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <p className="font-medium text-sm mb-1">Driver Signature:</p>
            <img src={tripData.driverSignature} alt="Driver Signature" className="border rounded-md" />
          </div>
          <div>
            <p className="font-medium text-sm mb-1">Passenger Signature:</p>
            <img src={tripData.passengerSignature} alt="Passenger Signature" className="border rounded-md" />
          </div>
        </div>

        <button onClick={handleFinalSubmit} className="bg-green-600 text-white w-full mt-6 py-3 rounded-lg font-medium hover:bg-green-700">
          Submit Trip Sheet
        </button>
      </div>
    </div>
  );
}
