import API from "../../api";
import type { EvacuationRecord } from "../types";

export interface UpdateMemberEvacuationStatusResponse {
  message: string;
  data: EvacuationRecord;
}

export const updateMemberEvacuationStatus = async (
  evacuationId: string | number,
  memberId: string,
  status: 'evacuated' | 'not_verified' | 'not_evacuated'
): Promise<UpdateMemberEvacuationStatusResponse> => {
  const res = await API.patch<UpdateMemberEvacuationStatusResponse>(
    `/api/evacuations/${evacuationId}/members/${memberId}/status`, 
    { status }
  );
  return res.data;
};
