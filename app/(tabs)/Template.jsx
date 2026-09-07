import { Animated, Easing, Image, ScrollView, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import { triggerVibration } from "../../components/constant/vibration";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ShimmerCard from "../../components/ui/ShimmerCard";
import MotionPressable from "../../components/ui/MotionPressable";
import { useRouter } from "expo-router";
import { API_BASE_URL } from "../../constants/api";
import { authFetch } from "../../utils/authFetch";
import { clearAuthSession } from "../../utils/authStorage";

const Template= ()=>{
      const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");
    const router = useRouter();
    const { width } = useWindowDimensions();
    const shimmerValue = useRef(new Animated.Value(0)).current;
    const shimmerItems = useMemo(() => Array.from({ length: 4 }, (_, index) => index), []);

    const fetchTemplates = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const response = await authFetch(`${API_BASE_URL}/templates`);
            if (response.status === 401) {
                await clearAuthSession();
                setTemplates([]);
                setError("Session expired. Please login again.");
                router.push('/login');
                return;
            }
            if (!response.ok) {
                throw new Error(`Request failed: ${response.status}`);
            }
            const data = await response.json();
            setTemplates(Array.isArray(data) ? data : []);
        } catch (fetchError) {
            setError(`Could not load templates from ${API_BASE_URL}/templates`);
            setTemplates([]);
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL]);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    useEffect(() => {
        if (!loading) {
            shimmerValue.stopAnimation();
            return;
        }

        const shimmerLoop = Animated.loop(
            Animated.timing(shimmerValue, {
                toValue: 1,
                duration: 1050,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );

        shimmerValue.setValue(0);
        shimmerLoop.start();

        return () => {
            shimmerLoop.stop();
            shimmerValue.stopAnimation();
        };
    }, [loading, shimmerValue]);

      const handlePress = async (id,name,description) => {
        const parsedId = Number(id);
        if (!Number.isFinite(parsedId) || parsedId <= 0) {
            setError("Templates are unavailable right now. Please try again in a moment.");
            return;
        }
        await triggerVibration("tap");
        console.log("Navigating to template with ID:", parsedId);
                router.push({
                    pathname: "/template/[id]",
                    params: { id: String(parsedId), name: String(name), description: String(description || "") },
                });
  };
    const templatesToRender = templates.length !== 0 ? templates : [{ id: "coming-soon", name: "Executive" }];

    return(
        <View className="flex-1 bg-[#F7F9FC]">
            <View className="rounded-b-[32px] bg-[#172B4D] px-5 pb-8 pt-14">
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                        <View className="h-12 w-12 overflow-hidden rounded-2xl bg-[#F4B942]">
                            <Image
                                source={require("../../assets/images/applogo.png")}
                                style={{ width: "100%", height: "100%" }}
                                resizeMode="cover"
                            />
                        </View>
                        <View>
                            <Text className="text-xs font-bold uppercase tracking-[2px] text-[#F4B942]">Resume Studio</Text>
                            <Text className="mt-1 text-2xl font-bold text-white">Choose your look.</Text>
                        </View>
                    </View>
                    <View className="h-12 w-12 items-center justify-center rounded-full bg-[#F4B942]">
                        <LottieView
                            source={require("../../assets/images/lionblink.json")}
                            autoPlay
                            loop
                            style={{ width: 47, height: 47 }}
                        />
                    </View>
                </View>
                <Text className="mt-5 max-w-[290px] text-sm leading-5 text-[#D7E1EC]">
                    Build a sharper first impression with a layout made for your next chapter.
                </Text>
                <View className="mt-6 flex-row items-center gap-3 rounded-2xl bg-[#213B61] p-3">
                    <MaterialIcons name="style" size={22} color="#F4B942" />
                    <View className="flex-1">
                            <Text className="text-xs font-bold uppercase tracking-widest text-[#D7E1EC]">Resume setup</Text>
                        <Text className="mt-1 text-sm font-bold text-white">Choose a style to begin</Text>
                    </View>
                    <Text className="text-sm font-bold text-[#F4B942]">4 styles</Text>
                </View>
            </View>

            {!loading && error === "" && (
                <View style={{ width: "100%", maxWidth: 860, alignSelf: "center" }} className="px-5 pt-6">
                    <View className="flex-row items-end justify-between">
                        <View>
                                <Text className="text-xs font-bold uppercase tracking-[2px] text-[#2A9D8F]">Your next step</Text>
                                <Text className="mt-1 text-2xl font-bold text-[#102A43]">Pick your path</Text>
                        </View>
                        <MaterialIcons name="auto-awesome" size={22} color="#F4B942" />
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-5">
                        {['All', 'Minimal', 'Executive', 'Creative'].map((category) => (
                            <TouchableOpacity
                                key={category}
                                onPress={() => setActiveCategory(category)}
                                className={`mr-2 rounded-xl border px-4 py-2.5 ${activeCategory === category ? 'border-[#2A9D8F] bg-[#2A9D8F]' : 'border-[#D9E2EC] bg-white'}`}
                            >
                                <Text className={`text-sm font-bold ${activeCategory === category ? 'text-white' : 'text-[#486581]'}`}>{category}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    <View className="mt-6 flex-row items-center justify-between">
                        <View>
                            <Text className="text-base font-bold text-[#102A43]">Choose a style that feels like you</Text>
                            <Text className="mt-1 text-xs text-[#486581]">You can always change it later.</Text>
                        </View>
                        <Text className="rounded-full bg-[#FFF4CE] px-3 py-1 text-xs font-bold text-[#856B00]">{templates.length || 1} available</Text>
                    </View>
                </View>
            )}

            {loading && (
                <View className="mt-6 px-4">
                    <View className="flex-row flex-wrap">
                        {shimmerItems.map((item) => (
                            <ShimmerCard key={item} shimmerValue={shimmerValue} />
                        ))}
                    </View>
                </View>
            )}
            {!loading && error !== "" && <Text className="mx-5 mt-6 text-red-500">{error}</Text>}

            {!loading && (
                <ScrollView className="mt-5 px-4" showsVerticalScrollIndicator={false}>
                    <View style={{ width: "100%", maxWidth: 860, alignSelf: "center" }} className="flex-row flex-wrap justify-between pb-28">
                        {templatesToRender.map((template, index) => (
                            <View key={template.id ?? index} className="mb-4 w-[48.5%]">
                                <View className={`flex-col overflow-hidden rounded-[24px] border bg-white shadow-sm ${index === 0 ? 'border-[#F4B942]' : 'border-[#D9E2EC]'}`}>
                                    <MotionPressable className="h-full" haptic="impact-light" onPress={()=>handlePress(template.id,template.name,template.description)}>
                                        <View className="h-44 overflow-hidden">
                                            {index === 0 ? (
                                                <Image
                                                    source={require("../../assets/images/resume.jpg")}
                                                    style={{ width: "100%", height: "100%" }}
                                                    resizeMode="cover"
                                                />
                                            ) : (
                                                <View className={`flex-1 items-center justify-center ${index % 2 === 0 ? 'bg-[#E6F5F2]' : 'bg-[#FFF0D9]'}`}>
                                                    <View className="h-14 w-14 items-center justify-center rounded-[20px] bg-white">
                                                        <MaterialIcons name="lock-outline" size={25} color={index % 2 === 0 ? '#2A9D8F' : '#E68C42'} />
                                                    </View>
                                                    <Text className="mt-2 text-xs font-bold uppercase tracking-widest text-[#102A43]">Coming soon</Text>
                                                </View>
                                            )}
                                        </View>
                                        <View className="min-h-[116px] justify-center p-4">
                                            <View className="flex-row items-center justify-between">
                                                <View className="flex-1 pr-2">
                                                    {index === 0 && <Text className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#E68C42]">Recommended</Text>}
                                                    <Text numberOfLines={1} className="text-base font-bold text-[#102A43]">{template.name}</Text>
                                                </View>
                                                <View className="h-8 w-8 items-center justify-center rounded-full bg-[#E6F5F2]">
                                                    <MaterialIcons name="arrow-forward" size={17} color="#2A9D8F" />
                                                </View>
                                            </View>
                                            <Text numberOfLines={2} className="mt-1 text-xs leading-4 text-[#486581]">{template.description || "A sharp, polished starting point."}</Text>
                                        </View>
                                    </MotionPressable>
                                </View>
                            </View>
                        ))}
                    </View>
                </ScrollView>
            )}
        </View>
    )
}
export default Template;