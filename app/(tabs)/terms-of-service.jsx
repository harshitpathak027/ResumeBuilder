import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import AppPageHeader from '../../components/ui/AppPageHeader';

export default function TermsOfServiceScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-[#F7F9FC]">
      <AppPageHeader title="Terms of Service" eyebrow="The rules of the road" accent="#F4C95D" accentSoft="#FFF8DE" icon="description" onBack={() => router.back()} />

      <ScrollView style={{ width: '100%', maxWidth: 760, alignSelf: 'center' }} className="flex-1 px-4 pt-5" contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <Text className="mb-5 text-sm leading-5 text-[#486581]">The guidelines that keep your resume workspace useful and secure.</Text>
        <View className="mb-4 rounded-[22px] border border-[#D9E2EC] bg-white p-5">
          <Text className="mb-2 text-lg font-bold text-[#102A43]">Use of service</Text>
          <Text className="mb-1 text-[#486581]">• You are responsible for the information you add to your resume.</Text>
          <Text className="mb-1 text-[#486581]">• Do not upload unlawful, abusive, or misleading content.</Text>
          <Text className="text-[#486581]">• Keep your account credentials secure.</Text>
        </View>

        <View className="mb-4 rounded-[22px] border border-[#D9E2EC] bg-white p-5">
          <Text className="mb-2 text-lg font-bold text-[#102A43]">User content</Text>
          <Text className="mb-1 text-[#486581]">• You keep ownership of your resume and personal data.</Text>
          <Text className="mb-1 text-[#486581]">• You grant us permission to store/process data only to provide the service.</Text>
          <Text className="text-[#486581]">• You can request deletion by contacting support.</Text>
        </View>

        <View className="mb-4 rounded-[22px] border border-[#D9E2EC] bg-white p-5">
          <Text className="mb-2 text-lg font-bold text-[#102A43]">Availability and updates</Text>
          <Text className="mb-1 text-[#486581]">• Features may change to improve reliability and security.</Text>
          <Text className="mb-1 text-[#486581]">• We may suspend accounts that violate these terms.</Text>
          <Text className="text-[#486581]">• Service is provided on an "as-is" basis.</Text>
        </View>

        <View className="mb-8 rounded-[22px] border border-[#D9E2EC] bg-white p-5">
          <Text className="mb-2 text-lg font-bold text-[#102A43]">Contact</Text>
          <Text className="mb-1 text-[#486581]">Email: er.harshitpathak@outlook.com</Text>
          <Text className="text-[#486581]">Support: er.harshitpathak@outlook.com</Text>
        </View>
      </ScrollView>
    </View>
  );
}
