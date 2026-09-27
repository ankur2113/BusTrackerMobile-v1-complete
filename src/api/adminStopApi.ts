import { BusStop, CreateStopRequest, UpdateStopRequest } from "../types/stop";
import { apiRequest } from "./httpClient";

export async function getStops(): Promise<BusStop[]> {
  return apiRequest<BusStop[]>("/api/v1/admin/stops");
}

export async function getStopById(stopId: string): Promise<BusStop> {
  return apiRequest<BusStop>(`/api/v1/admin/stops/${stopId}`);
}

export async function createStop(request: CreateStopRequest): Promise<BusStop> {
  return apiRequest<BusStop>("/api/v1/admin/stops", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function updateStop(
  stopId: string,
  request: UpdateStopRequest
): Promise<BusStop> {
  return apiRequest<BusStop>(`/api/v1/admin/stops/${stopId}`, {
    method: "PUT",
    body: JSON.stringify(request),
  });
}

export async function deleteStop(stopId: string): Promise<void> {
  return apiRequest<void>(`/api/v1/admin/stops/${stopId}`, {
    method: "DELETE",
  });
}
