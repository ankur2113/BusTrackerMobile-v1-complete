import {
  LiveLocationHistoryResponse,
  LiveLocationResponse,
  SendLiveLocationRequest,
} from "../types/liveLocation";
import { apiRequest } from "./httpClient";

export async function sendCoordinatorLiveLocation(
  tripId: string,
  request: SendLiveLocationRequest
): Promise<LiveLocationResponse> {
  return apiRequest<LiveLocationResponse>(
    `/api/v1/coordinator/trips/${tripId}/location`,
    {
      method: "POST",
      body: JSON.stringify(request),
    }
  );
}

export async function getCoordinatorLatestLocation(
  tripId: string
): Promise<LiveLocationResponse> {
  return apiRequest<LiveLocationResponse>(
    `/api/v1/coordinator/trips/${tripId}/location`
  );
}

export async function getCoordinatorLocationHistory(
  tripId: string
): Promise<LiveLocationHistoryResponse[]> {
  return apiRequest<LiveLocationHistoryResponse[]>(
    `/api/v1/coordinator/trips/${tripId}/location/history`
  );
}
