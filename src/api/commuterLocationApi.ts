import { LiveLocationResponse } from "../types/liveLocation";
import { apiRequest } from "./httpClient";

export async function getLatestBusLocation(
  tripId: string
): Promise<LiveLocationResponse> {
  return apiRequest<LiveLocationResponse>(
    `/api/v1/commuter/trips/${tripId}/location`
  );
}
