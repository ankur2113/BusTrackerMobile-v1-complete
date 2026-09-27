export type BusRoute = {
  id: string;
  routeCode: string;
  routeName: string;
  description?: string | null;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateRouteRequest = {
  routeCode: string;
  routeName: string;
  description?: string;
};

export type UpdateRouteRequest = {
  routeName: string;
  description?: string;
  active?: boolean;
};

export type AddRouteStopRequest = {
  stopId: string;
  stopSequence: number;
  plannedArrivalOffsetMinutes: number;
  pickupEnabled: boolean;
};

export type RouteStop = {
  routeStopId?: string;
  id?: string;
  stopId: string;
  stopCode?: string;
  stopName?: string;
  landmark?: string | null;
  latitude?: number;
  longitude?: number;
  stopSequence: number;
  plannedArrivalOffsetMinutes: number;
  pickupEnabled: boolean;
  active?: boolean;
};

export type RouteDetails = {
  route: BusRoute;
  stops: RouteStop[];
};
