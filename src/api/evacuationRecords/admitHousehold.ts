import API from "../../api";
import type { EvacuationRecord } from "../types";

export interface AdmitHouseholdPayload {
    household_id: string;
    member_count: number;
    event_id?: string | null;
}

export interface AdmitHouseholdResponse {
    message: string;
    data: EvacuationRecord;
}

export const admitHousehold = async (data: AdmitHouseholdPayload): Promise<AdmitHouseholdResponse> => {
    const res = await API.post<AdmitHouseholdResponse>("/api/evacuations/admit", data);
    return res.data;
}