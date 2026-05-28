import API from "../../api";

export interface DeleteUnitResponse {
    message: string;
}

export const deleteUnit = async (
    centerId: string, 
    unitId: number | string
): Promise<DeleteUnitResponse> => {
    const response = await API.delete<DeleteUnitResponse>(`/api/centers/${centerId}/units/${unitId}`);
    return response.data;
};
