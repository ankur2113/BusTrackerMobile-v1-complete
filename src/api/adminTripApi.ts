import { CreateTripRequest, Trip, TripDetails } from "../types/trip";
import { apiRequest } from "./httpClient";

export async function getTrips(): Promise<Trip[]> {
  return apiRequest<Trip[]>("/api/v1/admin/trips");
}

export async function getTripDetails(tripId: string): Promise<TripDetails> {
  return apiRequest<TripDetails>(`/api/v1/admin/trips/${tripId}`);
}

export async function createTrip(
  request: CreateTripRequest,
): Promise<TripDetails> {
  return apiRequest<TripDetails>("/api/v1/admin/trips", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function cancelTrip(tripId: string): Promise<TripDetails> {
  return apiRequest<TripDetails>(`/api/v1/admin/trips/${tripId}/cancel`, {
    method: "POST",
  });
}
