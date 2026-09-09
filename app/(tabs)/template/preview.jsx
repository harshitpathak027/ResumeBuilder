import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Animated, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { WebView } from "react-native-webview";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as FileSystem from "expo-file-system/legacy";

import { API_BASE_URL } from "../../../constants/api";
import SnapResumeLoader from "../../../components/screen/SnapResumeLoader";
import { authFetch } from "../../../utils/authFetch";
import { getAuthToken } from "../../../utils/authStorage";
import { showErrorMessage } from "../../../utils/errorMessageBus";

const T = {
  ink: "#141821",
  fieldBorder: "#EAEBED",
  caps: "#9AA0AC",
  blue: "#1CB0F6",
  green: "#58CC02",
  greenPressed: "#46A302",
  greenBg: "#EBF8E1",
  greenBorder: "#B7E793",
  canvasBg: "#F0F0FA",
};

export default function ResumePreviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { resumeId, name } = useLocalSearchParams();

  const resolvedResumeId = Array.isArray(resumeId) ? resumeId[0] : resumeId;
  const title = Array.isArray(name) ? name[0] : name;

  const [token, setToken] = useState(null);
  const [loadingToken, setLoadingToken] = useState(true);
  const [webHtml, setWebHtml] = useState(null);
  const [loadingWebHtml, setLoadingWebHtml] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const loadToken = async () => {
      const authToken = await getAuthToken();
      if (!authToken) {
        showErrorMessage("Session expired", "Please login again");
        router.replace("/login");
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
        const response = await authFetch(previewUrl, { method: "GET" });

        if (!isMounted) return;

        if (!response.ok) {
          setLoadError(`HTTP ${response.status}`);
          setLoadingWebHtml(false);
          if (response.status === 401) router.replace("/login");
          else if (response.status === 403) router.back();
          return;
        }

        const html = await response.text();

        if (!isMounted) return;

        if (!html?.trim()) {
          setLoadError("Empty preview");
          setLoadingWebHtml(false);
          return;
        }

        setWebHtml(html);
        setLoadingWebHtml(false);
      } catch (error) {
        if (!isMounted) return;
        setLoadError(error.message || "Network error");
        setLoadingWebHtml(false);
      }
    };

    loadWebPreview();

    return () => {
      isMounted = false;
    };
  }, [previewUrl, router, token]);

  const handleDownload = async () => {
    if (!resolvedResumeId || downloading) return;
    setDownloading(true);

    try {
      const exportUrl = `${API_BASE_URL}/resumes/${resolvedResumeId}/export-pdf`;

      if (Platform.OS === "web") {
        const response = await authFetch(exportUrl, { method: "GET" });
        if (!response.ok) {
          showErrorMessage("Error", "Unable to export PDF");
          return;
        }
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = `resume-${resolvedResumeId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(objectUrl);
        return;
      }

      const fileUri = `${FileSystem.cacheDirectory}resume-export-${resolvedResumeId}.pdf`;
      const result = await FileSystem.downloadAsync(exportUrl, fileUri, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (result.status >= 400) {
        showErrorMessage("Error", "Unable to download file");
        return;
      }

      const saveName = `resume-export-${resolvedResumeId}-${Date.now()}.pdf`;

      if (Platform.OS === "android" && FileSystem.StorageAccessFramework) {
        const permission = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (permission.granted) {
          const base64 = await FileSystem.readAsStringAsync(result.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          const targetUri = await FileSystem.StorageAccessFramework.createFileAsync(
            permission.directoryUri,
            saveName,
            "application/pdf"
          );
          await FileSystem.writeAsStringAsync(targetUri, base64, {
            encoding: FileSystem.EncodingType.Base64,
          });
          showErrorMessage("Download Complete", "Resume PDF has been saved to your selected folder.");
          return;
        }
      }

      const fallbackUri = `${FileSystem.documentDirectory}${saveName}`;
      await FileSystem.copyAsync({ from: result.uri, to: fallbackUri });
      showErrorMessage("Download Complete", "Resume PDF saved in app documents.");
    } catch (error) {
      showErrorMessage("Error", error?.message || "Unable to download PDF");
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = () => {
    handleDownload();
  };

  if (loadError) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF", padding: 20 }}>
        <MaterialIcons name="error-outline" size={48} color="#FF4B4B" />
        <Text style={{ fontSize: 18, fontWeight: "800", color: T.ink, marginTop: 12, textAlign: "center" }}>
          {loadError}
        </Text>
        <Text style={{ fontSize: 12, fontWeight: "600", color: T.caps, marginTop: 4, marginBottom: 20, textAlign: "center" }}>
          {previewUrl ? `URL: ${previewUrl}` : "No URL available"}
        </Text>
        <TouchableOpacity activeOpacity={0.85} onPress={() => router.back()} style={{ borderRadius: 16, backgroundColor: T.ink, paddingHorizontal: 24, paddingVertical: 12 }}>
          <Text style={{ fontSize: 14, fontWeight: "800", color: "#FFFFFF" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loadingToken || !previewUrl || !token || loadingWebHtml || !webHtml) {
    return (
      <SnapResumeLoader
        messages={[
          "Loading your resume preview...",
          "Applying final visual formatting...",
          "Preparing readable print layout...",
          "Almost ready to review!",
        ]}
      />
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      {/* Top Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingTop: Math.max(insets.top + 12, 52),
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: T.fieldBorder,
          backgroundColor: "#FFFFFF",
        }}
      >
        <TouchableOpacity activeOpacity={0.7} onPress={() => router.back()} style={{ padding: 4 }}>
          <MaterialIcons name="arrow-back" size={24} color={T.caps} />
        </TouchableOpacity>

        <Text style={{ fontSize: 20, fontWeight: "900", color: T.ink }}>
          {title ? title : "Final Preview"}
        </Text>

        <TouchableOpacity activeOpacity={0.7} onPress={handleShare}>
          <Text style={{ fontSize: 14, fontWeight: "900", letterSpacing: 0.8, color: T.blue }}>
            SHARE
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Canvas Area */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 140, backgroundColor: T.canvasBg, minHeight: "100%" }}>
        {/* Floating White Paper Stage */}
        <View
          style={{
            borderRadius: 20,
            backgroundColor: "#FFFFFF",
            overflow: "hidden",
            height: 520,
            shadowColor: "#000000",
            shadowOpacity: 0.08,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
            elevation: 3,
            marginBottom: 20,
          }}
        >
          {Platform.OS === "web" ? (
            <iframe
              title={title || "Resume Preview"}
              srcDoc={webHtml || ""}
              style={{ border: "none", width: "100%", height: "100%" }}
            />
          ) : (
            <WebView
              source={{ html: webHtml || "" }}
              originWhitelist={["*"]}
              startInLoadingState
              renderLoading={() => <SnapResumeLoader />}
              javaScriptEnabled
              scalePageToFit
              style={{ flex: 1 }}
              onError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                showErrorMessage("Preview Error", "Failed to render preview: " + (nativeEvent?.description || "Unknown error"));
              }}
            />
          )}
        </View>

        {/* Master Rank Banner */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
            borderRadius: 20,
            borderWidth: 1.5,
            borderColor: T.greenBorder,
            backgroundColor: T.greenBg,
            padding: 16,
          }}
        >
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: T.green, alignItems: "center", justifyContent: "center" }}>
            <MaterialIcons name="check" size={22} color="#FFFFFF" />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: "800", color: "#2D6800", lineHeight: 18 }}>
              Your resume looks amazing! You've reached Master Rank.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action 3D Button Container */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "#FFFFFF",
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 28,
          borderTopWidth: 1,
          borderTopColor: T.fieldBorder,
        }}
      >
        <TouchableOpacity activeOpacity={0.92} onPress={handleDownload} disabled={downloading}>
          <View style={{ borderRadius: 20, paddingBottom: 4, backgroundColor: T.greenPressed }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 20,
                paddingVertical: 16,
                backgroundColor: T.green,
              }}
            >
              <MaterialIcons name="file-download" size={22} color="#FFFFFF" />
              <Text style={{ marginLeft: 8, fontSize: 16, fontWeight: "900", letterSpacing: 0.8, color: "#FFFFFF" }}>
                {downloading ? "DOWNLOADING..." : "DOWNLOAD"}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}