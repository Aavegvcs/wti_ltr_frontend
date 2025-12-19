"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useTripSheet } from "@/hooks/useTripSheet";
import { useState } from "react";

export default function ValidateTrip() {
  const sp = useSearchParams();
  const router = useRouter();
  const { submitTripSheet } = useTripSheet();

  const id = sp.get("id");

  const driverName = sp.get("driverName") || "";
  const mobile = sp.get("mobile") || "";
  const corporateName = sp.get("corporateName") || "";
  const branchName = sp.get("branchName") || "";
  const vehicleNumber = sp.get("vehicleNumber") || "";

  const tripDate = sp.get("tripDate") || "";
  const startTime = sp.get("startTime") || "";
  const endTime = sp.get("endTime") || "";
  const sourceName = sp.get("sourceName") || "";
  const destinationName = sp.get("destinationName") || "";
  const startOdometer = sp.get("startOdometer") || "";
  const endOdometer = sp.get("endOdometer") || "";
  const totalKm = sp.get("totalKm") || "";

  const driverSign = sp.get("driverSign") || "";
  const userSign = sp.get("userSign") || "";
  const driverSignLat = sp.get("driverSignLat") ;
  const driverSignLng = sp.get("driverSignLng");
  const userSignLat = sp.get("userSignLat");
  const userSignLng = sp.get("userSignLng");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await submitTripSheet({
        tripSheetId: Number(id),
        tripStatus: 1, // SUBMITTED
        tripDate,
        startTime,
        endTime,
        sourceName,
        destinationName,
        startOdometer,
        endOdometer,
        totalKm,      
        driverSign,
        userSign,
        driverSignLat: driverSignLat,
        driverSignLng: driverSignLng,
        userSignLat: userSignLat,
        userSignLng: userSignLng,
      });

      router.push("/success");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 pb-32">
      <div className="relative">
        <button
          onClick={() =>
            router.push(
              `/trip-sheet?mobile=${mobile}&driverName=${driverName}&corporateName=${corporateName}&branchName=${branchName}&vehicleNumber=${vehicleNumber}`
            )
          }
          className="absolute left-0 top-0 bg-gray-200 px-3 py-1 rounded text-sm"
        >
          Edit
        </button>
        <h1 className="text-xl font-bold text-center mb-4">
          Review Trip Details
        </h1>
      </div>

      <div className="bg-white p-5 rounded-xl shadow space-y-4 text-sm">
        <div className="flex justify-between">
          <span>Driver:</span>
          <span className="font-medium">{driverName}</span>
        </div>
        <div className="flex justify-between">
          <span>Mobile:</span>
          <span className="font-medium">{mobile}</span>
        </div>
        <div className="flex justify-between">
          <span>Corporate:</span>
          <span className="font-medium">{corporateName}</span>
        </div>
        <div className="flex justify-between">
          <span>Branch:</span>
          <span className="font-medium">{branchName}</span>
        </div>
        <div className="flex justify-between">
          <span>Vehicle:</span>
          <span className="font-medium">{vehicleNumber}</span>
        </div>

        <hr />

        <div className="flex justify-between">
          <span>Trip Date:</span>
          <span className="font-medium">{tripDate}</span>
        </div>
        <div className="flex justify-between">
          <span>Start Time:</span>
          <span className="font-medium">{startTime}</span>
        </div>
        <div className="flex justify-between">
          <span>End Time:</span>
          <span className="font-medium">{endTime}</span>
        </div>

        <hr />

        <div className="flex justify-between">
          <span>Start Location:</span>
          <span className="font-medium">{sourceName}</span>
        </div>
        <div className="flex justify-between">
          <span>End Location:</span>
          <span className="font-medium">{destinationName}</span>
        </div>

        <hr />

        <div className="flex justify-between">
          <span>Start Odometer:</span>
          <span className="font-medium">{startOdometer}</span>
        </div>
        <div className="flex justify-between">
          <span>End Odometer:</span>
          <span className="font-medium">{endOdometer}</span>
        </div>

        <div className="flex justify-between text-lg font-semibold">
          <span>Total KM:</span>
          <span>{totalKm}</span>
        </div>

        <hr />

        <div>
          <p className="font-medium">Driver Signature:</p>
          {driverSign ? (
            <img
              src={driverSign}
              alt="driver-sign"
              className="h-24 border rounded mt-2"
            />
          ) : (
            <p className="text-gray-500 text-xs">No signature uploaded</p>
          )}
        </div>

        <div className="pb-4">
          <p className="font-medium">Passenger Signature:</p>
          {userSign ? (
            <img
              src={userSign}
              alt="user-sign"
              className="h-24 border rounded mt-2"
            />
          ) : (
            <p className="text-gray-500 text-xs">No signature uploaded</p>
          )}
        </div>

        {error && <p className="text-red-600 text-center text-sm">{error}</p>}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-black text-white py-4 rounded-lg text-lg font-bold"
        >
          {loading ? "Submitting..." : "Submit Trip Sheet"}
        </button>
        <button
          onClick={() =>
            router.push(
              `/trip-sheet?mobile=${mobile}&driverName=${driverName}&corporateName=${corporateName}&branchName=${branchName}&vehicleNumber=${vehicleNumber}`
            )
          }
          className="w-full mt-2 border py-3 rounded-lg text-lg font-semibold"
        >
          Edit Trip
        </button>
      </div>
    </div>
  );
}
