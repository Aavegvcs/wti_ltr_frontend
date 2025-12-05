
// "use client";

// import { useState, useCallback } from "react";
// import axiosInstance from "@/utils/config-global";

// export type TripSheet = any; // keep flexible; you can create an interface later

// function extractResult(res: any) {
//   const top = res?.data;
//   const data = top?.data;
//   const ok = !!data?.status;
//   const msg = data?.message || top?.message || "Something went wrong";
//   return { ok, msg, result: data?.result || data?.data || null };
// }

// export function useTripSheet() {
//   const [loading, setLoading] = useState(false);

//   const newTripsheetApi = useCallback(async (mobile: string): Promise<TripSheet> => {
//     setLoading(true);
//     try {
//       const res = await axiosInstance.post("/tripsheet/newTripsheetApi", { driverMobile: mobile });
//       const { ok, msg, result } = extractResult(res);

//       if (!ok || !result) {
//         throw new Error(msg || "Unable to open trip sheet.");
//       }

//       return result;
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   const submitTripSheet = useCallback(async (payload: any) => {
//     const res = await axiosInstance.patch("/tripsheet/updateTripsheetApi", payload);
//     const { ok, msg } = extractResult(res);
//     if (!ok) throw new Error(msg || "Unable to submit trip sheet.");
//     return true;
//   }, []);

//   return { newTripsheetApi, submitTripSheet, loading };
// }
"use client";

import { useState, useCallback } from "react";
import axiosInstance from "@/utils/config-global";

export type TripSheet = any; // keep flexible; you can create an interface later

function extractResult(res: any) {
  const top = res?.data;
  const data = top?.data;
  const ok = !!data?.status;
  const msg = data?.message || top?.message || "Something went wrong";
  return { ok, msg, result: data?.result || data?.data || null };
}

export function useTripSheet() {
  const [loading, setLoading] = useState(false);

  const newTripsheetApi = useCallback(async (mobile: string): Promise<TripSheet> => {
    setLoading(true);
    try {
      const res = await axiosInstance.post("/tripsheet/newTripsheetApi", { driverMobile: mobile });
      const { ok, msg, result } = extractResult(res);

      if (!ok || !result) {
        throw new Error(msg || "Unable to open trip sheet.");
      }

      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  const submitTripSheet = useCallback(async (payload: any) => {
    const res = await axiosInstance.patch("/tripsheet/updateTripsheetApi", payload);
    const { ok, msg } = extractResult(res);
    if (!ok) throw new Error(msg || "Unable to submit trip sheet.");
    return true;
  }, []);

  return { newTripsheetApi, submitTripSheet, loading };
}
