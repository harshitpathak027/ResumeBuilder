import { Text, TouchableOpacity, View } from "react-native";
import { triggerVibration } from "../../components/constant/vibration";
const Template= ()=>{
    const handlePress = async () =>{
        await triggerVibration("tap");
    }
    return(
        <>
        <View className="flex-1 p-4 mt-8">
            <Text className="text-2xl font-bold">Template</Text>
            <Text className="text-gray-500 text-sm">Choose a template to get started</Text>



            <View className="mt-4 flex-col w-1/2 h-1/3 shadow-slate-600  bg-white rounded-lg">
            <TouchableOpacity activeOpacity={0.8} onPress={handlePress}>
                <View className="h-3/4 flex  items-center bg-[#d5e0f0] justify-center rounded-lg">
                   <Text>
                    
                    Coming Soon
                    </Text> 
                </View>
                <View className="h-1/4 p-2"> 
                    <Text className="font-semibold">Executive</Text>
                    <Text className="text-gray-500 text-sm">Modern</Text>    
                </View>
            </TouchableOpacity>
            </View>
        </View>
        </>
    )
}
export default Template;