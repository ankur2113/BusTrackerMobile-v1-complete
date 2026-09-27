export type Bus = {
  id: string;
  registrationNumber: string;
  displayName: string;
  capacity: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateBusRequest = {
  registrationNumber: string;
  displayName?: string;
  capacity: number;
};

export type UpdateBusRequest = {
  displayName?: string;
  capacity?: number;
  active?: boolean;
};
