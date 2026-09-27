export type TripStatus =
  | "PLANNED"
  | "BOARDING"
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELLED";

export type TripStopStatus = "PENDING" | "ARRIVED" | "DEPARTED" | "SKIPPED";

export type Trip = {
  id: string;

  routeId: string;
  routeCode?: string | null;
  routeName?: string | null;

  busId: string;
  busRegistrationNumber?: string | null;
  busDisplayName?: string | null;

  coordinatorId: string;
  coordinatorName?: string | null;

  scheduledStartAt: string;
  scheduledEndAt?: string | null;
  actualStartAt?: string | null;
  actualEndAt?: string | null;

  status: TripStatus;
};

export type TripStop = {
  id: string;
  stopId: string;

  stopCode?: string | null;
  stopName?: string | null;
  landmark?: string | null;

  latitude?: number | null;
  longitude?: number | null;

  stopSequence: number;

  scheduledArrivalAt?: string | null;
  actualArrivalAt?: string | null;

  status: TripStopStatus;
};

export type TripDetails = {
  trip: Trip;
  stops: TripStop[];
};

export type CreateTripRequest = {
  routeId: string;
  busId: string;
  coordinatorId: string;
  scheduledStartAt: string;
  scheduledEndAt?: string | null;
};
