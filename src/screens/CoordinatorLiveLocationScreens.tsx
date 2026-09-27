import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { sendCoordinatorLiveLocation } from "../api/coordinatorLocationApi";
import { getCoordinatorTrips } from "../api/coordinatorTripApi";
import { LiveLocationResponse } from "../types/liveLocation";
import { startBackgroundBusLocation, stopBackgroundBusLocation } from "../tasks/backgroundLocationTask";
import { successHaptic, warningHaptic } from "../utils/haptics";
import { Trip } from "../types/trip";

export function CoordinatorLiveLocationScreen() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  const [loadingTrips, setLoadingTrips] = useState(false);
  const [sending, setSending] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [backgroundSharing, setBackgroundSharing] = useState(false);

  const [lastLocation, setLastLocation] = useState<LiveLocationResponse | null>(
    null,
  );

  const locationSubscriptionRef = useRef<Location.LocationSubscription | null>(
    null,
  );

  useEffect(() => {
    loadTrips();

    return () => {
      stopSharing();
    };
  }, []);

  async function loadTrips() {
    try {
      setLoadingTrips(true);

      const response = await getCoordinatorTrips();
      setTrips(response);
    } catch (error) {
      console.error("Failed to load trips", error);
      Alert.alert("Error", "Unable to load assigned trips.");
    } finally {
      setLoadingTrips(false);
    }
  }

  async function requestLocationPermission() {
    const permission = await Location.requestForegroundPermissionsAsync();

    if (permission.status !== "granted") {
      Alert.alert(
        "Permission required",
        "Location permission is required to share live bus location.",
      );
      return false;
    }

    return true;
  }

  async function sendLocation(location: Location.LocationObject) {
    if (!selectedTripId) {
      Alert.alert("Validation error", "Please select a trip first.");
      return;
    }

    const response = await sendCoordinatorLiveLocation(selectedTripId, {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracyMeters: location.coords.accuracy ?? undefined,
      headingDegrees: location.coords.heading ?? undefined,
      speedMps: location.coords.speed ?? undefined,
      locationRecordedAt: new Date(location.timestamp).toISOString(),
    });

    setLastLocation(response);
  }

  async function handleSendOnce() {
    if (!selectedTripId) {
      Alert.alert("Validation error", "Please select a trip first.");
      return;
    }

    try {
      setSending(true);

      const hasPermission = await requestLocationPermission();

      if (!hasPermission) {
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      await sendLocation(location);
      await successHaptic();

      Alert.alert("Success", "Current location sent successfully.");
    } catch (error) {
      console.error("Failed to send location", error);
      const message =
        error instanceof Error ? error.message : "Unable to send location.";
      Alert.alert("Error", message);
    } finally {
      setSending(false);
    }
  }

  async function handleStartSharing() {
    if (!selectedTripId) {
      Alert.alert("Validation error", "Please select a trip first.");
      return;
    }

    try {
      const hasPermission = await requestLocationPermission();

      if (!hasPermission) {
        return;
      }

      if (locationSubscriptionRef.current) {
        locationSubscriptionRef.current.remove();
        locationSubscriptionRef.current = null;
      }

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        async (location) => {
          try {
            await sendLocation(location);
          } catch (error) {
            console.error("Failed to send live location update", error);
          }
        },
      );

      locationSubscriptionRef.current = subscription;
      setSharing(true);
      await successHaptic();

      Alert.alert("Started", "Live location sharing started.");
    } catch (error) {
      console.error("Failed to start live sharing", error);
      const message =
        error instanceof Error
          ? error.message
          : "Unable to start live location sharing.";
      Alert.alert("Error", message);
    }
  }

  function stopSharing() {
    if (locationSubscriptionRef.current) {
      locationSubscriptionRef.current.remove();
      locationSubscriptionRef.current = null;
    }

    setSharing(false);
  }

  async function handleStopSharing() {
    stopSharing();
    await successHaptic();
    Alert.alert("Stopped", "Live location sharing stopped.");
  }

  async function handleStartBackgroundSharing() {
    if (!selectedTripId) {
      Alert.alert("Validation error", "Please select a trip first.");
      return;
    }

    try {
      await startBackgroundBusLocation(selectedTripId);
      setBackgroundSharing(true);
      await warningHaptic();
      Alert.alert(
        "Background sharing started",
        "Location will continue to be shared while the trip is active."
      );
    } catch (error) {
      console.error("Failed to start background sharing", error);
      const message =
        error instanceof Error
          ? error.message
          : "Unable to start background location sharing.";
      Alert.alert("Error", message);
    }
  }

  async function handleStopBackgroundSharing() {
    await stopBackgroundBusLocation();
    setBackgroundSharing(false);
    await successHaptic();
    Alert.alert("Stopped", "Background location sharing stopped.");
  }

  const selectedTrip = trips.find((trip) => trip.id === selectedTripId);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Send Live Location</Text>

      <Text style={styles.subtitle}>
        Share coordinator phone GPS location for the selected trip.
      </Text>

      <View style={styles.listHeader}>
        <Text style={styles.cardTitle}>Assigned Trips</Text>

        <Pressable style={styles.refreshButton} onPress={loadTrips}>
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </Pressable>
      </View>

      {loadingTrips && <ActivityIndicator size="large" />}

      {!loadingTrips && trips.length === 0 && (
        <Text style={styles.emptyText}>No assigned trips found.</Text>
      )}

      {!loadingTrips &&
        trips.map((trip) => {
          const isSelected = selectedTripId === trip.id;

          return (
            <View
              key={trip.id}
              style={[styles.tripCard, isSelected ? styles.selectedCard : null]}
            >
              <Text style={styles.tripTitle}>Trip: {trip.id}</Text>
              <Text style={styles.text}>Status: {trip.status}</Text>
              <Text style={styles.text}>Start: {trip.scheduledStartAt}</Text>
              <Text style={styles.text}>End: {trip.scheduledEndAt}</Text>

              <Pressable
                style={styles.secondaryButton}
                onPress={() => setSelectedTripId(trip.id)}
              >
                <Text style={styles.secondaryButtonText}>
                  {isSelected ? "Selected" : "Select Trip"}
                </Text>
              </Pressable>
            </View>
          );
        })}

      {selectedTrip && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Location Sharing</Text>

          <Text style={styles.text}>Selected Trip: {selectedTrip.id}</Text>
          <Text style={styles.text}>Trip Status: {selectedTrip.status}</Text>
          <Text style={styles.text}>
            Sharing Status: {sharing ? "Live sharing active" : "Not sharing"}
          </Text>
          <Text style={styles.text}>
            Background Sharing: {backgroundSharing ? "On" : "Off"}
          </Text>

          <Pressable
            style={[
              styles.primaryButton,
              sending ? styles.disabledButton : null,
            ]}
            onPress={handleSendOnce}
            disabled={sending}
          >
            <Text style={styles.primaryButtonText}>
              {sending ? "Sending..." : "Send Location Once"}
            </Text>
          </Pressable>

          {!sharing ? (
            <Pressable
              style={styles.primaryButton}
              onPress={handleStartSharing}
            >
              <Text style={styles.primaryButtonText}>Start Live Sharing</Text>
            </Pressable>
          ) : (
            <Pressable style={styles.dangerButton} onPress={handleStopSharing}>
              <Text style={styles.primaryButtonText}>Stop Live Sharing</Text>
            </Pressable>
          )}

          {!backgroundSharing ? (
            <Pressable
              style={styles.primaryButton}
              onPress={handleStartBackgroundSharing}
            >
              <Text style={styles.primaryButtonText}>Start Background Sharing</Text>
            </Pressable>
          ) : (
            <Pressable
              style={styles.dangerButton}
              onPress={handleStopBackgroundSharing}
            >
              <Text style={styles.primaryButtonText}>Stop Background Sharing</Text>
            </Pressable>
          )}
        </View>
      )}

      {lastLocation && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Last Sent Location</Text>

          <Text style={styles.text}>Latitude: {lastLocation.latitude}</Text>
          <Text style={styles.text}>Longitude: {lastLocation.longitude}</Text>

          {!!lastLocation.accuracyMeters && (
            <Text style={styles.text}>
              Accuracy: {lastLocation.accuracyMeters} meters
            </Text>
          )}

          {!!lastLocation.speedMps && (
            <Text style={styles.text}>
              Speed: {lastLocation.speedMps} m/s
            </Text>
          )}

          <Text style={styles.text}>
            Recorded At: {lastLocation.locationRecordedAt}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: "#f4f6f8",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: "#6b7280",
    marginBottom: 20,
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 24,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  refreshButton: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: "#111827",
    fontWeight: "600",
  },
  tripCard: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    elevation: 1,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: "#2563eb",
  },
  tripTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  text: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 3,
  },
  emptyText: {
    color: "#6b7280",
    fontSize: 15,
    marginTop: 8,
    marginBottom: 8,
  },
  secondaryButton: {
    backgroundColor: "#e5e7eb",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },
  secondaryButtonText: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "700",
  },
  primaryButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },
  dangerButton: {
    backgroundColor: "#dc2626",
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 15,
  },
  disabledButton: {
    opacity: 0.6,
  },
});
