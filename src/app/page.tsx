
// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { useTripSheet, TripSheet } from "@/hooks/useTripSheet";

// export default function DriverHomePage() {
//   const [mobile, setMobile] = useState("");
//   const [error, setError] = useState<string | null>(null);
//   const { newTripsheetApi, loading } = useTripSheet();
//   const router = useRouter();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError(null);

//     if (!/^\d{10}$/.test(mobile)) {
//       setError("Please enter a valid 10-digit mobile number.");
//       return;
//     }

//     try {
//       const trip: TripSheet = await newTripsheetApi(mobile);

//       const qs = new URLSearchParams({
//         mobile,
//         driverName: trip.driver?.name || "",
//         corporateName: trip.corporate?.corporateName || "",
//         branchName: trip.branch?.name || "",
//         vehicleNumber: trip.vehicle?.vehicleNumber || "",
//       });

//       router.push(`/trip-sheet?${qs.toString()}`);
//     } catch (err: any) {
//       setError(err?.message || "Unable to open trip sheet.");
//     }
//   };

//   return (
//     <div className="min-h-screen flex flex-col bg-white  ">
//       {/* Top Section */}
//       <div className="p-6 mt-14">
//         <h1 className="text-3xl font-bold text-center text-black">
//           Driver Trip Sheet
//         </h1>
//         <p className="text-center text-gray-500 mt-2 text-sm">
//           Enter your mobile number to continue
//         </p>
//       </div>

//       {/* Input Card */}
//       <div className="px-6 mt-6">
//         <form
//           onSubmit={handleSubmit}
//           className="bg-gray-100 rounded-xl p-5 shadow-sm space-y-5"
//         >
//           <div>
//             <label className="font-semibold text-gray-700">Mobile Number</label>
//             <input
//               type="tel"
//               maxLength={10}
//               value={mobile}
//               onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
//               className="mt-2 w-full border border-gray-300 rounded-lg p-4 text-2xl  font-bold  focus:ring-2 focus:ring-black outline-none"
//               placeholder="Enter 10-digit number"
//             />
//           </div>

//           {error && (
//             <p className="text-red-600 text-sm text-center">{error}</p>
//           )}

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-black text-white text-lg py-4 rounded-lg font-semibold disabled:opacity-60"
//           >
//             {loading ? "Checking..." : "Continue"}
//           </button>
//         </form>
//       </div>

//       {/* Bottom Placeholder for spacing */}
//       <div className="flex-1" />
//     </div>
//   );
// }
// src/app/driver/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTripSheet, TripSheet } from "@/hooks/useTripSheet";

export default function DriverHomePage() {
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { newTripsheetApi, loading } = useTripSheet();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!/^\d{10}$/.test(mobile)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    try {
      const trip: TripSheet = await newTripsheetApi(mobile);

      const qs = new URLSearchParams({
        mobile,
        driverName: trip.driver?.name || "",
        corporateName: trip.corporate?.corporateName || "",
        branchName: trip.branch?.name || "",
        vehicleNumber: trip.vehicle?.vehicleNumber || "",
      });

      router.push(`/trip-sheet?${qs.toString()}`);
    } catch (err: any) {
      setError(err?.message || "Unable to open trip sheet.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="p-6 mt-14">
        <h1 className="text-3xl font-bold text-center text-black">Driver Trip Sheet</h1>
        <p className="text-center text-gray-500 mt-2 text-sm">Enter your mobile number to continue</p>
      </div>

      <div className="px-6 mt-6">
        <form onSubmit={handleSubmit} className="bg-gray-100 rounded-xl p-5 shadow-sm space-y-5">
          <div>
            <label className="font-semibold text-gray-700">Mobile Number</label>
            <input
              type="tel"
              maxLength={10}
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
              className="mt-2 w-full border border-gray-300 rounded-lg p-4 text-2xl font-bold focus:ring-2 focus:ring-black outline-none"
              placeholder="Enter 10-digit number"
            />
          </div>

          {error && <p className="text-red-600 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white text-lg py-4 rounded-lg font-semibold disabled:opacity-60 cursor-pointer"
          >
            {loading ? "Checking..." : "Continue"}
          </button>
        </form>
      </div>

      <div className="flex-1" />
    </div>
  );
}
