import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useAuth } from "../context/AuthContext";
import type { RootStackParamList } from "../navigation/AppNavigator";

export function CoordinatorHomeScreen() {
  const { logout } = useAuth();

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Coordinator Dashboard</Text>

      <Text style={styles.subtitle}>
        Manage assigned trips, stop progress, passenger manifest, and live
        location.
      </Text>

      <DashboardButton
        title="View Assigned Trips"
        description="See trips assigned to you by the admin"
        onPress={() => navigation.navigate("CoordinatorTrips")}
      />

      <DashboardButton
        title="Start Trip"
        description="Move trip from PLANNED to BOARDING or ACTIVE"
        onPress={() => navigation.navigate("CoordinatorTrips")}
      />

      <DashboardButton
        title="Update Trip Stop Status"
        description="Mark trip stops as arrived, departed, or skipped"
        onPress={() => navigation.navigate("CoordinatorTrips")}
      />

      <DashboardButton
        title="Passenger Manifest"
        description="View checked-in commuters stop-wise"
        onPress={() => navigation.navigate("CoordinatorManifest")}
      />

      <DashboardButton
        title="Send Live Location"
        description="Share your phone GPS location with commuters"
        onPress={() => navigation.navigate("CoordinatorLiveLocation")}
      />

      <DashboardButton
        title="Emergency / SOS"
        description="Report breakdowns, delays, or emergencies to admin"
        onPress={() => navigation.navigate("CoordinatorEmergency")}
      />

      <DashboardButton
        title="End Trip"
        description="Complete the active trip"
        onPress={() => navigation.navigate("CoordinatorTrips")}
      />

      <Pressable style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </Pressable>
    </ScrollView>
  );
}

function DashboardButton({
  title,
  description,
  onPress,
}: {
  title: string;
  description: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDescription}>{description}</Text>
      </View>

      <Text style={styles.arrow}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: "#eef2ff",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: "#6b7280",
    marginBottom: 22,
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: "#6b7280",
    maxWidth: 280,
  },
  arrow: {
    fontSize: 30,
    color: "#9ca3af",
  },
  logoutButton: {
    backgroundColor: "#dc2626",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 18,
  },
  logoutButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 16,
  },
});
