import API from "../../api";
import type { CreateCenterPayload, CreateCenterResponse } from "../types/evacuationCenter";

export const createCenter = async ( centerData: CreateCenterPayload ): Promise<CreateCenterResponse> => {
  const response = await API.post("/api/evacuation-centers", centerData);
  return response.data;
}