import API from "../../api";
import type { EvacuationRecord } from "../types";

export interface GetEvacuationRecordResponse {
  data: EvacuationRecord;
}

export const getEvacuationRecord = async (id: string | number): Promise<GetEvacuationRecordResponse> => {
  const res = await API.get<GetEvacuationRecordResponse>(`/api/evacuations/${id}`);
  return res.data;
};
