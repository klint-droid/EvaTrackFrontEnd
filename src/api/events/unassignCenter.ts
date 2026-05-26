import API from "../../api";
import type { Center } from "../types";

export interface UnassignCenterResponse {
  message: string;
  data: Center;
}

export const unassignCenter = async (centerId: string): Promise<UnassignCenterResponse> => {
  const response = await API.patch<UnassignCenterResponse>(`/api/centers/${centerId}/unassign`);
  return response.data;
};
