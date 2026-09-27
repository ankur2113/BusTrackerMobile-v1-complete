export type EmergencyStatus = "OPEN" | "RESOLVED";

export type EmergencyReport = {
  id: string;
  tripId: string;
  reportedByUserId: string;
  emergencyType: string;
  message: string;
  status: EmergencyStatus;
  reportedAt: string;
  resolvedAt?: string | null;
  resolvedByUserId?: string | null;
};

export type CreateEmergencyReportRequest = {
  emergencyType: string;
  message: string;
};
