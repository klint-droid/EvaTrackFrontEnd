import API from "../../api";
import type { Unit } from "../types";

export interface UpdateUnitPayload {
    name?: string;
    type_id?: number | string;
    max_capacity?: number;
}

export interface UpdateUnitResponse {
    message: string;
    data: Unit;
}

export const updateUnit = async (
    centerId: string, 
    unitId: number | string, 
    data: UpdateUnitPayload
): Promise<UpdateUnitResponse> => {
    const response = await API.put<UpdateUnitResponse>(`/api/centers/${centerId}/units/${unitId}`, data);
    return response.data;
};
