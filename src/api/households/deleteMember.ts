import API from '../../api';

export interface DeleteMemberResponse {
    message: string;
}

export const deleteMember = async (householdId: string, memberId: string): Promise<DeleteMemberResponse> => {
    const res = await API.delete<DeleteMemberResponse>(`/api/households/${householdId}/members/${memberId}`);
    return res.data;
}