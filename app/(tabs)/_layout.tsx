import { Redirect, Slot, usePathname } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import CustomNavbar from './../../components/screen/CustomNavbar';
import { getAuthToken } from '../../utils/authStorage';

export default function TabLayout() {
  const pathname = usePathname();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loadAuth = async () => {
      const token = await getAuthToken();
      setIsLoggedIn(Boolean(token));
      setIsCheckingAuth(false);
    };

    loadAuth();
  }, [pathname]);

  const isAuthPage = pathname === '/login' || pathname === '/signup';

  if (isCheckingAuth) {
    return <View className="flex-1 bg-gray-50" />;
  }

  if (!isLoggedIn && !isAuthPage) {
    return <Redirect href="/login" />;
  }

  if (isLoggedIn && isAuthPage) {
    return <Redirect href="/" />;
  }

  return (
    <View className="flex-1">
      <Slot />
      {!isAuthPage && <CustomNavbar />}
    </View>
  );
}
