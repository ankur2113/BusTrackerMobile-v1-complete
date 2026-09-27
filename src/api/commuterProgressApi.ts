import { apiRequest } from "./httpClient";
import { TripProgress } from "../types/tripProgress";

export async function getTripProgress(tripId: string): Promise<TripProgress> {
  return apiRequest<TripProgress>(`/api/v1/commuter/trips/${tripId}/progress`);
}
