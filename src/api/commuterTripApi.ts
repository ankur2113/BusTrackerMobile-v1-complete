import {
  CommuterCheckInRequest,
  CommuterCheckInResponse,
  CommuterTrip,
  CommuterTripDetails,
} from "../types/commuterTrip";
import { apiRequest } from "./httpClient";

export async function getCommuterTrips(): Promise<CommuterTrip[]> {
  return apiRequest<CommuterTrip[]>("/api/v1/commuter/trips");
}

export async function getCommuterTripDetails(
  tripId: string
): Promise<CommuterTripDetails> {
  return apiRequest<CommuterTripDetails>(`/api/v1/commuter/trips/${tripId}`);
}

export async function checkInForTrip(
  tripId: string,
  request: CommuterCheckInRequest
): Promise<CommuterCheckInResponse> {
  return apiRequest<CommuterCheckInResponse>(
    `/api/v1/commuter/trips/${tripId}/check-in`,
    {
      method: "POST",
      body: JSON.stringify(request),
    }
  );
}

export async function cancelCheckInForTrip(
  tripId: string
): Promise<CommuterCheckInResponse> {
  return apiRequest<CommuterCheckInResponse>(
    `/api/v1/commuter/trips/${tripId}/check-in/cancel`,
    {
      method: "POST",
    }
  );
}
