import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function HelpSupportScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-gray-100">
      <View className="flex-row items-center gap-3 px-4 pt-10 pb-3 border-b border-gray-200 bg-white">
        <TouchableOpacity activeOpacity={0.85} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Help & Support</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-3" contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
        <Text className="text-xl font-bold text-gray-900 mb-2">Get in Touch</Text>

        <View className="bg-white rounded-2xl p-4 shadow-black">
          <View className="w-14 h-14 bg-blue-100 rounded-2xl items-center justify-center mb-2">
            <MaterialIcons name="email" size={26} color="#1976D2" />
          </View>
          <Text className="text-lg font-bold text-gray-900 mb-1">Email Support</Text>
          <Text className="text-gray-500">er.harshitpathak@outlook.com</Text>
        </View>
      </ScrollView>
    </View>
  );
}
