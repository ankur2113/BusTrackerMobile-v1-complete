export type SendLiveLocationRequest = {
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  speedMps?: number;
  headingDegrees?: number;
  locationRecordedAt?: string;
};

export type LiveLocationResponse = {
  tripId: string;
  latitude: number;
  longitude: number;
  accuracyMeters?: number | null;
  speedMps?: number | null;
  headingDegrees?: number | null;
  locationRecordedAt?: string | null;
  locationReceivedAt?: string | null;
};

export type LiveLocationHistoryResponse = LiveLocationResponse & {
  id: string;
  source?: string | null;
};
