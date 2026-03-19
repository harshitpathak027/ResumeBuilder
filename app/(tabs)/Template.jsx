import { Animated, Easing, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { triggerVibration } from "../../components/constant/vibration";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ShimmerCard from "../../components/ui/ShimmerCard";
import { useRouter } from "expo-router";
import { API_BASE_URL } from "../../constants/api";

const Template= ()=>{
      const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const router = useRouter();
    const shimmerValue = useRef(new Animated.Value(0)).current;
    const shimmerItems = useMemo(() => Array.from({ length: 4 }, (_, index) => index), []);

    const fetchTemplates = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const response = await fetch(`${API_BASE_URL}/templates`);
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

    const handlePress = async (id,name) => {
        await triggerVibration("tap");
        console.log("Navigating to template with ID:", id);
        router.push({
        pathname: "/template/[id]",
        params: { id: String(id), name: String(name) },
        });  
  };
    const templatesToRender = templates.length !== 0 ? templates : [{ id: "coming-soon", name: "Executive" }];

    return(
        <View className="flex-1 p-4 mt-8">
            <Text className="text-2xl font-bold">Template</Text>
            <Text className="text-gray-500 text-sm">Choose a template to get started</Text>

            {loading && (
                <View className="mt-4">
                    <View className="flex-row flex-wrap">
                        {shimmerItems.map((item) => (
                            <ShimmerCard key={item} shimmerValue={shimmerValue} />
                        ))}
                    </View>
                </View>
            )}
            {!loading && error !== "" && <Text className="mt-4 text-red-500">{error}</Text>}

            {!loading && (
                <ScrollView className="mt-4" showsVerticalScrollIndicator={false}>
                    <View className="flex-row flex-wrap" >
                        {templatesToRender.map((template, index) => (
                            <View key={template.id ?? index} className="w-1/2 px-1 mb-4">
                                <View className="flex-col h-56 shadow-slate-600 bg-white rounded-lg">
                                    <TouchableOpacity className="h-full" activeOpacity={0.8} onPress={()=>handlePress(template.id,template.name)}>
                                        <View className="h-3/4 bg-[#d5e0f0] rounded-lg overflow-hidden">
                                            {index === 0 ? (
                                                <Image
                                                    source={require("../../assets/images/resume.jpg")}
                                                    style={{ width: "100%", height: "100%" }}
                                                    resizeMode="cover"
                                                />
                                            ) : (
                                                <View className="flex-1 items-center justify-center">
                                                    <Text className="text-gray-600 font-medium">Coming Soon</Text>
                                                </View>
                                            )}
                                        </View>
                                        <View className="h-1/4 p-2">
                                            <Text className="font-semibold">{template.name}</Text>
                                            <Text className="text-gray-500 text-sm">{template.description}</Text>
                                        </View>
                                    </TouchableOpacity>
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