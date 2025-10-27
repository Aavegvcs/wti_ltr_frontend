"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EndTripPage() {
  const router = useRouter();

  const [endTime, setEndTime] = useState("");
  const [destination, setDestination] = useState("");
  const [odometerEnd, setOdometerEnd] = useState("");

  useEffect(() => {
    const now = new Date();
    setEndTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tripStart = JSON.parse(localStorage.getItem("tripStart") || "{}");

    localStorage.setItem(
      "tripEnd",
      JSON.stringify({ ...tripStart, endTime, destination, odometerEnd })
    );

    router.push("/trip-summary");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-md">
        <h1 className="text-2xl font-semibold text-center mb-4">End Trip</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* ✅ Manual destination input */}
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Enter Drop Location"
            className="border rounded-lg px-4 py-3"
            required
          />

          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="border rounded-lg px-4 py-3"
            required
          />

          <input
            type="number"
            placeholder="End Odometer Reading"
            value={odometerEnd}
            onChange={(e) => setOdometerEnd(e.target.value)}
            className="border rounded-lg px-4 py-3"
            required
          />

          <button
            type="submit"
            className="bg-green-600 text-white rounded-lg py-3 font-medium hover:bg-green-700 transition-all"
          >
            Save & Continue
          </button>
        </form>
      </div>
    </div>
  );
}
