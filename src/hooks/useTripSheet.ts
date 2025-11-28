// src/hooks/useTripSheet.ts
import { useCallback, useState } from "react";
import axiosInstance from "@/utils/config-global";

type StandardResponse<T = any> = {
  success?: boolean;
  message?: string;
  statusCode?: number;
  result?: T;
  data?: T;
};

export function useTripSheet() {
  const [loading, setLoading] = useState(false);

  const newTripsheetApi = useCallback(async (driverMobile: string) => {
    setLoading(true);
    try {
      const payload = { driverMobile };
      const res = await axiosInstance.post<StandardResponse>("/tripsheet/newTripsheetApi", payload);
      setLoading(false);
      // server uses standardResponse wrapper - result may be in result or data
      return res.data.result ?? res.data.data ?? res.data;
    } catch (err: any) {
      setLoading(false);
      throw err;
    }
  }, []);

  const getOrCreate = useCallback(async (mobileNumber: string, tripDate?: string) => {
    setLoading(true);
    try {
      const payload: any = { mobileNumber };
      if (tripDate) payload.tripDate = tripDate;
      const res = await axiosInstance.post<StandardResponse>("/tripsheet/get-or-create", payload);
      setLoading(false);
      return res.data.result ?? res.data.data ?? res.data;
    } catch (err: any) {
      setLoading(false);
      throw err;
    }
  }, []);

  const saveTripSheet = useCallback(async (id: number, body: any) => {
    setLoading(true);
    try {
      const res = await axiosInstance.patch<StandardResponse>(`/tripsheet/save/${id}`, body);
      setLoading(false);
      return res.data;
    } catch (err: any) {
      setLoading(false);
      throw err;
    }
  }, []);

  const submitTripSheet = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const res = await axiosInstance.patch<StandardResponse>(`/tripsheet/submit/${id}`);
      setLoading(false);
      return res.data;
    } catch (err: any) {
      setLoading(false);
      throw err;
    }
  }, []);

  const closeTripSheet = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const res = await axiosInstance.patch<StandardResponse>(`/tripsheet/close/${id}`);
      setLoading(false);
      return res.data;
    } catch (err: any) {
      setLoading(false);
      throw err;
    }
  }, []);

  const reopenTripSheet = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const res = await axiosInstance.patch<StandardResponse>(`/tripsheet/reopen/${id}`);
      setLoading(false);
      return res.data;
    } catch (err: any) {
      setLoading(false);
      throw err;
    }
  }, []);

  const getTripsByDriver = useCallback(async (driverId: number) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get<StandardResponse>(`/tripsheet/driver/${driverId}`);
      setLoading(false);
      return res.data.result ?? res.data.data ?? res.data;
    } catch (err: any) {
      setLoading(false);
      throw err;
    }
  }, []);

  return {
    loading,
    newTripsheetApi,
    getOrCreate,
    saveTripSheet,
    submitTripSheet,
    closeTripSheet,
    reopenTripSheet,
    getTripsByDriver,
  };
}
