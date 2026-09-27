import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { useAuth } from "../context/AuthContext";

import { AdminHomeScreen } from "../screens/AdminHomeScreen";
import { CommuterHomeScreen } from "../screens/CommuterHomeScreen";
import { CoordinatorHomeScreen } from "../screens/CoordinatorHomeScreen";
import { LoginScreen } from "../screens/LoginScreen";

import { AssignCommuterRouteScreen } from "../screens/AssignCommuterRouteScreens";
import { ManageBusesScreen } from "../screens/ManageBusesScreens";
import { ManageRoutesScreen } from "../screens/ManageRoutesScreens";
import { ManageStopsScreen } from "../screens/ManageStopsScreens";
import { ManageTripsScreen } from "../screens/ManageTripsScreens";
import { ManageUsersScreen } from "../screens/ManageUsersScreens";
import { AdminEmergenciesScreen } from "../screens/AdminEmergenciesScreens";

import { CoordinatorLiveLocationScreen } from "../screens/CoordinatorLiveLocationScreens";
import { CoordinatorManifestScreen } from "../screens/CoordinatorManifestScreens";
import { CoordinatorTripsScreen } from "../screens/CoordinatorTripsScreens";
import { CoordinatorEmergencyScreen } from "../screens/CoordinatorEmergencyScreens";

import { CommuterTrackBusScreen } from "../screens/CommuterTrackBusScreens";
import { CommuterTripsScreen } from "../screens/CommuterTripsScreens";

export type RootStackParamList = {
  Login: undefined;

  AdminHome: undefined;
  ManageUsers: undefined;
  ManageBuses: undefined;
  ManageStops: undefined;
  ManageRoutes: undefined;
  ManageTrips: undefined;
  AssignCommuterRoute: undefined;
  AdminEmergencies: undefined;

  CoordinatorHome: undefined;
  CoordinatorTrips: undefined;
  CoordinatorManifest: undefined;
  CoordinatorLiveLocation: undefined;
  CoordinatorEmergency: undefined;

  CommuterHome: undefined;
  CommuterTrips: undefined;
  CommuterTrackBus: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const linking = {
  prefixes: ["bustrackermobile://"],
  config: {
    screens: {
      Login: "login",
      AdminHome: "admin",
      ManageTrips: "admin/trips",
      AdminEmergencies: "admin/emergencies",
      CoordinatorHome: "coordinator",
      CoordinatorTrips: "coordinator/trips",
      CoordinatorLiveLocation: "coordinator/location",
      CoordinatorEmergency: "coordinator/emergency",
      CommuterHome: "commuter",
      CommuterTrips: "commuter/trips",
      CommuterTrackBus: "commuter/track",
    },
  },
};

export function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator>
        {!user ? (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : user.role === "ADMIN" ? (
          <>
            <Stack.Screen
              name="AdminHome"
              component={AdminHomeScreen}
              options={{ title: "Admin Dashboard" }}
            />

            <Stack.Screen
              name="ManageUsers"
              component={ManageUsersScreen}
              options={{ title: "Manage Users" }}
            />

            <Stack.Screen
              name="ManageBuses"
              component={ManageBusesScreen}
              options={{ title: "Manage Buses" }}
            />

            <Stack.Screen
              name="ManageStops"
              component={ManageStopsScreen}
              options={{ title: "Manage Stops" }}
            />

            <Stack.Screen
              name="ManageRoutes"
              component={ManageRoutesScreen}
              options={{ title: "Manage Routes" }}
            />

            <Stack.Screen
              name="ManageTrips"
              component={ManageTripsScreen}
              options={{ title: "Manage Trips" }}
            />

            <Stack.Screen
              name="AssignCommuterRoute"
              component={AssignCommuterRouteScreen}
              options={{ title: "Assign Commuter" }}
            />

            <Stack.Screen
              name="AdminEmergencies"
              component={AdminEmergenciesScreen}
              options={{ title: "Emergency Reports" }}
            />
          </>
        ) : user.role === "COORDINATOR" ? (
          <>
            <Stack.Screen
              name="CoordinatorHome"
              component={CoordinatorHomeScreen}
              options={{ title: "Coordinator Dashboard" }}
            />

            <Stack.Screen
              name="CoordinatorTrips"
              component={CoordinatorTripsScreen}
              options={{ title: "Assigned Trips" }}
            />

            <Stack.Screen
              name="CoordinatorManifest"
              component={CoordinatorManifestScreen}
              options={{ title: "Passenger Manifest" }}
            />

            <Stack.Screen
              name="CoordinatorLiveLocation"
              component={CoordinatorLiveLocationScreen}
              options={{ title: "Send Live Location" }}
            />

            <Stack.Screen
              name="CoordinatorEmergency"
              component={CoordinatorEmergencyScreen}
              options={{ title: "Emergency / SOS" }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="CommuterHome"
              component={CommuterHomeScreen}
              options={{ title: "Commuter Dashboard" }}
            />

            <Stack.Screen
              name="CommuterTrips"
              component={CommuterTripsScreen}
              options={{ title: "My Trips" }}
            />

            <Stack.Screen
              name="CommuterTrackBus"
              component={CommuterTrackBusScreen}
              options={{ title: "Track Bus" }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
