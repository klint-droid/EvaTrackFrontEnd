import API from "../../api";
import type { Unit } from "../types";

export interface GetUnitsByCenterResponse {
    current_page: number;
    data: Unit[];
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
}

export const getUnitsByCenter = async (centerId: string, page: number = 1, limit: number = 15): Promise<GetUnitsByCenterResponse> => {
    const response = await API.get<GetUnitsByCenterResponse>(`/api/centers/${centerId}/units`, {
        params: { page, limit }
    });
    return response.data;
};
