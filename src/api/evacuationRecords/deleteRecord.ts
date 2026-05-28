import API from "../../api";

export interface DeleteRecordResponse {
  message: string;
}

export const deleteRecord = async (evacuationId: string | number): Promise<DeleteRecordResponse> => {
  const res = await API.delete<DeleteRecordResponse>(`/api/evacuations/${evacuationId}`);
  return res.data;
};
