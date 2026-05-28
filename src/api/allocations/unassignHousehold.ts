import API from '../../api';

export interface UnassignHouseholdResponse {
    message: string;
}

export const unassignHousehold = async (
    unitId: number | string, 
    allocationId: number | string
): Promise<UnassignHouseholdResponse> => {
    const response = await API.delete<UnassignHouseholdResponse>(`/api/units/${unitId}/allocations/${allocationId}`);
    return response.data;
};
