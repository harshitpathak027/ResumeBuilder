import { Slot, Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { View } from 'react-native';
import CustomNavbar from './../../components/screen/CustomNavbar'

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <View className='flex-1'>
      <Slot/>
      <CustomNavbar/>
    </View>
  );
}
