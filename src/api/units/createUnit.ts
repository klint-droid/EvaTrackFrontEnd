import API from "../../api";
import type { Unit } from "../types";

export interface CreateUnitPayload {
    name: string;
    type_id: number | string;
    max_capacity: number;
}

export interface CreateUnitResponse {
    message: string;
    data: Unit;
}

export const createUnit = async (
    centerId: string, 
    data: CreateUnitPayload
): Promise<CreateUnitResponse> => {
    const response = await API.post<CreateUnitResponse>(`/api/centers/${centerId}/units`, data);
    return response.data;
};
