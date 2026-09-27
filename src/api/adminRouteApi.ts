import {
  AddRouteStopRequest,
  BusRoute,
  CreateRouteRequest,
  RouteDetails,
  UpdateRouteRequest,
} from "../types/route";
import { apiRequest } from "./httpClient";

export async function getRoutes(): Promise<BusRoute[]> {
  return apiRequest<BusRoute[]>("/api/v1/admin/routes");
}

export async function getRouteDetails(routeId: string): Promise<RouteDetails> {
  return apiRequest<RouteDetails>(`/api/v1/admin/routes/${routeId}`);
}

export async function createRoute(
  request: CreateRouteRequest
): Promise<BusRoute> {
  return apiRequest<BusRoute>("/api/v1/admin/routes", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function updateRoute(
  routeId: string,
  request: UpdateRouteRequest
): Promise<BusRoute> {
  return apiRequest<BusRoute>(`/api/v1/admin/routes/${routeId}`, {
    method: "PUT",
    body: JSON.stringify(request),
  });
}

export async function deleteRoute(routeId: string): Promise<void> {
  return apiRequest<void>(`/api/v1/admin/routes/${routeId}`, {
    method: "DELETE",
  });
}

export async function addStopToRoute(
  routeId: string,
  request: AddRouteStopRequest
): Promise<RouteDetails> {
  return apiRequest<RouteDetails>(`/api/v1/admin/routes/${routeId}/stops`, {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function removeStopFromRoute(
  routeId: string,
  routeStopId: string
): Promise<void> {
  return apiRequest<void>(
    `/api/v1/admin/routes/${routeId}/stops/${routeStopId}`,
    { method: "DELETE" }
  );
}
