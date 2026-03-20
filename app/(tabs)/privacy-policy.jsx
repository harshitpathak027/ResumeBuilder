import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-gray-100">
      <View className="flex-row items-center gap-4 px-4 pt-12 pb-4 border-b border-gray-200 bg-white">
        <TouchableOpacity activeOpacity={0.85} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-900">Privacy Policy</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        <View className="bg-white rounded-2xl p-5 mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-2">What personal data we collect</Text>
          <Text className="text-gray-700 mb-1">• Account data: name, email, and login credentials.</Text>
          <Text className="text-gray-700 mb-1">• Resume content: profile details, education, work experience, projects, and skills.</Text>
          <Text className="text-gray-700">• Usage data: basic app activity, device type, and error logs for troubleshooting.</Text>
        </View>

        <View className="bg-white rounded-2xl p-5 mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-2">How we use your data</Text>
          <Text className="text-gray-700 mb-1">• To create, save, edit, and export your resumes.</Text>
          <Text className="text-gray-700 mb-1">• To secure your account and prevent unauthorized access.</Text>
          <Text className="text-gray-700">• To provide support and improve app performance.</Text>
        </View>

        <View className="bg-white rounded-2xl p-5 mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-2">Data sharing</Text>
          <Text className="text-gray-700 mb-1">• We do not sell your personal data.</Text>
          <Text className="text-gray-700 mb-1">• Data is shared only with required infrastructure providers (hosting/storage).</Text>
          <Text className="text-gray-700">• Data may be disclosed if required by law.</Text>
        </View>

        <View className="bg-white rounded-2xl p-5 mb-8">
          <Text className="text-lg font-bold text-gray-900 mb-2">Contact for privacy requests</Text>
          <Text className="text-gray-700 mb-1">Email: er.harshitpathak@outlook.com</Text>
          <Text className="text-gray-700 mb-1">Support: er.harshitpathak@outlook.com</Text>
          <Text className="text-gray-700">You can request access, correction, or deletion of your personal data.</Text>
        </View>
      </ScrollView>
    </View>
  );
}
