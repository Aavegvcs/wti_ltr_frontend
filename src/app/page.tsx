
// "use client";
// import { useState } from "react";
// import { useRouter } from "next/navigation";

// export default function HomePage() {
//   const [mobile, setMobile] = useState("");
//   const router = useRouter();

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!/^\d{10}$/.test(mobile)) {
//       alert("Please enter a valid 10-digit mobile number");
//       return;
//     }
//     router.push(`/trip-sheet?mobile=${mobile}`);
//   };

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
//       <div className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-md">
//         <h1 className="text-2xl font-semibold text-center mb-4">
//           Start Your Trip
//         </h1>
//         <form onSubmit={handleSubmit} className="flex flex-col gap-4">
//           <input
//             type="tel"
//             value={mobile}
//             onChange={(e) => setMobile(e.target.value)}
//             placeholder="Enter 10-digit mobile number"
//             className="border border-gray-300 rounded-lg px-4 py-3 text-center text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             maxLength={10}
//           />
//           <button
//             type="submit"
//             className="bg-blue-600 text-white font-semibold rounded-lg py-3 hover:bg-blue-700 transition-all"
//           >
//             Continue
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }
// app/driver/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTripSheet } from "@/hooks/useTripSheet";

export default function DriverHome() {
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { newTripsheetApi } = useTripSheet();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(mobile)) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }

    try {
      setLoading(true);
      const result = await newTripsheetApi(mobile);
      // result may be the saved trip sheet or standard wrapper. Normalize:
      const trip = result?.result ?? result ?? null;
      if (!trip || !trip.id) {
        // some backends send saved data in `data` or `result`
        // try a few fallbacks:
        const candidate = (result?.data ?? result?.result ?? result) as any;
        if (!candidate || !candidate.id) {
          alert("Could not create or fetch tripsheet. Try again.");
          setLoading(false);
          return;
        }
      }
      // store trip object in sessionStorage for pages to consume
      const normalized = trip?.id ? trip : result;
      sessionStorage.setItem("currentTrip", JSON.stringify(normalized));
      setLoading(false);
      router.push(`/trip-sheet`);
    } catch (err: any) {
      setLoading(false);
      console.error(err);
      alert(err?.message ?? "Failed to fetch/create trip sheet");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-md">
        <h1 className="text-2xl font-semibold text-center mb-4">Start Your Trip</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="Enter 10-digit mobile number"
            className="border border-gray-300 rounded-lg px-4 py-3 text-center text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={10}
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg py-3 hover:bg-blue-700 transition-all"
          >
            {loading ? "Loading..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
