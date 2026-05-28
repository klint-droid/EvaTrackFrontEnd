import API from "../../api";
import type { UnitAllocation } from "../types";

export interface AssignHouseholdResponse {
    message: string;
    data: UnitAllocation;
}

export const assignHousehold = async (
    unitId: number | string, 
    evacuationId: number | string
): Promise<AssignHouseholdResponse> => {
    const response = await API.post<AssignHouseholdResponse>(`/api/units/${unitId}/allocations`, { 
        evacuation_id: evacuationId 
    });
    return response.data;
};
