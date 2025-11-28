// "use client";
// import { useEffect, useState } from "react";

// export default function ValidateTrip() {
//   const [tripData, setTripData] = useState<any>(null);

//   useEffect(() => {
//     const data = JSON.parse(localStorage.getItem("tripSheet") || "{}");
//     setTripData(data);
//   }, []);

//   if (!tripData) return <p className="text-center mt-10">Loading...</p>;

//   const handleFinalSubmit = () => {
//     console.log("Submitting Trip:", tripData);
//     alert("Trip submitted successfully!");
//     localStorage.removeItem("tripSheet");
//   };

//   return (
//     <div className="min-h-screen flex flex-col items-center bg-gray-50 px-4 py-8">
//       <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md">
//         <h1 className="text-2xl font-semibold text-center mb-4">Validate Trip</h1>

//         <div className="text-sm space-y-2">
//           <p><strong>Driver:</strong> {tripData.driverName}</p>
//           <p><strong>Mobile:</strong> {tripData.mobile}</p>
//           <p><strong>Corporate:</strong> {tripData.corporateName}</p>
//           <p><strong>Vehicle:</strong> {tripData.vehicleNo}</p>
//           <p><strong>Start Location:</strong> {tripData.startLocation}</p>
//           <p><strong>End Location:</strong> {tripData.endLocation}</p>
//           <p><strong>Start Time:</strong> {tripData.startTime}</p>
//           <p><strong>End Time:</strong> {tripData.endTime}</p>
//           <p><strong>Odometer Start:</strong> {tripData.odometerStart}</p>
//           <p><strong>Odometer End:</strong> {tripData.odometerEnd}</p>
//         </div>

//         <div className="mt-4 space-y-4">
//           <div>
//             <p className="font-medium text-sm mb-1">Driver Signature:</p>
//             <img src={tripData.driverSignature} alt="Driver Signature" className="border rounded-md" />
//           </div>
//           <div>
//             <p className="font-medium text-sm mb-1">Passenger Signature:</p>
//             <img src={tripData.passengerSignature} alt="Passenger Signature" className="border rounded-md" />
//           </div>
//         </div>

//         <button onClick={handleFinalSubmit} className="bg-green-600 text-white w-full mt-6 py-3 rounded-lg font-medium hover:bg-green-700">
//           Submit Trip Sheet
//         </button>
//       </div>
//     </div>
//   );
// }
// app/validate-trip/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useTripSheet } from "@/hooks/useTripSheet";
import { useRouter } from "next/navigation";

export default function ValidateTripPage() {
  const router = useRouter();
  const { submitTripSheet } = useTripSheet();
  const [trip, setTrip] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("currentTrip");
    if (!raw) {
      router.push("/driver");
      return;
    }
    setTrip(JSON.parse(raw));
  }, [router]);

  if (!trip) return <p className="text-center mt-10">Loading...</p>;

  const handleFinalSubmit = async () => {
    try {
      setSubmitting(true);
      await submitTripSheet(Number(trip.id));
      // clear session
      sessionStorage.removeItem("currentTrip");
      setSubmitting(false);
      alert("Trip submitted successfully!");
      router.push("/driver");
    } catch (err: any) {
      setSubmitting(false);
      console.error(err);
      alert("Failed to submit trip: " + (err?.message ?? ""));
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-semibold text-center mb-4">Validate Trip</h1>

        <div className="text-sm space-y-2">
          <p><strong>Driver:</strong> {trip.driver?.name ?? trip.driverName}</p>
          <p><strong>Mobile:</strong> {trip.driver?.mobileNumber ?? trip.mobile}</p>
          <p><strong>Corporate:</strong> {trip.corporate?.corporateName ?? trip.corporateName}</p>
          <p><strong>Vehicle:</strong> {trip.vehicle?.vehicleNumber ?? trip.vehicleNo}</p>
          <p><strong>Start Location:</strong> {trip.sourceName}</p>
          <p><strong>End Location:</strong> {trip.destinationName}</p>
          <p><strong>Start Time:</strong> {trip.startTime}</p>
          <p><strong>End Time:</strong> {trip.endTime}</p>
          <p><strong>Odometer Start:</strong> {trip.odometerStart}</p>
          <p><strong>Odometer End:</strong> {trip.odometerEnd}</p>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <p className="font-medium text-sm mb-1">Driver Signature:</p>
            {trip.driverSign ? (
              <img src={trip.driverSign} alt="Driver Signature" className="border rounded-md" />
            ) : (
              <p className="text-xs text-gray-500">No signature captured</p>
            )}
          </div>
          <div>
            <p className="font-medium text-sm mb-1">Passenger Signature:</p>
            {trip.userSign ? (
              <img src={trip.userSign} alt="Passenger Signature" className="border rounded-md" />
            ) : (
              <p className="text-xs text-gray-500">No signature captured</p>
            )}
          </div>
        </div>

        <button onClick={handleFinalSubmit} disabled={submitting} className="bg-green-600 text-white w-full mt-6 py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-60">
          {submitting ? "Submitting..." : "Submit Trip Sheet"}
        </button>
      </div>
    </div>
  );
}
