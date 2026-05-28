import API from "../../api";
import type { User } from "../types";

export interface UpdateUserPayload {
    first_name?: string;
    last_name?: string;
    role?: 'evac_personnel' | 'evac_admin' | 'super_admin';
    contact_number?: string;
}

export interface UpdateUserResponse {
    message: string;
    user: User;
}

export const updateUser = async (
    id: string, 
    data: UpdateUserPayload
): Promise<UpdateUserResponse> => {
    const response = await API.put<UpdateUserResponse>(`/api/users/${id}`, data);
    return response.data;
};
