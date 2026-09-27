import { CommuterCheckInResponse } from "../types/commuterTrip";
import { apiRequest } from "./httpClient";

export async function getMyCheckIns(): Promise<CommuterCheckInResponse[]> {
  return apiRequest<CommuterCheckInResponse[]>("/api/v1/commuter/check-in");
}
