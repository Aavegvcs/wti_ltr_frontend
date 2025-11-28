// "use client";
// import { useEffect, useRef, useState } from "react";
// import SignatureCanvas from "react-signature-canvas";
// import { useRouter } from "next/navigation";

// export default function TripSheet() {
//   const router = useRouter();

//   const [driverData, setDriverData] = useState<any>(null);

//   // Trip fields
//   const [tripDate, setTripDate] = useState("");
//   const [startTime, setStartTime] = useState("");
//   const [endTime, setEndTime] = useState("");
//   const [startLocation, setStartLocation] = useState("");
//   const [endLocation, setEndLocation] = useState("");
//   const [odometerStart, setOdometerStart] = useState("");
//   const [odometerEnd, setOdometerEnd] = useState("");

//   // Signatures
//   const driverSign = useRef<SignatureCanvas | null>(null);
//   const passengerSign = useRef<SignatureCanvas | null>(null);

//   useEffect(() => {
//     const details = JSON.parse(localStorage.getItem("driverDetails") || "{}");
//     setDriverData(details);

//     const now = new Date();
//     setTripDate(now.toISOString().split("T")[0]);
//     setStartTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
//   }, []);

//   const handleSave = () => {
//     if (!odometerStart || !odometerEnd || !startLocation || !endLocation) {
//       alert("Please fill all trip details");
//       return;
//     }

//     const driverSignature = driverSign.current?.getTrimmedCanvas().toDataURL();
//     const passengerSignature = passengerSign.current?.getTrimmedCanvas().toDataURL();

//     const fullTripData = {
//       ...driverData,
//       tripDate,
//       startTime,
//       endTime,
//       startLocation,
//       endLocation,
//       odometerStart,
//       odometerEnd,
//       driverSignature,
//       passengerSignature,
//     };

//     localStorage.setItem("tripSheet", JSON.stringify(fullTripData));
//     router.push("/validate-trip");
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col items-center px-4 py-6">
//       <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md space-y-6">
//         <h1 className="text-2xl font-semibold text-center mb-4">Trip Sheet</h1>

//         {/* Driver & Vehicle Info */}
//         {driverData && (
//           <div className="space-y-1 text-sm">
//             <p><strong>Mobile:</strong> {driverData.mobile}</p>
//             <p><strong>Driver:</strong> {driverData.driverName}</p>
//             <p><strong>Vehicle:</strong> {driverData.vehicleNo}</p>
//             <p><strong>Corporate:</strong> {driverData.corporateName}</p>
//           </div>
//         )}

//         {/* Start Trip Section */}
//         <div>
//           <h2 className="font-medium text-lg mb-2">Start Trip</h2>
//           <input type="date" value={tripDate} onChange={e => setTripDate(e.target.value)} className="border rounded-lg w-full px-4 py-2 mb-2" />
//           <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="border rounded-lg w-full px-4 py-2 mb-2" />
//           <input type="text" placeholder="Start Location" value={startLocation} onChange={e => setStartLocation(e.target.value)} className="border rounded-lg w-full px-4 py-2 mb-2" />
//           <input type="number" placeholder="Start Odometer" value={odometerStart} onChange={e => setOdometerStart(e.target.value)} className="border rounded-lg w-full px-4 py-2" />
//         </div>

//         {/* End Trip Section */}
//         <div>
//           <h2 className="font-medium text-lg mb-2">End Trip</h2>
//           <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="border rounded-lg w-full px-4 py-2 mb-2" />
//           <input type="text" placeholder="End Location" value={endLocation} onChange={e => setEndLocation(e.target.value)} className="border rounded-lg w-full px-4 py-2 mb-2" />
//           <input type="number" placeholder="End Odometer" value={odometerEnd} onChange={e => setOdometerEnd(e.target.value)} className="border rounded-lg w-full px-4 py-2" />
//         </div>

//         {/* Signatures */}
//         <div>
//           <h2 className="font-medium text-lg mb-2">Signatures</h2>
//           <p className="text-sm">Driver Signature</p>
//           <SignatureCanvas ref={driverSign} penColor="black" canvasProps={{ width: 300, height: 100, className: "border rounded-md mb-4" }} />
//           <p className="text-sm">Passenger Signature</p>
//           <SignatureCanvas ref={passengerSign} penColor="black" canvasProps={{ width: 300, height: 100, className: "border rounded-md" }} />
//         </div>


//         <button onClick={handleSave} className="bg-blue-600 text-white w-full rounded-lg py-3 font-medium hover:bg-blue-700 transition">
//           Validate & Review
//         </button>
//       </div>
//     </div>
//   );
// }
// app/trip-sheet/page.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { useRouter } from "next/navigation";
import { useTripSheet } from "@/hooks/useTripSheet";

type Trip = any;

