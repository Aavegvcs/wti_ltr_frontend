// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { useTripSheet, TripSheet } from "@/hooks/useTripSheet";
// const ButtonLoader = () => (
//   <svg
//     className="animate-spin h-6 w-6 text-white"
//     xmlns="http://www.w3.org/2000/svg"
//     fill="none"
//     viewBox="0 0 24 24"
//   >
//     <circle
//       className="opacity-25"
//       cx="12"
//       cy="12"
//       r="10"
//       stroke="currentColor"
//       strokeWidth="4"
//     />
//     <path
//       className="opacity-75"
//       fill="currentColor"
//       d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
//     />
//   </svg>
// );

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
//     <div className="min-h-screen flex flex-col bg-white">
//       <div className="p-6 mt-14">
//         <h1 className="text-3xl font-bold text-center text-black">
//           Driver Trip Sheet
//         </h1>
//         <p className="text-center text-gray-500 mt-2 text-sm">
//           Enter your mobile number to continue
//         </p>
//       </div>

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
//               className="mt-2 w-full border border-gray-300 rounded-lg p-4 text-2xl font-bold focus:ring-2 focus:ring-black outline-none"
//               placeholder="Enter 10-digit number"
//             />
//           </div>

//           {error && <p className="text-red-600 text-sm text-center">{error}</p>}

//           {/* <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-black text-white text-lg py-4 rounded-lg font-semibold disabled:opacity-60 cursor-pointer"
//           >
//             {loading ? "Checking..." : "Continue"}
//           </button> */}
//           <button
//             type="submit"
//             disabled={loading}
//             className={`w-full bg-black cursor-pointer text-white text-lg py-4 rounded-lg font-semibold
//     flex items-center justify-center gap-3
//     disabled:opacity-60 disabled:cursor-not-allowed`}
//           >
//             {loading ? (
//               <>
//                 <ButtonLoader />
//                 <span>Checking...</span>
//               </>
//             ) : (
//               "Continue"
//             )}
//           </button>
//         </form>
//       </div>

//       <div className="flex-1" />
//     </div>
//   );
// }
// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { useTripSheet, TripSheet } from "@/hooks/useTripSheet";

// /* -------------------------------------------------- */
// /* Loader                                             */
// /* -------------------------------------------------- */
// const ButtonLoader = () => (
//   <svg
//     className="animate-spin h-6 w-6 text-white"
//     xmlns="http://www.w3.org/2000/svg"
//     fill="none"
//     viewBox="0 0 24 24"
//   >
//     <circle
//       className="opacity-25"
//       cx="12"
//       cy="12"
//       r="10"
//       stroke="currentColor"
//       strokeWidth="4"
//     />
//     <path
//       className="opacity-75"
//       fill="currentColor"
//       d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
//     />
//   </svg>
// );

// /* -------------------------------------------------- */
// /* Mandatory Location Helper                          */
// /* -------------------------------------------------- */
// const getLocationOrFail = (): Promise<{ lat: number; lng: number }> =>
//   new Promise((resolve, reject) => {
//     if (!navigator.geolocation) {
//       reject("Location is not supported on this device.");
//       return;
//     }

//     navigator.geolocation.getCurrentPosition(
//       (pos) =>
//         resolve({
//           lat: pos.coords.latitude,
//           lng: pos.coords.longitude,
//         }),
//       () => reject("Location permission is required to continue."),
//       {
//         enableHighAccuracy: true,
//         timeout: 15000,
//         maximumAge: 0,
//       }
//     );
//   });

// export default function DriverHomePage() {
//   const [mobile, setMobile] = useState("");
//   const [error, setError] = useState<string | null>(null);

//   const { newTripsheetApi, loading } = useTripSheet();
//   const router = useRouter();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (loading) return;

//     setError(null);

//     // 📱 Mobile validation
//     if (!/^\d{10}$/.test(mobile)) {
//       setError("Please enter a valid 10-digit mobile number.");
//       return;
//     }

//     try {
//       // 🔐 STEP 1: Force location permission FIRST
//       const location = await getLocationOrFail();

//       // 🚀 STEP 2: Only after location → call API
//       const trip: TripSheet = await newTripsheetApi(mobile);

//       // 👉 You may also send lat/lng to backend if needed
//       // newTripsheetApi(mobile, location)

//       const qs = new URLSearchParams({
//         mobile,
//         driverName: trip.driver?.name || "",
//         corporateName: trip.corporate?.corporateName || "",
//         branchName: trip.branch?.name || "",
//         vehicleNumber: trip.vehicle?.vehicleNumber || "",
//         lat: String(location.lat),
//         lng: String(location.lng),
//       });

