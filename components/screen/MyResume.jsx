import { Text, TouchableHighlight, TouchableOpacity, View } from "react-native";

const MyResume = ()=>{
    return(
        <>
        <View className="flex-row justify-between ">
            <Text className="text-xl font-bold text-[#102A43]">Continue building</Text>
            <TouchableOpacity activeOpacity={0.8} >

            {/* <Text className="text-primary">View All</Text> */}
            </TouchableOpacity>

        </View>
        </>
    )
}
export default MyResume;