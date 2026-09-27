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

import { createStop, getStops } from "../api/adminStopApi";
import { BusStop } from "../types/stop";

export function ManageStopsScreen() {
  const [stops, setStops] = useState<BusStop[]>([]);
  const [stopCode, setStopCode] = useState("");
  const [stopName, setStopName] = useState("");
  const [landmark, setLandmark] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadStops();
  }, []);

  async function loadStops() {
    try {
      setLoading(true);
      const response = await getStops();
      setStops(response);
    } catch (error) {
      console.error("Failed to load stops", error);
      Alert.alert("Error", "Unable to load stops.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateStop() {
    if (!stopCode.trim()) {
      Alert.alert("Validation error", "Stop code is required.");
      return;
    }

    if (!stopName.trim()) {
      Alert.alert("Validation error", "Stop name is required.");
      return;
    }

    const parsedLatitude = Number(latitude);
    const parsedLongitude = Number(longitude);

    if (Number.isNaN(parsedLatitude) || parsedLatitude < -90 || parsedLatitude > 90) {
      Alert.alert("Validation error", "Latitude must be between -90 and 90.");
      return;
    }

    if (
      Number.isNaN(parsedLongitude) ||
      parsedLongitude < -180 ||
      parsedLongitude > 180
    ) {
      Alert.alert("Validation error", "Longitude must be between -180 and 180.");
      return;
    }

    try {
      setCreating(true);

      await createStop({
        stopCode: stopCode.trim(),
        stopName: stopName.trim(),
        landmark: landmark.trim() || undefined,
        latitude: parsedLatitude,
        longitude: parsedLongitude,
      });

      setStopCode("");
      setStopName("");
      setLandmark("");
      setLatitude("");
      setLongitude("");

      await loadStops();

      Alert.alert("Success", "Stop created successfully.");
    } catch (error) {
      console.error("Failed to create stop", error);
      Alert.alert("Error", "Unable to create stop.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Manage Stops</Text>
      <Text style={styles.subtitle}>
        Create and view pickup/drop points used in routes.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Create Stop</Text>

        <Text style={styles.label}>Stop Code</Text>
        <TextInput
          style={styles.input}
          value={stopCode}
          onChangeText={setStopCode}
          placeholder="Example: STOP-A-2001"
          autoCapitalize="characters"
        />

        <Text style={styles.label}>Stop Name</Text>
        <TextInput
          style={styles.input}
          value={stopName}
          onChangeText={setStopName}
          placeholder="Example: City Center"
        />

        <Text style={styles.label}>Landmark</Text>
        <TextInput
          style={styles.input}
          value={landmark}
          onChangeText={setLandmark}
          placeholder="Example: Near Metro Station"
        />

        <Text style={styles.label}>Latitude</Text>
        <TextInput
          style={styles.input}
          value={latitude}
          onChangeText={setLatitude}
          placeholder="Example: 12.971599"
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Longitude</Text>
        <TextInput
          style={styles.input}
          value={longitude}
          onChangeText={setLongitude}
          placeholder="Example: 77.594566"
          keyboardType="decimal-pad"
        />

        <Pressable
          style={[styles.primaryButton, creating && styles.disabledButton]}
          onPress={handleCreateStop}
          disabled={creating}
        >
          <Text style={styles.primaryButtonText}>
            {creating ? "Creating..." : "Create Stop"}
          </Text>
        </Pressable>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.cardTitle}>Existing Stops</Text>

        <Pressable style={styles.refreshButton} onPress={loadStops}>
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : stops.length === 0 ? (
        <Text style={styles.emptyText}>No stops found.</Text>
      ) : (
        stops.map((stop) => (
          <View key={stop.id} style={styles.stopCard}>
            <Text style={styles.stopTitle}>{stop.stopName}</Text>
            <Text style={styles.stopText}>Code: {stop.stopCode}</Text>
            {!!stop.landmark && (
              <Text style={styles.stopText}>Landmark: {stop.landmark}</Text>
            )}
            <Text style={styles.stopText}>Latitude: {stop.latitude}</Text>
            <Text style={styles.stopText}>Longitude: {stop.longitude}</Text>
            <Text style={styles.stopText}>
              Status: {stop.active ? "Active" : "Inactive"}
            </Text>
          </View>
        ))
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
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 14,
  },
  primaryButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 4,
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  emptyText: {
    color: "#6b7280",
    fontSize: 15,
    marginTop: 8,
  },
  stopCard: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    elevation: 1,
  },
  stopTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  stopText: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 3,
  },
});