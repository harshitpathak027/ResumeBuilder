import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Animated, View, Text, TouchableOpacity, ScrollView } from "react-native";
import { API_BASE_URL } from "../../constants/api";
import { useRouter } from "expo-router";
import { authFetch } from "../../utils/authFetch";
import { clearAuthSession, getAuthToken, getAuthUser, setAuthSession } from "../../utils/authStorage";
import { showErrorMessage } from "../../utils/errorMessageBus";


const MyResumeList = ({ setResumeItem }) => {
    const router = useRouter();
    const [MyResumes, setMyResumes] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [shimmerValue] = useState(new Animated.Value(0));

    useEffect(() => {
        Animated.loop(
            Animated.timing(shimmerValue, {
                toValue: 1,
                duration: 1100,
                useNativeDriver: true,
            })
        ).start();
    }, [shimmerValue]);

    useEffect(()=>{
        const fetchResumes = async () => {
            try {
                let authUser = await getAuthUser();
                let userId = authUser?.id;

                if (!userId) {
                    const meRes = await authFetch(`${API_BASE_URL}/users/me`);
                    if (meRes.ok) {
                        const meData = await meRes.json();
                        userId = meData?.id;
                        authUser = meData;

                        if (userId) {
                            const token = await getAuthToken();
                            if (token) {
                                await setAuthSession({ token, user: authUser });
                            }
                        }
                    }
                }

                if (!userId) {
                    await clearAuthSession();
                    setMyResumes([]);
                    setResumeItem?.([]);
                    router.push('/login');
                    return;
                }

                const res = await authFetch(`${API_BASE_URL}/resumes/user/${userId}`);

                if (res.status === 401) {
                    await clearAuthSession();
                    setMyResumes([]);
                    setResumeItem?.([]);
                    router.push('/login');
                    return;
                }

                console.log("status:", res.status);
                const data = await res.json();
                const normalized = Array.isArray(data) ? data : [];
                setMyResumes(normalized);
                setResumeItem?.(normalized);
            } catch (e) {
                console.log("fetch error:", e.message);
                setResumeItem?.([]);
            } finally {
                setLoading(false);
            }
        };
        fetchResumes();
    },[router, setResumeItem])

    const translateX = shimmerValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-240, 240],
    });

    const renderShimmerCard = (key) => (
        <View key={key} className="flex-col bg-white m-2 p-6 py-8 rounded-2xl overflow-hidden">
            <Animated.View
                pointerEvents="none"
                style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    width: 120,
                    transform: [{ translateX }, { skewX: "-18deg" }],
                    backgroundColor: "rgba(255,255,255,0.55)",
                }}
            />
            <View className="flex-row justify-between">
                <View className="flex-row gap-5 flex-1">
                    <View className="self-start bg-gray-200 w-14 h-14 rounded-xl" />
                    <View className="flex-1">
                        <View className="h-5 w-2/3 bg-gray-200 rounded-md mb-2" />
                        <View className="h-4 w-1/2 bg-gray-200 rounded-md" />
                    </View>
                </View>
                <View className="w-6 h-6 bg-gray-200 rounded-md self-center" />
            </View>
        </View>
    );

    return (
        <>  
        <ScrollView showsHorizontalScrollIndicator={false}>

            {loading && [1, 2, 3].map((item) => renderShimmerCard(item))}

            {!loading && MyResumes.map((resume, index)=>{
        const templateId = resume?.template?.id;
        const templateName = resume?.template?.name || "Resume";

        return (
        <TouchableOpacity
            key={resume?.id ? String(resume.id) : `${templateId || 'template'}-${index}`}
            activeOpacity={0.8}
            onPress={() => {
                if (!templateId) {
                    showErrorMessage("Error", "Template information missing for this resume");
                    return;
                }

                router.push({
                    pathname: "/template/[id]",
                    params: {
                        id: String(templateId),
                        name: String(templateName),
                        resumeId: String(resume.id),
                    },
                });
            }}
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
            )}) }
                 </ScrollView>
        </>
    )
}
export default MyResumeList;