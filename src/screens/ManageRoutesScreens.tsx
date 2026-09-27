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
    addStopToRoute,
    createRoute,
    getRouteDetails,
    getRoutes,
} from "../api/adminRouteApi";
import { getStops } from "../api/adminStopApi";
import { BusRoute, RouteDetails } from "../types/route";
import { BusStop } from "../types/stop";

export function ManageRoutesScreen() {
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [stops, setStops] = useState<BusStop[]>([]);

  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [routeDetails, setRouteDetails] = useState<RouteDetails | null>(null);

  const [routeCode, setRouteCode] = useState("");
  const [routeName, setRouteName] = useState("");
  const [description, setDescription] = useState("");

  const [stopSequence, setStopSequence] = useState("");
  const [plannedArrivalOffsetMinutes, setPlannedArrivalOffsetMinutes] =
    useState("");

  const [loading, setLoading] = useState(false);
  const [creatingRoute, setCreatingRoute] = useState(false);
  const [attachingStop, setAttachingStop] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    try {
      setLoading(true);

      const routesResponse = await getRoutes();
      const stopsResponse = await getStops();

      setRoutes(routesResponse);
      setStops(stopsResponse);
    } catch (error) {
      console.error("Failed to load route data", error);
      Alert.alert("Error", "Unable to load routes and stops.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateRoute() {
    if (!routeCode.trim()) {
      Alert.alert("Validation error", "Route code is required.");
      return;
    }

    if (!routeName.trim()) {
      Alert.alert("Validation error", "Route name is required.");
      return;
    }

    try {
      setCreatingRoute(true);

      const createdRoute = await createRoute({
        routeCode: routeCode.trim(),
        routeName: routeName.trim(),
        description: description.trim() || undefined,
      });

      setRouteCode("");
      setRouteName("");
      setDescription("");

      await loadInitialData();

      setSelectedRouteId(createdRoute.id);
      await loadRouteDetails(createdRoute.id);

      Alert.alert("Success", "Route created successfully.");
    } catch (error) {
      console.error("Failed to create route", error);
      Alert.alert("Error", "Unable to create route.");
    } finally {
      setCreatingRoute(false);
    }
  }

  async function loadRouteDetails(routeId: string) {
    try {
      const details = await getRouteDetails(routeId);
      setRouteDetails(details);
    } catch (error) {
      console.error("Failed to load route details", error);
      Alert.alert("Error", "Unable to load route details.");
    }
  }

  async function handleSelectRoute(routeId: string) {
    setSelectedRouteId(routeId);
    setRouteDetails(null);
    await loadRouteDetails(routeId);
  }

  async function handleAttachStop() {
    if (!selectedRouteId) {
      Alert.alert("Validation error", "Please select a route first.");
      return;
    }

    if (!selectedStopId) {
      Alert.alert("Validation error", "Please select a stop first.");
      return;
    }

    const parsedSequence = Number(stopSequence);
    const parsedOffset = Number(plannedArrivalOffsetMinutes);

    if (!parsedSequence || parsedSequence <= 0) {
      Alert.alert("Validation error", "Stop sequence must be greater than 0.");
      return;
    }

    if (Number.isNaN(parsedOffset) || parsedOffset < 0) {
      Alert.alert("Validation error", "Arrival offset must be 0 or greater.");
      return;
    }

    try {
      setAttachingStop(true);

      const details = await addStopToRoute(selectedRouteId, {
        stopId: selectedStopId,
        stopSequence: parsedSequence,
        plannedArrivalOffsetMinutes: parsedOffset,
        pickupEnabled: true,
      });

      setRouteDetails(details);
      setSelectedStopId(null);
      setStopSequence("");
      setPlannedArrivalOffsetMinutes("");

      Alert.alert("Success", "Stop attached to route successfully.");
    } catch (error) {
      console.error("Failed to attach stop to route", error);
      Alert.alert("Error", "Unable to attach stop to route.");
    } finally {
      setAttachingStop(false);
    }
  }

  const selectedRoute = routes.find((route) => route.id === selectedRouteId);
  const selectedStop = stops.find((stop) => stop.id === selectedStopId);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Manage Routes</Text>

      <Text style={styles.subtitle}>
        Create routes and attach pickup stops in order.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Create Route</Text>

        <Text style={styles.label}>Route Code</Text>
        <TextInput
          style={styles.input}
          value={routeCode}
          onChangeText={setRouteCode}
          placeholder="Example: ROUTE-2001"
          autoCapitalize="characters"
        />

        <Text style={styles.label}>Route Name</Text>
        <TextInput
          style={styles.input}
          value={routeName}
          onChangeText={setRouteName}
          placeholder="Example: City Center to Office"
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.input}
          value={description}
          onChangeText={setDescription}
          placeholder="Example: Morning office commute route"
        />

        <Pressable
          style={[
            styles.primaryButton,
            creatingRoute ? styles.disabledButton : null,
          ]}
          onPress={handleCreateRoute}
          disabled={creatingRoute}
        >
          <Text style={styles.primaryButtonText}>
            {creatingRoute ? "Creating..." : "Create Route"}
          </Text>
        </Pressable>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.cardTitle}>Existing Routes</Text>

        <Pressable style={styles.refreshButton} onPress={loadInitialData}>
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </Pressable>
      </View>

      {loading && <ActivityIndicator size="large" />}

      {!loading && routes.length === 0 && (
        <Text style={styles.emptyText}>No routes found.</Text>
      )}

      {!loading &&
        routes.map((route) => {
          const isSelected = selectedRouteId === route.id;

          return (
            <View
              key={route.id}
              style={[
                styles.routeCard,
                isSelected ? styles.selectedCard : null,
              ]}
            >
              <Text style={styles.routeTitle}>{route.routeName}</Text>
              <Text style={styles.routeText}>Code: {route.routeCode}</Text>

              {!!route.description && (
                <Text style={styles.routeText}>
                  Description: {route.description}
                </Text>
              )}

              <Text style={styles.routeText}>
                Status: {route.active ? "Active" : "Inactive"}
              </Text>

              <Pressable
                style={styles.secondaryButton}
                onPress={() => handleSelectRoute(route.id)}
              >
                <Text style={styles.secondaryButtonText}>
                  {isSelected ? "Selected" : "Select Route"}
                </Text>
              </Pressable>
            </View>
          );
        })}

      {selectedRoute && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Attach Stop to Route</Text>

          <Text style={styles.selectedText}>
            Selected Route: {selectedRoute.routeName}
          </Text>

          <Text style={styles.label}>Select Stop</Text>

          {stops.length === 0 && (
            <Text style={styles.emptyText}>
              No stops found. Create stops first.
            </Text>
          )}

          {stops.map((stop) => {
            const isSelected = selectedStopId === stop.id;

            return (
              <Pressable
                key={stop.id}
                style={[
                  styles.stopSelectCard,
                  isSelected ? styles.selectedCard : null,
                ]}
                onPress={() => setSelectedStopId(stop.id)}
              >
                <Text style={styles.stopTitle}>{stop.stopName}</Text>
                <Text style={styles.routeText}>Code: {stop.stopCode}</Text>
                <Text style={styles.routeText}>
                  Lat/Lng: {stop.latitude}, {stop.longitude}
                </Text>
              </Pressable>
            );
          })}

          {selectedStop && (
            <Text style={styles.selectedText}>
              Selected Stop: {selectedStop.stopName}
            </Text>
          )}

          <Text style={styles.label}>Stop Sequence</Text>
          <TextInput
            style={styles.input}
            value={stopSequence}
            onChangeText={setStopSequence}
            placeholder="Example: 1"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Arrival Offset Minutes</Text>
          <TextInput
            style={styles.input}
            value={plannedArrivalOffsetMinutes}
            onChangeText={setPlannedArrivalOffsetMinutes}
            placeholder="Example: 0"
            keyboardType="numeric"
          />

          <Pressable
            style={[
              styles.primaryButton,
              attachingStop ? styles.disabledButton : null,
            ]}
            onPress={handleAttachStop}
            disabled={attachingStop}
          >
            <Text style={styles.primaryButtonText}>
              {attachingStop ? "Attaching..." : "Attach Stop"}
            </Text>
          </Pressable>
        </View>
      )}

      {routeDetails && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Route Stops</Text>

          {routeDetails.stops.length === 0 ? (
            <Text style={styles.emptyText}>
              No stops attached to this route yet.
            </Text>
          ) : (
            routeDetails.stops
              .slice()
              .sort((a, b) => a.stopSequence - b.stopSequence)
              .map((routeStop) => {
                const key =
                  routeStop.id || routeStop.routeStopId || routeStop.stopId;

                return (
                  <View key={key} style={styles.attachedStopCard}>
                    <Text style={styles.stopTitle}>
                      {routeStop.stopSequence}.{" "}
                      {routeStop.stopName || routeStop.stopId}
                    </Text>

                    {!!routeStop.stopCode && (
                      <Text style={styles.routeText}>
                        Code: {routeStop.stopCode}
                      </Text>
                    )}

                    <Text style={styles.routeText}>
                      Offset: {routeStop.plannedArrivalOffsetMinutes} minutes
                    </Text>

                    <Text style={styles.routeText}>
                      Pickup Enabled: {routeStop.pickupEnabled ? "Yes" : "No"}
                    </Text>
                  </View>
                );
              })
          )}
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
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  disabledButton: {
    opacity: 0.6,
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
    marginBottom: 8,
  },
  routeCard: {
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
  routeTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  routeText: {
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
  stopSelectCard: {
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  stopTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  attachedStopCard: {
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
});
