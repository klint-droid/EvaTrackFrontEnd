import API from "../../api";
import type { EvacuationRecord } from "../types";

export interface ScanQRPayload {
  household_id: string;
  event_id?: string | null;
  member_ids?: string[];
}

export interface ScanQRResponse {
  message: string;
  data: EvacuationRecord;
}

export const scanQR = async (data: ScanQRPayload): Promise<ScanQRResponse> => {
  const res = await API.post<ScanQRResponse>('/api/evacuations/process-scan', data);
  return res.data;
};
