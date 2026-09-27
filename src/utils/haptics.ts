import * as Haptics from "expo-haptics";

export async function successHaptic() {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // Haptics is best-effort only.
  }
}

export async function warningHaptic() {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch {
    // Haptics is best-effort only.
  }
}

export async function selectionHaptic() {
  try {
    await Haptics.selectionAsync();
  } catch {
    // Haptics is best-effort only.
  }
}
