"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function StartTripPage() {
  const searchParams = useSearchParams();
  const mobile = searchParams.get("mobile") || "";
  const router = useRouter();

  const [tripDate, setTripDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [source, setSource] = useState("");
  const [odometerStart, setOdometerStart] = useState("");

  // Auto-fill current date and time
  useEffect(() => {
    const now = new Date();
    setTripDate(now.toISOString().split("T")[0]);
    setStartTime(
      now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!source.trim()) {
      alert("Please enter the start location.");
      return;
    }

    if (!odometerStart) {
      alert("Please enter odometer reading.");
      return;
    }

    // Save trip start data locally or send to backend
    localStorage.setItem(
      "tripStart",
      JSON.stringify({ tripDate, startTime, source, odometerStart, mobile })
    );

    // Navigate to end trip page
    router.push("/end-trip");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-md">
        <h1 className="text-2xl font-semibold text-center mb-4">Start Trip</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Trip Date */}
          <input
            type="date"
            value={tripDate}
            onChange={(e) => setTripDate(e.target.value)}
            className="border rounded-lg px-4 py-3"
          />

          {/* Mobile Number */}
          <input
            type="text"
            value={mobile}
            disabled
            className="border rounded-lg px-4 py-3 bg-gray-100"
          />

          {/* Manual Start Location */}
          <input
            type="text"
            placeholder="Enter Start Location"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="border rounded-lg px-4 py-3"
          />

          {/* Start Time */}
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="border rounded-lg px-4 py-3"
          />

          {/* Odometer Start Reading */}
          <input
            type="number"
            placeholder="Enter Start Odometer Reading"
            value={odometerStart}
            onChange={(e) => setOdometerStart(e.target.value)}
            className="border rounded-lg px-4 py-3"
          />

          {/* Submit Button */}
          <button
            type="submit"
            className="bg-blue-600 text-white rounded-lg py-3 font-medium hover:bg-blue-700 transition"
          >
            Save & Continue
          </button>
        </form>
      </div>
    </div>
  );
}
