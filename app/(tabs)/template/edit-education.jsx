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

const EditEducation = () => {
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(true);
  const { resumeId, draft: draftParam } = useLocalSearchParams();
  const isDraft = !resumeId || draftParam === "true";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [educationItems, setEducationItems] = useState([]);
  const [queuedPopup, setQueuedPopup] = useState(null);
  const scrollRef = useRef(null);

  const [formData, setFormData] = useState({
    school: "",
    degree: "",
    field: "",
    startDate: "",
    endDate: "",
    gpa: "",
    achievements: "",
  });

  const progressAnim = useRef(new Animated.Value(0)).current;

  // Track progress on per-field basis
  const trackedFields = [
    formData.school,
    formData.degree,
    formData.startDate,
    formData.endDate,
    formData.gpa,
  ];

  const filledCount = trackedFields.filter((f) => String(f || "").trim().length > 0).length;
  const progressPercent = (filledCount / trackedFields.length) * 100;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progressPercent,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progressPercent]);

  const getMissingFields = () => {
    const missing = [];
    if (!formData.school?.trim()) missing.push("Institution Name");
    if (!formData.degree?.trim()) missing.push("Degree / Major");
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
      school: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
      gpa: "",
      achievements: "",
    });
    setEditingId(null);
  };

  const fetchEducations = async () => {
    if (isDraft) {
      const draft = await getResumeDraft();
      setEducationItems(draft.education || []);
      setLoading(false);
      return;
    }
    if (!resumeId) {
      setLoading(false);
      return;
    }

    try {
      const response = await authFetch(`${API_BASE_URL}/education`);
      if (response.ok) {
        const data = await response.json();
        setEducationItems(Array.isArray(data) ? data : []);
      } else {
        setEducationItems([]);
      }
    } catch (error) {
      console.log("Error fetching educations:", error);
      queuePopup("Error", "Could not load education list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEducations();
  }, []);

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
        const nextEducation = editingId
          ? current.education.map((item) => (item.id === editingId ? { ...formData, id: editingId } : item))
          : [...(current.education || []), { ...formData, id: `education-${Date.now()}` }];
        await saveResumeDraft({ education: nextEducation });
        queuePopup("Saved", "Education added to your draft");
        resetForm();
        setEducationItems(nextEducation);
        return;
      }

      const payload = {
        resume: { id: Number(resumeId) },
        school: formData.school,
        degree: formData.degree,
        field: formData.field || formData.degree,
        location: "N/A",
        startDate: formData.startDate,
        endDate: formData.endDate,
        isCurrent: false,
        gpa: formData.gpa,
        achievements: formData.achievements || "",
        sortOrder: 0,
      };

      const url = editingId ? `${API_BASE_URL}/education/${editingId}` : `${API_BASE_URL}/education`;
      const method = editingId ? "PUT" : "POST";

      const response = await authFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        queuePopup("Success", editingId ? "Education updated" : "Education added");
        await fetchEducations();
        resetForm();
      } else {
        queuePopup("Error", "Could not save education");
      }
    } catch (error) {
      console.log("Error saving education:", error);
      queuePopup("Error", "Could not save education");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (item) => {
    setEditingId(item.id);
    setShowAddForm(true);
    setFormData({
      school: item.school || "",
      degree: item.degree || "",
      field: item.field || "",
      startDate: item.startDate || "",
      endDate: item.endDate || "",
      gpa: item.gpa || "",
      achievements: item.achievements || "",
    });
    scrollRef.current?.scrollTo?.({ y: 0, animated: true });
  };

  const performDelete = async (id) => {
    try {
      setSaving(true);
      if (isDraft) {
        const draft = await getResumeDraft();
        const nextEducation = draft.education.filter((item) => item.id !== id);
        await saveResumeDraft({ education: nextEducation });
        setEducationItems(nextEducation);
        queuePopup("Deleted", "Education removed from your draft");
        setSaving(false);
        return;
      }
      const response = await authFetch(`${API_BASE_URL}/education/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchEducations();
        if (editingId === id) {
          resetForm();
        }
        queuePopup("Deleted", "Education entry deleted");
      } else {
        queuePopup("Error", "Could not delete education");
      }
    } catch (error) {
      console.log("Error deleting education:", error);
      queuePopup("Error", "Could not delete education");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm("Are you sure you want to delete this education entry?");
      if (confirmed) {
        performDelete(id);
      }
      return;
    }
    performDelete(id);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      {/* Header Bar with Animated Progress Slider */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 16, paddingHorizontal: 20, paddingTop: 54, paddingBottom: 16 }}>
        <TouchableOpacity activeOpacity={0.7} onPress={handleBack} style={{ padding: 4 }}>
          <MaterialIcons name="close" size={26} color={T.caps} />
        </TouchableOpacity>

        {/* Dynamic Progress Slider Bar */}
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
            <Text style={{ fontSize: 18, fontWeight: "800", color: T.ink }}>Education</Text>
            <Text style={{ marginTop: 4, fontSize: 13, fontWeight: "600", color: T.caps, lineHeight: 18 }}>
              Time to brag about your school days! Where did you study?
            </Text>
          </View>
        </View>

        {/* Added Education Items List */}
        {educationItems.length > 0 && (
          <View style={{ marginBottom: 20, gap: 10 }}>
            <Text style={{ fontSize: 11, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase", color: T.caps }}>
              ADDED EDUCATION ({educationItems.length})
            </Text>
            {educationItems.map((item) => (
              <View
                key={String(item.id)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justify: "space-between",
                  padding: 14,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: T.fieldBorder,
                  backgroundColor: T.fieldBg,
                }}
              >
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text numberOfLines={1} style={{ fontSize: 15, fontWeight: "800", color: T.ink }}>
                    {item.school || "University"}
                  </Text>
                  <Text numberOfLines={1} style={{ fontSize: 12, fontWeight: "600", color: T.caps, marginTop: 2 }}>
                    {item.degree} • {item.startDate} - {item.endDate}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <TouchableOpacity activeOpacity={0.7} onPress={() => handleEdit(item)}>
                    <MaterialIcons name="edit" size={20} color={T.blue} />
                  </TouchableOpacity>
                  <TouchableOpacity activeOpacity={0.7} onPress={() => handleDelete(item.id)}>
                    <MaterialIcons name="delete-outline" size={20} color={T.red} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Input Form Fields matching PDF */}
        <View style={{ gap: 16 }}>
          {/* Institution Name */}
          <View>
            <Text style={{ fontSize: 11, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase", color: T.caps, marginBottom: 6 }}>
              INSTITUTION NAME *
            </Text>
            <TextInput
              value={formData.school}
              onChangeText={(v) => handleChange("school", v)}
              placeholder="e.g. Stanford University"
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

          {/* Degree / Major */}
          <View>
            <Text style={{ fontSize: 11, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase", color: T.caps, marginBottom: 6 }}>
              DEGREE / MAJOR *
            </Text>
            <TextInput
              value={formData.degree}
              onChangeText={(v) => handleChange("degree", v)}
              placeholder="e.g. BS in Computer Science"
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
                placeholder="e.g. 2018"
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
                END DATE (OR EXPECTED) *
              </Text>
              <TextInput
                value={formData.endDate}
                onChangeText={(v) => handleChange("endDate", v)}
                placeholder="e.g. 2022"
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

          {/* GPA (Optional) */}
          <View>
            <Text style={{ fontSize: 11, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase", color: T.caps, marginBottom: 6 }}>
              GPA (OPTIONAL)
            </Text>
            <TextInput
              value={formData.gpa}
              onChangeText={(v) => handleChange("gpa", v)}
              placeholder="e.g. 3.8 / 4.0"
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
        <TouchableOpacity activeOpacity={0.92} onPress={handleAddOrUpdate}>
          <View style={{ borderRadius: 20, paddingBottom: 4, backgroundColor: isFormComplete ? T.greenPressed : T.caps }}>
            <View style={{
              alignItems: "center",
              justify: "center",
              borderRadius: 20,
              paddingVertical: 16,
              backgroundColor: isFormComplete ? T.green : T.fieldBorder,
            }}>
              <Text style={{ fontSize: 15, fontWeight: "900", letterSpacing: 0.8, color: "#FFFFFF" }}>
                {editingId ? "UPDATE EDUCATION" : "SAVE EDUCATION"}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {(loading || saving) && <BookLoader visible={loading || saving} />}
    </View>
  );
};

export default EditEducation;