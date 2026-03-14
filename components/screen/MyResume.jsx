import { Text, View } from "react-native";

const MyResume = ()=>{
    return(
        <>
        <View className="flex-row justify-between ">
            <Text className="font-medium text-xl">My Resumes</Text>
            <Text className="text-primary">View All</Text>

        </View>
        </>
    )
}
export default MyResume;