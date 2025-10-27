"use client";
import { useEffect, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { useRouter } from "next/navigation";

export default function TripSheet() {
  const router = useRouter();

  const [driverData, setDriverData] = useState<any>(null);

  // Trip fields
  const [tripDate, setTripDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [odometerStart, setOdometerStart] = useState("");
  const [odometerEnd, setOdometerEnd] = useState("");

  // Signatures
  const driverSign = useRef<SignatureCanvas | null>(null);
  const passengerSign = useRef<SignatureCanvas | null>(null);

  useEffect(() => {
    const details = JSON.parse(localStorage.getItem("driverDetails") || "{}");
    setDriverData(details);

    const now = new Date();
    setTripDate(now.toISOString().split("T")[0]);
    setStartTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  }, []);

  const handleSave = () => {
    if (!odometerStart || !odometerEnd || !startLocation || !endLocation) {
      alert("Please fill all trip details");
      return;
    }

    const driverSignature = driverSign.current?.getTrimmedCanvas().toDataURL();
    const passengerSignature = passengerSign.current?.getTrimmedCanvas().toDataURL();

    const fullTripData = {
      ...driverData,
      tripDate,
      startTime,
      endTime,
      startLocation,
      endLocation,
      odometerStart,
      odometerEnd,
      driverSignature,
      passengerSignature,
    };

    localStorage.setItem("tripSheet", JSON.stringify(fullTripData));
    router.push("/validate-trip");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center px-4 py-6">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md space-y-6">
        <h1 className="text-2xl font-semibold text-center mb-4">Trip Sheet</h1>

        {/* Driver & Vehicle Info */}
        {driverData && (
          <div className="space-y-1 text-sm">
            <p><strong>Mobile:</strong> {driverData.mobile}</p>
            <p><strong>Driver:</strong> {driverData.driverName}</p>
            <p><strong>Vehicle:</strong> {driverData.vehicleNo}</p>
            <p><strong>Corporate:</strong> {driverData.corporateName}</p>
          </div>
        )}

        {/* Start Trip Section */}
        <div>
          <h2 className="font-medium text-lg mb-2">Start Trip</h2>
          <input type="date" value={tripDate} onChange={e => setTripDate(e.target.value)} className="border rounded-lg w-full px-4 py-2 mb-2" />
          <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="border rounded-lg w-full px-4 py-2 mb-2" />
          <input type="text" placeholder="Start Location" value={startLocation} onChange={e => setStartLocation(e.target.value)} className="border rounded-lg w-full px-4 py-2 mb-2" />
          <input type="number" placeholder="Start Odometer" value={odometerStart} onChange={e => setOdometerStart(e.target.value)} className="border rounded-lg w-full px-4 py-2" />
        </div>

        {/* End Trip Section */}
        <div>
          <h2 className="font-medium text-lg mb-2">End Trip</h2>
          <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="border rounded-lg w-full px-4 py-2 mb-2" />
          <input type="text" placeholder="End Location" value={endLocation} onChange={e => setEndLocation(e.target.value)} className="border rounded-lg w-full px-4 py-2 mb-2" />
          <input type="number" placeholder="End Odometer" value={odometerEnd} onChange={e => setOdometerEnd(e.target.value)} className="border rounded-lg w-full px-4 py-2" />
        </div>

        {/* Signatures */}
        <div>
          <h2 className="font-medium text-lg mb-2">Signatures</h2>
          <p className="text-sm">Driver Signature</p>
          <SignatureCanvas ref={driverSign} penColor="black" canvasProps={{ width: 300, height: 100, className: "border rounded-md mb-4" }} />
          <p className="text-sm">Passenger Signature</p>
          <SignatureCanvas ref={passengerSign} penColor="black" canvasProps={{ width: 300, height: 100, className: "border rounded-md" }} />
        </div>

        <button onClick={handleSave} className="bg-blue-600 text-white w-full rounded-lg py-3 font-medium hover:bg-blue-700 transition">
          Validate & Review
        </button>
      </div>
    </div>
  );
}