export default function TripSheetPage() {
  const router = useRouter();
  const { saveTripSheet } = useTripSheet();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [tripDate, setTripDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [odometerStart, setOdometerStart] = useState("");
  const [odometerEnd, setOdometerEnd] = useState("");
  const [saving, setSaving] = useState(false);

  const driverSign = useRef<SignatureCanvas | null>(null);
  const passengerSign = useRef<SignatureCanvas | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("currentTrip");
    if (!raw) {
      // if no trip in session -> redirect to driver entry
      router.push("/driver");
      return;
    }
    const data = JSON.parse(raw);
    setTrip(data);

    // prefill fields if backend returned defaults
    const now = new Date();
    setTripDate(data.tripDate ? new Date(data.tripDate).toISOString().split("T")[0] : now.toISOString().split("T")[0]);

    // prefer startTime from backend if provided
    setStartTime(data.startTime ?? now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    setEndTime(data.endTime ?? "");

    setStartLocation(data.sourceName ?? "");
    setEndLocation(data.destinationName ?? "");
    setOdometerStart((data as any).odometerStart ?? "");
    setOdometerEnd((data as any).odometerEnd ?? "");
  }, [router]);

  const handleSave = async () => {
    if (!trip) return alert("Trip data not loaded");
    if (!startLocation || !endLocation || !odometerStart || !odometerEnd) {
      return alert("Please fill all trip details");
    }

    try {
      setSaving(true);

      const driverSignature = driverSign.current?.isEmpty() ? null : driverSign.current?.getTrimmedCanvas().toDataURL();
      const passengerSignature = passengerSign.current?.isEmpty() ? null : passengerSign.current?.getTrimmedCanvas().toDataURL();

      // Build body mapping to backend entity fields
      const body: any = {
        startTime: startTime || null,
        endTime: endTime || null,
        sourceName: startLocation,
        destinationName: endLocation,
        odometerStart: odometerStart,
        odometerEnd: odometerEnd,
      };

      if (driverSignature) body.driverSign = driverSignature;
      if (passengerSignature) body.userSign = passengerSignature;

      // send PATCH to save/:id (id exists on trip)
      await saveTripSheet(Number(trip.id), body);

      const updatedTrip = { ...trip, ...body };
      // save updated trip in session storage for next pages
      sessionStorage.setItem("currentTrip", JSON.stringify(updatedTrip));
      setSaving(false);
      router.push("/validate-trip");
    } catch (err: any) {
      setSaving(false);
      console.error(err);
      alert("Failed to save trip: " + (err?.message ?? ""));
    }
  };

  if (!trip) return <p className="text-center mt-10">Loading trip...</p>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center px-4 py-6">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md space-y-6">
        <h1 className="text-2xl font-semibold text-center mb-4">Trip Sheet</h1>

        <div className="space-y-1 text-sm">
          <p><strong>Mobile:</strong> {trip.driver?.mobileNumber ?? trip.mobile ?? trip.driverMobile ?? trip.driver?.mobile}</p>
          <p><strong>Driver:</strong> {trip.driver?.name ?? trip.driverName ?? ""}</p>
          <p><strong>Vehicle:</strong> {trip.vehicle?.vehicleNumber ?? trip.vehicleNo ?? ""}</p>
          <p><strong>Corporate:</strong> {trip.corporate?.corporateName ?? trip.corporateName ?? ""}</p>
        </div>

        <div>
          <h2 className="font-medium text-lg mb-2">Start Trip</h2>
          <input type="date" value={tripDate} onChange={e => setTripDate(e.target.value)} className="border rounded-lg w-full px-4 py-2 mb-2" />
          <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="border rounded-lg w-full px-4 py-2 mb-2" />
          <input type="text" placeholder="Start Location" value={startLocation} onChange={e => setStartLocation(e.target.value)} className="border rounded-lg w-full px-4 py-2 mb-2" />
          <input type="number" placeholder="Start Odometer" value={odometerStart} onChange={e => setOdometerStart(e.target.value)} className="border rounded-lg w-full px-4 py-2" />
        </div>

        <div>
          <h2 className="font-medium text-lg mb-2">End Trip</h2>
          <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="border rounded-lg w-full px-4 py-2 mb-2" />
          <input type="text" placeholder="End Location" value={endLocation} onChange={e => setEndLocation(e.target.value)} className="border rounded-lg w-full px-4 py-2 mb-2" />
          <input type="number" placeholder="End Odometer" value={odometerEnd} onChange={e => setOdometerEnd(e.target.value)} className="border rounded-lg w-full px-4 py-2" />
        </div>

        <div>
          <h2 className="font-medium text-lg mb-2">Signatures</h2>
          <p className="text-sm">Driver Signature</p>
          <SignatureCanvas ref={driverSign} penColor="black" canvasProps={{ width: 300, height: 100, className: "border rounded-md mb-4" }} />
          <p className="text-sm">Passenger Signature</p>
          <SignatureCanvas ref={passengerSign} penColor="black" canvasProps={{ width: 300, height: 100, className: "border rounded-md" }} />
        </div>

        <button onClick={handleSave} disabled={saving} className="bg-blue-600 text-white w-full rounded-lg py-3 font-medium hover:bg-blue-700 transition disabled:opacity-60">
          {saving ? "Saving..." : "Validate & Review"}
        </button>
      </div>
    </div>
  );
}
