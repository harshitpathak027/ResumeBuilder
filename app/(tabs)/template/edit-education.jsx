import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Platform, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import FormInputBox from "../../../components/ui/FormInputBox";
import FormSectionCard from "../../../components/ui/FormSectionCard";
import BookLoader from "../../../components/screen/BookLoader";
import TemplatePageHeader from "../../../components/ui/TemplatePageHeader";
import { API_BASE_URL } from "../../../constants/api";
import { authFetch } from "../../../utils/authFetch";
import { showErrorMessage } from "../../../utils/errorMessageBus";
import { getResumeDraft, saveResumeDraft } from "../../../utils/resumeDraftStorage";

const EditEducation = () => {
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);
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
    location: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
    gpa: "",
    achievements: "",
    sortOrder: 0,
    resume: { id: Number(resumeId) }
  });

  const getMissingFields = () => {
    const missing = [];
    if (!formData.school?.trim()) missing.push("School/University");
    if (!formData.degree?.trim()) missing.push("Degree");
    if (!formData.field?.trim()) missing.push("Field of Study");
    if (!formData.location?.trim()) missing.push("Location");
    if (!formData.startDate?.trim()) missing.push("Start Date");
    if (!formData.endDate?.trim()) missing.push("End Date");
    if (!formData.gpa?.trim()) missing.push("GPA");
    if (!formData.achievements?.trim()) missing.push("Achievements & Activities");
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
      location: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
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
          ? current.education.map((item) => item.id === editingId ? { ...formData, id: editingId } : item)
          : [...(current.education || []), { ...formData, id: `education-${Date.now()}` }];
        await saveResumeDraft({ education: nextEducation });
        queuePopup("Saved", "Education added to your draft");
        resetForm();
        setShowAddForm(false);
        setEducationItems(nextEducation);
        router.replace({ pathname: "/template/[id]", params: { id: String(current.templateId), draft: "true", name: current.title } });
        return;
      }

      const payload = {
        resume: { id: Number(resumeId) },
        school: formData.school,
        degree: formData.degree,
        field: formData.field,
        location: formData.location,
        startDate: formData.startDate,
        endDate: formData.endDate,
        isCurrent: formData.isCurrent,
        gpa: formData.gpa,
        achievements: formData.achievements,
        sortOrder: 0,
      };

      const url = editingId
        ? `${API_BASE_URL}/education/${editingId}`
        : `${API_BASE_URL}/education`;

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
        setShowAddForm(false);
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


  const handleEdit = async (id) => {
    try {
      setSaving(true);
      setEditingId(id);
      setShowAddForm(true);

      if (isDraft) {
        const draft = await getResumeDraft();
        const item = draft.education.find((entry) => entry.id === id);
        if (item) setFormData(item);
        setSaving(false);
        return;
      }

      const req = await authFetch(`${API_BASE_URL}/education/${id}`);

      if (req.ok) {
        const data = await req.json();
        setFormData(data);
        setShowAddForm(true);
        requestAnimationFrame(() => {
          scrollRef.current?.scrollTo?.({ y: 0, animated: true });
        });
      }
    } catch (error) {
      console.log("Error loading education:", error);
      queuePopup("Error", "Could not load education");
    } finally {
      setSaving(false);
    }
  }
  const handleAddForm = () => {
    resetForm();
    // console.log(showAddForm);
    setShowAddForm(true)
    // console.log(showAddForm);
    setEditingId("");
  }

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
          setShowAddForm(false);
        }
        queuePopup("Deleted", "Education entry deleted successfully");
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
    <View className="flex-1 bg-[#F7F9FC]">
      <TemplatePageHeader
        eyebrow="Your foundation"
        title="Education"
        accent="#3A86FF"
        accentSoft="#DDEAF5"
        icon="school"
        onBack={handleBack}
      />

      <ScrollView ref={scrollRef} style={{ width: "100%", maxWidth: 760, alignSelf: "center" }} className="flex-1 pt-5" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 140 }}>
        {!showAddForm && (
          <TouchableOpacity
            className="mb-3 h-12 items-center justify-center rounded-[18px] border border-dashed border-[#9CC1FF] bg-[#F4F8FF]"
            activeOpacity={0.85}
            onPress={handleAddForm}
          >
            <Text className="text-base font-bold text-[#2563C7]">+ Add Education</Text>
          </TouchableOpacity>
        )}

        {showAddForm && (
          <View className="mb-3 rounded-[24px] border border-[#D9E2EC] bg-white p-4 shadow-sm">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-[#102A43]">{editingId ? "Edit Education" : "New Education"}</Text>
              <TouchableOpacity activeOpacity={0.8} onPress={() => setShowAddForm(false)}>
                <Text className="text-sm font-bold text-[#E76F51]">Cancel</Text>
              </TouchableOpacity>
            </View>

            <FormInputBox
              label="School/University"
              value={formData.school}
              onChange={(v) => handleChange("school", v)}
              placeholder="University name"
              icon="school"
              required
            />
            <FormInputBox
              label="Degree"
              value={formData.degree}
              onChange={(v) => handleChange("degree", v)}
              placeholder="e.g., Bachelor of Science"
              required
            />

            <FormInputBox
              label="Field of Study"
              value={formData.field}
              onChange={(v) => handleChange("field", v)}
              placeholder="e.g., Computer Science"
              required
            />
            <FormInputBox
              label="Location"
              value={formData.location}
              onChange={(v) => handleChange("location", v)}
              placeholder="City, State"
              icon="location-on"
              required
            />
            <View className="flex-row gap-3">
              <View className="flex-1">
                <FormInputBox
                  label="Start Date"
                  value={formData.startDate}
                  onChange={(v) => handleChange("startDate", v)}
                  placeholder="Aug 2018"
                  icon="calendar-today"
                  required
                />
              </View>
              <View className="flex-1">
                <FormInputBox
                  label="End Date"
                  value={formData.endDate}
                  onChange={(v) => handleChange("endDate", v)}
                  placeholder="May 2022"
                  required
                />
              </View>
            </View>

            <View className="mb-3 flex-row items-center justify-between rounded-2xl bg-[#F7F9FC] px-3 py-2.5">
              <Text className="text-base text-[#102A43]">Currently studying here</Text>
              <Switch
                value={formData.isCurrent}
                onValueChange={(v) => handleChange("isCurrent", v)}
                trackColor={{ false: "#D9E2EC", true: "#A8DCD5" }}
                thumbColor="#ffffff"
              />
            </View>

            <FormInputBox
              label="GPA"
              value={formData.gpa}
              onChange={(v) => handleChange("gpa", v)}
              placeholder="e.g., 3.8"
              required
            />
            <FormInputBox
              label="Achievements & Activities"
              value={formData.achievements}
              onChange={(v) => handleChange("achievements", v)}
              placeholder="Honors, clubs, relevant coursework..."
              multiline
              required
            />
            <TouchableOpacity
              className={`${saving || !isFormComplete ? "bg-[#F2B7A9]" : "bg-[#E76F51]"} mt-1 h-12 flex-row items-center justify-center rounded-2xl`}
              activeOpacity={0.9}
              onPress={handleAddOrUpdate}
              disabled={saving}
            >
              <Text className="text-base font-bold text-white">
                {editingId ? "Update Education" : "Add Education"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {educationItems.map((item) => (
          <FormSectionCard key={item.id} title={item.school} accent="#3A86FF" icon="school">
            <View className="flex-row items-start justify-between">
              <View className="flex-row items-start gap-3 flex-1">
                <MaterialIcons name="drag-indicator" size={20} color="#829AB1" />
                <View className="flex-1">
                  <FormInputBox
                    label="School/University"
                    value={item.school}
                    placeholder="University name"
                    icon="school"
                  />
                  <FormInputBox
                    label="Degree"
                    value={item.degree}
                    placeholder="e.g., Bachelor of Science"
                  />
                  <Text className="mt-1 text-sm text-[#486581]">{item.timeline}</Text>
                  <FormInputBox
                    label="GPA"
                    value={item.gpa}
                    placeholder="e.g., 3.8"
                  />
                  <Text className="mt-2 text-sm text-[#486581]" numberOfLines={2}>
                    {item.details}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center gap-4">
                <TouchableOpacity activeOpacity={0.8}>
                  <MaterialIcons name="edit" size={18} color="#4b5563" onPress={() => handleEdit(item.id)} />
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.8} onPress={() => handleDelete(item.id)}>
                  <MaterialIcons name="delete-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          </FormSectionCard>
        ))}
        {!showAddForm && educationItems.length === 0 && (
          <View className="items-center rounded-[24px] border border-dashed border-[#9CC1FF] bg-[#F4F8FF] px-6 py-9">
            <View className="h-14 w-14 items-center justify-center rounded-full bg-[#DDEAF5]">
              <MaterialIcons name="school" size={28} color="#3A86FF" />
            </View>
            <Text className="mt-4 text-lg font-bold text-[#102A43]">Start your learning story</Text>
            <Text className="mt-1 text-center text-sm text-[#486581]">Add your education to complete this resume section.</Text>
          </View>
        )}
      </ScrollView>

      {(loading || saving) ? <BookLoader visible={loading || saving} /> : null}
    </View>
  );
};

export default EditEducation;