export interface Center {
  evacuation_center_id: string;
  name: string;
  capacity: number;
  latitude: number;
  longitude: number;
  osm_address: string;
}

export interface CreateCenterPayload {
  name: string;
  capacity: number;
  latitude: number;
  longitude: number;
  osm_address: string;
}

export interface CreateCenterResponse {
  message: string;
  data: Center;
}

export interface DeleteCenterResponse {
  message: string;
}

export interface UpdateCenterPayload extends CreateCenterPayload {}

export interface UpdateCenterResponse extends CreateCenterResponse {}

export interface CenterCapacityResponse {
  capacity: number;
  current_occupancy: number;
  available_capacity: number;
}