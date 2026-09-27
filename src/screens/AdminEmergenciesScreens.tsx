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

import { getOpenEmergencies, resolveEmergency } from "../api/adminEmergencyApi";
import { EmergencyReport } from "../types/emergency";
import { successHaptic } from "../utils/haptics";

export function AdminEmergenciesScreen() {
  const [emergencies, setEmergencies] = useState<EmergencyReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  useEffect(() => {
    loadEmergencies();
  }, []);

  async function loadEmergencies() {
    try {
      setLoading(true);
      const response = await getOpenEmergencies();
      setEmergencies(response);
    } catch (error) {
      console.error("Failed to load emergencies", error);
      Alert.alert("Error", "Unable to load emergency reports.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResolve(emergencyId: string) {
    try {
      setResolvingId(emergencyId);
      await resolveEmergency(emergencyId);
      await successHaptic();
      await loadEmergencies();
      Alert.alert("Resolved", "Emergency report marked as resolved.");
    } catch (error) {
      console.error("Failed to resolve emergency", error);
      const message =
        error instanceof Error ? error.message : "Unable to resolve emergency.";
      Alert.alert("Error", message);
    } finally {
      setResolvingId(null);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.heroTitle}>Emergency Reports</Text>
        <Text style={styles.heroSubtitle}>Open SOS reports from coordinators.</Text>
      </View>

      <Pressable style={styles.refreshButton} onPress={loadEmergencies}>
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </Pressable>

      {loading && <ActivityIndicator size="large" />}

      {!loading && emergencies.length === 0 && (
        <Text style={styles.emptyText}>No open emergency reports.</Text>
      )}

      {emergencies.map((item) => {
        const resolving = resolvingId === item.id;
        return (
          <View key={item.id} style={styles.card}>
            <Text style={styles.cardTitle}>{item.emergencyType}</Text>
            <Text style={styles.text}>{item.message}</Text>
            <Text style={styles.text}>Trip: {item.tripId}</Text>
            <Text style={styles.text}>Reported: {item.reportedAt}</Text>
            <Text style={styles.status}>Status: {item.status}</Text>

            <Pressable
              style={[styles.primaryButton, resolving ? styles.disabledButton : null]}
              onPress={() => handleResolve(item.id)}
              disabled={resolving}
            >
              <Text style={styles.primaryButtonText}>
                {resolving ? "Resolving..." : "Mark Resolved"}
              </Text>
            </Pressable>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, paddingBottom: 40, backgroundColor: "#f8fafc" },
  heroCard: { backgroundColor: "#7f1d1d", borderRadius: 22, padding: 20, marginBottom: 18 },
  heroTitle: { color: "#ffffff", fontSize: 28, fontWeight: "800", marginBottom: 6 },
  heroSubtitle: { color: "#fecaca", fontSize: 15 },
  refreshButton: { backgroundColor: "#e5e7eb", paddingVertical: 11, borderRadius: 12, alignItems: "center", marginBottom: 14 },
  refreshButtonText: { color: "#111827", fontWeight: "800" },
  card: { backgroundColor: "#ffffff", padding: 16, borderRadius: 16, marginBottom: 12, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: "800", color: "#111827", marginBottom: 6 },
  text: { fontSize: 14, color: "#4b5563", marginBottom: 3 },
  status: { fontSize: 14, color: "#dc2626", fontWeight: "800", marginTop: 5 },
  primaryButton: { backgroundColor: "#16a34a", paddingVertical: 12, borderRadius: 12, alignItems: "center", marginTop: 12 },
  primaryButtonText: { color: "#ffffff", fontWeight: "800" },
  disabledButton: { opacity: 0.6 },
  emptyText: { color: "#6b7280", fontSize: 15, marginTop: 8 },
});
