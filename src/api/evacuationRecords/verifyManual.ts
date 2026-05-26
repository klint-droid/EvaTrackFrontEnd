import API from "../../api";
import type { EvacuationRecord } from "../types";

export interface VerifyManualPayload {
  household_id: string;
  event_id?: string | null;
}

export interface VerifyManualResponse {
  message: string;
  data: EvacuationRecord;
}

export const verifyManual = async (data: VerifyManualPayload): Promise<VerifyManualResponse> => {
  const res = await API.post<VerifyManualResponse>('/api/evacuations/verify-manual', data);
  return res.data;
};
