import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { API_BASE_URL } from '../../../constants/api';
import { getAuthToken } from '../../../utils/authStorage';

export default function ResumePreviewScreen() {
  const router = useRouter();
  const { resumeId, name } = useLocalSearchParams();

  const resolvedResumeId = Array.isArray(resumeId) ? resumeId[0] : resumeId;
  const title = Array.isArray(name) ? name[0] : name;

  const [token, setToken] = useState(null);
  const [loadingToken, setLoadingToken] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      const authToken = await getAuthToken();
      if (!authToken) {
        Alert.alert('Session expired', 'Please login again');
        router.replace('/login');
        return;
      }
      setToken(authToken);
      setLoadingToken(false);
    };

    loadToken();
  }, [router]);

  const previewUrl = useMemo(() => {
    if (!resolvedResumeId) return null;
    return `${API_BASE_URL}/resumes/${resolvedResumeId}/preview`;
  }, [resolvedResumeId]);

  if (loadingToken || !previewUrl || !token) {
    return (
      <View className="flex-1 bg-gray-100 items-center justify-center">
        <ActivityIndicator size="large" color="#0073D5" />
        <Text className="mt-3 text-gray-600">Loading preview...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center gap-3 p-4 pt-11 border-b border-gray-200">
        <TouchableOpacity activeOpacity={0.85} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">{title || 'Resume Preview'}</Text>
      </View>

      <WebView
        source={{
          uri: previewUrl,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }}
        startInLoadingState
        renderLoading={() => (
          <View className="flex-1 bg-gray-100 items-center justify-center">
            <ActivityIndicator size="large" color="#0073D5" />
          </View>
        )}
        onHttpError={(event) => {
          const statusCode = event?.nativeEvent?.statusCode;
          Alert.alert('Preview Error', `Unable to load preview (HTTP ${statusCode || 'Unknown'})`);
        }}
        onError={() => {
          Alert.alert('Preview Error', 'Unable to load preview in app');
        }}
      />
    </View>
  );
}
