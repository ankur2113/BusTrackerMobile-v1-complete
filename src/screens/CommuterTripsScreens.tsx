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

import { getMyCheckIns } from "../api/commuterCheckInApi";
import {
  cancelCheckInForTrip,
  checkInForTrip,
  getCommuterTripDetails,
  getCommuterTrips,
} from "../api/commuterTripApi";
import {
  CommuterCheckInResponse,
  CommuterTrip,
  CommuterTripDetails,
} from "../types/commuterTrip";
import { TripStop } from "../types/trip";
import { successHaptic, selectionHaptic } from "../utils/haptics";

export function CommuterTripsScreen() {
  const [trips, setTrips] = useState<CommuterTrip[]>([]);
  const [checkIns, setCheckIns] = useState<CommuterCheckInResponse[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [selectedTripStopId, setSelectedTripStopId] = useState<string | null>(null);
  const [tripDetails, setTripDetails] = useState<CommuterTripDetails | null>(null);

  const [loadingTrips, setLoadingTrips] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    loadTripsAndCheckIns();
  }, []);

  async function loadTripsAndCheckIns() {
    try {
      setLoadingTrips(true);
      const [tripsResponse, checkInsResponse] = await Promise.all([
        getCommuterTrips(),
        getMyCheckIns(),
      ]);
      setTrips(tripsResponse);
      setCheckIns(checkInsResponse);
    } catch (error) {
      console.error("Failed to load commuter trips", error);
      Alert.alert("Error", "Unable to load your trips.");
    } finally {
      setLoadingTrips(false);
    }
  }

  async function loadTripDetails(tripId: string) {
    try {
      setSelectedTripId(tripId);
      setSelectedTripStopId(null);
      setLoadingDetails(true);

      const response = await getCommuterTripDetails(tripId);
      setTripDetails(response);

      const existingCheckIn = getActiveCheckIn(tripId);
      if (existingCheckIn) {
        setSelectedTripStopId(existingCheckIn.tripStopId);
      }
    } catch (error) {
      console.error("Failed to load trip details", error);
      const message =
        error instanceof Error ? error.message : "Unable to load trip details.";
      Alert.alert("Error", message);
    } finally {
      setLoadingDetails(false);
    }
  }

  function getActiveCheckIn(tripId: string) {
    return checkIns.find(
      (checkIn) =>
        checkIn.tripId === tripId &&
        ["CHECKED_IN", "BOARDED", "NO_SHOW"].includes(checkIn.status)
    );
  }

  async function refreshCurrentTrip(tripId: string) {
    const [checkInsResponse, detailsResponse] = await Promise.all([
      getMyCheckIns(),
      getCommuterTripDetails(tripId),
    ]);
    setCheckIns(checkInsResponse);
    setTripDetails(detailsResponse);
  }

  async function handleCheckIn() {
    if (!selectedTripId) {
      Alert.alert("Validation error", "Please select a trip first.");
      return;
    }

    if (!selectedTripStopId) {
      Alert.alert("Validation error", "Please select your pickup stop.");
      return;
    }

    try {
      setCheckingIn(true);
      await checkInForTrip(selectedTripId, { tripStopId: selectedTripStopId });
      await refreshCurrentTrip(selectedTripId);
      await successHaptic();
      Alert.alert("Success", "You have checked in successfully.");
    } catch (error) {
      console.error("Failed to check in", error);
      const message = error instanceof Error ? error.message : "Unable to check in.";
      Alert.alert("Error", message);
    } finally {
      setCheckingIn(false);
    }
  }

  async function handleCancelCheckIn() {
    if (!selectedTripId) return;

    try {
      setCancelling(true);
      await cancelCheckInForTrip(selectedTripId);
      await refreshCurrentTrip(selectedTripId);
      setSelectedTripStopId(null);
      await successHaptic();
      Alert.alert("Success", "Your check-in has been cancelled.");
    } catch (error) {
      console.error("Failed to cancel check-in", error);
      const message =
        error instanceof Error ? error.message : "Unable to cancel check-in.";
      Alert.alert("Error", message);
    } finally {
      setCancelling(false);
    }
  }

  function renderTripCard(trip: CommuterTrip) {
    const isSelected = selectedTripId === trip.id;
    const activeCheckIn = getActiveCheckIn(trip.id);

    return (
      <View
        key={trip.id}
        style={[styles.tripCard, isSelected ? styles.selectedCard : null]}
      >
        <Text style={styles.tripTitle}>{trip.routeName || `Trip: ${trip.id}`}</Text>
        {!!trip.routeCode && <Text style={styles.text}>Route Code: {trip.routeCode}</Text>}
        {!!trip.busDisplayName && <Text style={styles.text}>Bus: {trip.busDisplayName}</Text>}
        {!!trip.busRegistrationNumber && (
          <Text style={styles.text}>Registration: {trip.busRegistrationNumber}</Text>
        )}
        {!!trip.coordinatorName && (
          <Text style={styles.text}>Coordinator: {trip.coordinatorName}</Text>
        )}
        <Text style={styles.text}>Status: {trip.status}</Text>
        <Text style={styles.text}>Start: {trip.scheduledStartAt}</Text>
        {!!trip.scheduledEndAt && <Text style={styles.text}>End: {trip.scheduledEndAt}</Text>}
        <Text style={styles.text}>
          Check-in: {activeCheckIn ? activeCheckIn.status : "Not checked in"}
        </Text>

        <Pressable style={styles.secondaryButton} onPress={() => loadTripDetails(trip.id)}>
          <Text style={styles.secondaryButtonText}>
            {isSelected ? "Reload Details" : "Open Trip"}
          </Text>
        </Pressable>
      </View>
    );
  }

  function renderStopCard(stop: TripStop) {
    const isSelected = selectedTripStopId === stop.id;
    const activeCheckIn = selectedTripId ? getActiveCheckIn(selectedTripId) : undefined;
    const checkedIn = !!activeCheckIn;

    return (
      <Pressable
        key={stop.id}
        style={[
          styles.stopCard,
          isSelected ? styles.selectedCard : null,
          checkedIn ? styles.disabledStopCard : null,
        ]}
        onPress={() => {
          if (!checkedIn) {
            selectionHaptic();
            setSelectedTripStopId(stop.id);
          }
        }}
        disabled={checkedIn}
      >
        <Text style={styles.stopTitle}>
          {stop.stopSequence}. {stop.stopName || stop.stopId}
        </Text>
        {!!stop.stopCode && <Text style={styles.text}>Code: {stop.stopCode}</Text>}
        {!!stop.scheduledArrivalAt && (
          <Text style={styles.text}>Scheduled Arrival: {stop.scheduledArrivalAt}</Text>
        )}
        <Text style={styles.text}>Stop Status: {stop.status}</Text>
      </Pressable>
    );
  }

  const activeCheckIn = selectedTripId ? getActiveCheckIn(selectedTripId) : undefined;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>My Trips</Text>
      <Text style={styles.subtitle}>View your assigned trips and check in for pickup.</Text>

      <View style={styles.listHeader}>
        <Text style={styles.cardTitle}>Assigned Trips</Text>
        <Pressable style={styles.refreshButton} onPress={loadTripsAndCheckIns}>
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </Pressable>
      </View>

      {loadingTrips && <ActivityIndicator size="large" />}
      {!loadingTrips && trips.length === 0 && (
        <Text style={styles.emptyText}>No trips assigned to you yet.</Text>
      )}
      {!loadingTrips && trips.map(renderTripCard)}

      {loadingDetails && <ActivityIndicator size="large" />}

      {tripDetails && !loadingDetails && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Trip Details</Text>
          <Text style={styles.text}>Trip ID: {tripDetails.trip.id}</Text>
          {!!tripDetails.trip.routeName && (
            <Text style={styles.text}>Route: {tripDetails.trip.routeName}</Text>
          )}
          <Text style={styles.text}>Status: {tripDetails.trip.status}</Text>
          <Text style={styles.text}>Start: {tripDetails.trip.scheduledStartAt}</Text>
          {!!tripDetails.trip.scheduledEndAt && (
            <Text style={styles.text}>End: {tripDetails.trip.scheduledEndAt}</Text>
          )}

          <Text style={styles.checkInStatus}>
            {activeCheckIn
              ? `Current check-in status: ${activeCheckIn.status}`
              : "Select your pickup stop and check in."}
          </Text>

          <Text style={styles.sectionTitle}>Pickup Stops</Text>
          {tripDetails.stops.length === 0 ? (
            <Text style={styles.emptyText}>No stops found for this trip.</Text>
          ) : (
            tripDetails.stops
              .slice()
              .sort((a, b) => a.stopSequence - b.stopSequence)
              .map(renderStopCard)
          )}

          {!activeCheckIn && (
            <Pressable
              style={[styles.primaryButton, checkingIn ? styles.disabledButton : null]}
              onPress={handleCheckIn}
              disabled={checkingIn}
            >
              <Text style={styles.primaryButtonText}>
                {checkingIn ? "Checking in..." : "Check In"}
              </Text>
            </Pressable>
          )}

          {activeCheckIn?.status === "CHECKED_IN" && (
            <Pressable
              style={[styles.dangerButton, cancelling ? styles.disabledButton : null]}
              onPress={handleCancelCheckIn}
              disabled={cancelling}
            >
              <Text style={styles.primaryButtonText}>
                {cancelling ? "Cancelling..." : "Cancel Check-In"}
              </Text>
            </Pressable>
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
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#2563eb", marginTop: 16, marginBottom: 10 },
  stopCard: { backgroundColor: "#f9fafb", padding: 14, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: "#e5e7eb" },
  disabledStopCard: { opacity: 0.75 },
  stopTitle: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 5 },
  checkInStatus: { fontSize: 15, fontWeight: "700", color: "#2563eb", marginTop: 10, marginBottom: 8 },
  primaryButton: { backgroundColor: "#2563eb", paddingVertical: 13, borderRadius: 10, alignItems: "center", marginTop: 14 },
  dangerButton: { backgroundColor: "#dc2626", paddingVertical: 13, borderRadius: 10, alignItems: "center", marginTop: 14 },
  primaryButtonText: { color: "#ffffff", fontWeight: "700", fontSize: 15 },
  disabledButton: { opacity: 0.6 },
});
