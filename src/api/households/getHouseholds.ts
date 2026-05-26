import API from "../../api";
import type { PaginatedResponse, Household } from "../types";

export interface GetHouseholdsParams {
    q?: string;
    status?: 'evacuated' | 'not_evacuated';
    center_id?: string;
}

export const getHouseholds = async (page: number = 1, params: GetHouseholdsParams = {}): Promise<PaginatedResponse<Household>> => {
    const query = new URLSearchParams({
        page: String(page),
        ...params as Record<string, string>
    }).toString();
    const res = await API.get<PaginatedResponse<Household>>(`/api/households?${query}`);
    return res.data;
}