import API from "../../api";
import type { CenterCapacityResponse } from "../types/evacuationCenter";

export const getCapacity = async (centerId: number | string): Promise<CenterCapacityResponse> => {
  const response = await API.get(`/api/evacuation-centers/${centerId}/capacity`);
  return response.data;
};