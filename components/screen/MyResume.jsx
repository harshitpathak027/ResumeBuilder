import { Text, TouchableHighlight, TouchableOpacity, View } from "react-native";

const MyResume = ()=>{
    return(
        <>
        <View className="flex-row justify-between ">
            <Text className="font-medium text-xl">My Resumes</Text>
            <TouchableOpacity activeOpacity={0.8} >

            <Text className="text-primary">View All</Text>
            </TouchableOpacity>

        </View>
        </>
    )
}
export default MyResume;