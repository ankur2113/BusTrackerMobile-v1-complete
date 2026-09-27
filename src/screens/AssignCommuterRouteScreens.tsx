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
  assignCommuterToRoute,
  deleteCommuterRouteAssignment,
  getAssignmentsForCommuter,
} from "../api/adminCommuterRouteAssignmentApi";
import { getRouteDetails, getRoutes } from "../api/adminRouteApi";
import { getUsers } from "../api/adminUserApi";

import { AdminUser } from "../types/adminUser";
import { CommuterRouteAssignment } from "../types/commuterRouteAssignment";
import { BusRoute, RouteDetails, RouteStop } from "../types/route";

export function AssignCommuterRouteScreen() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [assignments, setAssignments] = useState<CommuterRouteAssignment[]>([]);
  const [routeDetails, setRouteDetails] = useState<RouteDetails | null>(null);

  const [selectedCommuterId, setSelectedCommuterId] = useState<string | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [loadingRouteDetails, setLoadingRouteDetails] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [deletingAssignmentId, setDeletingAssignmentId] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    try {
      setLoading(true);
      const [usersResponse, routesResponse] = await Promise.all([
        getUsers(),
        getRoutes(),
      ]);
      setUsers(usersResponse);
      setRoutes(routesResponse);
    } catch (error) {
      console.error("Failed to load assignment data", error);
      Alert.alert("Error", "Unable to load commuters and routes.");
    } finally {
      setLoading(false);
    }
  }

  async function loadAssignmentsForCommuter(commuterId: string) {
    try {
      setLoadingAssignments(true);
      const response = await getAssignmentsForCommuter(commuterId);
      setAssignments(response);
    } catch (error) {
      console.error("Unable to load commuter assignments", error);
      setAssignments([]);
      const message = error instanceof Error ? error.message : "Unable to load assignments.";
      Alert.alert("Error", message);
    } finally {
      setLoadingAssignments(false);
    }
  }

  async function handleSelectCommuter(commuterId: string) {
    setSelectedCommuterId(commuterId);
    setSelectedRouteId(null);
    setSelectedStopId(null);
    setRouteDetails(null);
    await loadAssignmentsForCommuter(commuterId);
  }

  async function handleSelectRoute(routeId: string) {
    try {
      setSelectedRouteId(routeId);
      setSelectedStopId(null);
      setRouteDetails(null);
      setLoadingRouteDetails(true);
      const details = await getRouteDetails(routeId);
      setRouteDetails(details);
    } catch (error) {
      console.error("Unable to load route details", error);
      const message = error instanceof Error ? error.message : "Unable to load route stops.";
      Alert.alert("Error", message);
    } finally {
      setLoadingRouteDetails(false);
    }
  }

  async function handleAssign() {
    if (!selectedCommuterId) {
      Alert.alert("Validation error", "Please select a commuter.");
      return;
    }

    if (!selectedRouteId) {
      Alert.alert("Validation error", "Please select a route.");
      return;
    }

    if (!selectedStopId) {
      Alert.alert("Validation error", "Please select a default stop from the selected route.");
      return;
    }

    try {
      setAssigning(true);
      await assignCommuterToRoute({
        commuterId: selectedCommuterId,
        routeId: selectedRouteId,
        defaultStopId: selectedStopId,
      });
      setSelectedRouteId(null);
      setSelectedStopId(null);
      setRouteDetails(null);
      await loadAssignmentsForCommuter(selectedCommuterId);
      Alert.alert("Success", "Commuter assigned to route successfully.");
    } catch (error) {
      console.error("Failed to assign commuter to route", error);
      const message =
        error instanceof Error ? error.message : "Unable to assign commuter to route.";
      Alert.alert("Error", message);
    } finally {
      setAssigning(false);
    }
  }

  async function handleDeleteAssignment(assignment: CommuterRouteAssignment) {
    if (!assignment.id) {
      Alert.alert("Error", "Assignment ID is missing.");
      return;
    }

    try {
      setDeletingAssignmentId(assignment.id);
      await deleteCommuterRouteAssignment(assignment.id);
      if (selectedCommuterId) {
        await loadAssignmentsForCommuter(selectedCommuterId);
      }
      Alert.alert("Success", "Assignment deactivated successfully.");
    } catch (error) {
      console.error("Failed to delete assignment", error);
      const message = error instanceof Error ? error.message : "Unable to delete assignment.";
      Alert.alert("Error", message);
    } finally {
      setDeletingAssignmentId(null);
    }
  }

  const commuters = users.filter((user) => user.role === "COMMUTER" && user.active);
  const selectedCommuter = commuters.find((commuter) => commuter.id === selectedCommuterId);
  const selectedRoute = routes.find((route) => route.id === selectedRouteId);
  const routeStops = (routeDetails?.stops ?? [])
    .filter((stop) => stop.pickupEnabled !== false)
    .slice()
    .sort((a, b) => a.stopSequence - b.stopSequence);
  const selectedRouteStop = routeStops.find((stop) => stop.stopId === selectedStopId);

  function getRouteName(routeId: string) {
    return routes.find((route) => route.id === routeId)?.routeName ?? routeId;
  }

  function getStopName(stopId?: string | null) {
    if (!stopId) {
      return "No default stop";
    }
    const fromSelectedRoute = routeStops.find((stop) => stop.stopId === stopId)?.stopName;
    if (fromSelectedRoute) return fromSelectedRoute;
    return stopId;
  }

  function renderRouteStop(stop: RouteStop) {
    const isSelected = selectedStopId === stop.stopId;
    return (
      <Pressable
        key={stop.routeStopId ?? stop.id ?? stop.stopId}
        style={[styles.selectionCard, isSelected ? styles.selectedCard : null]}
        onPress={() => setSelectedStopId(stop.stopId)}
      >
        <Text style={styles.selectionTitle}>
          {stop.stopSequence}. {stop.stopName ?? stop.stopId}
        </Text>
        {!!stop.stopCode && <Text style={styles.selectionText}>Code: {stop.stopCode}</Text>}
        <Text style={styles.selectionText}>
          Offset: {stop.plannedArrivalOffsetMinutes} minutes
        </Text>
      </Pressable>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Assign Commuter to Route</Text>
      <Text style={styles.subtitle}>
        Select a commuter, then assign only stops that belong to the selected route.
      </Text>

      {loading && <ActivityIndicator size="large" />}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Create Assignment</Text>

        <Text style={styles.sectionLabel}>1. Select Commuter</Text>
        {commuters.length === 0 ? (
          <Text style={styles.emptyText}>No commuters found. Create commuter first.</Text>
        ) : (
          commuters.map((commuter) => {
            const isSelected = selectedCommuterId === commuter.id;
            return (
              <Pressable
                key={commuter.id}
                style={[styles.selectionCard, isSelected ? styles.selectedCard : null]}
                onPress={() => handleSelectCommuter(commuter.id)}
              >
                <Text style={styles.selectionTitle}>{commuter.fullName}</Text>
                <Text style={styles.selectionText}>Username: {commuter.username}</Text>
              </Pressable>
            );
          })
        )}

        {selectedCommuter && (
          <Text style={styles.selectedText}>Selected Commuter: {selectedCommuter.fullName}</Text>
        )}

        <Text style={styles.sectionLabel}>2. Select Route</Text>
        {routes.length === 0 ? (
          <Text style={styles.emptyText}>No routes found. Create route first.</Text>
        ) : (
          routes.map((route) => {
            const isSelected = selectedRouteId === route.id;
            return (
              <Pressable
                key={route.id}
                style={[styles.selectionCard, isSelected ? styles.selectedCard : null]}
                onPress={() => handleSelectRoute(route.id)}
              >
                <Text style={styles.selectionTitle}>{route.routeName}</Text>
                <Text style={styles.selectionText}>Code: {route.routeCode}</Text>
              </Pressable>
            );
          })
        )}

        {selectedRoute && (
          <Text style={styles.selectedText}>Selected Route: {selectedRoute.routeName}</Text>
        )}

        <Text style={styles.sectionLabel}>3. Select Default Stop</Text>
        {loadingRouteDetails && <ActivityIndicator size="small" />}
        {!selectedRouteId ? (
          <Text style={styles.emptyText}>Select a route first.</Text>
        ) : routeStops.length === 0 ? (
          <Text style={styles.emptyText}>No pickup stops are attached to this route.</Text>
        ) : (
          routeStops.map(renderRouteStop)
        )}

        {selectedRouteStop && (
          <Text style={styles.selectedText}>
            Selected Stop: {selectedRouteStop.stopName ?? selectedRouteStop.stopId}
          </Text>
        )}

        <Pressable
          style={[styles.primaryButton, assigning ? styles.disabledButton : null]}
          onPress={handleAssign}
          disabled={assigning}
        >
          <Text style={styles.primaryButtonText}>
            {assigning ? "Assigning..." : "Assign Commuter"}
          </Text>
        </Pressable>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.cardTitle}>Assignments for Selected Commuter</Text>
        <Pressable
          style={styles.refreshButton}
          onPress={() => selectedCommuterId && loadAssignmentsForCommuter(selectedCommuterId)}
          disabled={!selectedCommuterId}
        >
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </Pressable>
      </View>

      {loadingAssignments && <ActivityIndicator size="large" />}
      {!selectedCommuterId ? (
        <Text style={styles.emptyText}>Select a commuter to view assignments.</Text>
      ) : assignments.length === 0 ? (
        <Text style={styles.emptyText}>No assignments found for this commuter.</Text>
      ) : (
        assignments.map((assignment) => {
          const isDeleting = deletingAssignmentId === assignment.id;
          return (
            <View key={assignment.id ?? `${assignment.commuterId}-${assignment.routeId}`} style={styles.assignmentCard}>
              <Text style={styles.selectionTitle}>{selectedCommuter?.fullName ?? assignment.commuterId}</Text>
              <Text style={styles.selectionText}>Route: {getRouteName(assignment.routeId)}</Text>
              <Text style={styles.selectionText}>Default Stop: {getStopName(assignment.defaultStopId)}</Text>
              <Text style={styles.selectionText}>Status: {assignment.active ? "Active" : "Inactive"}</Text>
              {assignment.active && (
                <Pressable
                  style={[styles.dangerButton, isDeleting ? styles.disabledButton : null]}
                  onPress={() => handleDeleteAssignment(assignment)}
                  disabled={isDeleting}
                >
                  <Text style={styles.primaryButtonText}>
                    {isDeleting ? "Removing..." : "Remove Assignment"}
                  </Text>
                </Pressable>
              )}
            </View>
          );
        })
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
    marginTop: 18,
  },
  dangerButton: {
    backgroundColor: "#dc2626",
    paddingVertical: 12,
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
  assignmentCard: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    elevation: 1,
  },
});
