import { Text, View } from "react-native";

import { MaterialIcons } from "@expo/vector-icons";

const Dashboard = ()=>{
    return (
        <>
            
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
        </>
    )
}

export default Dashboard;