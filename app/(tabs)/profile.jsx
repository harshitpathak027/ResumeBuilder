import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { clearAuthSession, getAuthUser } from '../../utils/authStorage';
import { showErrorMessage } from '../../utils/errorMessageBus';
import AppPageHeader from '../../components/ui/AppPageHeader';
// import { getAuthUser } from '../../utils/authStorage';

export default function ProfileScreen() {
  const router = useRouter();
  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const user = await getAuthUser();
      setAuthUser(user);
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    await clearAuthSession();
    setAuthUser(null);
    showErrorMessage('Logged out', 'You have been logged out successfully');
    router.push('/login');
  };

  const items = [
    { label: 'Account Settings', description: 'Manage your account', icon: 'settings', color: '#635BDB', soft: '#EAE8FF', route: '/account-settings' },
    { label: 'Privacy Policy', description: 'Understand your data', icon: 'privacy-tip', color: '#3285D9', soft: '#E2F0FF', route: '/privacy-policy' },
    { label: 'Terms of Service', description: 'Review the basics', icon: 'description', color: '#E68C42', soft: '#FFF0DC', route: '/terms-of-service' },
    { label: 'Help & Support', description: 'Get help when you need it', icon: 'help-outline', color: '#249D8D', soft: '#DEF7F1', route: '/help-support' },
    { label: 'Logout', description: 'Sign out of this device', icon: 'logout', color: '#D95D55', soft: '#FDE8E5' },
  ];
  return (
    <View className="flex-1 bg-[#F4F8F7]">
      <AppPageHeader title="Profile" eyebrow="Your space" accent="#2A9D8F" accentSoft="#DDF3F0" icon="verified-user" onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        <View className="mx-auto w-full max-w-[760px]">
          <LinearGradient
            colors={['#FFFFFF', '#E8F8F4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="overflow-hidden rounded-[26px] border border-[#B9E4DD] p-5 shadow-sm"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-4">
                <View className="h-[68px] w-[68px] items-center justify-center rounded-[22px] bg-[#CDEFE9]">
                  <MaterialIcons name="person" size={36} color="#249D8D" />
                </View>
                <View className="min-w-0 flex-1">
                  <Text className="text-xs font-bold uppercase tracking-[2px] text-[#249D8D]">Your profile</Text>
                  <Text numberOfLines={1} className="mt-1 text-xl font-bold text-[#102A43]">{authUser?.name || 'Guest User'}</Text>
                  <Text numberOfLines={1} className="mt-1 text-sm text-[#486581]">{authUser?.email || 'Not logged in'}</Text>
                </View>
              </View>
              <MaterialIcons name="auto-awesome" size={22} color="#F4C95D" />
            </View>
            <View className="mt-6 flex-row items-center overflow-hidden rounded-2xl bg-[#F3FBF9] px-4 py-3">
              <View className="h-14 w-14 items-center justify-center rounded-2xl bg-[#DDF3F0]">
                <LottieView
                  source={require('../../assets/images/lionblink.json')}
                  autoPlay
                  loop
                  style={{ width: 52, height: 52 }}
                />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-xs font-bold uppercase tracking-[1.5px] text-[#249D8D]">Your account hub</Text>
                <Text className="mt-1 text-sm leading-5 text-[#486581]">Keep your workspace, privacy, and sign-in details in one place.</Text>
              </View>
              <MaterialIcons name="verified-user" size={22} color="#249D8D" />
            </View>
          </LinearGradient>

          <View className="mt-7 flex-row items-end justify-between"><View><Text className="text-2xl font-bold text-[#102A43]">Your space</Text><Text className="mt-1 text-sm text-[#486581]">Everything you need, in one place.</Text></View><MaterialIcons name="auto-awesome" size={22} color="#F4C95D" /></View>
          <View className="mt-4 flex-row flex-wrap justify-between">
            {items.map((item) => (
              <TouchableOpacity
                key={item.label}
                activeOpacity={0.85}
                onPress={() => {
                  if (item.label === 'Logout') {
                    handleLogout();
                    return;
                  }
                  router.push(item.route);
                }}
                className="mb-3 w-[48.5%] rounded-[22px] border border-[#D9E2EC] bg-white p-4 shadow-sm"
              >
                <View className="flex-row items-start justify-between"><View className="h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: item.soft }}><MaterialIcons name={item.icon} size={21} color={item.color} /></View><View className="h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: item.soft }}><MaterialIcons name={item.label === 'Logout' ? 'logout' : 'arrow-forward'} size={16} color={item.color} /></View></View>
                <Text numberOfLines={1} className="mt-5 font-bold text-[#102A43]">{item.label}</Text>
                <Text numberOfLines={2} className="mt-1 min-h-[32px] text-xs leading-4 text-[#486581]">{item.description}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {!authUser && <View className="mt-3 rounded-[24px] bg-[#102A43] p-5"><View className="flex-row items-center gap-3"><View className="h-10 w-10 items-center justify-center rounded-full bg-[#F4C95D]"><MaterialIcons name="lock-open" size={19} color="#6D5900" /></View><View className="flex-1"><Text className="text-base font-bold text-white">Unlock your workspace</Text><Text className="mt-1 text-xs text-[#C7D8E5]">Save your progress across devices.</Text></View></View><View className="mt-4 flex-row gap-3"><TouchableOpacity className="flex-1 items-center justify-center rounded-xl bg-white py-3" activeOpacity={0.85} onPress={() => router.push('/login')}><Text className="font-bold text-[#102A43]">Log in</Text></TouchableOpacity><TouchableOpacity className="flex-1 items-center justify-center rounded-xl bg-[#F4C95D] py-3" activeOpacity={0.85} onPress={() => router.push('/signup')}><Text className="font-bold text-[#5C4C00]">Sign up</Text></TouchableOpacity></View></View>}
        </View>
      </ScrollView>
    </View>
  );
}
