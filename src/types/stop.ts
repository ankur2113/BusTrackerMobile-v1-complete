export type BusStop = {
  id: string;
  stopCode: string;
  stopName: string;
  landmark?: string | null;
  latitude: number;
  longitude: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateStopRequest = {
  stopCode?: string;
  stopName: string;
  landmark?: string;
  latitude: number;
  longitude: number;
};

export type UpdateStopRequest = {
  stopName: string;
  landmark?: string;
  latitude: number;
  longitude: number;
  active?: boolean;
};
