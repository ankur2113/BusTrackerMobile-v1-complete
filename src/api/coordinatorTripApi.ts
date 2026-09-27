import { Trip, TripDetails, TripStop } from "../types/trip";
import { apiRequest } from "./httpClient";

export async function getCoordinatorTrips(): Promise<Trip[]> {
  return apiRequest<Trip[]>("/api/v1/coordinator/trips");
}

export async function getCoordinatorTripDetails(
  tripId: string
): Promise<TripDetails> {
  return apiRequest<TripDetails>(`/api/v1/coordinator/trips/${tripId}`);
}

export async function markTripBoarding(tripId: string): Promise<TripDetails> {
  return apiRequest<TripDetails>(
    `/api/v1/coordinator/trips/${tripId}/boarding`,
    {
      method: "POST",
    }
  );
}

export async function startTrip(tripId: string): Promise<TripDetails> {
  return apiRequest<TripDetails>(`/api/v1/coordinator/trips/${tripId}/start`, {
    method: "POST",
  });
}

export async function endTrip(tripId: string): Promise<TripDetails> {
  return apiRequest<TripDetails>(`/api/v1/coordinator/trips/${tripId}/end`, {
    method: "POST",
  });
}

export async function markStopArrived(
  tripId: string,
  tripStopId: string
): Promise<TripStop> {
  return apiRequest<TripStop>(
    `/api/v1/coordinator/trips/${tripId}/stops/${tripStopId}/arrived`,
    {
      method: "POST",
    }
  );
}

export async function markStopDeparted(
  tripId: string,
  tripStopId: string
): Promise<TripStop> {
  return apiRequest<TripStop>(
    `/api/v1/coordinator/trips/${tripId}/stops/${tripStopId}/departed`,
    {
      method: "POST",
    }
  );
}

export async function markStopSkipped(
  tripId: string,
  tripStopId: string
): Promise<TripStop> {
  return apiRequest<TripStop>(
    `/api/v1/coordinator/trips/${tripId}/stops/${tripStopId}/skipped`,
    {
      method: "POST",
    }
  );
}
