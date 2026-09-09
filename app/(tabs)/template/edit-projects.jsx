import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import LottieView from "lottie-react-native";
import BookLoader from "../../../components/screen/BookLoader";
import { API_BASE_URL } from "../../../constants/api";
import { authFetch } from "../../../utils/authFetch";
import { showErrorMessage } from "../../../utils/errorMessageBus";
import { getResumeDraft, saveResumeDraft } from "../../../utils/resumeDraftStorage";

const T = {
  blue: "#3B82F6",
  bluePressed: "#2563EB",
  blueBg: "#E8F2FF",
  cyan: "#00A2E8",
  green: "#58CC02",
  greenPressed: "#46A302",
  greenBg: "#EEFCE2",
  ink: "#141821",
  fieldBg: "#F6F6F7",
  fieldBorder: "#E6E7EA",
  placeholder: "#A9ADB6",
  caps: "#9AA0AC",
  track: "#EDEFF2",
  red: "#E5484D",
  redBg: "#FDECEC",
};

const EditProjects = () => {
  const router = useRouter();
  const { resumeId, draft: draftParam } = useLocalSearchParams();
  const isDraft = !resumeId || draftParam === "true";

  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [projects, setProjects] = useState([]);
  const [queuedPopup, setQueuedPopup] = useState(null);
  const scrollRef = useRef(null);

  const [formData, setFormData] = useState({
    projectName: "",
    description: "",
    technologies: "",
    startDate: "",
    endDate: "",
    liveUrl: "",
    repoUrl: "",
    sortOrder: 0,
  });

  const progressAnim = useRef(new Animated.Value(0)).current;

  // Calculate dynamic completion percentage based on form inputs or projects list
  const trackedFields = [
    formData.projectName,
    formData.description,
    formData.technologies,
    formData.startDate,
    formData.endDate,
  ];

  const filledCount = trackedFields.filter((f) => String(f || "").trim().length > 0).length;
  const formProgress = (filledCount / trackedFields.length) * 100;
  const listProgress = projects.length > 0 ? 100 : 0;
  const currentProgress = showAddForm ? formProgress : listProgress;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: currentProgress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentProgress]);

  const getMissingFields = () => {
    const missing = [];
    if (!formData.projectName?.trim()) missing.push("Project Name");
    if (!formData.description?.trim()) missing.push("Description");
    if (!formData.technologies?.trim()) missing.push("Technologies Used");
    if (!formData.startDate?.trim()) missing.push("Start Date");
    if (!formData.endDate?.trim()) missing.push("End Date");
    return missing;
  };

  const isFormComplete = getMissingFields().length === 0;

  const queuePopup = (title, message) => {
    setQueuedPopup({ title, message });
  };

  useEffect(() => {
    if (!loading && !saving && queuedPopup) {
      showErrorMessage(queuedPopup.title, queuedPopup.message);
      setQueuedPopup(null);
    }
  }, [loading, saving, queuedPopup]);

  const resetForm = () => {
    setFormData({
      projectName: "",
      description: "",
      technologies: "",
      startDate: "",
      endDate: "",
      liveUrl: "",
      repoUrl: "",
      sortOrder: 0,
    });
    setEditingId(null);
  };

  const fetchProjects = async () => {
    if (isDraft) {
      const draft = await getResumeDraft();
      setProjects(draft.projects || []);
      setLoading(false);
      return;
    }
    if (!resumeId) {
      setLoading(false);
      return;
    }

    try {
      const response = await authFetch(`${API_BASE_URL}/projects/resume/${resumeId}`);
      if (response.ok) {
        const data = await response.json();
        setProjects(Array.isArray(data) ? data : []);
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.log("Error fetching projects:", error);
      queuePopup("Error", "Could not load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [resumeId]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddOrUpdate = async () => {
    const missingFields = getMissingFields();
    if (missingFields.length > 0) {
      showErrorMessage("Missing Fields", `Please fill: ${missingFields.join(", ")}`);
      return;
    }

    try {
      setSaving(true);

      if (isDraft) {
        const current = await getResumeDraft();
        const nextProjects = editingId
          ? current.projects.map((item) => (item.id === editingId ? { ...formData, id: editingId } : item))
          : [...(current.projects || []), { ...formData, id: `project-${Date.now()}` }];
        await saveResumeDraft({ projects: nextProjects });
        setProjects(nextProjects);
        resetForm();
        setShowAddForm(false);
        return;
      }

      const payload = {
        resume: { id: Number(resumeId) },
        projectName: formData.projectName,
        description: formData.description,
        technologies: formData.technologies,
        startDate: formData.startDate,
        endDate: formData.endDate,
        liveUrl: formData.liveUrl || "",
        repoUrl: formData.repoUrl || "",
        sortOrder: 0,
      };

      const url = editingId ? `${API_BASE_URL}/projects/${editingId}` : `${API_BASE_URL}/projects`;
      const method = editingId ? "PUT" : "POST";

      const response = await authFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        queuePopup("Success", editingId ? "Project updated" : "Project added");
        await fetchProjects();
        resetForm();
        setShowAddForm(false);
      } else {
        queuePopup("Error", "Could not save project");
      }
    } catch (error) {
      console.log("Error saving project:", error);
      queuePopup("Error", "Could not save project");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (project) => {
    setEditingId(project.id);
    setFormData({
      projectName: project.projectName || "",
      description: project.description || "",
      technologies: project.technologies || "",
      startDate: project.startDate || "",
      endDate: project.endDate || "",
      liveUrl: project.liveUrl || "",
      repoUrl: project.repoUrl || "",
      sortOrder: project.sortOrder || 0,
    });
    setShowAddForm(true);
    scrollRef.current?.scrollTo?.({ y: 0, animated: true });
  };

  const performDelete = async (id) => {
    try {
      setSaving(true);
      if (isDraft) {
        const draft = await getResumeDraft();
        const nextProjects = draft.projects.filter((item) => item.id !== id);
        await saveResumeDraft({ projects: nextProjects });
        setProjects(nextProjects);
        setSaving(false);
        return;
      }
      const response = await authFetch(`${API_BASE_URL}/projects/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchProjects();
        if (editingId === id) {
          resetForm();
          setShowAddForm(false);
        }
      } else {
        queuePopup("Error", "Could not delete project");
      }
    } catch (error) {
      console.log("Error deleting project:", error);
      queuePopup("Error", "Could not delete project");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm("Are you sure you want to delete this project?");
      if (confirmed) {
        performDelete(id);
      }
      return;
    }
    performDelete(id);
  };

  const handleAddForm = () => {
    resetForm();
    setShowAddForm(true);
  };

  const handleBack = () => {
    if (showAddForm && projects.length > 0) {
      setShowAddForm(false);
      resetForm();
      return;
    }
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  const handleMainButtonPress = () => {
    if (showAddForm) {
      handleAddOrUpdate();
    } else if (projects.length > 0) {
      router.back();
    } else {
      handleAddForm();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      {/* Header Bar with Back/Close Icon and Animated Progress Slider */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 16, paddingHorizontal: 20, paddingTop: 54, paddingBottom: 16 }}>
        <TouchableOpacity activeOpacity={0.7} onPress={handleBack} style={{ padding: 4 }}>
          <MaterialIcons name={showAddForm ? "arrow-back" : "close"} size={26} color={T.caps} />
        </TouchableOpacity>

        {/* Dynamic Progress Slider */}
        <View style={{ flex: 1, height: 12, borderRadius: 6, backgroundColor: T.track, overflow: "hidden" }}>
          <Animated.View
            style={{
              height: "100%",
              borderRadius: 6,
              backgroundColor: T.green,
              width: progressAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ["0%", "100%"],
              }),
            }}
          />
        </View>
      </View>

      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 140 }}>
        {/* Mascot Stage & Speech Bubble */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <View style={{ width: 72, height: 72, borderRadius: 18, overflow: "hidden" }}>
            <LottieView
              source={require("../../../assets/images/lionblink.json")}
              autoPlay
              loop
              style={{ width: "100%", height: "100%" }}
            />
          </View>

          <View style={{
            flex: 1,
            borderRadius: 20,
            borderWidth: 1.5,
            borderColor: T.fieldBorder,
            backgroundColor: "#FFFFFF",
            padding: 16,
            shadowColor: "#000000",
            shadowOpacity: 0.03,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 },
            elevation: 1,
          }}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: T.ink, lineHeight: 18 }}>
              {showAddForm
                ? "Show recruiters what you built and the tech stack you mastered!"
                : "Wow! You're moving fast. Now, tell me about your projects!"}
            </Text>
          </View>
        </View>

        {/* Page Title */}
        <Text style={{ fontSize: 24, fontWeight: "900", color: T.ink, marginBottom: 20 }}>Projects</Text>

        {/* View Mode: Added Projects Cards & Action Triggers */}
        {!showAddForm && (
          <View style={{ gap: 14 }}>
            {/* Project List Items */}
            {projects.map((project) => (
              <View
                key={String(project.id)}
                style={{
                  borderRadius: 20,
                  borderWidth: 2,
                  borderColor: T.cyan,
                  backgroundColor: "#FFFFFF",
                  padding: 18,
                  paddingBottom: 22,
                  shadowColor: T.cyan,
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 2,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <View style={{ flex: 1, paddingRight: 12 }}>
                    <Text style={{ fontSize: 18, fontWeight: "800", color: T.ink }}>{project.projectName}</Text>
                    <Text style={{ fontSize: 14, fontWeight: "700", color: T.cyan, marginTop: 2 }}>{project.technologies}</Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <TouchableOpacity activeOpacity={0.7} onPress={() => handleEdit(project)}>
                      <MaterialIcons name="edit" size={20} color={T.caps} />
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.7} onPress={() => handleDelete(project.id)}>
                      <MaterialIcons name="delete-outline" size={22} color={T.red} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12 }}>
                  <MaterialIcons name="date-range" size={16} color={T.caps} />
                  <Text style={{ fontSize: 11, fontWeight: "800", letterSpacing: 0.6, textTransform: "uppercase", color: T.caps }}>
                    {project.startDate} — {project.endDate}
                  </Text>
                </View>

                {Boolean(project.description) && (
                  <Text style={{ fontSize: 13, fontWeight: "600", color: T.caps, marginTop: 8 }} numberOfLines={2}>
                    {project.description}
                  </Text>
                )}
              </View>
            ))}

            {/* Add Project Dashed Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleAddForm}
              style={{
                borderRadius: 20,
                borderWidth: 2,
                borderStyle: "dashed",
                borderColor: T.fieldBorder,
                backgroundColor: "#FFFFFF",
                paddingVertical: 18,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                gap: 8,
              }}
            >
              <MaterialIcons name="add" size={20} color={T.caps} />
              <Text style={{ fontSize: 13, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase", color: T.caps }}>
                ADD PROJECT
              </Text>
            </TouchableOpacity>

            {/* Pro Tip Banner */}
            <View
              style={{
                borderRadius: 20,
                backgroundColor: T.blueBg,
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                marginTop: 6,
              }}
            >
              <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" }}>
                <MaterialIcons name="lightbulb" size={22} color={T.blue} />
              </View>
              <Text style={{ flex: 1, fontSize: 13, fontWeight: "700", color: T.blue, lineHeight: 18 }}>
                Pro tip: Focus on live links and the technologies you used!
              </Text>
            </View>
          </View>
        )}

        {/* Edit/Add Form Mode */}
        {showAddForm && (
          <View style={{ gap: 16 }}>
            {/* Project Name */}
            <View>
              <Text style={{ fontSize: 11, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase", color: T.caps, marginBottom: 6 }}>
                PROJECT NAME *
              </Text>
              <TextInput
                value={formData.projectName}
                onChangeText={(v) => handleChange("projectName", v)}
                placeholder="e.g. Portfolio Website"
                placeholderTextColor={T.placeholder}
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
                }}
              />
            </View>

            {/* Technologies Used */}
            <View>
              <Text style={{ fontSize: 11, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase", color: T.caps, marginBottom: 6 }}>
                TECHNOLOGIES USED *
              </Text>
              <TextInput
                value={formData.technologies}
                onChangeText={(v) => handleChange("technologies", v)}
                placeholder="e.g. React, Node.js, Tailwind"
                placeholderTextColor={T.placeholder}
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
                }}
              />
            </View>

            {/* Dates Row */}
            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase", color: T.caps, marginBottom: 6 }}>
                  START DATE *
                </Text>
                <TextInput
                  value={formData.startDate}
                  onChangeText={(v) => handleChange("startDate", v)}
                  placeholder="e.g. Jan 2023"
                  placeholderTextColor={T.placeholder}
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
                  }}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase", color: T.caps, marginBottom: 6 }}>
                  END DATE *
                </Text>
                <TextInput
                  value={formData.endDate}
                  onChangeText={(v) => handleChange("endDate", v)}
                  placeholder="e.g. Mar 2023"
                  placeholderTextColor={T.placeholder}
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
                  }}
                />
              </View>
            </View>

            {/* Description */}
            <View>
              <Text style={{ fontSize: 11, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase", color: T.caps, marginBottom: 6 }}>
                PROJECT DESCRIPTION *
              </Text>
              <TextInput
                value={formData.description}
                onChangeText={(v) => handleChange("description", v)}
                placeholder="Describe what you built and your impact..."
                placeholderTextColor={T.placeholder}
                multiline
                numberOfLines={4}
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
                  minHeight: 100,
                  textAlignVertical: "top",
                }}
              />
            </View>

            {/* Live Demo URL */}
            <View>
              <Text style={{ fontSize: 11, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase", color: T.caps, marginBottom: 6 }}>
                LIVE DEMO URL (OPTIONAL)
              </Text>
              <TextInput
                value={formData.liveUrl}
                onChangeText={(v) => handleChange("liveUrl", v)}
                placeholder="https://yourproject.com"
                placeholderTextColor={T.placeholder}
                autoCapitalize="none"
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
                }}
              />
            </View>

            {/* Repository URL */}
            <View>
              <Text style={{ fontSize: 11, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase", color: T.caps, marginBottom: 6 }}>
                REPOSITORY URL (OPTIONAL)
              </Text>
              <TextInput
                value={formData.repoUrl}
                onChangeText={(v) => handleChange("repoUrl", v)}
                placeholder="https://github.com/username/repo"
                placeholderTextColor={T.placeholder}
                autoCapitalize="none"
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
                }}
              />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Fixed Bottom Action 3D Button */}
      <View style={{
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
      }}>
        <TouchableOpacity
          activeOpacity={0.92}
          onPress={handleMainButtonPress}
          disabled={saving || (showAddForm && !isFormComplete)}
        >
          <View
            style={{
              borderRadius: 20,
              paddingBottom: 4,
              backgroundColor: (!showAddForm || isFormComplete) ? T.greenPressed : T.caps,
            }}
          >
            <View
              style={{
                alignItems: "center",
                justify: "center",
                borderRadius: 20,
                paddingVertical: 16,
                backgroundColor: (!showAddForm || isFormComplete) ? T.green : T.fieldBorder,
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: "900", letterSpacing: 0.8, color: "#FFFFFF" }}>
                {showAddForm
                  ? (editingId ? "UPDATE PROJECT" : "SAVE PROJECT")
                  : "CONTINUE"}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {(loading || saving) && <BookLoader visible={loading || saving} />}
    </View>
  );
};

export default EditProjects;