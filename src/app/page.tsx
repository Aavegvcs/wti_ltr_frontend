
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [mobile, setMobile] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(mobile)) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }
    router.push(`/trip-sheet?mobile=${mobile}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-md">
        <h1 className="text-2xl font-semibold text-center mb-4">
          Start Your Trip
        </h1>
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
            className="bg-blue-600 text-white font-semibold rounded-lg py-3 hover:bg-blue-700 transition-all"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