//       router.push(`/trip-sheet?${qs.toString()}`);
//     } catch (err: any) {
//       setError(
//         typeof err === "string" ? err : err?.message || "Unable to continue."
//       );
//     }
//   };

//   return (
//     <div className="min-h-screen flex flex-col bg-white">
//       <div className="p-6 mt-14">
//         <h1 className="text-3xl font-bold text-center text-black">
//           Driver Trip Sheet
//         </h1>
//         <p className="text-center text-gray-500 mt-2 text-sm">
//           Mobile number & location access required
//         </p>
//       </div>

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
//               className="mt-2 w-full border border-gray-300 rounded-lg p-4 text-2xl font-bold focus:ring-2 focus:ring-black outline-none"
//               placeholder="Enter 10-digit number"
//             />
//           </div>

//           {error && (
//             <p className="text-red-600 text-sm text-center font-medium">
//               {error}
//             </p>
//           )}

//           {/* <button
//             type="submit"
//             disabled={loading}
//             className={`w-full bg-black text-white cursor-pointer text-lg py-4 rounded-lg font-semibold
//               flex items-center justify-center gap-3
//               disabled:opacity-60 disabled:cursor-not-allowed`}
//           > */}
//           <button
//             type="submit"
//             disabled={loading}
//             className={`ripple w-full bg-black text-white cursor-pointer text-lg py-4 rounded-lg font-semibold
//     flex items-center justify-center gap-3
//     disabled:opacity-60 disabled:cursor-not-allowed`}
//           >
//             {loading ? (
//               <>
//                 <ButtonLoader />
//                 <span>Checking location…</span>
//               </>
//             ) : (
//               "Continue"
//             )}
//           </button>

//           <p className="text-xs text-gray-500 text-center">
//             Location permission is mandatory to continue
//           </p>
//         </form>
//       </div>

//       <div className="flex-1" />
//     </div>
//   );
// }
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTripSheet, TripSheet } from "@/hooks/useTripSheet";

/* -------------------------------------------------- */
/* Loader                                             */
/* -------------------------------------------------- */
const ButtonLoader = () => (
  <svg
    className="animate-spin h-6 w-6 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
    />
  </svg>
);

/* -------------------------------------------------- */
/* Mandatory Location Helper                          */
/* -------------------------------------------------- */
const getLocationOrFail = (): Promise<{ lat: number; lng: number }> =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject("Location is not supported on this device.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => reject("Location permission is required to continue."),
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  });

export default function DriverHomePage() {
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false); // 🔒 LOCAL LOCK

  const { newTripsheetApi, loading } = useTripSheet();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🔒 HARD BLOCK – prevents double click instantly
    if (submitting) return;
    setSubmitting(true);

    setError(null);

    // 📱 Mobile validation
    if (!/^\d{10}$/.test(mobile)) {
      setError("Please enter a valid 10-digit mobile number.");
      setSubmitting(false);
      return;
    }

    try {
      // 🔐 STEP 1: Location permission (blocking)
      const location = await getLocationOrFail();

      // 🚀 STEP 2: API call (single execution)
      const trip: TripSheet = await newTripsheetApi(mobile);

      const qs = new URLSearchParams({
        mobile,
        driverName: trip.driver?.name || "",
        corporateName: trip.corporate?.corporateName || "",
        branchName: trip.branch?.name || "",
        vehicleNumber: trip.vehicle?.vehicleNumber || "",
        lat: String(location.lat),
        lng: String(location.lng),
      });

      router.push(`/trip-sheet?${qs.toString()}`);
    } catch (err: any) {
      setError(
        typeof err === "string" ? err : err?.message || "Unable to continue."
      );
      setSubmitting(false); // 🔓 unlock only on error
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="p-6 mt-14">
        <h1 className="text-3xl font-bold text-center text-black">
          Driver Trip Sheet
        </h1>
        <p className="text-center text-gray-500 mt-2 text-sm">
          Mobile number & location access required
        </p>
      </div>

      {/* Form */}
      <div className="px-6 mt-6">
        <form
          onSubmit={handleSubmit}
          className="bg-gray-100 rounded-xl p-5 shadow-sm space-y-5"
        >
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

          {error && (
            <p className="text-red-600 text-sm text-center font-medium">
              {error}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || submitting}
            className={`ripple w-full bg-black text-white text-lg py-4 rounded-lg font-semibold
              flex items-center justify-center gap-3
              disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {loading || submitting ? (
              <>
                <ButtonLoader />
                <span>Checking location…</span>
              </>
            ) : (
              "Continue"
            )}
          </button>

          <p className="text-xs text-gray-500 text-center">
            Location permission is mandatory to continue
          </p>
        </form>
      </div>

      <div className="flex-1" />
    </div>
  );
}
