import { CommuterCheckInResponse } from "./commuterTrip";
import { TripStopStatus } from "./trip";

export type ManifestCheckIn = CommuterCheckInResponse;

export type ManifestStop = {
  tripStopId: string;
  stopId: string;
  stopCode?: string | null;
  stopName?: string | null;
  stopSequence?: number | null;
  stopStatus: TripStopStatus;
  passengers: ManifestCheckIn[];
};

export type PassengerManifest = ManifestStop[];
