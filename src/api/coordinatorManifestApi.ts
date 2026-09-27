import { ManifestCheckIn, PassengerManifest } from "../types/manifest";
import { apiRequest } from "./httpClient";

export async function getPassengerManifest(
  tripId: string
): Promise<PassengerManifest> {
  return apiRequest<PassengerManifest>(
    `/api/v1/coordinator/trips/${tripId}/manifest`
  );
}

export async function getStopCheckIns(
  tripId: string,
  tripStopId: string
): Promise<ManifestCheckIn[]> {
  return apiRequest<ManifestCheckIn[]>(
    `/api/v1/coordinator/trips/${tripId}/stops/${tripStopId}/check-ins`
  );
}

export async function markCheckInBoarded(
  tripId: string,
  checkInId: string
): Promise<ManifestCheckIn> {
  return apiRequest<ManifestCheckIn>(
    `/api/v1/coordinator/trips/${tripId}/check-ins/${checkInId}/boarded`,
    {
      method: "POST",
    }
  );
}

export async function markCheckInNoShow(
  tripId: string,
  checkInId: string
): Promise<ManifestCheckIn> {
  return apiRequest<ManifestCheckIn>(
    `/api/v1/coordinator/trips/${tripId}/check-ins/${checkInId}/no-show`,
    {
      method: "POST",
    }
  );
}
