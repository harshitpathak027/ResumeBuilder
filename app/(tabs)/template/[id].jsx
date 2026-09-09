import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Linking, Platform, ScrollView, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import { API_BASE_URL } from "../../../constants/api";
import { getAuthToken, getAuthUser, setAuthSession } from "../../../utils/authStorage";
import { authFetch } from "../../../utils/authFetch";
import * as FileSystem from "expo-file-system/legacy";
import SnapResumeLoader from "../../../components/screen/SnapResumeLoader";
import BookLoader from "../../../components/screen/BookLoader";
import { showErrorMessage } from "../../../utils/errorMessageBus";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { clearResumeDraft, getResumeDraft, isResumeDraftComplete, saveResumeDraft } from "../../../utils/resumeDraftStorage";

const T = {
  blue: "#3B82F6",
  blueBg: "#E8F2FF",
  green: "#58CC02",
  greenPressed: "#46A302",
  greenBg: "#EEFCE2",
  orange: "#F5A623",
  orangeBg: "#FFF0D9",
  ink: "#141821",
  fieldBg: "#F8F9FA",
  fieldBorder: "#EAEBED",
  caps: "#9AA0AC",
  red: "#E5484D",
  redBg: "#FDECEC",
  disabledBg: "#E0E2E7",
  disabledBorder: "#C8CBD0",
};

