import { Link } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ThemedView } from '../components/themed-view';

export default function ModalScreen() {
  return (
    <ThemedView style={styles.container}>
      <View className="h-16 w-16 items-center justify-center rounded-3xl bg-[#F4C95D]">
        <MaterialIcons name="auto-awesome" size={30} color="#102A43" />
      </View>
      <Text className="mt-5 text-2xl font-bold text-[#102A43]">A little pause</Text>
      <Text className="mt-2 text-center text-[#486581]">Keep building your career story one step at a time.</Text>
      <Link href="/" dismissTo asChild>
        <TouchableOpacity className="mt-6 flex-row items-center rounded-2xl bg-[#E76F51] px-5 py-3">
          <Text className="font-bold text-white">Back to workspace</Text>
          <MaterialIcons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F7F9FC',
  },
});
