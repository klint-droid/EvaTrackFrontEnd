import API from "../../api";
import type { DeleteCenterResponse } from "../types/evacuationCenter";

export const deleteCenter = async (centerId: number | string): Promise<DeleteCenterResponse> => {
    const response = await API.delete(`/api/evacuation-centers/${centerId}`);
    return response.data;
}