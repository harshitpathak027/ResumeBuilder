import {useLocalSearchParams, useRouter} from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Linking, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { API_BASE_URL } from "../../../constants/api";
import { getAuthToken, getAuthUser, setAuthSession } from "../../../utils/authStorage";
import { authFetch } from "../../../utils/authFetch";
import * as FileSystem from "expo-file-system/legacy";
import SnapResumeLoader from "../../../components/screen/SnapResumeLoader";
import BookLoader from "../../../components/screen/BookLoader";
import { showErrorMessage } from "../../../utils/errorMessageBus";

const TemplateDetail = () => {
  const {id,name,description,resumeId: routeResumeId} = useLocalSearchParams();
  const router = useRouter();
  const parsedRouteResumeId = Array.isArray(routeResumeId) ? Number(routeResumeId[0]) : Number(routeResumeId);
  const [resumeId, setResumeId] = useState(Number.isFinite(parsedRouteResumeId) && parsedRouteResumeId > 0 ? parsedRouteResumeId : null);
  const [creatingResume, setCreatingResume] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionType, setActionType] = useState(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const [expandedTab, setExpandedTab] = useState(null);
  const templateName = Array.isArray(name) ? name[0] : name;
  const templateDescription = Array.isArray(description) ? description[0] : description;
  const [resumeTitle, setResumeTitle] = useState(templateName ? `${templateName} Resume` : "My Resume");
  console.log("Template ID:", id, templateName);

  const parsedTemplateId = Array.isArray(id) ? Number(id[0]) : Number(id);

  const openExternalUrl = async (url, mode = "preview") => {
    if (Platform.OS === "web") {
      if (mode === "download") {
        const link = document.createElement("a");
        link.href = url;
        link.download = "resume.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }
      window.location.assign(url);
      return;
    }

    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      showErrorMessage("Error", "Cannot open this URL on your device");
      return;
    }
    await Linking.openURL(url);
  };

  const downloadProtectedPdfOnWeb = async (url) => {
    const response = await authFetch(url, { method: "GET" });
    if (!response.ok) {
      if (response.status === 401) {
        showErrorMessage("Session expired", "Please login again");
        router.replace("/login");
        return;
      }
      if (response.status === 403) {
        showErrorMessage("Access denied", "You are not allowed to export this resume");
        return;
      }
      showErrorMessage("Error", "Unable to export PDF");
      return;
    }

    const contentType = (response.headers.get("content-type") || "").toLowerCase();
    if (!contentType.includes("application/pdf")) {
      showErrorMessage("Error", "Failed to generate PDF");
      return;
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = "resume.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
  };

  const downloadProtectedFileOnMobile = async (url, fileName) => {
    const token = await getAuthToken();
    if (!token) {
      showErrorMessage("Session expired", "Please login again");
      router.replace("/login");
      return null;
    }

    const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
    const result = await FileSystem.downloadAsync(url, fileUri, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const contentTypeHeader = result?.headers?.["Content-Type"] || result?.headers?.["content-type"] || "";
    const contentType = String(contentTypeHeader).toLowerCase();

    if (result?.status === 401) {
      showErrorMessage("Session expired", "Please login again");
      router.replace("/login");
      return null;
    }

    if (result?.status === 403) {
      showErrorMessage("Access denied", "You are not allowed to export this resume");
      return null;
    }

    if (!result?.status || result.status >= 400) {
      showErrorMessage("Error", "Unable to download file");
      return null;
    }

    return {
      uri: result?.uri ?? null,
      status: result?.status,
      contentType,
    };
  };

  const handlePreview = async () => {
    setActionType("preview");
    setActionLoading(true);
    try {
      const ensuredResumeId = await ensureResumeId();
      if (!ensuredResumeId) {
        return;
      }

      const previewUrl = `${API_BASE_URL}/resumes/${ensuredResumeId}/preview`;

      const preCheck = await authFetch(previewUrl, { method: "GET" });
      if (!preCheck.ok) {
        if (preCheck.status === 401) {
          showErrorMessage("Session expired", "Please login again");
          router.replace("/login");
          return;
        }
        if (preCheck.status === 403) {
          showErrorMessage("Access denied", "You are not allowed to preview this resume");
          return;
        }
        showErrorMessage("Error", `Unable to load preview (HTTP ${preCheck.status || "Unknown"})`);
        return;
      }

      router.push({
        pathname: Platform.OS === "web" ? "/(tabs)/template/web-preview" : "/(tabs)/template/preview",
        params: { resumeId: String(ensuredResumeId), name: String(templateName || "Preview") },
      });
    } catch (error) {
      showErrorMessage("Error", `${error?.message || "Unable to load preview"}\nAPI: ${API_BASE_URL}`);
    } finally {
      setActionLoading(false);
      setActionType(null);
    }
  };

  const handleExportPdf = async () => {
    setActionType("export");
    setActionLoading(true);
    try {
      const ensuredResumeId = await ensureResumeId();
      if (!ensuredResumeId) {
        return;
      }

      if (Platform.OS === "web") {
        await downloadProtectedPdfOnWeb(`${API_BASE_URL}/resumes/${ensuredResumeId}/export-pdf`);
        return;
      }

      const downloadResult = await downloadProtectedFileOnMobile(
        `${API_BASE_URL}/resumes/${ensuredResumeId}/export-pdf`,
        `resume-export-${ensuredResumeId}.pdf`
      );

      if (!downloadResult?.uri) {
        return;
      }

      const saveName = `resume-export-${ensuredResumeId}-${Date.now()}.pdf`;

      if (Platform.OS === "android" && FileSystem.StorageAccessFramework) {
        const permission = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

        if (permission.granted) {
          const base64 = await FileSystem.readAsStringAsync(downloadResult.uri, {
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

          showErrorMessage("Download Complete", "Resume PDF has been downloaded to the selected folder.");
          return;
        }
      }

      const fallbackUri = `${FileSystem.documentDirectory}${saveName}`;
      await FileSystem.copyAsync({ from: downloadResult.uri, to: fallbackUri });
      showErrorMessage("Download Complete", "Resume PDF saved in app documents.");
    } catch (error) {
      console.log("Mobile export error:", error?.message || error);
      showErrorMessage("Error", "Unable to export PDF");
    } finally {
      setActionLoading(false);
      setActionType(null);
    }
  };

  const createResumeRecord = async (title) => {
    if (!Number.isFinite(parsedTemplateId) || parsedTemplateId <= 0) {
      showErrorMessage("Error", "Invalid template selected");
      return null;
    }

    setCreatingResume(true);
    try {
      let auth  = await getAuthUser();
      let userId = auth?.id;

      if (!userId) {
        const meRes = await authFetch(`${API_BASE_URL}/users/me`);
        if (meRes.ok) {
          const meData = await meRes.json();
          userId = meData?.id;
          auth = meData;

          if (userId) {
            const token = await getAuthToken();
            if (token) {
              await setAuthSession({ token, user: auth });
            }
          }
        }
      }
      
      if (!userId) {
        showErrorMessage("Error", "User not authenticated");
        return null;
      }

      const res = await authFetch(`${API_BASE_URL}/resumes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title,
          userId: userId,
          templateId: parsedTemplateId,
        }),
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      const createdResumeId = data?.id ?? data?.resumeId ?? null;
      if (res.ok && createdResumeId) {
        setResumeId(createdResumeId);
        return createdResumeId;
      }

      const errorMessage = data?.error || data?.message || "Failed to create resume record";
      showErrorMessage("Error", errorMessage);
      return null;
    } catch (e) {
      console.log("fetch error:", e.message);
      showErrorMessage("Error", "Unable to connect to server");
      return null;
    } finally {
      setCreatingResume(false);
    }
  };

  const ensureResumeId = async () => {
    if (resumeId) {
      return resumeId;
    }
    if (creatingResume) {
      showErrorMessage("Please wait", "Resume is still being prepared");
      return null;
    }
    return createResumeRecord(resumeTitle.trim() || "My Resume");
  };

const templateDetailTabs = [
  {
    name: "personal-information",
    label: "Personal Information",
    icon: "person",
    description: "Name, email, phone, address",
  },
  {
    name: "education",
    label: "Education",
    icon: "school",
    description: "Degree, college, graduation year",
  },
  {
    name: "experience",
    label: "Experience",
    icon: "work",
    description: "Job title, company, duration",
  },
  {
    name: "skills",
    label: "Skills",
    icon: "build",
    description: "Technical, soft skills",
  },
  {
    name: "projects",
    label: "Projects",
    icon: "code",
    description: "Project title, tech stack, and impact",
  },
];

    const handleCreateAndContinue = async () => {
      const trimmedTitle = resumeTitle.trim();
      if (!trimmedTitle) {
        showErrorMessage("Missing Fields", "Please fill: Resume Title");
        return;
      }

      const createdId = await createResumeRecord(trimmedTitle);
      if (!createdId) {
        return;
      }
      setExpandedTab("personal-information");
    };

    if (!resumeId && creatingResume) {
      return <BookLoader visible={creatingResume} />;
    }

    if (actionLoading) {
      return (
        <SnapResumeLoader
          messages={
            actionType === "export"
              ? [
                  "Generating your PDF export...",
                  "Adjusting layout and alignment...",
                  "Optimizing for print quality...",
                  "Finalizing your download...",
                ]
              : [
                  "Loading your resume preview...",
                  "Rendering sections beautifully...",
                  "Checking fonts and spacing...",
                  "Preview is almost ready...",
                ]
          }
        />
      );
    }

    if (!resumeId) {
      return (
        <View className="flex-1 bg-gray-100">
          <View className="flex-row items-center gap-4 p-4 mb-2 bg-white">
            <MaterialIcons name="arrow-back" size={24} className="mt-8" color="#0073D5" onPress={() => router.push("/Template")} />
            <Text className="mt-8 text-xl">{templateName || "Template"}</Text>
          </View>

          <View className="px-4 pt-4">
            <View className="bg-white rounded-2xl p-5">
              <Text className="text-xl font-bold">{templateName || "Selected Template"}</Text>
              <Text className="text-gray-500 mt-2">
                {templateDescription || "Build your professional resume with this template."}
              </Text>

              <Text className="mt-5 mb-2 font-semibold">Resume Title<Text className="text-red-500"> *</Text></Text>
              <TextInput
                value={resumeTitle}
                onChangeText={setResumeTitle}
                placeholder="Enter resume title"
                className="border border-gray-300 rounded-xl px-4 py-3 text-base"
                editable={!creatingResume}
              />

              <TouchableOpacity
                className={`mt-5 ${resumeTitle.trim() ? 'bg-blue-600' : 'bg-blue-300'} rounded-xl py-3 items-center justify-center`}
                activeOpacity={0.85}
                onPress={handleCreateAndContinue}
                disabled={creatingResume}
              >
                <Text className="text-white font-semibold">Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    return(
        <>
        <View>
            <View className="flex-row  items-center gap-4 p-4 mb-2 bg-white">
                <MaterialIcons name="arrow-back" size={24} className="mt-8" color="#0073D5" onPress={()=>router.push("/Template")}/>
                <Text className="mt-8 text-xl">{templateName}</Text>
            </View>
        </View>

        <View className="px-3 pb-1 flex-row gap-2">
          <TouchableOpacity
            className="flex-1 bg-gray-200 rounded-xl py-3 items-center justify-center"
            activeOpacity={0.85}
            onPress={handlePreview}
          >
            <Text className="text-gray-900 font-semibold">Preview</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-blue-600 rounded-xl py-3 items-center justify-center"
            activeOpacity={0.85}
            onPress={handleExportPdf}
          >
            <Text className="text-white font-semibold">Export PDF</Text>
          </TouchableOpacity>
        </View>

        <Animated.ScrollView
            bounces
            alwaysBounceVertical
            scrollEventThrottle={16}
            contentContainerStyle={{ paddingBottom: 20 }}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: true }
            )}
        >
            {templateDetailTabs.map((tab, index) => {
              const inputRange = [(index - 1) * 120, index * 120, (index + 1) * 120];
              const translateY = scrollY.interpolate({
                inputRange,
                outputRange: [0, 0, -14],
                extrapolate: "clamp",
              });
              const scale = scrollY.interpolate({
                inputRange,
                outputRange: [1, 1, 1],
                extrapolate: "clamp",
              });
              const opacity = scrollY.interpolate({
                inputRange,
                outputRange: [1, 1, 1],
                extrapolate: "clamp",
              });

              const isExpanded = expandedTab === tab.name;

              return (
                <Animated.View
                  key={tab.name}
                  style={{
                    transform: [{ translateY }, { scale }],
                    opacity,
                  }}
                >
                  <TouchableOpacity
                    onPress={() =>
                      setExpandedTab((prevTab) => (prevTab === tab.name ? null : tab.name))
                    }
                    activeOpacity={0.85}
                  >

                <View className="p-7 m-2 rounded-2xl bg-white">

                <View className="flex-row align-middle  justify-between items-center gap-4  rounded-2xl" >
                    <View className="flex-row justify-center items-center gap-4">

                    <View className="w-10 h-10 bg-blue-200 rounded-full items-center justify-center"> 
                        <MaterialIcons name={`${tab.icon}`} size={20} color="#0073D5"/>
                    </View>
                    <View className="flex-col items-start gap-1">
                        <Text className="text-lg font-semibold">{tab.label}</Text>
                        <Text className="text-gray-500 text-sm">{tab.description}</Text>

                    </View>
                    </View>
                    <View>
                        <MaterialIcons name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={22} color="#9ca3af"/>
                    </View>
                </View>
                {isExpanded && (
                  <View className="mt-4 border-t flex items-center justify-center  border-gray-100 pt-4">
                    <TouchableOpacity
                      className="self-center w-full bg-gray-200 px-4 py-2 rounded-lg"
                      onPress={async (event) => {
                        event?.stopPropagation?.();
                        let pathname = "/template/edit-profile-information";

                        if (tab.name === "experience") {
                          pathname = "/template/edit-work-experience";
                        }

                        if (tab.name === "education") {
                          pathname = "/template/edit-education";
                        }

                        if (tab.name === "skills") {
                          pathname = "/template/edit-skills";
                        }

                        if (tab.name === "projects") {
                          pathname = "/template/edit-projects";
                        }

                        const ensuredResumeId = await ensureResumeId();
                        if (!ensuredResumeId) {
                          showErrorMessage("Please wait", "Resume is still being prepared");
                          return;
                        }

                        router.push({
                          pathname,
                          params: { resumeId: String(ensuredResumeId), name: String(tab.label) },
                        });
                      }}
                    >
                      <Text className="font-medium text-center">Edit {tab.name}</Text>
                    </TouchableOpacity>
                  </View>
                )}
                </View>
            </TouchableOpacity>
              </Animated.View>
              )})}
          
            </Animated.ScrollView>
        </>
    )
}
export default TemplateDetail;