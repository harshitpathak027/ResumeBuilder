import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { triggerVibration } from '../../components/constant/vibration';
import { API_BASE_URL } from '../../constants/api';
import { authFetch } from '../../utils/authFetch';
import { clearAuthSession, getAuthToken, getAuthUser } from '../../utils/authStorage';
import { showErrorMessage } from '../../utils/errorMessageBus';
import AppPageHeader from '../../components/ui/AppPageHeader';

export default function AccountSettingsScreen() {
  const router = useRouter();
  const [authUser, setAuthUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const user = await getAuthUser();
      const token = await getAuthToken();
      setAuthUser(user);
      setAuthToken(token);
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    await clearAuthSession();
    setAuthUser(null);
    showErrorMessage('Logged out', 'You have been logged out successfully');
    router.replace('/login');
  };

  const deleteAccount = async () => {
    if (isDeletingAccount) return;

    setIsDeletingAccount(true);
    try {
      if (!authToken) {
        showErrorMessage('Not logged in', 'Please login again');
        router.replace('/login');
        return;
      }

      const response = await authFetch(`${API_BASE_URL}/users/me`, {
        method: 'DELETE',
      });

      if (response.status === 204) {
        await clearAuthSession();
        setAuthUser(null);
        setAuthToken(null);
        showErrorMessage('Account deleted', 'Your account and data were deleted');
        setShowDeleteDialog(false);
        router.replace('/login');
        return;
      }

      if (response.status === 401) {
        await clearAuthSession();
        setAuthUser(null);
        setAuthToken(null);
        showErrorMessage('Session expired', 'Please login again');
        setShowDeleteDialog(false);
        router.replace('/login');
        return;
      }

      let message = `Failed to delete account (HTTP ${response.status})`;
      try {
        const text = await response.text();
        if (text) {
          try {
            const json = JSON.parse(text);
            if (json?.message) message = json.message;
          } catch {
            message = text;
          }
        }
      } catch {
        // ignore
      }

      showErrorMessage('Delete failed', message);
    } catch (error) {
      showErrorMessage('Delete failed', error?.message || 'Network error');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const confirmDeleteAccount = async () => {
    await triggerVibration('tap');
    setShowDeleteDialog(true);
  };

  const closeDeleteDialog = async () => {
    await triggerVibration('tap');
    if (isDeletingAccount) return;
    setShowDeleteDialog(false);
  };

  const handleDeleteFromDialog = async () => {
    await triggerVibration('tap');
    deleteAccount();
  };

  return (
    <View className="flex-1 bg-[#F7F9FC] px-5">
      <Modal
        transparent
        animationType="fade"
        statusBarTranslucent
        visible={showDeleteDialog}
        onRequestClose={closeDeleteDialog}
      >
        <View className="flex-1 items-center justify-center px-8 bg-black/25">
          <View className="w-full overflow-hidden rounded-[22px] bg-white">
            <View className="items-center px-6 pb-5 pt-6">
              <Text className="mb-1 text-center text-lg font-bold text-[#102A43]">Delete account?</Text>
              <Text className="text-center text-base text-[#486581]">
                This will permanently delete your account and all resumes.
              </Text>
            </View>

            <View className="h-px bg-[#D9E2EC]" />

            <TouchableOpacity
              className="py-4 items-center"
              activeOpacity={0.8}
              style={{ outlineStyle: 'none' }}
              onPress={closeDeleteDialog}
              disabled={isDeletingAccount}
            >
              <Text className="text-base font-bold text-[#2A9D8F]">Cancel</Text>
            </TouchableOpacity>

            <View className="h-px bg-[#D9E2EC]" />

            <TouchableOpacity
              className="py-4 items-center"
              activeOpacity={0.8}
              style={{ outlineStyle: 'none' }}
              onPress={handleDeleteFromDialog}
              disabled={isDeletingAccount}
            >
              {isDeletingAccount ? (
                <ActivityIndicator />
              ) : (
                <Text className="text-base font-bold text-[#E76F51]">Delete</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <AppPageHeader title="Account Settings" eyebrow="Manage your account" accent="#5B4BDB" accentSoft="#E6E4FF" icon="settings" onBack={() => router.back()} />

      {!authToken ? (
        <View className="mt-6 rounded-[22px] border border-[#D9E2EC] bg-white p-5">
          <Text className="text-base font-bold text-[#102A43]">You are not logged in</Text>
          <Text className="mt-1 text-[#486581]">Login to manage your account.</Text>

          <TouchableOpacity
            className="mt-4 items-center justify-center rounded-xl bg-[#E76F51] py-3"
            activeOpacity={0.85}
            onPress={() => router.replace('/login')}
          >
            <Text className="font-bold text-white">Go to Login</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={{ width: '100%', maxWidth: 760, alignSelf: 'center' }} className="mt-2" contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
          <View className="mt-6 rounded-[22px] border border-[#D9E2EC] bg-white p-5">
            <Text className="text-base font-bold text-[#102A43]">Signed in as</Text>
            <Text className="mt-1 text-[#486581]">{authUser?.email || authUser?.name || 'User'}</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleLogout}
            className="mt-4 flex-row items-center justify-between rounded-[20px] border border-[#D9E2EC] bg-white p-4 shadow-sm"
          >
            <View className="flex-row items-center gap-4">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#DDF3F0]">
                <MaterialIcons name="logout" size={20} color={'#2A9D8F'} />
              </View>
              <Text className="font-semibold">Logout</Text>
            </View>
            <MaterialIcons name="arrow-right" size={24} color={'#2A9D8F'} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={confirmDeleteAccount}
            className="mt-4 flex-row items-center justify-between rounded-[20px] border border-[#D9E2EC] bg-white p-4 shadow-sm"
          >
            <View className="flex-row items-center gap-4">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#FDE2DD]">
                <MaterialIcons name="delete-forever" size={20} color={'#E76F51'} />
              </View>
              <View>
                <Text className="font-bold text-[#102A43]">Delete Account</Text>
                <Text className="mt-1 text-xs text-[#486581]">This cannot be undone</Text>
              </View>
            </View>

            {isDeletingAccount ? <ActivityIndicator color="#E76F51" /> : <MaterialIcons name="arrow-right" size={24} color={'#E76F51'} />}
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}
