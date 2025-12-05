
// import axiosInstance from "@/utils/config-global";

// let debounceTimer: ReturnType<typeof setTimeout> | null = null;

// // store the last saved payload so we can flush before navigation
// let pendingPayload: Record<string, any> | null = null;

// /**
//  * Debounced partial update for trip sheet
//  * Always stores latest payload and sends only the newest update.
//  */
// export const debouncedUpdateTripSheet = (payload: Record<string, any>) => {
//   if (!payload?.tripSheetId) return;

//   // store the latest update
//   pendingPayload = payload;

//   // clear old timer
//   if (debounceTimer) clearTimeout(debounceTimer);

//   // start new timer (300ms is optimal)
//   debounceTimer = setTimeout(async () => {
//     try {
//       await axiosInstance.patch("/tripsheet/updateTripsheetApi", pendingPayload);
//       console.log("Autosave Success:", pendingPayload);
//       pendingPayload = null; // clear because update finished
//     } catch (err: any) {
//       console.error("Autosave failed:", err?.response?.data || err?.message);
//       // keep pendingPayload intact → so flush will retry
//     }
//   }, 300);
// };

// /**
//  * Ensures the final value before navigating is saved,
//  * even if debounce delay has not finished.
//  */
// export const flushTripAutosave = async () => {
//   if (!pendingPayload) return;

//   // important: stop the debounce timer
//   if (debounceTimer) clearTimeout(debounceTimer);
//   debounceTimer = null;

//   try {
//     await axiosInstance.patch("/tripsheet/updateTripsheetApi", pendingPayload);
//     console.log("Flushed Pending Update:", pendingPayload);
//   } catch (err: any) {
//     console.error("Flush Autosave Error:", err?.response?.data || err?.message);
//   }

//   pendingPayload = null; // clear after flush
// };
// import axiosInstance from "@/utils/config-global";

// let debounceTimer: ReturnType<typeof setTimeout> | null = null;

// // holds the latest full payload
// let pendingPayload: Record<string, any> | null = null;

// /**
//  * Debounced FULL update for trip sheet
//  * Always stores the latest COMPLETE payload and sends only that.
//  */
// export const debouncedUpdateTripSheet = (payload: Record<string, any>) => {
//   if (!payload?.tripSheetId) return;

//   // store the full and latest state
//   pendingPayload = payload;

//   // reset debounce timer
//   if (debounceTimer) clearTimeout(debounceTimer);

//   debounceTimer = setTimeout(async () => {
//     try {
//       await axiosInstance.patch("/tripsheet/updateTripsheetApi", pendingPayload);
//       console.log("Autosave Success:", pendingPayload);
//       pendingPayload = null;
//     } catch (err: any) {
//       console.error("Autosave failed:", err?.response?.data || err?.message);
//       // pendingPayload remains → flush will retry
//     }
//   }, 1000);
// };

// /**
//  * Ensures the last pending update is saved before navigation.
//  * Useful on page change or "Review Trip" click.
//  */
// export const flushTripAutosave = async () => {
//   if (!pendingPayload) return;

//   if (debounceTimer) clearTimeout(debounceTimer);
//   debounceTimer = null;

//   try {
//     await axiosInstance.patch("/tripsheet/updateTripsheetApi", pendingPayload);
//     console.log("Flushed Pending Update:", pendingPayload);
//   } catch (err: any) {
//     console.error("Flush Autosave Error:", err?.response?.data || err?.message);
//   }

//   pendingPayload = null;
// };
import axiosInstance from "@/utils/config-global";

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
// holds the latest full payload
let pendingPayload: Record<string, any> | null = null;
let flushing = false;

/**
 * Debounced FULL update for trip sheet
 * Receives a full payload (constructed by caller using refs).
 * IMPORTANT: We do NOT update UI state from the response (Option A).
 */
export const debouncedUpdateTripSheet = (payload: Record<string, any>) => {
  if (!payload?.tripSheetId) return;

  // Overwrite pending payload with latest full payload
  pendingPayload = payload;

  // reset debounce timer
  if (debounceTimer) clearTimeout(debounceTimer);

  debounceTimer = setTimeout(async () => {
    // send and swallow any response — DO NOT apply response to UI
    const toSend = pendingPayload;
    pendingPayload = null;
    debounceTimer = null;

    if (!toSend) return;

    try {
      await axiosInstance.patch("/tripsheet/updateTripsheetApi", toSend);
      // intentionally ignore response body (backend returns full trip) to avoid UI overwrite
    } catch (err: any) {
      console.error("Autosave failed:", err?.response?.data || err?.message);
      // Reassign so flush can retry later
      pendingPayload = toSend;
    }
  }, 1000); // internal debounce; caller also debounces typing. This protects against programmatic calls.
};

/**
 * Ensures the last pending update is saved before navigation.
 */
export const flushTripAutosave = async () => {
  if (!pendingPayload) return;

  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }

  if (flushing) return;
  flushing = true;

  try {
    const toSend = pendingPayload;
    pendingPayload = null;
    if (!toSend) return;
    await axiosInstance.patch("/tripsheet/updateTripsheetApi", toSend);
  } catch (err: any) {
    console.error("Flush Autosave Error:", err?.response?.data || err?.message);
    // put back payload to pending so next flush can retry
    // pendingPayload = toSend; // optional; uncomment if you want retries
  } finally {
    flushing = false;
  }
};
