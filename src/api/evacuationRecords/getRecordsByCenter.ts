import API from "../../api";
import type { EvacuationRecord } from "../types";

export interface GetRecordsByCenterResponse {
  data: EvacuationRecord[];
}

export const getRecordsByCenter = async (
  centerId: string, 
  statusId: number | null = null,
  eventId: string | null = null
): Promise<GetRecordsByCenterResponse> => {
  const query = new URLSearchParams({
    center_id: centerId,
    ...(statusId ? { household_status_id: String(statusId) } : {}),
    ...(eventId ? { event_id: eventId } : {})
  }).toString();
  
  const res = await API.get<GetRecordsByCenterResponse>(`/api/evacuations?${query}`);
  return res.data;
};
