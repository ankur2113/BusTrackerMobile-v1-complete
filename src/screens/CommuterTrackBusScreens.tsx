import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { getLatestBusLocation } from "../api/commuterLocationApi";
import { getTripProgress } from "../api/commuterProgressApi";
import { getCommuterTrips } from "../api/commuterTripApi";
import { CommuterTrip } from "../types/commuterTrip";
import { LiveLocationResponse } from "../types/liveLocation";
import { TripProgress } from "../types/tripProgress";
import { selectionHaptic, warningHaptic } from "../utils/haptics";

export function CommuterTrackBusScreen() {
  const [trips, setTrips] = useState<CommuterTrip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [latestLocation, setLatestLocation] =
    useState<LiveLocationResponse | null>(null);
  const [progress, setProgress] = useState<TripProgress | null>(null);

  const [loadingTrips, setLoadingTrips] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastAlertRef = useRef<string | null>(null);

  useEffect(() => {
    loadTrips();

    return () => {
      stopAutoRefresh();
    };
  }, []);

  async function loadTrips() {
    try {
      setLoadingTrips(true);
      const response = await getCommuterTrips();
      setTrips(response);
    } catch (error) {
      console.error("Failed to load commuter trips", error);
      Alert.alert("Error", "Unable to load your trips.");
    } finally {
      setLoadingTrips(false);
    }
  }

  async function loadLatestLocation(tripId?: string) {
    const tripIdToUse = tripId || selectedTripId;

    if (!tripIdToUse) {
      Alert.alert("Validation error", "Please select a trip first.");
      return;
    }

    try {
      setLoadingLocation(true);
      const [locationResponse, progressResponse] = await Promise.allSettled([
        getLatestBusLocation(tripIdToUse),
        getTripProgress(tripIdToUse),
      ]);

      if (locationResponse.status === "fulfilled") {
        setLatestLocation(locationResponse.value);
      }

      if (progressResponse.status === "fulfilled") {
        setProgress(progressResponse.value);
        maybeShowSmartAlert(progressResponse.value);
      }

      if (
        locationResponse.status === "rejected" &&
        progressResponse.status === "rejected"
      ) {
        throw locationResponse.reason;
      }
    } catch (error) {
      console.error("Failed to load bus tracking data", error);
      const message =
        error instanceof Error
          ? error.message
          : "Unable to load bus tracking data.";
      Alert.alert("Error", message);
    } finally {
      setLoadingLocation(false);
    }
  }

  function maybeShowSmartAlert(nextProgress: TripProgress) {
    const key = `${nextProgress.tripId}-${nextProgress.alertLevel}-${nextProgress.stopsAway}`;

    if (lastAlertRef.current === key) {
      return;
    }

    lastAlertRef.current = key;

    if (
      ["ARRIVING", "TWO_STOPS_AWAY", "FIVE_STOPS_AWAY", "TEN_MINUTES_AWAY"].includes(
        nextProgress.alertLevel,
      )
    ) {
      warningHaptic();
      Alert.alert("Bus Update", nextProgress.message);
    }
  }

  async function handleSelectTrip(tripId: string) {
    await selectionHaptic();
    setSelectedTripId(tripId);
    setLatestLocation(null);
    setProgress(null);
    await loadLatestLocation(tripId);
  }

  function startAutoRefresh() {
    if (!selectedTripId) {
      Alert.alert("Validation error", "Please select a trip first.");
      return;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      loadLatestLocation(selectedTripId);
    }, 10000);

    setAutoRefresh(true);
    Alert.alert("Started", "Bus location auto-refresh started.");
  }

  function stopAutoRefresh() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setAutoRefresh(false);
  }

  function handleStopAutoRefresh() {
    stopAutoRefresh();
    Alert.alert("Stopped", "Bus location auto-refresh stopped.");
  }

  async function openInMaps() {
    if (!latestLocation) {
      Alert.alert("Error", "No location available.");
      return;
    }

    const url = `https://www.google.com/maps/search/?api=1&query=${latestLocation.latitude},${latestLocation.longitude}`;
    const canOpen = await Linking.canOpenURL(url);

    if (!canOpen) {
      Alert.alert("Error", "Unable to open maps.");
      return;
    }

    await Linking.openURL(url);
  }

  const selectedTrip = trips.find((trip) => trip.id === selectedTripId);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.heroTitle}>Track Bus</Text>
        <Text style={styles.heroSubtitle}>
          Live ETA, route progress, and bus location for your assigned trip.
        </Text>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.cardTitle}>My Trips</Text>
        <Pressable style={styles.refreshButton} onPress={loadTrips}>
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </Pressable>
      </View>

      {loadingTrips && <ActivityIndicator size="large" />}
      {!loadingTrips && trips.length === 0 && (
        <Text style={styles.emptyText}>No trips assigned to you yet.</Text>
      )}

      {!loadingTrips &&
        trips.map((trip) => {
          const isSelected = selectedTripId === trip.id;

          return (
            <View
              key={trip.id}
              style={[styles.tripCard, isSelected ? styles.selectedCard : null]}
            >
              <Text style={styles.tripTitle}>
                {trip.routeName || `Trip: ${trip.id}`}
              </Text>
              {!!trip.routeCode && (
                <Text style={styles.text}>Route Code: {trip.routeCode}</Text>
              )}
              {!!trip.busDisplayName && (
                <Text style={styles.text}>Bus: {trip.busDisplayName}</Text>
              )}
              {!!trip.busRegistrationNumber && (
                <Text style={styles.text}>
                  Registration: {trip.busRegistrationNumber}
                </Text>
              )}
              <Text style={styles.text}>Status: {trip.status}</Text>
              <Text style={styles.text}>Start: {trip.scheduledStartAt}</Text>

              <Pressable
                style={styles.secondaryButton}
                onPress={() => handleSelectTrip(trip.id)}
              >
                <Text style={styles.secondaryButtonText}>
                  {isSelected ? "Selected" : "Track This Bus"}
                </Text>
              </Pressable>
            </View>
          );
        })}

      {selectedTrip && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Smart Arrival Alert</Text>
          {progress ? (
            <>
              <View style={styles.alertPill}>
                <Text style={styles.alertPillText}>{progress.message}</Text>
              </View>
              <Text style={styles.text}>
                Your Stop: {progress.targetStopName || progress.targetStopId}
              </Text>
              <Text style={styles.text}>Stops Away: {progress.stopsAway}</Text>
              {progress.estimatedMinutesToArrival >= 0 && (
                <Text style={styles.text}>
                  ETA: {progress.estimatedMinutesToArrival} minutes
                </Text>
              )}
              {!!progress.currentStopName && (
                <Text style={styles.text}>
                  Last Updated Stop: {progress.currentStopName}
                </Text>
              )}
            </>
          ) : (
            <Text style={styles.emptyText}>
              Progress will appear after you check in or have a default stop.
            </Text>
          )}
        </View>
      )}

      {selectedTrip && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Live Tracking</Text>
          <Text style={styles.text}>
            Selected Trip: {selectedTrip.routeName || selectedTrip.id}
          </Text>
          <Text style={styles.text}>Trip Status: {selectedTrip.status}</Text>
          <Text style={styles.text}>Auto Refresh: {autoRefresh ? "On" : "Off"}</Text>

          <Pressable
            style={[styles.primaryButton, loadingLocation ? styles.disabledButton : null]}
            onPress={() => loadLatestLocation()}
            disabled={loadingLocation}
          >
            <Text style={styles.primaryButtonText}>
              {loadingLocation ? "Loading..." : "Refresh Location"}
            </Text>
          </Pressable>

          {!autoRefresh ? (
            <Pressable style={styles.primaryButton} onPress={startAutoRefresh}>
              <Text style={styles.primaryButtonText}>Start Auto Refresh</Text>
            </Pressable>
          ) : (
            <Pressable style={styles.dangerButton} onPress={handleStopAutoRefresh}>
              <Text style={styles.primaryButtonText}>Stop Auto Refresh</Text>
            </Pressable>
          )}
        </View>
      )}

      {loadingLocation && <ActivityIndicator size="large" />}

      {latestLocation && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Live Map Preview</Text>
          <View style={styles.mapPreview}>
            <View style={styles.routeLine} />
            <View style={styles.busMarker}>
              <Text style={styles.busMarkerText}>🚌</Text>
            </View>
            <View style={styles.stopMarker}>
              <Text style={styles.stopMarkerText}>📍</Text>
            </View>
          </View>
          <Text style={styles.text}>Latitude: {latestLocation.latitude}</Text>
          <Text style={styles.text}>Longitude: {latestLocation.longitude}</Text>
          {!!latestLocation.accuracyMeters && (
            <Text style={styles.text}>
              Accuracy: {latestLocation.accuracyMeters} meters
            </Text>
          )}
          {!!latestLocation.speedMps && (
            <Text style={styles.text}>Speed: {latestLocation.speedMps} m/s</Text>
          )}
          <Text style={styles.text}>
            Recorded At: {latestLocation.locationRecordedAt}
          </Text>
          <Pressable style={styles.primaryButton} onPress={openInMaps}>
            <Text style={styles.primaryButtonText}>Open in Google Maps</Text>
          </Pressable>
        </View>
      )}

      {!latestLocation && selectedTrip && !loadingLocation && (
        <Text style={styles.emptyText}>
          No bus location received yet. Ask coordinator to start live location.
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, paddingBottom: 40, backgroundColor: "#eef2ff" },
  heroCard: { backgroundColor: "#1e3a8a", borderRadius: 22, padding: 20, marginBottom: 18 },
  heroTitle: { color: "#ffffff", fontSize: 28, fontWeight: "800", marginBottom: 6 },
  heroSubtitle: { color: "#bfdbfe", fontSize: 15 },
  listHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  card: { backgroundColor: "#ffffff", padding: 16, borderRadius: 16, marginBottom: 18, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: "800", color: "#111827", marginBottom: 12 },
  refreshButton: { backgroundColor: "#e0e7ff", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  refreshButtonText: { color: "#1e3a8a", fontWeight: "800" },
  tripCard: { backgroundColor: "#ffffff", padding: 16, borderRadius: 16, marginBottom: 12, elevation: 1 },
  selectedCard: { borderWidth: 2, borderColor: "#2563eb" },
  tripTitle: { fontSize: 16, fontWeight: "800", color: "#111827", marginBottom: 6 },
  text: { fontSize: 14, color: "#4b5563", marginBottom: 3 },
  emptyText: { color: "#6b7280", fontSize: 15, marginTop: 8, marginBottom: 8 },
  secondaryButton: { backgroundColor: "#e5e7eb", paddingVertical: 10, borderRadius: 10, alignItems: "center", marginTop: 12 },
  secondaryButtonText: { color: "#111827", fontSize: 14, fontWeight: "800" },
  primaryButton: { backgroundColor: "#2563eb", paddingVertical: 13, borderRadius: 12, alignItems: "center", marginTop: 12 },
  dangerButton: { backgroundColor: "#dc2626", paddingVertical: 13, borderRadius: 12, alignItems: "center", marginTop: 12 },
  primaryButtonText: { color: "#ffffff", fontWeight: "800", fontSize: 15 },
  disabledButton: { opacity: 0.6 },
  alertPill: { backgroundColor: "#dbeafe", borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 10 },
  alertPillText: { color: "#1e40af", fontWeight: "800", fontSize: 15 },
  mapPreview: { height: 180, borderRadius: 18, backgroundColor: "#dbeafe", overflow: "hidden", marginBottom: 14, justifyContent: "center" },
  routeLine: { height: 6, backgroundColor: "#60a5fa", marginHorizontal: 28, borderRadius: 999, transform: [{ rotate: "-12deg" }] },
  busMarker: { position: "absolute", left: "58%", top: "35%", backgroundColor: "#ffffff", borderRadius: 999, padding: 10, elevation: 3 },
  busMarkerText: { fontSize: 24 },
  stopMarker: { position: "absolute", left: "20%", bottom: "25%", backgroundColor: "#ffffff", borderRadius: 999, padding: 8, elevation: 3 },
  stopMarkerText: { fontSize: 22 },
});
