import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { View, Text, Touchable, TouchableOpacity, ScrollView } from "react-native";
import { API_BASE_URL } from "../../constants/api";
import { useRouter } from "expo-router";


const MyResumeList = () => {
    const router = useRouter();
    const [MyResumes, setMyResumes] = useState([]); 
    useEffect(()=>{
        const fetchResumes = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/resumes/user/1`);

                console.log("status:", res.status);
                const data = await res.json();
                setMyResumes(data);
            } catch (e) {
                console.log("fetch error:", e.message);
            }
        };
        fetchResumes();
    },[])
    return (
        <>  
        <ScrollView showsHorizontalScrollIndicator={false}>

   
            {MyResumes.map((resume)=>(
        <TouchableOpacity activeOpacity={0.8}     onPress={() => router.push(`/template/${resume.id}`)}
 >

            
            <View className="flex-col bg-white m-2 p-6 py-8 rounded-2xl">
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
                        <Text className="font-medium text-lg">{resume.title}</Text>
                        <Text className="text-gray-500">Last edited: 2 days ago</Text>
                    </View>
                   </View>
                    <View className="flex items-center justify-center" onPress={()=> router.push(`/template/${resume.id}`)}>
                        <MaterialIcons
                            size={24}
                            name='edit'
                            color={'#4F6BED'}
                        />
                    </View>
                </View>
            </View>
            </TouchableOpacity>
            )) }
                 </ScrollView>
        </>
    )
}
export default MyResumeList;