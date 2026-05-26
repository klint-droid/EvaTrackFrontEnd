import API from "../../api";

export interface DeleteHouseholdResponse {
    message: string;
}

export const deleteHousehold = async (id: string): Promise<DeleteHouseholdResponse> => {
    const res = await API.delete<DeleteHouseholdResponse>(`/api/households/${id}`);
    return res.data;
}