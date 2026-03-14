import { Text, TouchableOpacity, View } from "react-native";

import { MaterialIcons } from "@expo/vector-icons";
import { triggerVibration } from "../constant/vibration";

const Dashboard = ()=>{
    const handlePress = async () => {
      await triggerVibration("impact-heavy");
    };

    return (
        <>
          <TouchableOpacity activeOpacity={0.8} className="w-full" onPress={handlePress}>
        <View className={`flex flex-col gap-6 rounded-2xl py-6 border-0 bg-primary text-primary-foreground shadow-lg w-1/2 `}>
            <View className="p-4 gap-1">
            <View>
            <MaterialIcons
              size={24}
              name='description'
              color='white'
              />
            </View>
            <View className="text-white">
                <Text className="text-white font-bold">3</Text>
            </View>
            <View className="text-white">
                <Text className="text-white">Resumes</Text>
              </View>
            </View>
        </View>
              </TouchableOpacity>  
        </>
    )
}

export default Dashboard;