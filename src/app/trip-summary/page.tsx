"use client";
import { useEffect, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";

export default function TripSummary() {
  const [tripData, setTripData] = useState<any>(null);
  const driverSign = useRef<any>(null);
  const passengerSign = useRef<any>(null);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("tripEnd") || "{}");
    setTripData(data);
  }, []);

  const handleSave = () => {
    const driverSignature = driverSign.current.getTrimmedCanvas().toDataURL();
    const passengerSignature = passengerSign.current.getTrimmedCanvas().toDataURL();

    const finalData = { ...tripData, driverSignature, passengerSignature };
    console.log("Final Trip Data:", finalData);
    alert("Trip sheet saved successfully!");
  };

  if (!tripData) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-semibold text-center mb-4">
          Trip Summary
        </h1>
        <div className="text-sm space-y-2">
          <p><strong>Date:</strong> {tripData.tripDate}</p>
          <p><strong>Mobile:</strong> {tripData.mobile}</p>
          <p><strong>Start Location:</strong> {tripData.source}</p>
          <p><strong>End Location:</strong> {tripData.destination}</p>
          <p><strong>Start Time:</strong> {tripData.startTime}</p>
          <p><strong>End Time:</strong> {tripData.endTime}</p>
          <p><strong>Odometer Start:</strong> {tripData.odometerStart}</p>
          <p><strong>Odometer End:</strong> {tripData.odometerEnd}</p>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <p className="font-medium">Driver Signature:</p>
            <SignatureCanvas
              ref={driverSign}
              penColor="black"
              canvasProps={{
                width: 300,
                height: 100,
                className: "border border-gray-400 rounded-md",
              }}
            />
          </div>
          <div>
            <p className="font-medium">Passenger Signature:</p>
            <SignatureCanvas
              ref={passengerSign}
              penColor="black"
              canvasProps={{
                width: 300,
                height: 100,
                className: "border border-gray-400 rounded-md",
              }}
            />
          </div>

          <button
            onClick={handleSave}
            className="bg-blue-600 text-white w-full rounded-lg py-3 font-medium hover:bg-blue-700"
          >
            Save Trip Sheet
          </button>
        </div>
      </div>
    </div>
  );
}
