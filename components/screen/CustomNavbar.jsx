import { MaterialIcons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { triggerVibration } from '../constant/vibration';

const tabs = [
  { name: 'index', route: '/', label: 'Home', icon: 'home' },
  { name: 'Templates', route: '/Template', label: 'Templates', icon: 'description' },
  { name: 'profile', route: '/profile', label: 'Profile', icon: 'person' },
];

export default function CustomNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const handlePress = (tab) => {
    if (pathname === tab.route || (tab.route === '/' && pathname === '/index')) {
      return;
    }
    router.replace(tab.route);
  };

  const handlePressIn = () => {
    triggerVibration("flash-click");
  };
  return (
    <View
      className="mx-3 mb-2 flex-row rounded-[24px] border border-[#D9E2EC] bg-white px-2 pt-2 shadow-sm"
      style={{ paddingBottom: Math.max(insets.bottom, 8) }}
    >
      {tabs.map((tab) => {
        const isActive = pathname === tab.route || (tab.route === '/' && pathname === '/index');
        return (
          <TouchableOpacity
            key={tab.name}
            className={`flex-1 items-center justify-center gap-1 rounded-2xl py-2 ${isActive ? 'bg-[#FDE2DD]' : ''}`}
            onPressIn={handlePressIn}
            onPress={() => handlePress(tab)}
          >
            <MaterialIcons
              size={24}
              name={tab.icon}
              color={isActive ? '#E76F51' : '#829AB1'}
            />
            <Text className={`text-xs font-bold ${isActive ? 'text-[#E76F51]' : 'text-[#829AB1]'}`}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}