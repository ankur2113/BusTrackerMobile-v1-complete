export type CommuterRouteAssignment = {
  id: string;
  commuterId: string;
  routeId: string;
  defaultStopId?: string | null;
  active: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type AssignCommuterRouteRequest = {
  commuterId: string;
  routeId: string;
  defaultStopId: string;
};
