import { getAuthUser } from "@/utils/authStorage";
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
            <View className="flex m-2 text-left w-1/2">
            <Text className="text-gray-600">{greeting}</Text>
            <Text className="text-2xl font-bold">{user?.name || "User"}</Text>
            </View>
    )
}
export default DashboardProfile;