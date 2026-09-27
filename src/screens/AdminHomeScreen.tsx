import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAuth } from "../context/AuthContext";
import type { RootStackParamList } from "../navigation/AppNavigator";

export function AdminHomeScreen() {
  const { logout } = useAuth();

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  function comingSoon(feature: string) {
    Alert.alert(feature, "This feature will be added later.");
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>

      <Text style={styles.subtitle}>
        Manage users, buses, stops, routes, trips, and assignments.
      </Text>

      <DashboardButton
        title="Manage Users"
        description="Create coordinators and commuters"
        onPress={() => navigation.navigate("ManageUsers")}
      />

      <DashboardButton
        title="Manage Coordinators"
        description="Create, update, deactivate bus coordinators"
        onPress={() => navigation.navigate("ManageUsers")}
      />

      <DashboardButton
        title="Manage Commuters"
        description="Create, update, deactivate commuters"
        onPress={() => navigation.navigate("ManageUsers")}
      />

      <DashboardButton
        title="Manage Buses"
        description="Create and view buses"
        onPress={() => navigation.navigate("ManageBuses")}
      />

      <DashboardButton
        title="Manage Stops"
        description="Create pickup points with latitude and longitude"
        onPress={() => navigation.navigate("ManageStops")}
      />

      <DashboardButton
        title="Manage Routes"
        description="Create routes and attach ordered stops"
        onPress={() => navigation.navigate("ManageRoutes")}
      />

      <DashboardButton
        title="Manage Trips"
        description="Schedule trips and assign coordinator and bus"
        onPress={() => navigation.navigate("ManageTrips")}
      />

      <DashboardButton
        title="Assign Commuter to Route"
        description="Assign commuters to their regular bus routes"
        onPress={() => navigation.navigate("AssignCommuterRoute")}
      />


      <DashboardButton
        title="Emergency Reports"
        description="View and resolve coordinator SOS reports"
        onPress={() => navigation.navigate("AdminEmergencies")}
      />

      <DashboardButton
        title="Reports"
        description="View route and trip reports"
        onPress={() => comingSoon("Reports")}
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
