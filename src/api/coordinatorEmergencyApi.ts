import { apiRequest } from "./httpClient";
import {
  CreateEmergencyReportRequest,
  EmergencyReport,
} from "../types/emergency";

export async function reportTripEmergency(
  tripId: string,
  request: CreateEmergencyReportRequest,
): Promise<EmergencyReport> {
  return apiRequest<EmergencyReport>(
    `/api/v1/coordinator/trips/${tripId}/emergencies`,
    {
      method: "POST",
      body: JSON.stringify(request),
    },
  );
}

export async function getTripEmergencies(
  tripId: string,
): Promise<EmergencyReport[]> {
  return apiRequest<EmergencyReport[]>(
    `/api/v1/coordinator/trips/${tripId}/emergencies`,
  );
}
