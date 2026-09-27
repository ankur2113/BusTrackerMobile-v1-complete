import * as Location from "expo-location";
import * as SecureStore from "expo-secure-store";
import * as TaskManager from "expo-task-manager";

import { API_BASE_URL } from "../config/api";
import { getAccessToken } from "../storage/tokenStorage";

export const BUS_LOCATION_TASK = "bus-tracker-background-location";
export const BACKGROUND_TRIP_ID_KEY = "bus_tracker_background_trip_id";

type LocationTaskData = {
  locations?: Location.LocationObject[];
};

TaskManager.defineTask(BUS_LOCATION_TASK, async ({ data, error }: any) => {
  if (error) {
    console.log("Background location task error", error);
    return;
  }

  const taskData = data as LocationTaskData;
  const location = taskData.locations?.[0];

  if (!location) {
    return;
  }

  const tripId = await SecureStore.getItemAsync(BACKGROUND_TRIP_ID_KEY);
  const token = await getAccessToken();

  if (!tripId || !token) {
    return;
  }

  await fetch(`${API_BASE_URL}/api/v1/coordinator/trips/${tripId}/location`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracyMeters: location.coords.accuracy ?? undefined,
      headingDegrees: location.coords.heading ?? undefined,
      speedMps: location.coords.speed ?? undefined,
      locationRecordedAt: new Date(location.timestamp).toISOString(),
    }),
  });
});

export async function startBackgroundBusLocation(tripId: string) {
  const foreground = await Location.requestForegroundPermissionsAsync();

  if (foreground.status !== "granted") {
    throw new Error("Foreground location permission is required.");
  }

  const background = await Location.requestBackgroundPermissionsAsync();

  if (background.status !== "granted") {
    throw new Error("Background location permission is required.");
  }

  await SecureStore.setItemAsync(BACKGROUND_TRIP_ID_KEY, tripId);

  const hasStarted = await Location.hasStartedLocationUpdatesAsync(
    BUS_LOCATION_TASK
  );

  if (hasStarted) {
    await Location.stopLocationUpdatesAsync(BUS_LOCATION_TASK);
  }

  await Location.startLocationUpdatesAsync(BUS_LOCATION_TASK, {
    accuracy: Location.Accuracy.High,
    timeInterval: 10000,
    distanceInterval: 15,
    pausesUpdatesAutomatically: false,
    foregroundService: {
      notificationTitle: "Bus Tracker live location",
      notificationBody: "Sharing bus location for the active trip.",
      notificationColor: "#2563eb",
    },
  });
}

export async function stopBackgroundBusLocation() {
  const hasStarted = await Location.hasStartedLocationUpdatesAsync(
    BUS_LOCATION_TASK
  );

  if (hasStarted) {
    await Location.stopLocationUpdatesAsync(BUS_LOCATION_TASK);
  }

  await SecureStore.deleteItemAsync(BACKGROUND_TRIP_ID_KEY);
}
