import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import DashboardProfile from '../../components/screen/DashboardProfile';
import MyResumeList from '../../components/screen/MyResumeList';
import { useState } from 'react';
export default function HomeScreen() {
const [resumeItem,setResumeItem] = useState([]);
const router = useRouter();


  return (
    <View className="flex-1 bg-[#F7F9FC]">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingTop: 56, paddingBottom: 120 }}>
        <View className="mb-7 flex-row items-start justify-between">
          <DashboardProfile />
          <TouchableOpacity className="h-11 w-11 items-center justify-center rounded-2xl border border-[#D9E2EC] bg-white">
            <MaterialIcons name="notifications-none" size={23} color="#102A43" />
          </TouchableOpacity>
        </View>

        <LinearGradient
          colors={['#102A43', '#1D4D68']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="mb-6 overflow-hidden rounded-[30px] p-6"
        >
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-xs font-bold uppercase tracking-[2px] text-[#B9E8DF]">Resume workspace</Text>
              <Text className="mt-3 text-3xl font-bold leading-9 text-white">Build a resume that gets noticed.</Text>
              <Text className="mt-3 text-sm leading-5 text-[#D7E5ED]">Create a clear, confident story from the experience you already have.</Text>
            </View>
            <View className="h-16 w-16 items-center justify-center rounded-full bg-[#F4C95D]">
              <LottieView
                source={require('../../assets/images/lionblink.json')}
                autoPlay
                loop
                style={{ width: 62, height: 62 }}
              />
            </View>
          </View>
          <TouchableOpacity onPress={() => router.push('/Template')} className="mt-6 flex-row items-center justify-center rounded-2xl bg-[#F4C95D] py-3.5">
            <MaterialIcons name="add" size={21} color="#102A43" />
            <Text className="ml-2 font-bold text-[#102A43]">Create a new resume</Text>
            <MaterialIcons name="arrow-forward" size={19} color="#102A43" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </LinearGradient>

        <View className="mb-6 flex-row gap-3">
          <View className="flex-1 rounded-[22px] border border-[#D9E2EC] bg-white p-4">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#DDF3F0]"><MaterialIcons name="description" size={21} color="#2A9D8F" /></View>
            <Text className="mt-3 text-2xl font-bold text-[#102A43]">{resumeItem.length}</Text>
            <Text className="text-sm font-medium text-[#486581]">Total resumes</Text>
          </View>
          <View className="flex-1 rounded-[22px] border border-[#D9E2EC] bg-white p-4">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#FFF0D9]"><MaterialIcons name="edit-note" size={21} color="#F4A261" /></View>
            <Text className="mt-3 text-2xl font-bold text-[#102A43]">{resumeItem.length ? 'Active' : 'Ready'}</Text>
            <Text className="text-sm font-medium text-[#486581]">Workspace status</Text>
          </View>
        </View>

        <View className="mb-3 mt-8 flex-row items-end justify-between">
          <View>
            <Text className="text-2xl font-bold text-[#102A43]">Your resumes</Text>
            <Text className="mt-1 text-sm text-[#486581]">Pick up where you left off.</Text>
          </View>
          <MaterialIcons name="north-east" size={22} color="#E76F51" />
        </View>
        <MyResumeList setResumeItem={setResumeItem} />
      </ScrollView>
    </View>
  )
}


