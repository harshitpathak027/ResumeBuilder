import { getAuthUser } from "../../utils/authStorage";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

const getGreetingByHour = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
};

const DashboardProfile = () => {
    const [user, setUser] = useState(null);
    const [greeting, setGreeting] = useState(getGreetingByHour());

    useEffect(() => {
        let mounted = true;

        const loadUser = async () => {
            const authUser = await getAuthUser();
            if (mounted) {
                setUser(authUser);
            }
        };

        const updateGreeting = () => {
            setGreeting(getGreetingByHour());
        };

        loadUser();
        updateGreeting();

        const intervalId = setInterval(updateGreeting, 60 * 1000);

        return () => {
            mounted = false;
            clearInterval(intervalId);
        };
    }, []);

    return (
            <View className="m-0 flex-1">
            <Text className="text-sm font-bold uppercase tracking-[1px] text-[#2A9D8F]">{greeting}</Text>
            <Text className="mt-1 text-3xl font-bold text-[#102A43]">{user?.name || "User"}</Text>
            <Text className="mt-1 text-sm text-[#486581]">Ready to sharpen your story?</Text>
            </View>
    )
}
export default DashboardProfile;