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

import { createBus, getBuses } from "../api/adminBusApi";
import { Bus } from "../types/bus";

export function ManageBusesScreen() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadBuses();
  }, []);

  async function loadBuses() {
    try {
      setLoading(true);
      const response = await getBuses();
      setBuses(response);
    } catch (error) {
      console.error("Failed to load buses", error);
      Alert.alert("Error", "Unable to load buses.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateBus() {
    if (!registrationNumber.trim()) {
      Alert.alert("Validation error", "Registration number is required.");
      return;
    }

    if (!displayName.trim()) {
      Alert.alert("Validation error", "Display name is required.");
      return;
    }

    const parsedCapacity = Number(capacity);

    if (!parsedCapacity || parsedCapacity <= 0) {
      Alert.alert("Validation error", "Capacity must be greater than 0.");
      return;
    }

    try {
      setCreating(true);

      await createBus({
        registrationNumber: registrationNumber.trim(),
        displayName: displayName.trim(),
        capacity: parsedCapacity,
      });

      setRegistrationNumber("");
      setDisplayName("");
      setCapacity("");

      await loadBuses();

      Alert.alert("Success", "Bus created successfully.");
    } catch (error) {
      console.error("Failed to create bus", error);
      Alert.alert("Error", "Unable to create bus.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Manage Buses</Text>
      <Text style={styles.subtitle}>Create and view buses used for trips.</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Create Bus</Text>

        <Text style={styles.label}>Registration Number</Text>
        <TextInput
          style={styles.input}
          value={registrationNumber}
          onChangeText={setRegistrationNumber}
          placeholder="Example: BUS-2001"
          autoCapitalize="characters"
        />

        <Text style={styles.label}>Display Name</Text>
        <TextInput
          style={styles.input}
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Example: Office Bus 2001"
        />

        <Text style={styles.label}>Capacity</Text>
        <TextInput
          style={styles.input}
          value={capacity}
          onChangeText={setCapacity}
          placeholder="Example: 40"
          keyboardType="numeric"
        />

        <Pressable
          style={[styles.primaryButton, creating && styles.disabledButton]}
          onPress={handleCreateBus}
          disabled={creating}
        >
          <Text style={styles.primaryButtonText}>
            {creating ? "Creating..." : "Create Bus"}
          </Text>
        </Pressable>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.cardTitle}>Existing Buses</Text>

        <Pressable style={styles.refreshButton} onPress={loadBuses}>
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : buses.length === 0 ? (
        <Text style={styles.emptyText}>No buses found.</Text>
      ) : (
        buses.map((bus) => (
          <View key={bus.id} style={styles.busCard}>
            <Text style={styles.busTitle}>{bus.displayName}</Text>
            <Text style={styles.busText}>
              Registration: {bus.registrationNumber}
            </Text>
            <Text style={styles.busText}>Capacity: {bus.capacity}</Text>
            <Text style={styles.busText}>
              Status: {bus.active ? "Active" : "Inactive"}
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
  busCard: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    elevation: 1,
  },
  busTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  busText: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 3,
  },
});