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

import { createUser, getUsers } from "../api/adminUserApi";
import { AdminUser } from "../types/adminUser";

type CreatableRole = "COORDINATOR" | "COMMUTER";

export function ManageUsersScreen() {
  const [users, setUsers] = useState<AdminUser[]>([]);

  const [selectedRole, setSelectedRole] =
    useState<CreatableRole>("COORDINATOR");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("Password@123");

  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      const response = await getUsers();
      setUsers(response);
    } catch (error) {
      console.error("Failed to load users", error);
      Alert.alert("Error", "Unable to load users.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateUser() {
    if (!username.trim()) {
      Alert.alert("Validation error", "Username is required.");
      return;
    }

    if (!fullName.trim()) {
      Alert.alert("Validation error", "Full name is required.");
      return;
    }

    if (!password.trim()) {
      Alert.alert("Validation error", "Password is required.");
      return;
    }

    try {
      setCreating(true);

      await createUser({
        username: username.trim(),
        fullName: fullName.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        role: selectedRole,
        password: password.trim(),
      });

      setUsername("");
      setFullName("");
      setEmail("");
      setPhone("");
      setPassword("Password@123");

      await loadUsers();

      Alert.alert("Success", `${selectedRole} created successfully.`);
    } catch (error) {
      console.error("Failed to create user", error);
      const message =
        error instanceof Error ? error.message : "Unable to create user.";
      Alert.alert("Error", message);
    } finally {
      setCreating(false);
    }
  }

  const coordinators = users.filter((user) => user.role === "COORDINATOR");
  const commuters = users.filter((user) => user.role === "COMMUTER");

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Manage Users</Text>

      <Text style={styles.subtitle}>
        Create and view coordinators and commuters.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Create User</Text>

        <Text style={styles.label}>Role</Text>

        <View style={styles.roleRow}>
          <Pressable
            style={[
              styles.roleButton,
              selectedRole === "COORDINATOR" ? styles.selectedRoleButton : null,
            ]}
            onPress={() => setSelectedRole("COORDINATOR")}
          >
            <Text
              style={[
                styles.roleButtonText,
                selectedRole === "COORDINATOR"
                  ? styles.selectedRoleButtonText
                  : null,
              ]}
            >
              Coordinator
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.roleButton,
              selectedRole === "COMMUTER" ? styles.selectedRoleButton : null,
            ]}
            onPress={() => setSelectedRole("COMMUTER")}
          >
            <Text
              style={[
                styles.roleButtonText,
                selectedRole === "COMMUTER"
                  ? styles.selectedRoleButtonText
                  : null,
              ]}
            >
              Commuter
            </Text>
          </Pressable>
        </View>

        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Example: ravi.coordinator.2001"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Example: Ravi Coordinator"
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Example: ravi@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Phone</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="Example: 999991001"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Example: Password@123"
          secureTextEntry
        />

        <Pressable
          style={[
            styles.primaryButton,
            creating ? styles.disabledButton : null,
          ]}
          onPress={handleCreateUser}
          disabled={creating}
        >
          <Text style={styles.primaryButtonText}>
            {creating ? "Creating..." : `Create ${selectedRole}`}
          </Text>
        </Pressable>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.cardTitle}>Existing Users</Text>

        <Pressable style={styles.refreshButton} onPress={loadUsers}>
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </Pressable>
      </View>

      {loading && <ActivityIndicator size="large" />}

      {!loading && (
        <>
          <Text style={styles.sectionTitle}>Coordinators</Text>

          {coordinators.length === 0 ? (
            <Text style={styles.emptyText}>No coordinators found.</Text>
          ) : (
            coordinators.map((user) => <UserCard key={user.id} user={user} />)
          )}

          <Text style={styles.sectionTitle}>Commuters</Text>

          {commuters.length === 0 ? (
            <Text style={styles.emptyText}>No commuters found.</Text>
          ) : (
            commuters.map((user) => <UserCard key={user.id} user={user} />)
          )}
        </>
      )}
    </ScrollView>
  );
}

function UserCard({ user }: { user: AdminUser }) {
  return (
    <View style={styles.userCard}>
      <Text style={styles.userTitle}>{user.fullName}</Text>
      <Text style={styles.userText}>Username: {user.username}</Text>
      <Text style={styles.userText}>Role: {user.role}</Text>
      {!!user.email && <Text style={styles.userText}>Email: {user.email}</Text>}
      {!!user.phone && <Text style={styles.userText}>Phone: {user.phone}</Text>}
      <Text style={styles.userText}>
        Status: {user.active ? "Active" : "Inactive"}
      </Text>
    </View>
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
  roleRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  roleButton: {
    flex: 1,
    backgroundColor: "#e5e7eb",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  selectedRoleButton: {
    backgroundColor: "#2563eb",
  },
  roleButtonText: {
    color: "#111827",
    fontWeight: "700",
  },
  selectedRoleButtonText: {
    color: "#ffffff",
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
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#2563eb",
    marginTop: 14,
    marginBottom: 10,
  },
  emptyText: {
    color: "#6b7280",
    fontSize: 15,
    marginBottom: 10,
  },
  userCard: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    elevation: 1,
  },
  userTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  userText: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 3,
  },
});
