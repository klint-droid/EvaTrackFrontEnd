import API from "../../api";
import type { User } from "../types";

export interface AssignCenterResponse {
    message: string;
    data: User;
}

export const assignCenter = async (
    userId: string, 
    centerId: string | null
): Promise<AssignCenterResponse> => {
    const response = await API.post<AssignCenterResponse>(`/api/users/${userId}/assign-center`, {
        assigned_center_id: centerId,
    });
    return response.data;
};
