import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { API_BASE_URL } from '../../../constants/api';
import SnapResumeLoader from '../../../components/screen/SnapResumeLoader';
import { authFetch } from '../../../utils/authFetch';
import { getAuthToken } from '../../../utils/authStorage';
import { showErrorMessage } from '../../../utils/errorMessageBus';

export default function ResumePreviewScreen() {
  const router = useRouter();
  const { resumeId, name } = useLocalSearchParams();

  const resolvedResumeId = Array.isArray(resumeId) ? resumeId[0] : resumeId;
  const title = Array.isArray(name) ? name[0] : name;

  const [token, setToken] = useState(null);
  const [loadingToken, setLoadingToken] = useState(true);
  const [webHtml, setWebHtml] = useState(null);
  const [loadingWebHtml, setLoadingWebHtml] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    const loadToken = async () => {
      const authToken = await getAuthToken();
      if (!authToken) {
        showErrorMessage('Session expired', 'Please login again');
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

  useEffect(() => {
    let isMounted = true;

    const loadWebPreview = async () => {
      if (!previewUrl || !token) return;

      setLoadingWebHtml(true);

      try {
        const response = await authFetch(previewUrl, { method: 'GET' });

        if (!isMounted) return;

        if (!response.ok) {
          setLoadError(`HTTP ${response.status}`);
          setLoadingWebHtml(false);
          if (response.status === 401) router.replace('/login');
          else if (response.status === 403) router.back();
          return;
        }

        const html = await response.text();

        if (!isMounted) return;

        if (!html?.trim()) {
          setLoadError('Empty preview');
          setLoadingWebHtml(false);
          return;
        }

        setWebHtml(html);
        setLoadingWebHtml(false);
      } catch (error) {
        if (!isMounted) return;
        setLoadError(error.message || 'Network error');
        setLoadingWebHtml(false);
      }
    };

    loadWebPreview();

    return () => {
      isMounted = false;
    };
  }, [previewUrl, router, token]);

  if (loadError) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-4">
        <Text className="text-red-600 text-center text-lg mb-4">{loadError}</Text>
        <Text className="text-gray-600 text-xs text-center mb-4">
          {previewUrl ? `URL: ${previewUrl}` : 'No URL'}
        </Text>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.back()}
          className="bg-blue-600 px-6 py-2 rounded-lg"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loadingToken || !previewUrl || !token || loadingWebHtml || !webHtml) {
    return (
      <SnapResumeLoader
        messages={[
          'Loading your resume preview...',
          'Applying final visual formatting...',
          'Preparing readable print layout...',
          'Almost ready to review!',
        ]}
      />
    );
  }

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center gap-3 p-4 pt-11 border-b border-gray-200">
        <TouchableOpacity activeOpacity={0.85} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900 flex-1">{title || 'Resume Preview'}</Text>
      </View>

      {Platform.OS === 'web' ? (
        <View style={{ flex: 1 }}>
          <iframe
            title={title || 'Resume Preview'}
            srcDoc={webHtml || ''}
            style={{ border: 'none', width: '100%', height: '100%' }}
          />
        </View>
      ) : (
        <WebView
          source={{ html: webHtml || '' }}
          originWhitelist={['*']}
          startInLoadingState
          renderLoading={() => <SnapResumeLoader />}
          javaScriptEnabled
          scalePageToFit
          style={{ flex: 1 }}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            showErrorMessage('Preview Error', 'Failed to render preview: ' + (nativeEvent?.description || 'Unknown error'));
          }}
        />
      )}
    </View>
  );
}
