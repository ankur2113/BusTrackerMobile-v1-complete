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

import { getBuses } from "../api/adminBusApi";
import { getRoutes } from "../api/adminRouteApi";
import { createTrip, getTrips } from "../api/adminTripApi";
import { getUsers } from "../api/adminUserApi";

import { AdminUser } from "../types/adminUser";
import { Bus } from "../types/bus";
import { BusRoute } from "../types/route";
import { Trip, TripDetails } from "../types/trip";

export function ManageTripsScreen() {
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);

  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [selectedBusId, setSelectedBusId] = useState<string | null>(null);
  const [selectedCoordinatorId, setSelectedCoordinatorId] = useState<
    string | null
  >(null);

  const [scheduledStartAt, setScheduledStartAt] = useState("");
  const [scheduledEndAt, setScheduledEndAt] = useState("");

  const [createdTripDetails, setCreatedTripDetails] =
    useState<TripDetails | null>(null);

  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    try {
      setLoading(true);

      const routesResponse = await getRoutes();
      const busesResponse = await getBuses();
      const usersResponse = await getUsers();
      const tripsResponse = await getTrips();

      setRoutes(routesResponse);
      setBuses(busesResponse);
      setUsers(usersResponse);
      setTrips(tripsResponse);
    } catch (error) {
      console.error("Failed to load trip data", error);
      Alert.alert("Error", "Unable to load trip data.");
    } finally {
      setLoading(false);
    }
  }

  function isValidIsoDate(value: string) {
    return value.trim().length > 0 && !Number.isNaN(Date.parse(value));
  }

  async function handleCreateTrip() {
    if (!selectedRouteId) {
      Alert.alert("Validation error", "Please select a route.");
      return;
    }

    if (!selectedBusId) {
      Alert.alert("Validation error", "Please select a bus.");
      return;
    }

    if (!selectedCoordinatorId) {
      Alert.alert("Validation error", "Please select a coordinator.");
      return;
    }

    if (!isValidIsoDate(scheduledStartAt)) {
      Alert.alert(
        "Validation error",
        "Scheduled start time must be a valid ISO date.",
      );
      return;
    }

    if (!isValidIsoDate(scheduledEndAt)) {
      Alert.alert(
        "Validation error",
        "Scheduled end time must be a valid ISO date.",
      );
      return;
    }

    if (Date.parse(scheduledEndAt) <= Date.parse(scheduledStartAt)) {
      Alert.alert(
        "Validation error",
        "Scheduled end time must be after scheduled start time.",
      );
      return;
    }

    try {
      setCreating(true);

      const details = await createTrip({
        routeId: selectedRouteId,
        busId: selectedBusId,
        coordinatorId: selectedCoordinatorId,
        scheduledStartAt: scheduledStartAt.trim(),
        scheduledEndAt: scheduledEndAt.trim(),
      });

      setCreatedTripDetails(details);

      setSelectedRouteId(null);
      setSelectedBusId(null);
      setSelectedCoordinatorId(null);
      setScheduledStartAt("");
      setScheduledEndAt("");

      await loadInitialData();

      Alert.alert("Success", "Trip created successfully.");
    } catch (error) {
      console.error("Failed to create trip", error);
      const message =
        error instanceof Error ? error.message : "Unable to create trip.";
      Alert.alert("Error", message);
    } finally {
      setCreating(false);
    }
  }

  const coordinators = users.filter(
    (user) => user.role === "COORDINATOR" && user.active,
  );

  const selectedRoute = routes.find((route) => route.id === selectedRouteId);
  const selectedBus = buses.find((bus) => bus.id === selectedBusId);
  const selectedCoordinator = coordinators.find(
    (coordinator) => coordinator.id === selectedCoordinatorId,
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Manage Trips</Text>

      <Text style={styles.subtitle}>
        Create trips by assigning a route, bus, coordinator, and schedule.
      </Text>

      {loading && <ActivityIndicator size="large" />}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Create Trip</Text>

        <Text style={styles.sectionLabel}>1. Select Route</Text>

        {routes.length === 0 ? (
          <Text style={styles.emptyText}>
            No routes found. Create route first.
          </Text>
        ) : (
          routes.map((route) => {
            const isSelected = selectedRouteId === route.id;

            return (
              <Pressable
                key={route.id}
                style={[
                  styles.selectionCard,
                  isSelected ? styles.selectedCard : null,
                ]}
                onPress={() => setSelectedRouteId(route.id)}
              >
                <Text style={styles.selectionTitle}>{route.routeName}</Text>
                <Text style={styles.selectionText}>
                  Code: {route.routeCode}
                </Text>
              </Pressable>
            );
          })
        )}

        {selectedRoute && (
          <Text style={styles.selectedText}>
            Selected Route: {selectedRoute.routeName}
          </Text>
        )}

        <Text style={styles.sectionLabel}>2. Select Bus</Text>

        {buses.length === 0 ? (
          <Text style={styles.emptyText}>
            No buses found. Create bus first.
          </Text>
        ) : (
          buses.map((bus) => {
            const isSelected = selectedBusId === bus.id;

            return (
              <Pressable
                key={bus.id}
                style={[
                  styles.selectionCard,
                  isSelected ? styles.selectedCard : null,
                ]}
                onPress={() => setSelectedBusId(bus.id)}
              >
                <Text style={styles.selectionTitle}>{bus.displayName}</Text>
                <Text style={styles.selectionText}>
                  Registration: {bus.registrationNumber}
                </Text>
                <Text style={styles.selectionText}>
                  Capacity: {bus.capacity}
                </Text>
              </Pressable>
            );
          })
        )}

        {selectedBus && (
          <Text style={styles.selectedText}>
            Selected Bus: {selectedBus.displayName}
          </Text>
        )}

        <Text style={styles.sectionLabel}>3. Select Coordinator</Text>

        {coordinators.length === 0 ? (
          <Text style={styles.emptyText}>
            No coordinators found. Create coordinator first.
          </Text>
        ) : (
          coordinators.map((coordinator) => {
            const isSelected = selectedCoordinatorId === coordinator.id;

            return (
              <Pressable
                key={coordinator.id}
                style={[
                  styles.selectionCard,
                  isSelected ? styles.selectedCard : null,
                ]}
                onPress={() => setSelectedCoordinatorId(coordinator.id)}
              >
                <Text style={styles.selectionTitle}>
                  {coordinator.fullName}
                </Text>
                <Text style={styles.selectionText}>
                  Username: {coordinator.username}
                </Text>
              </Pressable>
            );
          })
        )}

        {selectedCoordinator && (
          <Text style={styles.selectedText}>
            Selected Coordinator: {selectedCoordinator.fullName}
          </Text>
        )}

        <Text style={styles.sectionLabel}>4. Schedule</Text>

        <Text style={styles.label}>Scheduled Start At</Text>
        <TextInput
          style={styles.input}
          value={scheduledStartAt}
          onChangeText={setScheduledStartAt}
          placeholder="Example: 2026-09-27T04:30:00Z"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Scheduled End At</Text>
        <TextInput
          style={styles.input}
          value={scheduledEndAt}
          onChangeText={setScheduledEndAt}
          placeholder="Example: 2026-09-27T05:30:00Z"
          autoCapitalize="none"
        />

        <Pressable
          style={[
            styles.primaryButton,
            creating ? styles.disabledButton : null,
          ]}
          onPress={handleCreateTrip}
          disabled={creating}
        >
          <Text style={styles.primaryButtonText}>
            {creating ? "Creating..." : "Create Trip"}
          </Text>
        </Pressable>
      </View>

      {createdTripDetails && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Created Trip</Text>

          <Text style={styles.selectionText}>
            Trip ID: {createdTripDetails.trip.id}
          </Text>
          <Text style={styles.selectionText}>
            Status: {createdTripDetails.trip.status}
          </Text>
          <Text style={styles.selectionText}>
            Start: {createdTripDetails.trip.scheduledStartAt}
          </Text>
          <Text style={styles.selectionText}>
            End: {createdTripDetails.trip.scheduledEndAt}
          </Text>

          <Text style={styles.sectionLabel}>Generated Trip Stops</Text>

          {createdTripDetails.stops.map((stop) => (
            <View key={stop.id} style={styles.tripStopCard}>
              <Text style={styles.selectionTitle}>
                {stop.stopSequence}. {stop.stopName ?? stop.stopId}
              </Text>
              <Text style={styles.selectionText}>Status: {stop.status}</Text>
              {!!stop.scheduledArrivalAt && (
                <Text style={styles.selectionText}>
                  Scheduled Arrival: {stop.scheduledArrivalAt}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      <View style={styles.listHeader}>
        <Text style={styles.cardTitle}>Existing Trips</Text>

        <Pressable style={styles.refreshButton} onPress={loadInitialData}>
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </Pressable>
      </View>

      {trips.length === 0 ? (
        <Text style={styles.emptyText}>No trips found.</Text>
      ) : (
        trips.map((trip) => (
          <View key={trip.id} style={styles.tripCard}>
            <Text style={styles.selectionTitle}>Trip: {trip.id}</Text>
            <Text style={styles.selectionText}>Status: {trip.status}</Text>
            <Text style={styles.selectionText}>
              Start: {trip.scheduledStartAt}
            </Text>
            <Text style={styles.selectionText}>End: {trip.scheduledEndAt}</Text>
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
  sectionLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2563eb",
    marginTop: 16,
    marginBottom: 10,
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
  selectionCard: {
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: "#2563eb",
  },
  selectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  selectionText: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 3,
  },
  selectedText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2563eb",
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  disabledButton: {
    opacity: 0.6,
  },
  emptyText: {
    color: "#6b7280",
    fontSize: 15,
    marginTop: 8,
    marginBottom: 8,
  },
  tripStopCard: {
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
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
  tripCard: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    elevation: 1,
  },
});
