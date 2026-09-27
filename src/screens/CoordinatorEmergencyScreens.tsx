import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  getTripEmergencies,
  reportTripEmergency,
} from "../api/coordinatorEmergencyApi";
import { getCoordinatorTrips } from "../api/coordinatorTripApi";
import { EmergencyReport } from "../types/emergency";
import { Trip } from "../types/trip";
import { successHaptic, warningHaptic } from "../utils/haptics";

export function CoordinatorEmergencyScreen() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [emergencies, setEmergencies] = useState<EmergencyReport[]>([]);
  const [emergencyType, setEmergencyType] = useState("BREAKDOWN");
  const [message, setMessage] = useState("");
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  async function selectTrip(tripId: string) {
    setSelectedTripId(tripId);
    const response = await getTripEmergencies(tripId);
    setEmergencies(response);
  }

  async function handleReportEmergency() {
    if (!selectedTripId) {
      Alert.alert("Validation error", "Please select a trip first.");
      return;
    }

    if (!emergencyType.trim() || !message.trim()) {
      Alert.alert("Validation error", "Emergency type and message are required.");
      return;
    }

    try {
      setSubmitting(true);
      await reportTripEmergency(selectedTripId, {
        emergencyType: emergencyType.trim(),
        message: message.trim(),
      });
      await warningHaptic();
      setMessage("");
      await selectTrip(selectedTripId);
      Alert.alert("Emergency sent", "Admin can now see this emergency report.");
    } catch (error) {
      console.error("Failed to report emergency", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unable to report emergency.";
      Alert.alert("Error", errorMessage);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.heroTitle}>Emergency / SOS</Text>
        <Text style={styles.heroSubtitle}>
          Report a breakdown, delay, medical issue, or route emergency to admin.
        </Text>
      </View>

      {loadingTrips && <ActivityIndicator size="large" />}

      {trips.map((trip) => {
        const isSelected = selectedTripId === trip.id;
        return (
          <Pressable
            key={trip.id}
            style={[styles.tripCard, isSelected ? styles.selectedCard : null]}
            onPress={async () => {
              await successHaptic();
              await selectTrip(trip.id);
            }}
          >
            <Text style={styles.tripTitle}>{trip.routeName || `Trip: ${trip.id}`}</Text>
            <Text style={styles.text}>Status: {trip.status}</Text>
            <Text style={styles.text}>Start: {trip.scheduledStartAt}</Text>
          </Pressable>
        );
      })}

      {selectedTripId && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Send SOS</Text>
          <Text style={styles.label}>Emergency Type</Text>
          <TextInput
            style={styles.input}
            value={emergencyType}
            onChangeText={setEmergencyType}
            placeholder="BREAKDOWN / DELAY / MEDICAL / OTHER"
            autoCapitalize="characters"
          />

          <Text style={styles.label}>Message</Text>
          <TextInput
            style={[styles.input, styles.messageInput]}
            value={message}
            onChangeText={setMessage}
            placeholder="Explain what happened and what riders should know"
            multiline
          />

          <Pressable
            style={[styles.dangerButton, submitting ? styles.disabledButton : null]}
            onPress={handleReportEmergency}
            disabled={submitting}
          >
            <Text style={styles.buttonText}>{submitting ? "Sending..." : "Report Emergency"}</Text>
          </Pressable>
        </View>
      )}

      {selectedTripId && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Trip Emergency History</Text>
          {emergencies.length === 0 ? (
            <Text style={styles.emptyText}>No emergency reports for this trip.</Text>
          ) : (
            emergencies.map((item) => (
              <View key={item.id} style={styles.emergencyCard}>
                <Text style={styles.tripTitle}>{item.emergencyType}</Text>
                <Text style={styles.text}>{item.message}</Text>
                <Text style={styles.text}>Status: {item.status}</Text>
                <Text style={styles.text}>Reported: {item.reportedAt}</Text>
              </View>
            ))
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, paddingBottom: 40, backgroundColor: "#eef2ff" },
  heroCard: { backgroundColor: "#1e1b4b", borderRadius: 22, padding: 20, marginBottom: 18 },
  heroTitle: { color: "#ffffff", fontSize: 28, fontWeight: "800", marginBottom: 6 },
  heroSubtitle: { color: "#c7d2fe", fontSize: 15 },
  card: { backgroundColor: "#ffffff", padding: 16, borderRadius: 16, marginBottom: 18, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: "800", color: "#111827", marginBottom: 12 },
  tripCard: { backgroundColor: "#ffffff", padding: 16, borderRadius: 16, marginBottom: 12, elevation: 1 },
  selectedCard: { borderWidth: 2, borderColor: "#4f46e5" },
  tripTitle: { fontSize: 16, fontWeight: "800", color: "#111827", marginBottom: 4 },
  text: { fontSize: 14, color: "#4b5563", marginBottom: 3 },
  label: { fontSize: 14, fontWeight: "700", color: "#374151", marginBottom: 6 },
  input: { backgroundColor: "#f9fafb", borderWidth: 1, borderColor: "#d1d5db", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 11, fontSize: 15, marginBottom: 14 },
  messageInput: { minHeight: 90, textAlignVertical: "top" },
  dangerButton: { backgroundColor: "#dc2626", paddingVertical: 14, borderRadius: 12, alignItems: "center", marginTop: 4 },
  buttonText: { color: "#ffffff", fontSize: 16, fontWeight: "800" },
  disabledButton: { opacity: 0.6 },
  emptyText: { color: "#6b7280", fontSize: 15 },
  emergencyCard: { backgroundColor: "#fef2f2", padding: 12, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: "#fecaca" },
});
