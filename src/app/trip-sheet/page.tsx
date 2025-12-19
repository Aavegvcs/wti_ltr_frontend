"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SignaturePad from "react-signature-canvas";
import { useTripSheet, TripSheet } from "@/hooks/useTripSheet";
import {
  debouncedUpdateTripSheet,
  flushTripAutosave,
} from "@/utils/TripsheetDebounce";
import { UploadFiletos3Bucket } from "@/utils/uploadToS3";

const LTR_CONTAINER = "signature";

/**
 * Key design notes:
 * - Backend returns full trip object on autosave responses (Option A).
 * - We MUST NOT overwrite UI state with autosave response.
 * - Use refs for the "source of truth" when building autosave payloads to avoid stale-setState races.
 * - Autosave triggers only after user stops typing (800ms).
 */

export default function TripSheetPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const mobile = sp.get("mobile") || "";
  const driverName = sp.get("driverName") || "";
  const corporateName = sp.get("corporateName") || "";
  const branchName = sp.get("branchName") || "";
  const vehicleNumber = sp.get("vehicleNumber") || "";

  const { newTripsheetApi } = useTripSheet();

  const [trip, setTrip] = useState<TripSheet | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UI state (for controlled inputs)
  const [tripDate, setTripDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [destinationName, setDestinationName] = useState("");
  const [startOdometer, setStartOdometer] = useState("");
  const [endOdometer, setEndOdometer] = useState("");

  // Refs that mirror UI state and are used to build payload synchronously.
  const tripIdRef = useRef<number | null>(null);
  const tripDateRef = useRef<string>("");
  const startTimeRef = useRef<string>("");
  const endTimeRef = useRef<string>("");
  const sourceNameRef = useRef<string>("");
  const destinationNameRef = useRef<string>("");
  const startOdometerRef = useRef<string>("");
  const endOdometerRef = useRef<string>("");

  // Signature refs & urls + lat/lng refs
  const driverRef = useRef<any>(null);
  const userRef = useRef<any>(null);
  const [driverSignUrl, setDriverSignUrl] = useState<string>("");
  const [userSignUrl, setUserSignUrl] = useState<string>("");

  const driverSignLatRef = useRef<number | null>(null);
  const driverSignLngRef = useRef<number | null>(null);
  const userSignLatRef = useRef<number | null>(null);
  const userSignLngRef = useRef<number | null>(null);

  // keep urls mirrored in refs for payload building
  const driverSignUrlRef = useRef<string>("");
  const userSignUrlRef = useRef<string>("");

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({
    tripDate: "",
    startTime: "",
    endTime: "",
    sourceName: "",
    destinationName: "",
    startOdometer: "",
    endOdometer: "",
    signatures: "",
  });

  // Typing debounce: one timer for all text/number inputs.
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const TYPING_DEBOUNCE_MS = 800;

  // Load trip
  useEffect(() => {
    if (!mobile) {
      router.push("/");
      return;
    }

    const load = async () => {
      try {
        setError(null);
        setLoading(true);
        const t = await newTripsheetApi(mobile);

        setTrip(t);
        tripIdRef.current = t?.id ?? null;

        // populate UI state and refs — only on initial load
        const td = t.tripDate ? t.tripDate.substring(0, 10) : "";
        setTripDate(td);
        tripDateRef.current = td;

        setStartTime(t.startTime ?? "");
        startTimeRef.current = t.startTime ?? "";

        setEndTime(t.endTime ?? "");
        endTimeRef.current = t.endTime ?? "";

        setSourceName(t.sourceName ?? "");
        sourceNameRef.current = t.sourceName ?? "";

        setDestinationName(t.destinationName ?? "");
        destinationNameRef.current = t.destinationName ?? "";

        setStartOdometer(t.startOdometer ? String(t.startOdometer) : "");
        startOdometerRef.current = t.startOdometer
          ? String(t.startOdometer)
          : "";

        setEndOdometer(t.endOdometer ? String(t.endOdometer) : "");
        endOdometerRef.current = t.endOdometer ? String(t.endOdometer) : "";

        if (t.driverSign) {
          setDriverSignUrl(t.driverSign);
          driverSignUrlRef.current = t.driverSign;
        }
        if (t.userSign) {
          setUserSignUrl(t.userSign);
          userSignUrlRef.current = t.userSign;
        }

        if (typeof t.driverSignLat === "number")
          driverSignLatRef.current = t.driverSignLat;
        if (typeof t.driverSignLng === "number")
          driverSignLngRef.current = t.driverSignLng;
        if (typeof t.userSignLat === "number")
          userSignLatRef.current = t.userSignLat;
        if (typeof t.userSignLng === "number")
          userSignLngRef.current = t.userSignLng;
      } catch (err: any) {
        setError(err?.message || "Failed to load trip sheet.");
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mobile]);

  // saving indicator (brief)
  useEffect(() => {
    if (!saving) return;
    const id = setTimeout(() => setSaving(false), 700);
    return () => clearTimeout(id);
  }, [saving]);

  // Helper: calculate total km from odometer refs (string -> number)
  const calcTotalKmFromRefs = (): number | null => {
    const sStr = startOdometerRef.current;
    const eStr = endOdometerRef.current;
    const s = sStr ? Number(sStr) : NaN;
    const e = eStr ? Number(eStr) : NaN;
    if (!Number.isFinite(s) || !Number.isFinite(e)) return null;
    if (e < s) return null;
    // keep 2 decimals
    return Number((e - s).toFixed(2));
  };

  // For showing in UI (derived from state — fine)
  const totalKmDisplay = () => {
    const v = calcTotalKmFromRefs();
    return v === null ? "" : String(v);
  };

  // Convert dataURL to File
  const dataUrlToFile = async (dataUrl: string, fileName: string) => {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], fileName, { type: "image/png" });
  };

  // Build full payload from refs — synchronous and always latest
  const buildFullPayloadFromRefs = (overrides: Record<string, any> = {}) => {
    const totalKm = calcTotalKmFromRefs();
    const payload: Record<string, any> = {
      tripSheetId: tripIdRef.current,
      tripDate: tripDateRef.current || null,
      startTime: startTimeRef.current || null,
      endTime: endTimeRef.current || null,
      sourceName: sourceNameRef.current?.trim() || null,
      destinationName: destinationNameRef.current?.trim() || null,
      startOdometer: startOdometerRef.current
        ? Number(startOdometerRef.current)
        : null,
      endOdometer: endOdometerRef.current
        ? Number(endOdometerRef.current)
        : null,
      totalKm: totalKm !== null ? Number(totalKm.toFixed(2)) : null,
      driverSign: driverSignUrlRef.current || null,
      driverSignLat: driverSignLatRef.current ?? null,
      driverSignLng: driverSignLngRef.current ?? null,
      userSign: userSignUrlRef.current || null,
      userSignLat: userSignLatRef.current ?? null,
      userSignLng: userSignLngRef.current ?? null,
    };

    return { ...payload, ...overrides };
  };

  // AUTOSAVE: triggered only after user stops typing (debounced trigger)
  const scheduleAutosaveFromRefs = (overrides: Record<string, any> = {}) => {
    if (!tripIdRef.current) return;
    setSaving(true);

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      const full = buildFullPayloadFromRefs(overrides);
      // send to debouncedUpdateTripSheet — we do NOT apply returned data into UI
      debouncedUpdateTripSheet(full);
    }, TYPING_DEBOUNCE_MS);
  };

  // flush wrapper: used by Review button
  const flushAndReturn = async () => {
    // clear any pending typing timer so flushTripAutosave sends latest pendingPayload
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }

    // Before flush, ensure pendingPayload contains latest values:
    // call debouncedUpdateTripSheet synchronously (it will set pendingPayload)
    const full = buildFullPayloadFromRefs();
    debouncedUpdateTripSheet(full);

    // then flush
    await flushTripAutosave();
  };

  // Input handlers: update state AND refs immediately; schedule autosave
  const onTripDateChange = (v: string) => {
    setTripDate(v);
    tripDateRef.current = v;
    scheduleAutosaveFromRefs();
  };

  const onStartTimeChange = (v: string) => {
    setStartTime(v);
    startTimeRef.current = v;
    scheduleAutosaveFromRefs();
  };

  const onEndTimeChange = (v: string) => {
    setEndTime(v);
    endTimeRef.current = v;
    scheduleAutosaveFromRefs();
  };

  const onSourceNameChange = (v: string) => {
    setSourceName(v);
    sourceNameRef.current = v;
    scheduleAutosaveFromRefs();
  };

  const onDestinationNameChange = (v: string) => {
    setDestinationName(v);
    destinationNameRef.current = v;
    scheduleAutosaveFromRefs();
  };

  const onStartOdometerChange = (v: string) => {
    // keep only digits and optional decimal (if you need decimals)
    const clean = v.replace(/[^\d.]/g, "");
    setStartOdometer(clean);
    startOdometerRef.current = clean;
    scheduleAutosaveFromRefs();
  };

  const onEndOdometerChange = (v: string) => {
    const clean = v.replace(/[^\d.]/g, "");
    setEndOdometer(clean);
    endOdometerRef.current = clean;
    scheduleAutosaveFromRefs();
  };

  // Strict validation used at final submit
  const validateOnSubmit = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!tripDateRef.current) newErrors.tripDate = "Trip date is required.";
    if (!startTimeRef.current) newErrors.startTime = "Start time is required.";
    if (!endTimeRef.current) newErrors.endTime = "End time is required.";
    if (!sourceNameRef.current?.trim())
      newErrors.sourceName = "Start location is required.";
    if (!destinationNameRef.current?.trim())
      newErrors.destinationName = "End location is required.";
    if (!startOdometerRef.current)
      newErrors.startOdometer = "Start odometer is required.";
    if (!endOdometerRef.current)
      newErrors.endOdometer = "End odometer is required.";

    // numeric checks
    const s = startOdometerRef.current ? Number(startOdometerRef.current) : NaN;
    const e = endOdometerRef.current ? Number(endOdometerRef.current) : NaN;
    if (startOdometerRef.current && (!Number.isFinite(s) || s < 0)) {
      newErrors.startOdometer =
        "Start odometer must be a valid non-negative number.";
    }
    if (endOdometerRef.current && (!Number.isFinite(e) || e < 0)) {
      newErrors.endOdometer =
        "End odometer must be a valid non-negative number.";
    }
    if (Number.isFinite(s) && Number.isFinite(e) && e < s) {
      newErrors.endOdometer =
        "End odometer must be greater than or equal to start odometer.";
    }

    // total km consistency
    const totalKm = calcTotalKmFromRefs();
    if (totalKm === null) {
      newErrors.endOdometer =
        newErrors.endOdometer ||
        "Total KM cannot be determined from odometer values.";
    }

    // signatures required
    if (!driverSignUrlRef.current || !userSignUrlRef.current) {
      newErrors.signatures = "Driver and passenger signatures are mandatory.";
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const clearFieldError = (field: string) => {
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // Signature save that populates url refs and lat/lng refs then autosaves
  const saveDriverSignature = async () => {
    try {
      if (!driverRef.current || driverRef.current.isEmpty()) {
        setError("Please provide driver signature before saving.");
        return;
      }

      const dataUrl = driverRef.current
        .getTrimmedCanvas()
        .toDataURL("image/png");
      const file = await dataUrlToFile(
        dataUrl,
        `driver-sign-${Date.now()}.png`
      );
      const url = await UploadFiletos3Bucket(file, LTR_CONTAINER);

      setDriverSignUrl(url);
      driverSignUrlRef.current = url;
      setErrors((prev) => ({ ...prev, signatures: "" }));

      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            driverSignLatRef.current = pos.coords.latitude;
            driverSignLngRef.current = pos.coords.longitude;
            scheduleAutosaveFromRefs();
          },
          () => {
            driverSignLatRef.current = null;
            driverSignLngRef.current = null;
            scheduleAutosaveFromRefs();
          },
          { timeout: 5000 }
        );
      } else {
        driverSignLatRef.current = null;
        driverSignLngRef.current = null;
        scheduleAutosaveFromRefs();
      }
    } catch (err: any) {
      console.error("Driver signature upload failed", err);
      setError("Driver signature upload failed");
    }
  };

  const saveUserSignature = async () => {
    try {
      if (!userRef.current || userRef.current.isEmpty()) {
        setError("Please provide passenger signature before saving.");
        return;
      }

      const dataUrl = userRef.current.getTrimmedCanvas().toDataURL("image/png");
      const file = await dataUrlToFile(dataUrl, `user-sign-${Date.now()}.png`);
      const url = await UploadFiletos3Bucket(file, LTR_CONTAINER);

      setUserSignUrl(url);
      userSignUrlRef.current = url;
      setErrors((prev) => ({ ...prev, signatures: "" }));

      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            userSignLatRef.current = pos.coords.latitude;
            userSignLngRef.current = pos.coords.longitude;
            scheduleAutosaveFromRefs();
          },
          () => {
            userSignLatRef.current = null;
            userSignLngRef.current = null;
            scheduleAutosaveFromRefs();
          },
          { timeout: 5000 }
        );
      } else {
        userSignLatRef.current = null;
        userSignLngRef.current = null;
        scheduleAutosaveFromRefs();
      }
    } catch (err: any) {
      console.error("Passenger signature upload failed", err);
      setError("Passenger signature upload failed");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  if (error && !trip)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 pt-16 pb-16 p-4">
      <div className="bg-white rounded-xl shadow p-4 space-y-2">
        <div className="font-semibold text-lg">Trip Information</div>

        <div className="text-sm text-gray-700 flex justify-between">
          <span>Driver:</span>
          <span className="font-medium">{driverName}</span>
        </div>

        <div className="text-sm text-gray-700 flex justify-between">
          <span>Mobile:</span>
          <span className="font-medium">{mobile}</span>
        </div>

        <div className="text-sm text-gray-700 flex justify-between">
          <span>Corporate:</span>
          <span className="font-medium">{corporateName}</span>
        </div>

        <div className="text-sm text-gray-700 flex justify-between">
          <span>Branch:</span>
          <span className="font-medium">{branchName}</span>
        </div>

        <div className="text-sm text-gray-700 flex justify-between">
          <span>Vehicle:</span>
          <span className="font-medium">{vehicleNumber}</span>
        </div>
      </div>

      <div className="mt-6 space-y-4  mb-6">
        {/* Trip Date */}
        <div>
          <label className="font-semibold text-gray-700">Trip Date</label>
          <input
            type="date"
            value={tripDate}
            onChange={(e) => {
              onTripDateChange(e.target.value);
              clearFieldError("tripDate");
            }}
            className="mt-1 w-full border rounded-lg p-3"
          />
          {errors.tripDate && (
            <p className="text-red-500 text-sm">{errors.tripDate}</p>
          )}
        </div>

        {/* Start Time */}
        <div>
          <label className="font-semibold text-gray-700">Start Time</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => {
              onStartTimeChange(e.target.value);
              clearFieldError("startTime");
            }}
            className="mt-1 w-full border rounded-lg p-3"
          />
          {errors.startTime && (
            <p className="text-red-500 text-sm">{errors.startTime}</p>
          )}
        </div>

        {/* End Time */}
        <div>
          <label className="font-semibold text-gray-700">End Time</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => {
              onEndTimeChange(e.target.value);
              clearFieldError("endTime");
            }}
            className="mt-1 w-full border rounded-lg p-3"
          />
          {errors.endTime && (
            <p className="text-red-500 text-sm">{errors.endTime}</p>
          )}
        </div>

        {/* Start Location */}
        <div>
          <label className="font-semibold text-gray-700">Start Location</label>
          <input
            value={sourceName}
            onChange={(e) => {
              onSourceNameChange(e.target.value);
              clearFieldError("sourceName");
            }}
            className="mt-1 w-full border rounded-lg p-3"
            placeholder="Source"
          />
          {errors.sourceName && (
            <p className="text-red-500 text-sm">{errors.sourceName}</p>
          )}
        </div>

        {/* End Location */}
        <div>
          <label className="font-semibold text-gray-700">End Location</label>
          <input
            value={destinationName}
            onChange={(e) => {
              onDestinationNameChange(e.target.value);
              clearFieldError("destinationName");
            }}
            className="mt-1 w-full border rounded-lg p-3"
            placeholder="Destination"
          />
          {errors.destinationName && (
            <p className="text-red-500 text-sm">{errors.destinationName}</p>
          )}
        </div>

        {/* Odometers */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-semibold text-gray-700">
              Start Odometer
            </label>
            <input
              value={startOdometer}
              onChange={(e) => {
                onStartOdometerChange(e.target.value);
                clearFieldError("startOdometer");
              }}
              className="mt-1 w-full border rounded-lg p-3"
              placeholder="e.g. 12345"
            />
            {errors.startOdometer && (
              <p className="text-red-500 text-sm">{errors.startOdometer}</p>
            )}
          </div>

          <div>
            <label className="font-semibold text-gray-700">End Odometer</label>
            <input
              value={endOdometer}
              onChange={(e) => {
                onEndOdometerChange(e.target.value);
                clearFieldError("endOdometer");
              }}
              className="mt-1 w-full border rounded-lg p-3"
              placeholder="e.g. 12410"
            />
            {errors.endOdometer && (
              <p className="text-red-500 text-sm">{errors.endOdometer}</p>
            )}
          </div>
        </div>

        <div className="text-right text-lg font-semibold">
          Total KM: {totalKmDisplay()}
        </div>

        {/* Signatures */}
        <div className="bg-white rounded-xl shadow p-4 space-y-4">
          <div>
            <div className="font-semibold">Driver Signature</div>
            <SignaturePad
              ref={driverRef}
              canvasProps={{
                className: "border w-full h-40 bg-gray-50 rounded",
              }}
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => driverRef.current?.clear()}
                className="px-4 py-2 bg-gray-200 rounded cursor-pointer"
              >
                Clear
              </button>

              <button
                onClick={saveDriverSignature}
                className="px-4 py-2 bg-black text-white rounded cursor-pointer"
              >
                Save
              </button>

              {driverSignUrl && (
                <span className="text-sm text-green-600 self-center">
                  Saved ✓
                </span>
              )}
            </div>

            {driverSignUrl && (
              <img
                src={driverSignUrl}
                alt="driver-sign"
                className="h-20 mt-3"
              />
            )}
          </div>

          <div>
            <div className="font-semibold">Passenger Signature</div>
            <SignaturePad
              ref={userRef}
              canvasProps={{
                className: "border w-full h-40 bg-gray-50 rounded",
              }}
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => userRef.current?.clear()}
                className="px-4 py-2 bg-gray-200 rounded cursor-pointer"
              >
                Clear
              </button>

              <button
                onClick={saveUserSignature}
                className="px-4 py-2 bg-black text-white rounded cursor-pointer"
              >
                Save
              </button>

              {userSignUrl && (
                <span className="text-sm text-green-600 self-center">
                  Saved ✓
                </span>
              )}
            </div>

            {userSignUrl && (
              <img src={userSignUrl} alt="user-sign" className="h-20 mt-3" />
            )}
          </div>

          {errors.signatures && (
            <p className="text-red-500 text-sm">{errors.signatures}</p>
          )}
        </div>
      </div>

      {error && (
        <p className="text-red-600 text-sm mt-3 text-center">{error}</p>
      )}
      {saving && (
        <p className="text-blue-600 text-sm mt-2 text-center">Saving...</p>
      )}

      {/* Review Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow p-4">
        <button
          onClick={async () => {
            await flushAndReturn();

            const ok = validateOnSubmit();
            if (!ok) {
              window.scrollTo({ top: 0, behavior: "smooth" });
              return;
            }

            const finalPayload = buildFullPayloadFromRefs();

            const q = new URLSearchParams({
              id: String(finalPayload.tripSheetId),
              mobile,
              driverName,
              corporateName,
              branchName,
              vehicleNumber,
              tripDate: finalPayload.tripDate ?? "",
              startTime: finalPayload.startTime ?? "",
              endTime: finalPayload.endTime ?? "",
              sourceName: finalPayload.sourceName ?? "",
              destinationName: finalPayload.destinationName ?? "",
              startOdometer: finalPayload.startOdometer
                ? String(finalPayload.startOdometer)
                : "",
              endOdometer: finalPayload.endOdometer
                ? String(finalPayload.endOdometer)
                : "",
              totalKm: finalPayload.totalKm ? String(finalPayload.totalKm) : "",
              driverSign: finalPayload.driverSign ?? "",
              userSign: finalPayload.userSign ?? "",
              driverSignLat: finalPayload.driverSignLat
                ? String(finalPayload.driverSignLat)
                : "",
              driverSignLng: finalPayload.driverSignLng
                ? String(finalPayload.driverSignLng)
                : "",
              userSignLat: finalPayload.userSignLat
                ? String(finalPayload.userSignLat)
                : "",
              userSignLng: finalPayload.userSignLng
                ? String(finalPayload.userSignLng)
                : "",
            });

            router.push(`/validate-trip?${q.toString()}`);
          }}
          className="w-full bg-black text-white py-3 rounded-lg text-lg font-semibold"
        >
          Review Trip
        </button>
      </div>
    </div>
  );
}