const TemplateDetail = () => {
  const { id, name, description, resumeId: routeResumeId, draft: draftParam } = useLocalSearchParams();
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
  const cardEntrances = useRef({}).current;
  const cardPressScales = useRef({}).current;
  const templateName = Array.isArray(name) ? name[0] : name;
  const templateDescription = Array.isArray(description) ? description[0] : description;
  const [resumeTitle, setResumeTitle] = useState(templateName ? `${templateName} Resume` : "My Resume");

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
          const readJson = async (response) => (response.ok ? response.json().catch(() => null) : null);
          nextDraft = {
            personal: await readJson(personalResponse),
            education: (await readJson(educationResponse)) || [],
            experience: (await readJson(experienceResponse)) || [],
            skills: (await readJson(skillsResponse)) || [],
            projects: (await readJson(projectsResponse)) || [],
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
      let auth = await getAuthUser();
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
    { icon: "#3B82F6", bg: "#E8F2FF" },
    { icon: "#F5A623", bg: "#FFF4E5" },
    { icon: "#58CC02", bg: "#EEFCE2" },
    { icon: "#8B5CF6", bg: "#F3E8FF" },
    { icon: "#EC4899", bg: "#FCE7F3" },
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
      const request = (url, body, method = "POST") =>
        fetch(url, { method, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
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
      const failures = results.map((result, index) => (result.status === "rejected" ? sectionRequests[index][0] : null)).filter(Boolean);
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
            ? ["Generating your PDF export...", "Adjusting layout and alignment...", "Optimizing for print quality...", "Finalizing your download..."]
            : ["Loading your resume preview...", "Rendering sections beautifully...", "Checking fonts and spacing...", "Preview is almost ready..."]
        }
      />
    );
  }

  // Setup Screen (Initial Title Assignment)
  if (!resumeId && !isDraftFlow) {
    return (
      <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
        {/* Top Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justify: "space-between",
            paddingHorizontal: 20,
            paddingTop: Math.max(insets.top + 12, 54),
            paddingBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: T.fieldBorder,
          }}
        >
          <TouchableOpacity activeOpacity={0.7} onPress={() => router.push("/Template")} style={{ padding: 4 }}>
            <MaterialIcons name="arrow-back" size={24} color={T.caps} />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: "800", color: T.ink }}>Resume Setup</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 120 }}>
          {/* Mascot Banner Stage */}
          <View style={{ alignItems: "center", marginBottom: 28 }}>
            <View style={{ width: 90, height: 90, borderRadius: 24, backgroundColor: T.orangeBg, overflow: "hidden", marginBottom: 12 }}>
              <LottieView source={require("../../../assets/images/lionblink.json")} autoPlay loop style={{ width: "100%", height: "100%" }} />
            </View>
            <Text style={{ fontSize: 24, fontWeight: "800", color: T.ink, textAlign: "center" }}>Let's begin!</Text>
            <Text style={{ fontSize: 13, fontWeight: "600", color: T.caps, textAlign: "center", marginTop: 4, maxWidth: 280 }}>
              Start with a title, then build each section of your resume.
            </Text>
          </View>

          {/* Form Box */}
          <View
            style={{
              borderRadius: 24,
              borderWidth: 1,
              borderColor: T.fieldBorder,
              backgroundColor: "#FFFFFF",
              padding: 20,
              shadowColor: "#000000",
              shadowOpacity: 0.04,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
              elevation: 2,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: T.blueBg, alignItems: "center", justifyContent: "center" }}>
                <MaterialIcons name="description" size={24} color={T.blue} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 17, fontWeight: "800", color: T.ink }}>{templateName || "Selected template"}</Text>
                <Text style={{ fontSize: 11, fontWeight: "800", letterSpacing: 0.6, color: T.caps, textTransform: "uppercase" }}>Selected Template</Text>
              </View>
            </View>

            <Text style={{ fontSize: 11, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase", color: T.caps, marginBottom: 8 }}>
              Resume Title
            </Text>

            <TextInput
              value={resumeTitle}
              onChangeText={setResumeTitle}
              placeholder="e.g. Product designer journey"
              placeholderTextColor={T.caps}
              style={{
                backgroundColor: T.fieldBg,
                borderWidth: 1,
                borderColor: T.fieldBorder,
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 15,
                fontWeight: "600",
                color: T.ink,
                marginBottom: 20,
              }}
              editable={!creatingResume}
            />

            {/* 3D Duolingo CTA */}
            <TouchableOpacity activeOpacity={0.92} onPress={handleCreateAndContinue} disabled={creatingResume}>
              <View style={{ borderRadius: 20, paddingBottom: 4, backgroundColor: T.greenPressed }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 20, paddingVertical: 16, backgroundColor: T.green }}>
                  <MaterialIcons name="play-arrow" size={22} color="#FFFFFF" />
                  <Text style={{ marginLeft: 6, fontSize: 15, fontWeight: "900", letterSpacing: 0.8, color: "#FFFFFF" }}>CREATE RESUME</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Workspace View (Sections Builder)
  const completedCount = draft ? ["personal-information", "education", "experience", "skills", "projects"].filter((section) => isSectionComplete(section, draft)).length : 0;
  const progressPercent = Math.round((completedCount / 5) * 100);
  const isDraftReady = draft && isResumeDraftComplete(draft);
  const remainingCount = 5 - completedCount;

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      {/* Header Bar */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justify: "space-between",
          paddingHorizontal: 20,
          paddingTop: Math.max(insets.top + 12, 54),
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: T.fieldBorder,
        }}
      >
        <TouchableOpacity activeOpacity={0.7} onPress={() => router.push("/Template")} style={{ padding: 4 }}>
          <MaterialIcons name="arrow-back" size={24} color={T.caps} />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: "800", color: T.ink }}>{templateName || "Resume"}</Text>
        <View style={{ borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: T.orangeBg }}>
          <Text style={{ fontSize: 11, fontWeight: "800", color: T.orange }}>DRAFT</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 120 }}>
        {/* Progress Tracker Card */}
        <View
          style={{
            borderRadius: 24,
            borderWidth: 1,
            borderColor: T.fieldBorder,
            backgroundColor: T.fieldBg,
            padding: 18,
            marginBottom: 20,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: T.orangeBg, alignItems: "center", justifyContent: "center" }}>
                <MaterialIcons name="alt-route" size={20} color={T.orange} />
              </View>
              <View>
                <Text style={{ fontSize: 10.5, fontWeight: "800", letterSpacing: 0.6, textTransform: "uppercase", color: T.caps }}>YOUR RESUME PATH</Text>
                <Text style={{ fontSize: 14, fontWeight: "800", color: T.ink, marginTop: 1 }}>{completedCount} of 5 sections saved</Text>
              </View>
            </View>
            <Text style={{ fontSize: 18, fontWeight: "900", color: T.blue }}>{progressPercent}%</Text>
          </View>

          <View style={{ height: 8, borderRadius: 4, backgroundColor: T.fieldBorder, overflow: "hidden" }}>
            <View style={{ height: "100%", width: `${progressPercent}%`, borderRadius: 4, backgroundColor: T.green }} />
          </View>
        </View>

        {/* Action Header Button Section */}
        <View style={{ marginBottom: 20 }}>
          {isDraftFlow ? (
            <View>
              {/* Helpful Nudge Indicator when disabled */}
              {!isDraftReady && (
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 8 }}>
                  <MaterialIcons name="info-outline" size={15} color={T.orange} />
                  <Text style={{ fontSize: 12, fontWeight: "700", color: T.orange }}>
                    Complete {remainingCount} more section{remainingCount > 1 ? "s" : ""} to enable
                  </Text>
                </View>
              )}

              <TouchableOpacity
                activeOpacity={isDraftReady ? 0.92 : 1}
                onPress={handleCreateDraft}
                disabled={creatingResume || !isDraftReady}
                style={{ opacity: isDraftReady ? 1 : 0.7 }}
              >
                <View
                  style={{
                    borderRadius: 16,
                    paddingBottom: 4,
                    backgroundColor: isDraftReady ? T.greenPressed : T.disabledBorder,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 16,
                      paddingVertical: 14,
                      backgroundColor: isDraftReady ? T.green : T.disabledBg,
                    }}
                  >
                    <MaterialIcons
                      name={isDraftReady ? "check-circle" : "lock"}
                      size={18}
                      color={isDraftReady ? "#FFFFFF" : T.caps}
                    />
                    <Text
                      style={{
                        marginLeft: 6,
                        fontSize: 13.5,
                        fontWeight: "900",
                        letterSpacing: 0.6,
                        color: isDraftReady ? "#FFFFFF" : T.caps,
                      }}
                    >
                      CREATE RESUME
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handlePreview}
                style={{
                  flex: 1,
                  height: 44,
                  flexDirection: "row",
                  alignItems: "center",
                  justify: "center",
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: T.fieldBorder,
                  backgroundColor: T.fieldBg,
                }}
              >
                <MaterialIcons name="visibility" size={18} color={T.ink} />
                <Text style={{ marginLeft: 6, fontSize: 13.5, fontWeight: "700", color: T.ink }}>Preview</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleExportPdf}
                style={{
                  flex: 1,
                  height: 44,
                  flexDirection: "row",
                  alignItems: "center",
                  justify: "center",
                  borderRadius: 16,
                  backgroundColor: T.blue,
                }}
              >
                <MaterialIcons name="file-download" size={18} color="#FFFFFF" />
                <Text style={{ marginLeft: 6, fontSize: 13.5, fontWeight: "700", color: "#FFFFFF" }}>Export PDF</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Section Cards List */}
        <Text style={{ marginBottom: 14, fontSize: 11, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase", color: T.caps }}>SECTIONS</Text>

        {templateDetailTabs.map((tab, index) => {
          const palette = tabPalette[index % tabPalette.length];
          const isComplete = isSectionComplete(tab.name, draft);

          return (
            <TouchableOpacity
              key={tab.name}
              activeOpacity={0.85}
              onPress={() => handleSectionPress(tab)}
              style={{
                marginBottom: 12,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: isComplete ? T.green : T.fieldBorder,
                backgroundColor: isComplete ? T.greenBg : "#FFFFFF",
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
                shadowColor: "#000000",
                shadowOpacity: 0.04,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 2 },
                elevation: 1,
              }}
            >
              <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: palette.bg, alignItems: "center", justifyContent: "center", marginRight: 14 }}>
                <MaterialIcons name={tab.icon} size={22} color={palette.icon} />
              </View>

              <View style={{ flex: 1, minWidth: 0 }}>
                <Text numberOfLines={1} style={{ fontSize: 16, fontWeight: "800", color: T.ink }}>
                  {tab.label}
                </Text>
                <Text numberOfLines={1} style={{ marginTop: 2, fontSize: 12, fontWeight: "600", color: T.caps }}>
                  {tab.description}
                </Text>
              </View>

              <View style={{ marginLeft: 10, alignItems: "center", justifyContent: "center" }}>
                {isComplete ? (
                  <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: T.green, alignItems: "center", justifyContent: "center" }}>
                    <MaterialIcons name="check" size={16} color="#FFFFFF" />
                  </View>
                ) : (
                  <MaterialIcons name="chevron-right" size={24} color={T.caps} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default TemplateDetail;