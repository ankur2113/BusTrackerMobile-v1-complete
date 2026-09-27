export type TripProgress = {
  tripId: string;
  targetTripStopId: string;
  targetStopId: string;
  targetStopName?: string | null;
  targetStopSequence: number;
  currentTripStopId?: string | null;
  currentStopName?: string | null;
  currentStopSequence?: number | null;
  stopsAway: number;
  estimatedMinutesToArrival: number;
  alertLevel:
    | "ARRIVING"
    | "TWO_STOPS_AWAY"
    | "FIVE_STOPS_AWAY"
    | "TEN_MINUTES_AWAY"
    | "ON_THE_WAY";
  message: string;
  scheduledArrivalAt?: string | null;
};
