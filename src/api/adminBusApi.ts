import { Bus, CreateBusRequest, UpdateBusRequest } from "../types/bus";
import { apiRequest } from "./httpClient";

export async function getBuses(): Promise<Bus[]> {
  return apiRequest<Bus[]>("/api/v1/admin/buses");
}

export async function getBusById(busId: string): Promise<Bus> {
  return apiRequest<Bus>(`/api/v1/admin/buses/${busId}`);
}

export async function createBus(request: CreateBusRequest): Promise<Bus> {
  return apiRequest<Bus>("/api/v1/admin/buses", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function updateBus(
  busId: string,
  request: UpdateBusRequest
): Promise<Bus> {
  return apiRequest<Bus>(`/api/v1/admin/buses/${busId}`, {
    method: "PUT",
    body: JSON.stringify(request),
  });
}

export async function deleteBus(busId: string): Promise<void> {
  return apiRequest<void>(`/api/v1/admin/buses/${busId}`, {
    method: "DELETE",
  });
}
