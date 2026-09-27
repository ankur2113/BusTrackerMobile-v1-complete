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

import { getCoordinatorTrips } from "../api/coordinatorTripApi";
import {
  getPassengerManifest,
  markCheckInBoarded,
  markCheckInNoShow,
} from "../api/coordinatorManifestApi";
import { Trip } from "../types/trip";
import { ManifestCheckIn, ManifestStop, PassengerManifest } from "../types/manifest";
import { successHaptic, warningHaptic } from "../utils/haptics";

export function CoordinatorManifestScreen() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [manifest, setManifest] = useState<PassengerManifest>([]);

  const [loadingTrips, setLoadingTrips] = useState(false);
  const [loadingManifest, setLoadingManifest] = useState(false);
  const [updatingCheckInId, setUpdatingCheckInId] = useState<string | null>(null);

  useEffect(() => {
    loadTrips();
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

  async function loadManifest(tripId: string) {
    try {
      setSelectedTripId(tripId);
      setLoadingManifest(true);
      const response = await getPassengerManifest(tripId);
      setManifest(response);
    } catch (error) {
      console.error("Failed to load passenger manifest", error);
      const message =
        error instanceof Error
          ? error.message
          : "Unable to load passenger manifest.";
      Alert.alert("Error", message);
    } finally {
      setLoadingManifest(false);
    }
  }

  async function handleMarkBoarded(checkIn: ManifestCheckIn) {
    if (!selectedTripId) return;

    try {
      setUpdatingCheckInId(checkIn.id);
      await markCheckInBoarded(selectedTripId, checkIn.id);
      await loadManifest(selectedTripId);
      await successHaptic();
      Alert.alert("Success", "Commuter marked as boarded.");
    } catch (error) {
      console.error("Failed to mark boarded", error);
      const message =
        error instanceof Error ? error.message : "Unable to mark boarded.";
      Alert.alert("Error", message);
    } finally {
      setUpdatingCheckInId(null);
    }
  }

  async function handleMarkNoShow(checkIn: ManifestCheckIn) {
    if (!selectedTripId) return;

    try {
      setUpdatingCheckInId(checkIn.id);
      await markCheckInNoShow(selectedTripId, checkIn.id);
      await loadManifest(selectedTripId);
      await warningHaptic();
      Alert.alert("Success", "Commuter marked as no-show.");
    } catch (error) {
      console.error("Failed to mark no-show", error);
      const message =
        error instanceof Error ? error.message : "Unable to mark no-show.";
      Alert.alert("Error", message);
    } finally {
      setUpdatingCheckInId(null);
    }
  }

  function renderPassenger(checkIn: ManifestCheckIn) {
    const isUpdating = updatingCheckInId === checkIn.id;
    const canUpdate = checkIn.status === "CHECKED_IN";

    return (
      <View key={checkIn.id} style={styles.checkInCard}>
        <Text style={styles.checkInTitle}>
          {checkIn.commuterName || checkIn.commuterId}
        </Text>
        {!!checkIn.commuterPhone && (
          <Text style={styles.text}>Phone: {checkIn.commuterPhone}</Text>
        )}
        <Text style={styles.text}>Status: {checkIn.status}</Text>
        {!!checkIn.checkedInAt && (
          <Text style={styles.text}>Checked In: {checkIn.checkedInAt}</Text>
        )}
        {!!checkIn.boardedAt && (
          <Text style={styles.text}>Boarded At: {checkIn.boardedAt}</Text>
        )}
        {!!checkIn.cancelledAt && (
          <Text style={styles.text}>Cancelled At: {checkIn.cancelledAt}</Text>
        )}

        {canUpdate && (
          <View style={styles.actionRow}>
            <Pressable
              style={[styles.primaryButton, isUpdating ? styles.disabledButton : null]}
              onPress={() => handleMarkBoarded(checkIn)}
              disabled={isUpdating}
            >
              <Text style={styles.primaryButtonText}>
                {isUpdating ? "Updating..." : "Mark Boarded"}
              </Text>
            </Pressable>

            <Pressable
              style={[styles.dangerButton, isUpdating ? styles.disabledButton : null]}
              onPress={() => handleMarkNoShow(checkIn)}
              disabled={isUpdating}
            >
              <Text style={styles.primaryButtonText}>No Show</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  }

  function renderStop(stop: ManifestStop) {
    return (
      <View key={stop.tripStopId} style={styles.stopCard}>
        <Text style={styles.stopTitle}>
          {stop.stopSequence ? `${stop.stopSequence}. ` : ""}
          {stop.stopName || stop.stopId}
        </Text>
        {!!stop.stopCode && <Text style={styles.text}>Code: {stop.stopCode}</Text>}
        <Text style={styles.text}>Stop Status: {stop.stopStatus}</Text>

        {stop.passengers.length === 0 ? (
          <Text style={styles.emptyText}>No checked-in commuters at this stop.</Text>
        ) : (
          stop.passengers.map(renderPassenger)
        )}
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Passenger Manifest</Text>
      <Text style={styles.subtitle}>View checked-in commuters and mark boarded/no-show.</Text>

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
              <Text style={styles.tripTitle}>{trip.routeName || `Trip: ${trip.id}`}</Text>
              <Text style={styles.text}>Status: {trip.status}</Text>
              <Text style={styles.text}>Start: {trip.scheduledStartAt}</Text>
              {!!trip.scheduledEndAt && <Text style={styles.text}>End: {trip.scheduledEndAt}</Text>}

              <Pressable style={styles.secondaryButton} onPress={() => loadManifest(trip.id)}>
                <Text style={styles.secondaryButtonText}>
                  {isSelected ? "Reload Manifest" : "Open Manifest"}
                </Text>
              </Pressable>
            </View>
          );
        })}

      {loadingManifest && <ActivityIndicator size="large" />}

      {selectedTripId && !loadingManifest && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Manifest</Text>
          <Text style={styles.text}>Trip ID: {selectedTripId}</Text>

          {manifest.length === 0 ? (
            <Text style={styles.emptyText}>No stops found in manifest.</Text>
          ) : (
            manifest
              .slice()
              .sort((a, b) => (a.stopSequence ?? 0) - (b.stopSequence ?? 0))
              .map(renderStop)
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
  tripCard: { backgroundColor: "#ffffff", padding: 16, borderRadius: 14, marginBottom: 12, elevation: 1 },
  selectedCard: { borderWidth: 2, borderColor: "#2563eb" },
  tripTitle: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 6 },
  text: { fontSize: 14, color: "#4b5563", marginBottom: 3 },
  emptyText: { color: "#6b7280", fontSize: 15, marginTop: 8, marginBottom: 8 },
  secondaryButton: { backgroundColor: "#e5e7eb", paddingVertical: 10, borderRadius: 10, alignItems: "center", marginTop: 12 },
  secondaryButtonText: { color: "#111827", fontSize: 14, fontWeight: "700" },
  stopCard: { backgroundColor: "#f9fafb", padding: 14, borderRadius: 12, marginTop: 14, borderWidth: 1, borderColor: "#e5e7eb" },
  stopTitle: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 6 },
  checkInCard: { backgroundColor: "#ffffff", padding: 12, borderRadius: 10, marginTop: 10, borderWidth: 1, borderColor: "#e5e7eb" },
  checkInTitle: { fontSize: 15, fontWeight: "700", color: "#111827", marginBottom: 5 },
  actionRow: { flexDirection: "row", gap: 8, marginTop: 10, flexWrap: "wrap" },
  primaryButton: { flex: 1, minWidth: 120, backgroundColor: "#2563eb", paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  dangerButton: { flex: 1, minWidth: 100, backgroundColor: "#dc2626", paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  primaryButtonText: { color: "#ffffff", fontWeight: "700" },
  disabledButton: { opacity: 0.6 },
});
