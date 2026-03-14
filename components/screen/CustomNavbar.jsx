import { MaterialIcons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

const tabs = [
  { name: 'index', route: '/', label: 'Home', icon: 'home' },
  { name: 'Templates', route: '/Template', label: 'Templates', icon: 'description' },
  { name: 'profile', route: '/profile', label: 'Profile', icon: 'person' },
];

export default function CustomNavbar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View className="flex-row bg-white border-t border-gray-200 pb-2 pt-2">
      {tabs.map((tab) => {
        const isActive = pathname === tab.route || (tab.route === '/' && pathname === '/index');
        console.log('Current Pathname:', pathname, 'Tab Route:', tab.route, 'Is Active:', isActive);
        return (
          <TouchableOpacity
            key={tab.name}
            className="flex-1 items-center justify-center gap-1"
            onPress={() => router.push(tab.route)}
          >
            <MaterialIcons
              size={24}
              name={tab.icon}
              color={isActive ? '#6366f1' : '#9ca3af'}
            />
            <Text className={`text-xs font-medium ${isActive ? 'text-indigo-500' : 'text-gray-400'}`}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}