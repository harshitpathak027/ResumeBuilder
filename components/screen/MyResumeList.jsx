import { MaterialIcons } from "@expo/vector-icons";
import { View, Text, Touchable, TouchableOpacity } from "react-native";

const MyResumeList = () => {
    return (
        <>  
        <TouchableOpacity activeOpacity={0.8}  >
            <View className="flex-col bg-white p-6 py-8 rounded-2xl">
                <View className="flex-row justify-between">
                   <View className="flex-row gap-5">
                     <View className="self-start bg-[#c1d6f7] p-4 rounded-xl">

                        <MaterialIcons
                            className="flex-shrink"
                            size={24}
                            name='description'
                            color={'#4F6BED'}
                        />
                    </View>
                    <View>
                        <Text className="font-medium text-lg">Resume 1</Text>
                        <Text className="text-gray-500">Last edited: 2 days ago</Text>
                    </View>
                   </View>
                    <View className="flex items-center justify-center">
                        <MaterialIcons
                            size={24}
                            name='edit'
                            color={'#4F6BED'}
                        />
                    </View>
                </View>
            </View>
            </TouchableOpacity>
        </>
    )
}
export default MyResumeList;