import API from "../../api";
import type { DeleteCenterResponse } from "../types/evacuationCenter";

export const deleteCenter = async (centerId: number | string): Promise<DeleteCenterResponse> => {
    if (!centerId || typeof centerId === 'object') {
        throw new Error('Invalid center ID provided for deletion.');
    }
    const response = await API.delete(`/api/evacuation-centers/${centerId}`);
    return response.data;
}