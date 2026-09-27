import { Trip, TripDetails } from "./trip";

export type CommuterTrip = Trip;

export type CommuterTripDetails = TripDetails;

export type CommuterCheckInRequest = {
  tripStopId: string;
};

export type CheckInStatus = "CHECKED_IN" | "CANCELLED" | "BOARDED" | "NO_SHOW";

export type CommuterCheckInResponse = {
  id: string;

  tripId: string;
  tripStopId: string;

  commuterId: string;
  commuterName?: string | null;
  commuterPhone?: string | null;

  stopId: string;
  stopCode?: string | null;
  stopName?: string | null;
  stopSequence?: number | null;

  status: CheckInStatus;

  checkedInAt?: string | null;
  boardedAt?: string | null;
  cancelledAt?: string | null;
};
