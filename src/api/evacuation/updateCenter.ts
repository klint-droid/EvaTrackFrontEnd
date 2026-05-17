import API from "../../api";
import type { UpdateCenterPayload, UpdateCenterResponse} from "../types/evacuationCenter";

export const updateCenter = async (centerId: number | string, centerData: UpdateCenterPayload): Promise<UpdateCenterResponse> => {
  const response = await API.put(`/api/evacuation-centers/${centerId}`, centerData);
  return response.data;
}
