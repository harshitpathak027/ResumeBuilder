import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function TermsOfServiceScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-gray-100">
      <View className="flex-row items-center gap-4 px-4 pt-12 pb-4 border-b border-gray-200 bg-white">
        <TouchableOpacity activeOpacity={0.85} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-900">Terms of Service</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        <View className="bg-white rounded-2xl p-5 mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-2">Use of service</Text>
          <Text className="text-gray-700 mb-1">• You are responsible for the information you add to your resume.</Text>
          <Text className="text-gray-700 mb-1">• Do not upload unlawful, abusive, or misleading content.</Text>
          <Text className="text-gray-700">• Keep your account credentials secure.</Text>
        </View>

        <View className="bg-white rounded-2xl p-5 mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-2">User content</Text>
          <Text className="text-gray-700 mb-1">• You keep ownership of your resume and personal data.</Text>
          <Text className="text-gray-700 mb-1">• You grant us permission to store/process data only to provide the service.</Text>
          <Text className="text-gray-700">• You can request deletion by contacting support.</Text>
        </View>

        <View className="bg-white rounded-2xl p-5 mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-2">Availability and updates</Text>
          <Text className="text-gray-700 mb-1">• Features may change to improve reliability and security.</Text>
          <Text className="text-gray-700 mb-1">• We may suspend accounts that violate these terms.</Text>
          <Text className="text-gray-700">• Service is provided on an "as-is" basis.</Text>
        </View>

        <View className="bg-white rounded-2xl p-5 mb-8">
          <Text className="text-lg font-bold text-gray-900 mb-2">Contact</Text>
          <Text className="text-gray-700 mb-1">Email: er.harshitpathak@outlook.com</Text>
          <Text className="text-gray-700">Support: er.harshitpathak@outlook.com</Text>
        </View>
      </ScrollView>
    </View>
  );
}
