import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import AppPageHeader from '../../components/ui/AppPageHeader';

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-[#F7F9FC]">
      <AppPageHeader title="Privacy Policy" eyebrow="Your data, clearly explained" accent="#3A86FF" accentSoft="#DDEAF5" icon="privacy-tip" onBack={() => router.back()} />

      <ScrollView style={{ width: '100%', maxWidth: 760, alignSelf: 'center' }} className="flex-1 px-4 pt-5" contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <Text className="mb-5 text-sm leading-5 text-[#486581]">A clear overview of how your resume data is handled.</Text>
        <View className="mb-4 rounded-[22px] border border-[#D9E2EC] bg-white p-5">
          <Text className="mb-2 text-lg font-bold text-[#102A43]">What personal data we collect</Text>
          <Text className="mb-1 text-[#486581]">• Account data: name, email, and login credentials.</Text>
          <Text className="mb-1 text-[#486581]">• Resume content: profile details, education, work experience, projects, and skills.</Text>
          <Text className="text-[#486581]">• Usage data: basic app activity, device type, and error logs for troubleshooting.</Text>
        </View>

        <View className="mb-4 rounded-[22px] border border-[#D9E2EC] bg-white p-5">
          <Text className="mb-2 text-lg font-bold text-[#102A43]">How we use your data</Text>
          <Text className="mb-1 text-[#486581]">• To create, save, edit, and export your resumes.</Text>
          <Text className="mb-1 text-[#486581]">• To secure your account and prevent unauthorized access.</Text>
          <Text className="text-[#486581]">• To provide support and improve app performance.</Text>
        </View>

        <View className="mb-4 rounded-[22px] border border-[#D9E2EC] bg-white p-5">
          <Text className="mb-2 text-lg font-bold text-[#102A43]">Data sharing</Text>
          <Text className="mb-1 text-[#486581]">• We do not sell your personal data.</Text>
          <Text className="mb-1 text-[#486581]">• Data is shared only with required infrastructure providers (hosting/storage).</Text>
          <Text className="text-[#486581]">• Data may be disclosed if required by law.</Text>
        </View>

        <View className="mb-8 rounded-[22px] border border-[#D9E2EC] bg-white p-5">
          <Text className="mb-2 text-lg font-bold text-[#102A43]">Contact for privacy requests</Text>
          <Text className="mb-1 text-[#486581]">Email: er.harshitpathak@outlook.com</Text>
          <Text className="mb-1 text-[#486581]">Support: er.harshitpathak@outlook.com</Text>
          <Text className="text-[#486581]">You can request access, correction, or deletion of your personal data.</Text>
        </View>
      </ScrollView>
    </View>
  );
}
