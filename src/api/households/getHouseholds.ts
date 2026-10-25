import API from "../../api";
import type { PaginatedResponse, Household } from "../types";

export interface GetHouseholdsParams {
    q?: string;
    status?: 'evacuated' | 'not_evacuated';
    center_id?: string;
    event_id?: string;
    force_sync?: boolean | string;
}

export const getHouseholds = async (page: number = 1, params: GetHouseholdsParams = {}): Promise<PaginatedResponse<Household>> => {
    const queryParams: Record<string, string> = {
        page: String(page),
    };
    if (params.q) queryParams.q = params.q;
    if (params.status) queryParams.status = params.status;
    if (params.center_id) queryParams.center_id = params.center_id;
    if (params.event_id) queryParams.event_id = params.event_id;
    if (params.force_sync) queryParams.force_sync = '1';

    const query = new URLSearchParams(queryParams).toString();
    const res = await API.get<PaginatedResponse<Household>>(`/api/households?${query}`);
    return res.data;
}