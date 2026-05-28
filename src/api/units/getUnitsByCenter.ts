import API from "../../api";
import type { Unit } from "../types";

export interface GetUnitsByCenterResponse {
    data: Unit[];
}

export const getUnitsByCenter = async (centerId: string): Promise<GetUnitsByCenterResponse> => {
    const response = await API.get<GetUnitsByCenterResponse>(`/api/centers/${centerId}/units`);
    return response.data;
};
