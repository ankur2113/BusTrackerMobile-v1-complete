import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  endTrip,
  getCoordinatorTripDetails,
  getCoordinatorTrips,
  markStopArrived,
  markStopDeparted,
  markStopSkipped,
  markTripBoarding,
  startTrip,
} from "../api/coordinatorTripApi";
import { Trip, TripDetails, TripStop } from "../types/trip";

export function CoordinatorTripsScreen() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [tripDetails, setTripDetails] = useState<TripDetails | null>(null);

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadTrips();
  }, []);

  async function loadTrips() {
    try {
      setLoading(true);
      const response = await getCoordinatorTrips();
      setTrips(response);
    } catch (error) {
      console.error("Failed to load coordinator trips", error);
      Alert.alert("Error", "Unable to load assigned trips.");
    } finally {
      setLoading(false);
    }
  }

  async function loadTripDetails(tripId: string) {
    try {
      setSelectedTripId(tripId);
      const details = await getCoordinatorTripDetails(tripId);
      setTripDetails(details);
    } catch (error) {
      console.error("Failed to load trip details", error);
      Alert.alert("Error", "Unable to load trip details.");
    }
  }

  async function runTripAction(
    successMessage: string,
    action: () => Promise<TripDetails>
  ) {
    try {
      setActionLoading(true);
      const details = await action();
      setTripDetails(details);
      await loadTrips();
      Alert.alert("Success", successMessage);
    } catch (error) {
      console.error("Trip action failed", error);
      const message =
        error instanceof Error ? error.message : "Unable to perform action.";
      Alert.alert("Error", message);
    } finally {
      setActionLoading(false);
    }
  }

  async function runStopAction(
    successMessage: string,
    action: () => Promise<TripStop>
  ) {
    if (!selectedTripId) return;

    try {
      setActionLoading(true);
      await action();
      await loadTripDetails(selectedTripId);
      await loadTrips();
      Alert.alert("Success", successMessage);
    } catch (error) {
      console.error("Stop action failed", error);
      const message =
        error instanceof Error ? error.message : "Unable to update stop status.";
      Alert.alert("Error", message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleBoarding() {
    if (!selectedTripId) return;
    await runTripAction("Trip marked as boarding.", () =>
      markTripBoarding(selectedTripId)
    );
  }

  async function handleStartTrip() {
    if (!selectedTripId) return;
    await runTripAction("Trip started successfully.", () =>
      startTrip(selectedTripId)
    );
  }

  async function handleEndTrip() {
    if (!selectedTripId) return;
    await runTripAction("Trip ended successfully.", () => endTrip(selectedTripId));
  }

  async function handleStopAction(
    tripStop: TripStop,
    actionType: "ARRIVED" | "DEPARTED" | "SKIPPED"
  ) {
    if (!selectedTripId) return;

    if (actionType === "ARRIVED") {
      await runStopAction("Stop marked as arrived.", () =>
        markStopArrived(selectedTripId, tripStop.id)
      );
      return;
    }

    if (actionType === "DEPARTED") {
      await runStopAction("Stop marked as departed.", () =>
        markStopDeparted(selectedTripId, tripStop.id)
      );
      return;
    }

    await runStopAction("Stop marked as skipped.", () =>
      markStopSkipped(selectedTripId, tripStop.id)
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Assigned Trips</Text>
      <Text style={styles.subtitle}>View your trips and update trip progress.</Text>

      <View style={styles.listHeader}>
        <Text style={styles.cardTitle}>Trips</Text>
        <Pressable style={styles.refreshButton} onPress={loadTrips}>
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </Pressable>
      </View>

      {loading && <ActivityIndicator size="large" />}
      {!loading && trips.length === 0 && (
        <Text style={styles.emptyText}>No assigned trips found.</Text>
      )}

      {!loading &&
        trips.map((trip) => {
          const isSelected = selectedTripId === trip.id;
          return (
            <View
              key={trip.id}
              style={[styles.tripCard, isSelected ? styles.selectedCard : null]}
            >
              <Text style={styles.tripTitle}>{trip.routeName || `Trip: ${trip.id}`}</Text>
              <Text style={styles.tripText}>Status: {trip.status}</Text>
              <Text style={styles.tripText}>Start: {trip.scheduledStartAt}</Text>
              {!!trip.scheduledEndAt && <Text style={styles.tripText}>End: {trip.scheduledEndAt}</Text>}
              {!!trip.busDisplayName && <Text style={styles.tripText}>Bus: {trip.busDisplayName}</Text>}

              <Pressable style={styles.secondaryButton} onPress={() => loadTripDetails(trip.id)}>
                <Text style={styles.secondaryButtonText}>
                  {isSelected ? "Selected" : "View Details"}
                </Text>
              </Pressable>
            </View>
          );
        })}

      {tripDetails && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Trip Actions</Text>
          <Text style={styles.tripText}>Trip ID: {tripDetails.trip.id}</Text>
          <Text style={styles.tripText}>Status: {tripDetails.trip.status}</Text>

          <View style={styles.actionRow}>
            <Pressable
              style={[styles.actionButton, actionLoading ? styles.disabledButton : null]}
              onPress={handleBoarding}
              disabled={actionLoading}
            >
              <Text style={styles.actionButtonText}>Boarding</Text>
            </Pressable>

            <Pressable
              style={[styles.actionButton, actionLoading ? styles.disabledButton : null]}
              onPress={handleStartTrip}
              disabled={actionLoading}
            >
              <Text style={styles.actionButtonText}>Start</Text>
            </Pressable>

            <Pressable
              style={[styles.dangerButton, actionLoading ? styles.disabledButton : null]}
              onPress={handleEndTrip}
              disabled={actionLoading}
            >
              <Text style={styles.actionButtonText}>End</Text>
            </Pressable>
          </View>
        </View>
      )}

      {tripDetails && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Trip Stops</Text>

          {tripDetails.stops.length === 0 ? (
            <Text style={styles.emptyText}>No stops found for this trip.</Text>
          ) : (
            tripDetails.stops
              .slice()
              .sort((a, b) => a.stopSequence - b.stopSequence)
              .map((stop) => (
                <View key={stop.id} style={styles.stopCard}>
                  <Text style={styles.stopTitle}>
                    {stop.stopSequence}. {stop.stopName ?? stop.stopId}
                  </Text>
                  {!!stop.stopCode && <Text style={styles.tripText}>Code: {stop.stopCode}</Text>}
                  <Text style={styles.tripText}>Status: {stop.status}</Text>
                  {!!stop.scheduledArrivalAt && (
                    <Text style={styles.tripText}>Scheduled Arrival: {stop.scheduledArrivalAt}</Text>
                  )}
                  {!!stop.actualArrivalAt && (
                    <Text style={styles.tripText}>Actual Arrival: {stop.actualArrivalAt}</Text>
                  )}

                  <View style={styles.actionRow}>
                    <Pressable
                      style={[styles.smallActionButton, actionLoading ? styles.disabledButton : null]}
                      onPress={() => handleStopAction(stop, "ARRIVED")}
                      disabled={actionLoading}
                    >
                      <Text style={styles.smallActionText}>Arrived</Text>
                    </Pressable>

                    <Pressable
                      style={[styles.smallActionButton, actionLoading ? styles.disabledButton : null]}
                      onPress={() => handleStopAction(stop, "DEPARTED")}
                      disabled={actionLoading}
                    >
                      <Text style={styles.smallActionText}>Departed</Text>
                    </Pressable>

                    <Pressable
                      style={[styles.smallDangerButton, actionLoading ? styles.disabledButton : null]}
                      onPress={() => handleStopAction(stop, "SKIPPED")}
                      disabled={actionLoading}
                    >
                      <Text style={styles.smallActionText}>Skipped</Text>
                    </Pressable>
                  </View>
                </View>
              ))
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, paddingBottom: 40, backgroundColor: "#f4f6f8" },
  title: { fontSize: 26, fontWeight: "700", color: "#111827", marginBottom: 6 },
  subtitle: { fontSize: 15, color: "#6b7280", marginBottom: 20 },
  listHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  card: { backgroundColor: "#ffffff", padding: 16, borderRadius: 14, marginBottom: 24, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: "700", color: "#111827", marginBottom: 12 },
  refreshButton: { backgroundColor: "#e5e7eb", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  refreshButtonText: { color: "#111827", fontWeight: "600" },
  emptyText: { color: "#6b7280", fontSize: 15, marginTop: 8, marginBottom: 8 },
  tripCard: { backgroundColor: "#ffffff", padding: 16, borderRadius: 14, marginBottom: 12, elevation: 1 },
  selectedCard: { borderWidth: 2, borderColor: "#2563eb" },
  tripTitle: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 6 },
  tripText: { fontSize: 14, color: "#4b5563", marginBottom: 3 },
  secondaryButton: { backgroundColor: "#e5e7eb", paddingVertical: 10, borderRadius: 10, alignItems: "center", marginTop: 12 },
  secondaryButtonText: { color: "#111827", fontSize: 14, fontWeight: "700" },
  actionRow: { flexDirection: "row", gap: 8, marginTop: 12, flexWrap: "wrap" },
  actionButton: { flex: 1, minWidth: 90, backgroundColor: "#2563eb", paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  dangerButton: { flex: 1, minWidth: 90, backgroundColor: "#dc2626", paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  actionButtonText: { color: "#ffffff", fontWeight: "700" },
  disabledButton: { opacity: 0.6 },
  stopCard: { backgroundColor: "#f9fafb", padding: 14, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: "#e5e7eb" },
  stopTitle: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 5 },
  smallActionButton: { backgroundColor: "#2563eb", paddingVertical: 9, paddingHorizontal: 10, borderRadius: 8 },
  smallDangerButton: { backgroundColor: "#dc2626", paddingVertical: 9, paddingHorizontal: 10, borderRadius: 8 },
  smallActionText: { color: "#ffffff", fontWeight: "700", fontSize: 13 },
});
