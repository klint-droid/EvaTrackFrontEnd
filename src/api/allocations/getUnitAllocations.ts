import API from "../../api";
import type { UnitAllocation } from "../types";

export interface GetUnitAllocationsResponse {
    data: UnitAllocation[];
}

export const getUnitAllocations = async (unitId: number | string): Promise<GetUnitAllocationsResponse> => {
    const response = await API.get<GetUnitAllocationsResponse>(`/api/units/${unitId}/allocations`);
    return response.data;
};
