import API from "../../api";

export interface DeleteUserResponse {
    message: string;
}

export const deleteUser = async (userId: string): Promise<DeleteUserResponse> => {
    const response = await API.delete<DeleteUserResponse>(`/api/users/${userId}`);
    return response.data;
};
