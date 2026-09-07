import { Text, TouchableOpacity, View } from "react-native";

import { MaterialIcons } from "@expo/vector-icons";
import { triggerVibration } from "../constant/vibration";

const Dashboard = ({ resumeItem = [] })=>{
    const handlePress = async () => {
      await triggerVibration("impact-heavy");
    };

    const totalResumes = Array.isArray(resumeItem) ? resumeItem.length : 0;
    const latestResumeTitle = totalResumes > 0 ? resumeItem[0]?.title : null;

    return (
        <>
          <TouchableOpacity activeOpacity={0.8} className="w-full" onPress={handlePress}>
        <View className="w-full flex-row items-center justify-between rounded-[26px] bg-[#5B4BDB] p-5 shadow-sm">
            <View className="flex-row items-center gap-4">
            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-[#E6E4FF]">
            <MaterialIcons
              size={24}
              name='description'
              color='#5B4BDB'
              />
            </View>
            <View>
                <Text className="text-xs font-bold uppercase tracking-[2px] text-[#E6E4FF]">Your progress</Text>
                <Text className="mt-1 text-3xl font-bold text-white">{totalResumes}</Text>
                <Text className="text-sm font-bold text-[#E6E4FF]">resumes in progress</Text>
              </View>
            </View>
            <View className="items-center">
              <MaterialIcons name="trending-up" size={25} color="#F4C95D" />
              <Text className="mt-1 text-xs font-bold text-[#F4C95D]">KEEP GOING</Text>
            </View>
        </View>
              </TouchableOpacity>  
        </>
    )
}

export default Dashboard;