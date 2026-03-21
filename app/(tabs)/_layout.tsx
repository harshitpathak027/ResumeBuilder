import { Redirect, Slot, usePathname } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import CustomNavbar from './../../components/screen/CustomNavbar';
import { getAuthToken } from '../../utils/authStorage';

export default function TabLayout() {
  const pathname = usePathname();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check auth on mount and when pathname changes
  useEffect(() => {
    let isMounted = true;

    const loadAuth = async () => {
      try {
        const token = await getAuthToken();
        if (isMounted) {
          setIsLoggedIn(Boolean(token));
          setIsCheckingAuth(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        if (isMounted) {
          setIsLoggedIn(false);
          setIsCheckingAuth(false);
        }
      }
    };

    loadAuth();

    return () => {
      isMounted = false;
    };
  }, []);

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
