import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { triggerVibration } from '../../components/constant/vibration';
import { API_BASE_URL } from '../../constants/api';
import { authFetch } from '../../utils/authFetch';
import { clearAuthSession, getAuthToken, getAuthUser } from '../../utils/authStorage';
import { showErrorMessage } from '../../utils/errorMessageBus';

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
    <View className="flex-1 p-4 mt-8">
      <Modal
        transparent
        animationType="fade"
        statusBarTranslucent
        visible={showDeleteDialog}
        onRequestClose={closeDeleteDialog}
      >
        <View className="flex-1 items-center justify-center px-8 bg-black/25">
          <View className="bg-white w-full rounded-xl overflow-hidden">
            <View className="px-6 pt-6 pb-5 items-center">
              <Text className="text-gray-900 text-lg font-bold text-center mb-1">Delete account?</Text>
              <Text className="text-gray-700 text-base text-center">
                This will permanently delete your account and all resumes.
              </Text>
            </View>

            <View className="h-px bg-gray-200" />

            <TouchableOpacity
              className="py-4 items-center"
              activeOpacity={0.8}
              style={{ outlineStyle: 'none' }}
              onPress={closeDeleteDialog}
              disabled={isDeletingAccount}
            >
              <Text className="text-blue-600 text-base font-medium">Cancel</Text>
            </TouchableOpacity>

            <View className="h-px bg-gray-200" />

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
                <Text className="text-red-600 text-base font-semibold">Delete</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View className="flex-row items-center gap-3">
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center"
        >
          <MaterialIcons name="arrow-back" size={20} color={'#4F6BED'} />
        </TouchableOpacity>
        <Text className="text-2xl font-bold">Account Settings</Text>
      </View>

      {!authToken ? (
        <View className="mt-6 bg-white rounded-2xl p-4">
          <Text className="text-base font-semibold text-gray-900">You are not logged in</Text>
          <Text className="text-gray-500 mt-1">Login to manage your account.</Text>

          <TouchableOpacity
            className="mt-4 bg-blue-600 rounded-xl py-3 items-center justify-center"
            activeOpacity={0.85}
            onPress={() => router.replace('/login')}
          >
            <Text className="text-white font-semibold">Go to Login</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView className="mt-2" showsVerticalScrollIndicator={false}>
          <View className="mt-6 bg-white rounded-2xl p-4">
            <Text className="text-base font-semibold text-gray-900">Signed in as</Text>
            <Text className="text-gray-500 mt-1">{authUser?.email || authUser?.name || 'User'}</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleLogout}
            className="flex-row items-center justify-between mt-6 p-4 bg-white rounded-2xl shadow-black"
          >
            <View className="flex-row items-center gap-4">
              <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center">
                <MaterialIcons name="logout" size={20} color={'#4F6BED'} />
              </View>
              <Text className="font-semibold">Logout</Text>
            </View>
            <MaterialIcons name="arrow-right" size={24} color={'#4F6BED'} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={confirmDeleteAccount}
            className="flex-row items-center justify-between mt-6 p-4 bg-white rounded-2xl shadow-black"
          >
            <View className="flex-row items-center gap-4">
              <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center">
                <MaterialIcons name="delete-forever" size={20} color={'#4F6BED'} />
              </View>
              <View>
                <Text className="font-semibold">Delete Account</Text>
                <Text className="text-gray-500 text-xs mt-1">This cannot be undone</Text>
              </View>
            </View>

            {isDeletingAccount ? <ActivityIndicator /> : <MaterialIcons name="arrow-right" size={24} color={'#4F6BED'} />}
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}
