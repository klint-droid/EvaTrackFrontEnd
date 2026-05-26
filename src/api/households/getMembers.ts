import API from "../../api";
import type { HouseholdMember } from "../types";

export interface GetMembersResponse {
    data: HouseholdMember[];
}

export const getMembers = async (householdId: string): Promise<GetMembersResponse> => {
    const res = await API.get<GetMembersResponse>(`/api/households/${householdId}/members`);
    return res.data;
}