import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import { View, Text, TouchableOpacity } from 'react-native';

export default function ExploreScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-[#F7F9FC] px-5 pt-14">
      <View className="rounded-[28px] bg-[#2A9D8F] p-6">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-xs font-bold uppercase tracking-[2px] text-[#DDF3F0]">Explore</Text>
            <Text className="mt-2 text-3xl font-bold text-white">Keep growing.</Text>
            <Text className="mt-2 text-sm leading-5 text-[#DDF3F0]">Discover tools that help you make your resume stronger.</Text>
          </View>
          <View className="h-20 w-20 items-center justify-center rounded-full bg-[#F4C95D]">
            <LottieView source={require('../../assets/images/lionblink.json')} autoPlay loop style={{ width: 76, height: 76 }} />
          </View>
        </View>
      </View>
      <View className="mt-6 rounded-[24px] border border-[#F4D98A] bg-[#FFF8DE] p-5">
        <View className="flex-row items-center gap-3">
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-[#F4C95D]"><MaterialIcons name="auto-awesome" size={24} color="#102A43" /></View>
          <View className="flex-1"><Text className="text-lg font-bold text-[#102A43]">More tools are coming</Text><Text className="mt-1 text-sm text-[#486581]">New career-building features will appear here.</Text></View>
        </View>
        <TouchableOpacity onPress={() => router.replace('/')} className="mt-5 flex-row items-center justify-center rounded-2xl bg-[#E76F51] py-3"><Text className="font-bold text-white">Back to my resumes</Text><MaterialIcons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} /></TouchableOpacity>
      </View>
    </View>
  );
}
