import {useFocusEffect, useLocalSearchParams, useRouter} from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Linking, Platform, ScrollView, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import { API_BASE_URL } from "../../../constants/api";
import { getAuthToken, getAuthUser, setAuthSession } from "../../../utils/authStorage";
import { authFetch } from "../../../utils/authFetch";
import * as FileSystem from "expo-file-system/legacy";
import SnapResumeLoader from "../../../components/screen/SnapResumeLoader";
import BookLoader from "../../../components/screen/BookLoader";
import { showErrorMessage } from "../../../utils/errorMessageBus";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TemplatePageHeader from "../../../components/ui/TemplatePageHeader";
import { clearResumeDraft, getResumeDraft, isResumeDraftComplete, saveResumeDraft } from "../../../utils/resumeDraftStorage";

const TemplateDetail = () => {
  const {id,name,description,resumeId: routeResumeId, draft: draftParam} = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const parsedRouteResumeId = Array.isArray(routeResumeId) ? Number(routeResumeId[0]) : Number(routeResumeId);
  const [resumeId, setResumeId] = useState(Number.isFinite(parsedRouteResumeId) && parsedRouteResumeId > 0 ? parsedRouteResumeId : null);
  const [creatingResume, setCreatingResume] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [draft, setDraft] = useState(null);
  const progressValue = useRef(new Animated.Value(0)).current;
  const isDraftFlow = String(Array.isArray(draftParam) ? draftParam[0] : draftParam) === "true";
  const scrollY = useRef(new Animated.Value(0)).current;
  const cardEntrances = useRef({}).current;
  const cardPressScales = useRef({}).current;
  const templateName = Array.isArray(name) ? name[0] : name;
  const templateDescription = Array.isArray(description) ? description[0] : description;
  const [resumeTitle, setResumeTitle] = useState(templateName ? `${templateName} Resume` : "My Resume");
  console.log("Template ID:", id, templateName);

  const parsedTemplateId = Array.isArray(id) ? Number(id[0]) : Number(id);

  const isSectionComplete = (sectionName, currentDraft) => {
    if (sectionName === "personal-information") {
      return Boolean(currentDraft?.personal?.firstName?.trim() && currentDraft?.personal?.lastName?.trim() && currentDraft?.personal?.email?.trim());
    }
    const section = currentDraft?.[sectionName];
    return Array.isArray(section) ? section.length > 0 : Boolean(section);
  };

  useFocusEffect(
    useCallback(() => {
    const loadProgress = async () => {
      let nextDraft;
      if (isDraftFlow) {
        nextDraft = await getResumeDraft();
      } else if (resumeId) {
        const [personalResponse, educationResponse, experienceResponse, skillsResponse, projectsResponse] = await Promise.all([
          authFetch(`${API_BASE_URL}/personal/${resumeId}`),
          authFetch(`${API_BASE_URL}/education`),
          authFetch(`${API_BASE_URL}/work-experience/resume/${resumeId}`),
          authFetch(`${API_BASE_URL}/skills/resume/${resumeId}`),
          authFetch(`${API_BASE_URL}/projects/resume/${resumeId}`),
        ]);
        const readJson = async (response) => response.ok ? response.json().catch(() => null) : null;
        nextDraft = {
          personal: await readJson(personalResponse),
          education: await readJson(educationResponse) || [],
          experience: await readJson(experienceResponse) || [],
          skills: await readJson(skillsResponse) || [],
          projects: await readJson(projectsResponse) || [],
        };
      } else {
        return;
      }
      setDraft(nextDraft);
      const completed = ["personal-information", "education", "experience", "skills", "projects"].filter((section) => isSectionComplete(section, nextDraft)).length;
      Animated.timing(progressValue, { toValue: completed / 5, duration: 650, useNativeDriver: false }).start();
    };
    loadProgress();
  }, [isDraftFlow, progressValue, resumeId])
  );

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

      const errorMessage = data?.message || data?.error || "Failed to create resume record";
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

const tabPalette = [
  { icon: "#168A83", soft: "#E5F5F1", active: "#F7FCFB", gradient: ["#FFFFFF", "#E6FAF5", "#BFE9DF"] },
  { icon: "#426EBA", soft: "#EAF0FB", active: "#F8FAFE", gradient: ["#FFFFFF", "#EEF4FF", "#C8D9F5"] },
  { icon: "#B8752D", soft: "#FFF1DF", active: "#FFFCF8", gradient: ["#FFFFFF", "#FFF7EA", "#F6D7AA"] },
  { icon: "#438B72", soft: "#E8F4EE", active: "#F8FCFA", gradient: ["#FFFFFF", "#EEF8F2", "#C7E5D4"] },
  { icon: "#C95C54", soft: "#FBEAE7", active: "#FFFAF9", gradient: ["#FFFFFF", "#FFF2EF", "#F4C6BF"] },
];

    useEffect(() => {
      templateDetailTabs.forEach((tab, index) => {
        if (!cardEntrances[tab.name]) {
          cardEntrances[tab.name] = new Animated.Value(0);
          cardPressScales[tab.name] = new Animated.Value(1);
        }

        Animated.spring(cardEntrances[tab.name], {
          toValue: 1,
          delay: index * 90,
          friction: 8,
          tension: 60,
          useNativeDriver: true,
        }).start();
      });
    }, [cardEntrances, cardPressScales]);

    const handleCreateAndContinue = async () => {
      const trimmedTitle = resumeTitle.trim();
      if (!trimmedTitle) {
        showErrorMessage("Missing Fields", "Please fill: Resume Title");
        return;
      }

      await saveResumeDraft({
        title: trimmedTitle,
        templateId: parsedTemplateId,
      });
      router.replace({
        pathname: "/template/[id]",
        params: {
          id: String(parsedTemplateId),
          name: String(templateName || "Resume"),
          description: String(templateDescription || ""),
          draft: "true",
          templateId: String(parsedTemplateId),
          resumeTitle: trimmedTitle,
        },
      });
    };

    const handleSectionPress = async (tab) => {
      const sectionRoutes = {
        "personal-information": "/template/edit-profile-information",
        experience: "/template/edit-work-experience",
        education: "/template/edit-education",
        skills: "/template/edit-skills",
        projects: "/template/edit-projects",
      };
      if (isDraftFlow) {
        router.push({
          pathname: sectionRoutes[tab.name],
          params: { draft: "true", name: String(tab.label) },
        });
        return;
      }
      const ensuredResumeId = await ensureResumeId();
      router.push({
        pathname: sectionRoutes[tab.name],
        params: { resumeId: String(ensuredResumeId), name: String(tab.label) },
      });
    };

    const handleCreateDraft = async () => {
      const currentDraft = await getResumeDraft();
      if (!isResumeDraftComplete(currentDraft)) {
        showErrorMessage("Complete your resume", "Finish all five sections before creating it");
        return;
      }
      setCreatingResume(true);
      try {
        const token = await getAuthToken();
        if (!token) throw new Error("Your session has expired. Please log in again.");
        const user = await getAuthUser();
        const request = (url, body, method = "POST") => fetch(url, { method, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
        const templateId = Number(parsedTemplateId);
        const userId = Number(user?.id);
        if (!Number.isFinite(templateId) || templateId <= 0) throw new Error("The selected template is invalid. Please choose a template again.");
        if (!Number.isFinite(userId) || userId <= 0) throw new Error("Your user session is invalid. Please log in again.");
        const response = await request(`${API_BASE_URL}/resumes`, { title: currentDraft.title?.trim() || "My Resume", userId, templateId });
        const data = await response.json().catch(() => null);
        const createdId = data?.id ?? data?.resumeId;
        if (!response.ok || !createdId) throw new Error(data?.message || data?.error || "Could not create resume");
        const send = async (url, body) => {
          const backendBody = { ...body };
          delete backendBody.id;
          delete backendBody.resume;
          const result = await request(url, { ...backendBody, resume: { id: createdId } });
          if (!result.ok) {
            const details = await result.text().catch(() => "");
            throw new Error(`${url.replace(API_BASE_URL, "")} returned ${result.status}${details ? `: ${details}` : ""}`);
          }
        };
        const personalResult = await request(`${API_BASE_URL}/personal/${createdId}`, { ...currentDraft.personal, resumeId: createdId }, "PUT");
        if (!personalResult.ok) throw new Error(`/personal/${createdId} returned ${personalResult.status}`);
        const sectionRequests = [
          ...currentDraft.education.map((item) => ["Education", `${API_BASE_URL}/education`, item]),
          ...currentDraft.experience.map((item) => ["Work Experience", `${API_BASE_URL}/work-experience`, item]),
          ...currentDraft.skills.map((item) => ["Skills", `${API_BASE_URL}/skills`, { skillName: item.name, category: item.category, rating: item.rating, sortOrder: 0 }]),
          ...currentDraft.projects.map((item) => ["Projects", `${API_BASE_URL}/projects`, item]),
        ];
        const results = await Promise.allSettled(sectionRequests.map(([, url, body]) => send(url, body)));
        const failures = results.map((result, index) => result.status === "rejected" ? sectionRequests[index][0] : null).filter(Boolean);
        if (failures.length) throw new Error(`Could not save: ${[...new Set(failures)].join(", ")}`);
        await clearResumeDraft();
        router.replace("/");
      } catch (error) {
        showErrorMessage("Could not create resume", error?.message || "Please try again");
      } finally {
        setCreatingResume(false);
      }
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

    if (!resumeId && !isDraftFlow) {
      return (
        <View className="flex-1 bg-[#F7F9FC]">
          <View className="rounded-b-[34px] bg-[#102A43] px-5 pb-7" style={{ paddingTop: Math.max(insets.top + 12, 24) }}>
            <View className="flex-row items-center justify-between">
              <TouchableOpacity onPress={() => router.push("/Template")} className="h-11 w-11 items-center justify-center rounded-2xl bg-[#193B5A]">
                <MaterialIcons name="arrow-back" size={22} color="#F4C95D" />
              </TouchableOpacity>
              <Text className="text-xs font-bold uppercase tracking-[2px] text-[#F4C95D]">Resume setup</Text>
              <View className="h-11 w-11 items-center justify-center rounded-2xl bg-[#F4C95D]">
                <MaterialIcons name="description" size={22} color="#102A43" />
              </View>
            </View>
            <View className="mt-6 flex-row items-center">
              <View className="h-24 w-24 items-center justify-center rounded-full bg-[#F4C95D]">
                <LottieView source={require("../../../assets/images/lionblink.json")} autoPlay loop style={{ width: 90, height: 90 }} />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-3xl font-bold text-white">Let&apos;s begin!</Text>
                <Text className="mt-2 text-sm leading-5 text-[#C9D6E3]">Start with a title, then build each section of your resume.</Text>
              </View>
            </View>
          </View>

          <ScrollView style={{ width: "100%", maxWidth: 760, alignSelf: "center" }} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 140 }}>
            <View className="mb-5 flex-row items-center justify-between">
              <View>
                <Text className="text-xs font-bold uppercase tracking-[2px] text-[#2A9D8F]">Getting started</Text>
                <Text className="mt-1 text-2xl font-bold text-[#102A43]">Set up your resume</Text>
            <View className="absolute bottom-7 left-7 top-16 w-1 rounded-full bg-[#D7E6E4]" />
              </View>
              <View className="h-10 w-10 items-center justify-center rounded-full bg-[#FDE2DD]">
                <MaterialIcons name="flag" size={20} color="#E76F51" />
              </View>
            </View>

            <View className="rounded-[28px] border border-[#D9E2EC] bg-white p-5 shadow-sm">
              <View className="flex-row items-center gap-3">
                <View className="h-14 w-14 items-center justify-center rounded-2xl bg-[#DDF3F0]">
                  <MaterialIcons name="description" size={27} color="#2A9D8F" />
                </View>
                <View className="flex-1">
                  <Text className="text-xl font-bold text-[#102A43]">{templateName || "Selected template"}</Text>
                  <Text className="mt-1 text-xs font-bold uppercase tracking-widest text-[#2A9D8F]">Your career canvas</Text>
                </View>
              </View>
              <Text className="mt-5 text-sm leading-5 text-[#486581]">{templateDescription || "Build your professional resume with this template."}</Text>

              <Text className="mb-2 mt-6 text-sm font-bold uppercase tracking-widest text-[#486581]">Resume title</Text>
              <TextInput
                value={resumeTitle}
                onChangeText={setResumeTitle}
                placeholder="e.g. Product designer journey"
                placeholderTextColor="#829AB1"
                className="rounded-2xl border-2 border-[#DDF3F0] bg-[#F7FDFC] px-4 py-4 text-base text-[#102A43]"
                editable={!creatingResume}
              />

              <TouchableOpacity
                className={`mt-5 flex-row items-center justify-center rounded-2xl py-4 ${resumeTitle.trim() ? 'bg-[#E76F51]' : 'bg-[#F2B7A9]'}`}
                activeOpacity={0.85}
                onPress={handleCreateAndContinue}
                disabled={creatingResume}
              >
                <MaterialIcons name="play-arrow" size={21} color="#FFFFFF" />
                <Text className="ml-2 font-bold text-white">Create resume</Text>
              </TouchableOpacity>
            </View>

            <View className="mt-5 flex-row items-center justify-center gap-2">
              {[0, 1, 2, 3, 4].map((step) => (
                <View key={step} className={`h-2.5 w-2.5 rounded-full ${step === 0 ? 'bg-[#E76F51]' : 'bg-[#D9E2EC]'}`} />
              ))}
            </View>
          </ScrollView>
        </View>
      );
    }

    return(
        <View className="flex-1 bg-[#EDF4F5]">
        <LinearGradient
          colors={["#E9F5F4", "#F3F1FA", "#FFF7EC"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
        />
        <TemplatePageHeader
          eyebrow="Resume workspace"
          title={templateName || "Resume"}
          accent="#172B4D"
          accentSoft="#DDF3F0"
          icon="description"
          onBack={() => router.push("/Template")}
          trailing={<View className="flex-row items-center gap-1 rounded-full bg-[#F4C95D] px-3 py-2"><MaterialIcons name="edit" size={15} color="#102A43" /><Text className="text-xs font-bold text-[#102A43]">Draft</Text></View>}
        />
        {/* <View className="w-full px-4 pt-4" style={{ maxWidth: 760, alignSelf: "center" }}>
          <Text className="text-sm text-[#486581]">Complete each section to build a polished resume.</Text>
          <View className="mt-4 flex-row items-center gap-3 rounded-2xl border border-[#D9E2EC] bg-white p-4">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#E6E4FF]">
              <MaterialIcons name="checklist" size={21} color="#5B4BDB" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-bold text-[#102A43]">Resume checklist</Text>
              <Text className="mt-1 text-xs text-[#486581]">Add your details, review the layout, then export.</Text>
            </View>
            <MaterialIcons name="chevron-right" size={21} color="#829AB1" />
          </View>
        </View> */}

        <View className="flex-row gap-3 px-4 pb-1 pt-4">
          {isDraftFlow ? (
            <TouchableOpacity className={`flex-1 flex-row items-center justify-center rounded-2xl py-3 ${draft && isResumeDraftComplete(draft) ? "bg-[#E76F51]" : "bg-[#F2B7A9]"}`} activeOpacity={0.9} onPress={handleCreateDraft} disabled={creatingResume || !draft || !isResumeDraftComplete(draft)}>
              <MaterialIcons name="check-circle" size={18} color="#FFFFFF" />
              <Text className="ml-2 font-bold text-white">Create Resume</Text>
            </TouchableOpacity>
          ) : null}
          {!isDraftFlow ? <>
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center rounded-2xl border border-[#D9E2EC] bg-white py-3"
            activeOpacity={0.85}
            onPress={handlePreview}
          >
            <MaterialIcons name="visibility" size={18} color="#176B67" />
            <Text className="ml-2 font-bold text-[#176B67]">Preview</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center rounded-2xl bg-[#E76F51] py-3"
            activeOpacity={0.85}
            onPress={handleExportPdf}
          >
            <MaterialIcons name="file-download" size={18} color="#FFFFFF" />
            <Text className="ml-2 font-bold text-white">Export PDF</Text>
          </TouchableOpacity>
          </> : null}
        </View>

        <View className="mx-4 mt-3 rounded-[22px] border border-white/80 bg-white/70 px-4 py-3 shadow-sm">
          <View className="flex-row items-center justify-between"><View className="flex-row items-center gap-3"><View className="h-9 w-9 items-center justify-center rounded-full bg-[#FFF4CE]"><MaterialIcons name="route" size={19} color="#D99B00" /></View><View><Text className="text-xs font-bold uppercase tracking-[1px] text-[#829AB1]">Your resume path</Text><Text className="mt-0.5 text-sm font-bold text-[#102A43]">{draft ? ["personal-information", "education", "experience", "skills", "projects"].filter((section) => isSectionComplete(section, draft)).length : 0} of 5 sections saved</Text></View></View><Text className="text-lg font-bold text-[#3978D2]">{draft ? `${["personal-information", "education", "experience", "skills", "projects"].filter((section) => isSectionComplete(section, draft)).length * 20}%` : "0%"}</Text></View>
          <Animated.View className="mt-4" style={{ flexDirection: "row", alignItems: "center", width: "100%", opacity: progressValue.interpolate({ inputRange: [0, 1], outputRange: [0.75, 1] }) }}>
            {templateDetailTabs.map((tab, index) => {
              const complete = isSectionComplete(tab.name, draft);
              const previousComplete = index === 0 || isSectionComplete(templateDetailTabs[index - 1].name, draft);
              return <View key={tab.name} style={{ flex: 1, flexDirection: "row", alignItems: "center" }}><View style={{ flex: 1, alignItems: "center" }}><View className="h-7 w-7 items-center justify-center rounded-full border-2" style={{ borderColor: complete ? "#168A83" : "#C7D6E2", backgroundColor: complete ? "#168A83" : "#FFFFFF" }}><MaterialIcons name={complete ? "check" : "lock-outline"} size={14} color={complete ? "#FFFFFF" : "#829AB1"} /></View></View>{index < templateDetailTabs.length - 1 ? <View className="h-1 flex-1 overflow-hidden rounded-full bg-[#DCE8FA]"><Animated.View className="h-full rounded-full bg-[#168A83]" style={{ width: previousComplete && complete ? "100%" : "0%" }} /></View> : null}</View>;
            })}
          </Animated.View>
          <View className="mt-2 flex-row"><Text className="flex-1 text-center text-[10px] font-semibold text-[#168A83]">Profile</Text><Text className="flex-1 text-center text-[10px] font-semibold text-[#829AB1]">Education</Text><Text className="flex-1 text-center text-[10px] font-semibold text-[#829AB1]">Experience</Text><Text className="flex-1 text-center text-[10px] font-semibold text-[#829AB1]">Skills</Text><Text className="flex-1 text-center text-[10px] font-semibold text-[#829AB1]">Projects</Text></View>
        </View>

        <Animated.ScrollView
          style={{ width: "100%", maxWidth: 760, alignSelf: "center" }}
            bounces
            alwaysBounceVertical
            scrollEventThrottle={16}
            contentContainerStyle={{
              paddingBottom: Math.max(insets.bottom + 56, 160),
              paddingTop: 10,
              paddingHorizontal: width < 480 ? 12 : 20,
            }}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: true }
            )}
        >
            <View className="mb-3 flex-row items-center justify-between">
              <View><Text className="text-xl font-bold text-[#102A43]">Build your resume</Text><Text className="mt-1 text-xs text-[#486581]">Add the details that make you stand out.</Text></View>
              <View className="h-10 w-10 items-center justify-center rounded-full bg-[#FFF4CE]"><MaterialIcons name="edit-note" size={21} color="#D99B00" /></View>
            </View>
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

              const palette = tabPalette[index];
              const entrance = cardEntrances[tab.name] || new Animated.Value(1);
              const pressScale = cardPressScales[tab.name] || new Animated.Value(1);

              return (
                <Animated.View
                  key={tab.name}
                  className="w-full pl-2"
                  style={{
                    width: "100%",
                    transform: [
                      { translateY },
                      { scale },
                      { scale: entrance },
                      { scale: pressScale },
                    ],
                    opacity: Animated.multiply(opacity, entrance),
                  }}
                >
                  <TouchableOpacity
                    className="w-full flex-row"
                    onPress={() => handleSectionPress(tab)}
                    activeOpacity={0.85}
                    onPressIn={() => {
                      Animated.spring(pressScale, {
                        toValue: 0.97,
                        friction: 7,
                        tension: 180,
                        useNativeDriver: true,
                      }).start();
                    }}
                    onPressOut={() => {
                      Animated.spring(pressScale, {
                        toValue: 1,
                        friction: 7,
                        tension: 180,
                        useNativeDriver: true,
                      }).start();
                    }}
                  >
                  <LinearGradient
                  colors={palette.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="relative mb-3 min-h-[92px] w-full flex-row items-center rounded-[22px] border p-3 shadow-sm"
                  style={{
                    width: "100%",
                    borderColor: "rgba(255,255,255,0.9)",
                    backgroundColor: "rgba(255,255,255,0.55)",
                    shadowColor: "#9AAABD",
                    shadowOffset: { width: 0, height: 5 },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                    elevation: 5,
                  }}
                >

                <View className="h-[56px] w-[56px] items-center justify-center rounded-full border-4 bg-white/75" style={{ borderColor: palette.icon }}>
                    <MaterialIcons name={`${tab.icon}`} size={25} color={palette.icon}/>
                  </View>
                  <View className="absolute left-[49px] top-[-4px] h-6 w-6 items-center justify-center rounded-full border-2 border-white" style={{ backgroundColor: palette.icon }}>
                    <Text className="text-[10px] font-bold text-white">{index + 1}</Text>
                  </View>
                <View className="ml-4 min-w-0 flex-1"><Text numberOfLines={1} className="text-base font-bold text-[#102A43]">{tab.label}</Text><View className="mt-1 flex-row items-center"><View className="flex-row items-center rounded-full px-2 py-1" style={{ backgroundColor: isSectionComplete(tab.name, draft) ? palette.icon : "#E8EDF2" }}><MaterialIcons name={isSectionComplete(tab.name, draft) ? "check" : "edit"} size={11} color={isSectionComplete(tab.name, draft) ? "#FFFFFF" : "#829AB1"} /><Text className="ml-1 text-[10px] font-bold uppercase tracking-[0.8px]" style={{ color: isSectionComplete(tab.name, draft) ? "#FFFFFF" : "#829AB1" }}>{isSectionComplete(tab.name, draft) ? "Saved in draft" : "Needs details"}</Text></View></View></View>
                <View className="h-9 w-9 items-center justify-center rounded-full bg-white/70"><MaterialIcons name="arrow-forward" size={18} color={palette.icon}/></View>
                </LinearGradient>
            </TouchableOpacity>
              </Animated.View>
              )})}
          
            </Animated.ScrollView>
        </View>
    )
}
export default TemplateDetail;