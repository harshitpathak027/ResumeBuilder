import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import FormInputBox from "../../../components/ui/FormInputBox";
import FormSectionCard from "../../../components/ui/FormSectionCard";
import BookLoader from "../../../components/screen/BookLoader";
import { API_BASE_URL } from "../../../constants/api";
import { authFetch } from "../../../utils/authFetch";
import { showErrorMessage } from "../../../utils/errorMessageBus";
import { getResumeDraft, saveResumeDraft } from "../../../utils/resumeDraftStorage";
import TemplatePageHeader from "../../../components/ui/TemplatePageHeader";

const EditWorkExperience = () => {
  const router = useRouter();
  const { resumeId, draft: draftParam } = useLocalSearchParams();
  const isDraft = !resumeId || draftParam === "true";

  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [experienceItems, setExperienceItems] = useState([]);
  const [queuedPopup, setQueuedPopup] = useState(null);
  const scrollRef = useRef(null);

  const [formData, setFormData] = useState({
    jobTitle: "",
    company: "",
    location: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
    description: "",
    sortOrder: 0,
  });

  const getMissingFields = () => {
    const missing = [];
    if (!formData.jobTitle.trim()) missing.push("Job Title");
    if (!formData.company.trim()) missing.push("Company");
    if (!formData.location.trim()) missing.push("Location");
    if (!formData.startDate.trim()) missing.push("Start Date");
    if (!formData.endDate.trim()) missing.push("End Date");
    if (!formData.description.trim()) missing.push("Description");
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
      jobTitle: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      description: "",
      sortOrder: 0,
    });
    setEditingId(null);
  };

  const fetchWorkExperience = async () => {
    if (isDraft) {
      const draft = await getResumeDraft();
      setExperienceItems(draft.experience || []);
      setLoading(false);
      return;
    }
    if (!resumeId) {
      setLoading(false);
      return;
    }

    try {
      const response = await authFetch(`${API_BASE_URL}/work-experience/resume/${resumeId}`);
      if (response.ok) {
        const data = await response.json();
        setExperienceItems(Array.isArray(data) ? data : []);
      } else {
        setExperienceItems([]);
      }
    } catch (error) {
      console.log("Error fetching work experience:", error);
      queuePopup("Error", "Could not load work experience");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkExperience();
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
        const nextExperience = editingId
          ? current.experience.map((item) => item.id === editingId ? { ...formData, id: editingId } : item)
          : [...(current.experience || []), { ...formData, id: `experience-${Date.now()}` }];
        await saveResumeDraft({ experience: nextExperience });
        setExperienceItems(nextExperience);
        resetForm();
        setShowAddForm(false);
        router.replace({ pathname: "/template/[id]", params: { id: String(current.templateId), draft: "true", name: current.title } });
        return;
      }

      const payload = {
        resume: { id: Number(resumeId) },
        jobTitle: formData.jobTitle,
        company: formData.company,
        location: formData.location,
        startDate: formData.startDate,
        endDate: formData.endDate,
        isCurrent: formData.isCurrent,
        description: formData.description,
        sortOrder: 0,
      };

      const url = editingId
        ? `${API_BASE_URL}/work-experience/${editingId}`
        : `${API_BASE_URL}/work-experience`;

      const method = editingId ? "PUT" : "POST";

      const response = await authFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        queuePopup("Success", editingId ? "Position updated" : "Position added");
        await fetchWorkExperience();
        resetForm();
        setShowAddForm(false);
      } else {
        queuePopup("Error", "Could not save position");
      }
    } catch (error) {
      console.log("Error saving position:", error);
      queuePopup("Error", "Could not save position");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (id) => {
    try {
      setSaving(true);
      if (isDraft) {
        const draft = await getResumeDraft();
        const item = draft.experience.find((entry) => entry.id === id);
        if (item) setFormData(item);
        setEditingId(id);
        setShowAddForm(true);
        setSaving(false);
        return;
      }
      const req = await authFetch(`${API_BASE_URL}/work-experience/${id}`);

      if (req.ok) {
        const data = await req.json();
        setEditingId(id);
        setFormData({
          jobTitle: data.jobTitle || "",
          company: data.company || "",
          location: data.location || "",
          startDate: data.startDate || "",
          endDate: data.endDate || "",
          isCurrent: data.isCurrent || false,
          description: data.description || "",
          sortOrder: data.sortOrder || 0,
        });
        setShowAddForm(true);
        requestAnimationFrame(() => {
          scrollRef.current?.scrollTo?.({ y: 0, animated: true });
        });
      }
    } catch (error) {
      console.log("Error loading position:", error);
      queuePopup("Error", "Could not load position");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setSaving(true);
      if (isDraft) {
        const draft = await getResumeDraft();
        const nextExperience = draft.experience.filter((item) => item.id !== id);
        await saveResumeDraft({ experience: nextExperience });
        setExperienceItems(nextExperience);
        setSaving(false);
        return;
      }
      const response = await authFetch(`${API_BASE_URL}/work-experience/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchWorkExperience();
      } else {
        queuePopup("Error", "Could not delete position");
      }
    } catch (error) {
      console.log("Error deleting position:", error);
      queuePopup("Error", "Could not delete position");
    } finally {
      setSaving(false);
    }
  };

  const handleAddForm = () => {
    resetForm();
    setShowAddForm(true);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  if (loading) {
    return <BookLoader visible={loading} />;
  }

  return (
    <View className="flex-1 bg-[#F7F9FC]">
      <TemplatePageHeader
        eyebrow="Your track record"
        title="Work Experience"
        accent="#F4C95D"
        accentSoft="#FFF8DE"
        icon="work-history"
        onBack={handleBack}
        trailing={<View className="flex-row items-center gap-1 rounded-full bg-[#102A43] px-3 py-2"><MaterialIcons name="auto-fix-high" size={14} color="#F4C95D" /><Text className="text-sm font-bold text-white">AI</Text></View>}
      />

      <ScrollView ref={scrollRef} style={{ width: "100%", maxWidth: 760, alignSelf: "center" }} className="flex-1 pt-5" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 140 }}>
        <View className="mb-3 rounded-[22px] border border-[#A8DCD5] bg-[#DDF3F0] p-4">
          <View className="mb-3 flex-row items-start gap-3">
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-[#102A43]">
              <MaterialIcons name="auto-fix-high" size={20} color="#F4C95D" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-[#102A43]">AI Enhancement Available</Text>
              <Text className="mt-1 text-sm text-[#486581]">Let AI improve your job descriptions with impactful language.</Text>
            </View>
          </View>
          <TouchableOpacity className="h-10 items-center justify-center self-start rounded-xl bg-[#E76F51] px-4" activeOpacity={0.85}>
            <Text className="text-base font-bold text-white">Coming Soon</Text>
          </TouchableOpacity>
        </View>

        {showAddForm && (
          <View className="mb-3 rounded-[24px] border border-[#D9E2EC] bg-white p-4 shadow-sm">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-[#102A43]">{editingId ? "Edit Position" : "New Position"}</Text>
              <TouchableOpacity activeOpacity={0.8} onPress={() => setShowAddForm(false)}>
                <Text className="text-sm font-bold text-[#E76F51]">Cancel</Text>
              </TouchableOpacity>
            </View>

            <FormInputBox
              label="Job Title"
              value={formData.jobTitle}
              onChange={(v) => handleChange("jobTitle", v)}
              placeholder="e.g., Software Engineer"
              required
            />
            <FormInputBox
              label="Company"
              value={formData.company}
              onChange={(v) => handleChange("company", v)}
              placeholder="Company name"
              icon="apartment"
              required
            />
            <FormInputBox
              label="Location"
              value={formData.location}
              onChange={(v) => handleChange("location", v)}
              placeholder="City, State or Remote"
              required
            />

            <View className="flex-row gap-3">
              <View className="flex-1">
                <FormInputBox
                  label="Start Date"
                  value={formData.startDate}
                  onChange={(v) => handleChange("startDate", v)}
                  placeholder="Jan 2022"
                  icon="calendar-today"
                  required
                />
              </View>
              <View className="flex-1">
                <FormInputBox
                  label="End Date"
                  value={formData.endDate}
                  onChange={(v) => handleChange("endDate", v)}
                  placeholder="Present"
                  required
                />
              </View>
            </View>

            <View className="mb-3 flex-row items-center justify-between rounded-2xl bg-[#F7F9FC] px-3 py-2.5">
              <Text className="text-base text-[#102A43]">I currently work here</Text>
              <Switch
                value={formData.isCurrent}
                onValueChange={(v) => handleChange("isCurrent", v)}
                trackColor={{ false: "#D9E2EC", true: "#A8DCD5" }}
                thumbColor="#ffffff"
              />
            </View>

            <FormInputBox
              label="Description"
              value={formData.description}
              onChange={(v) => handleChange("description", v)}
              placeholder="Describe your responsibilities and achievements..."
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
                {editingId ? "Update Position" : "Add Position"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {experienceItems.map((item) => (
          <FormSectionCard key={item.id} title={item.title} accent="#F4A261" icon="work-history">
            <View className="flex-row items-start justify-between">
              <View className="flex-row items-start gap-3 flex-1">
                <MaterialIcons name="drag-indicator" size={20} color="#829AB1" />
                <View className="flex-1">
                  <Text className="text-base font-bold text-[#102A43]">{item.jobTitle}</Text>
                  <Text className="mt-1 text-sm font-semibold text-[#486581]">{item.company}</Text>
                  <Text className="mt-1 text-xs text-[#829AB1]">{item.startDate} - {item.endDate} · {item.location}</Text>
                  <Text className="mt-2 text-sm text-[#486581]" numberOfLines={2}>
                    {item.description}
                  </Text>
                  {item.isCurrent && (
                    <View className="mt-3 self-start rounded-xl bg-[#DDF3F0] px-3 py-1">
                      <Text className="text-sm font-bold text-[#176B67]">Current Position</Text>
                    </View>
                  )}
                </View>
              </View>
              <View className="flex-row items-center gap-4">
                <TouchableOpacity activeOpacity={0.8} onPress={() => handleEdit(item.id)}>
                  <MaterialIcons name="edit" size={18} color="#4b5563" />
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.8} onPress={() => handleDelete(item.id)}>
                  <MaterialIcons name="delete-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          </FormSectionCard>
        ))}
        {!showAddForm && experienceItems.length === 0 && (
          <View className="items-center rounded-[24px] border border-dashed border-[#E8C86A] bg-[#FFF8DE] px-6 py-9">
            <View className="h-14 w-14 items-center justify-center rounded-full bg-[#F4C95D]">
              <MaterialIcons name="work-history" size={28} color="#102A43" />
            </View>
            <Text className="mt-4 text-lg font-bold text-[#102A43]">No experience added</Text>
            <Text className="mt-1 text-center text-sm text-[#486581]">Add your first role and turn work into momentum.</Text>
          </View>
        )}
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 border-t border-[#D9E2EC] bg-[#F7F9FC] px-4 py-3">
        <TouchableOpacity className="h-14 flex-row items-center justify-center rounded-2xl bg-[#E76F51]" activeOpacity={0.9} onPress={showAddForm ? handleAddOrUpdate : handleAddForm} disabled={saving}>
          <Text className="text-base font-bold text-white">{showAddForm ? (editingId ? "Update Position" : "Add Position") : "Add Position"}</Text>
        </TouchableOpacity>
      </View>
      {(loading || saving) ? <BookLoader visible={loading || saving} /> : null}
    </View>
  );
};

export default EditWorkExperience;