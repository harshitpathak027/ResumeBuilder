import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import AppPageHeader from '../../components/ui/AppPageHeader';

export default function HelpSupportScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-[#F7F9FC]">
      <AppPageHeader title="Help & Support" eyebrow="We are here to help" accent="#102A43" accentSoft="#DDF3F0" icon="help-outline" onBack={() => router.back()} />

      <ScrollView style={{ width: '100%', maxWidth: 760, alignSelf: 'center' }} className="flex-1 px-4 pt-5" contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <Text className="mb-1 text-xs font-bold uppercase tracking-[2px] text-[#2A9D8F]">Support center</Text>
        <Text className="mb-5 text-2xl font-bold text-[#102A43]">How can we help?</Text>

        <View className="rounded-[22px] border border-[#D9E2EC] bg-white p-5 shadow-sm">
          <View className="mb-3 h-14 w-14 items-center justify-center rounded-2xl bg-[#DDF3F0]">
            <MaterialIcons name="email" size={26} color="#2A9D8F" />
          </View>
          <Text className="mb-1 text-lg font-bold text-[#102A43]">Email Support</Text>
          <Text className="text-[#486581]">er.harshitpathak@outlook.com</Text>
          <TouchableOpacity onPress={() => Linking.openURL('mailto:er.harshitpathak@outlook.com')} className="mt-5 flex-row items-center justify-center rounded-2xl bg-[#E76F51] py-3">
            <MaterialIcons name="send" size={18} color="#FFFFFF" />
            <Text className="ml-2 font-bold text-white">Contact support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
