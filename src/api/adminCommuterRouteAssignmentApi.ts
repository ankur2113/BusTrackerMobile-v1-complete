import {
  AssignCommuterRouteRequest,
  CommuterRouteAssignment,
} from "../types/commuterRouteAssignment";
import { apiRequest } from "./httpClient";

export async function getCommuterRouteAssignments(): Promise<CommuterRouteAssignment[]> {
  return apiRequest<CommuterRouteAssignment[]>(
    "/api/v1/admin/commuter-route-assignments"
  );
}

export async function getAssignmentsForCommuter(
  commuterId: string
): Promise<CommuterRouteAssignment[]> {
  return apiRequest<CommuterRouteAssignment[]>(
    `/api/v1/admin/commuter-route-assignments/commuters/${commuterId}`
  );
}

export async function assignCommuterToRoute(
  request: AssignCommuterRouteRequest
): Promise<CommuterRouteAssignment> {
  return apiRequest<CommuterRouteAssignment>(
    "/api/v1/admin/commuter-route-assignments",
    {
      method: "POST",
      body: JSON.stringify(request),
    }
  );
}

export async function deleteCommuterRouteAssignment(
  assignmentId: string
): Promise<void> {
  return apiRequest<void>(
    `/api/v1/admin/commuter-route-assignments/${assignmentId}`,
    {
      method: "DELETE",
    }
  );
}
