import * as Haptics from "expo-haptics";
import { Platform, Vibration } from "react-native";

const vibrationPatterns = {
  tap: [0, 30],
  success: [0, 40, 50, 40],
  warning: [0, 120, 80, 120],
  error: [0, 200, 120, 200],
};

export const triggerVibration = async (mode = "tap") => {
  try {
    if (mode === "tap") {
      await Haptics.selectionAsync();
      return;
    }

    if (mode === "impact-light") {
      if (Platform.OS === "android") {
        Vibration.vibrate(12);
        return;
      }
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return;
    }

    if (mode === "impact-medium") {
      if (Platform.OS === "android") {
        Vibration.vibrate(20);
        return;
      }
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      return;
    }
if (mode === "flash-click") {
  if (Platform.OS === "android") {
    if (Haptics.performAndroidHapticsAsync && Haptics.AndroidHaptics?.Toggle_On) {
      await Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Toggle_On);
    } else {
      Vibration.vibrate(18);
    }
    return;
  }
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
  return;
}
    if (mode === "impact-heavy") {
      if (Platform.OS === "android") {
        Vibration.vibrate(30);
        return;
      }
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      return;
    }

    if (mode === "success") {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return;
    }

    if (mode === "warning") {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    if (mode === "error") {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (mode === "custom") {
      if (Platform.OS === "android") {
        Vibration.vibrate([0, 120, 70, 250]);
      } else {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      return;
    }

    const pattern = vibrationPatterns[mode];
    if (pattern && Platform.OS === "android") {
      Vibration.vibrate(pattern);
      return;
    }

    await Haptics.selectionAsync();
  } catch {
    if (Platform.OS === "android") {
      Vibration.vibrate(20);
    }
  }
};
