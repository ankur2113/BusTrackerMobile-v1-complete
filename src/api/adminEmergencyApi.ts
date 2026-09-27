import { apiRequest } from "./httpClient";
import { EmergencyReport } from "../types/emergency";

export async function getOpenEmergencies(): Promise<EmergencyReport[]> {
  return apiRequest<EmergencyReport[]>("/api/v1/admin/emergencies");
}

export async function resolveEmergency(
  emergencyId: string,
): Promise<EmergencyReport> {
  return apiRequest<EmergencyReport>(
    `/api/v1/admin/emergencies/${emergencyId}/resolve`,
    {
      method: "POST",
    },
  );
}
