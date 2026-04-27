import API from '../../api';

export const updateMemberEvacuationStatus = async (
    evacuationId,
    memberId,
    status
) => {
    const response = await API.patch(
        `/api/evacuations/${evacuationId}/members/${memberId}/status`,
        { status }
    );

    return response.data;
};