import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { clearAuthSession, getAuthUser } from '../../utils/authStorage';

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
    Alert.alert('Logged out', 'You have been logged out successfully');
    router.push('/login');
  };

  const items = [
    { label: 'Account Settings', icon: 'settings' },
    { label: 'Privacy Policy', icon: 'privacy-tip' },
    { label: 'Terms of Service', icon: 'description' },
    { label: 'Help & Support', icon: 'help-outline' },
    { label: 'Logout', icon: 'logout' },
  ];
  return (
    <View className="flex-1 p-4 mt-8">
      <Text className="text-2xl font-bold">Profile</Text>
      <View className="mt-4 gap-4 flex-row p-6 bg-white rounded-2xl shadow-black">
        <View className="w-20 h-20 rounded-full bg-blue-100 ">
          <MaterialIcons
            name='person'
            size={40}
            color={'#4F6BED'}
            style={{ marginTop: 20, marginLeft: 20 }}
          />
        </View>
        <View className="flex-col justify-center">
          <Text className="text-lg font-bold">{authUser?.name || 'Guest User'}</Text>
          <Text className="text-gray-500">{authUser?.email || 'Not logged in'}</Text>
        </View>
      </View>

      {!authUser && (
        <View className="mt-4 bg-white rounded-2xl p-4">
          <Text className="text-base font-semibold text-gray-900 mb-3">Access Your Account</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 bg-gray-200 rounded-xl py-3 items-center justify-center"
              activeOpacity={0.85}
              onPress={() => router.push('/login')}
            >
              <Text className="text-gray-900 font-semibold">Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-blue-600 rounded-xl py-3 items-center justify-center"
              activeOpacity={0.85}
              onPress={() => router.push('/signup')}
            >
              <Text className="text-white font-semibold">Signup</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}


      {/* adding other items as well */}

      <ScrollView showsVerticalScrollIndicator={false}>

      {items.map((item,index)=>{
        return(
           <TouchableOpacity
            key={index}
            activeOpacity={0.85}
            onPress={() => {
              if (item.label === 'Logout') {
                handleLogout();
                return;
              }

              if (item.label === 'Privacy Policy') {
                router.push('/privacy-policy');
                return;
              }

              if (item.label === 'Terms of Service') {
                router.push('/terms-of-service');
                return;
              }

              if (item.label === 'Help & Support') {
                router.push('/help-support');
                return;
              }
            }}
            className="flex-row items-center justify-between mt-6 p-4 bg-white rounded-2xl shadow-black"
           >
        <View className="flex-row items-center gap-4">
          <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center">
            <MaterialIcons
              name={item.icon}
              size={20}
              color={'#4F6BED'}
            />
          </View>
        <View>
          <Text className="font-semibold">{item.label}</Text>
        </View>
        </View>
        <View>

          <MaterialIcons
            name={item.label === 'Logout' ? 'logout' : 'arrow-right'}
            size={24}
            color={'#4F6BED'}
          />

        </View>
      </TouchableOpacity>
        )
      })}
           </ScrollView>


    </View>
  );
}
