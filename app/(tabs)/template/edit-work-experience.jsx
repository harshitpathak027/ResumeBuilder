import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import FormInputBox from "../../../components/ui/FormInputBox";
import FormSectionCard from "../../../components/ui/FormSectionCard";
import { API_BASE_URL } from "../../../constants/api";
import { authFetch } from "../../../utils/authFetch";

const EditWorkExperience = () => {
  const router = useRouter();
  const { resumeId } = useLocalSearchParams();

  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [experienceItems, setExperienceItems] = useState([]);

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
      Alert.alert("Error", "Could not load work experience");
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
    if (!resumeId) {
      Alert.alert("Error", "resumeId missing");
      return;
    }

    if (!formData.jobTitle.trim() || !formData.company.trim()) {
      Alert.alert("Validation", "Job title and company are required");
      return;
    }

    try {
      setSaving(true);

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
        Alert.alert("Success", editingId ? "Position updated" : "Position added");
        await fetchWorkExperience();
        resetForm();
        setShowAddForm(false);
      } else {
        Alert.alert("Error", "Could not save position");
      }
    } catch (error) {
      console.log("Error saving position:", error);
      Alert.alert("Error", "Could not save position");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (id) => {
    try {
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
      }
    } catch (error) {
      console.log("Error loading position:", error);
      Alert.alert("Error", "Could not load position");
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await authFetch(`${API_BASE_URL}/work-experience/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchWorkExperience();
      } else {
        Alert.alert("Error", "Could not delete position");
      }
    } catch (error) {
      console.log("Error deleting position:", error);
      Alert.alert("Error", "Could not delete position");
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
    return (
      <View className="flex-1 bg-gray-100 items-center justify-center">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      <View className="pt-12 px-4 pb-3 bg-white border-b border-blue-100">
        <View className="flex-row items-start justify-between">
          <TouchableOpacity className="flex-row items-center gap-3" onPress={handleBack} activeOpacity={0.8}>
            <MaterialIcons name="arrow-back-ios" size={18} color="#6b7280" />
            <View>
              <Text className="text-xl font-semibold text-gray-900">Work Experience</Text>
              <Text className="text-gray-500 text-sm mt-1">{experienceItems.length} positions added</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="px-3 h-8 rounded-2xl border border-gray-300 flex-row items-center gap-1" activeOpacity={0.8}>
            <MaterialIcons name="auto-fix-high" size={14} color="#3b82f6" />
            <Text className="text-gray-700 text-sm font-medium">AI</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 pt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="bg-blue-50 rounded-3xl p-5 mx-4 mb-4 border border-blue-100">
          <View className="flex-row items-start gap-3 mb-3">
            <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center">
              <MaterialIcons name="auto-fix-high" size={20} color="#3b82f6" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-900">AI Enhancement Available</Text>
              <Text className="text-gray-500 text-sm mt-1">Let AI improve your job descriptions with impactful language.</Text>
            </View>
          </View>
          <TouchableOpacity className="self-start px-4 h-10 rounded-2xl bg-blue-600 items-center justify-center" activeOpacity={0.85}>
            <Text className="text-white text-base font-semibold">Coming Soon</Text>
          </TouchableOpacity>
        </View>

        {!showAddForm && (
          <TouchableOpacity
            className="mx-4 mb-4 rounded-2xl border border-dashed border-green-500 bg-green-400 h-12 items-center justify-center"
            activeOpacity={0.85}
            onPress={handleAddForm}
          >
            <Text className="text-gray-900 text-base font-semibold">+ Add New Position</Text>
          </TouchableOpacity>
        )}

        {showAddForm && (
          <View className="bg-white rounded-3xl p-4 mx-4 mb-4 border border-gray-200">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-semibold text-gray-900">{editingId ? "Edit Position" : "New Position"}</Text>
              <TouchableOpacity activeOpacity={0.8} onPress={() => setShowAddForm(false)}>
                <Text className="text-gray-900 text-sm font-medium">Cancel</Text>
              </TouchableOpacity>
            </View>

            <FormInputBox
              label="Job Title"
              value={formData.jobTitle}
              onChange={(v) => handleChange("jobTitle", v)}
              placeholder="e.g., Software Engineer"
            />
            <FormInputBox
              label="Company"
              value={formData.company}
              onChange={(v) => handleChange("company", v)}
              placeholder="Company name"
              icon="apartment"
            />
            <FormInputBox
              label="Location"
              value={formData.location}
              onChange={(v) => handleChange("location", v)}
              placeholder="City, State or Remote"
            />

            <View className="flex-row gap-3">
              <View className="flex-1">
                <FormInputBox
                  label="Start Date"
                  value={formData.startDate}
                  onChange={(v) => handleChange("startDate", v)}
                  placeholder="Jan 2022"
                  icon="calendar-today"
                />
              </View>
              <View className="flex-1">
                <FormInputBox
                  label="End Date"
                  value={formData.endDate}
                  onChange={(v) => handleChange("endDate", v)}
                  placeholder="Present"
                />
              </View>
            </View>

            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-900 text-base">I currently work here</Text>
              <Switch
                value={formData.isCurrent}
                onValueChange={(v) => handleChange("isCurrent", v)}
                trackColor={{ false: "#d1d5db", true: "#93c5fd" }}
                thumbColor="#ffffff"
              />
            </View>

            <FormInputBox
              label="Description"
              value={formData.description}
              onChange={(v) => handleChange("description", v)}
              placeholder="Describe your responsibilities and achievements..."
              multiline
            />

            <TouchableOpacity
              className={`${saving ? "bg-blue-400" : "bg-blue-600"} mt-1 rounded-2xl h-12 items-center justify-center`}
              activeOpacity={0.9}
              onPress={handleAddOrUpdate}
              disabled={saving}
            >
              <Text className="text-white text-base font-semibold">
                {editingId ? "Update Position" : "Add Position"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {experienceItems.map((item) => (
          <FormSectionCard key={item.id} title={item.title}>
            <View className="flex-row items-start justify-between">
              <View className="flex-row items-start gap-3 flex-1">
                <MaterialIcons name="drag-indicator" size={20} color="#9ca3af" />
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900">{item.jobTitle}</Text>
                  <Text className="text-gray-500 text-sm mt-1">{item.company}</Text>
                  <Text className="text-gray-500 text-sm mt-1">{item.startDate} - {item.endDate} · {item.location}</Text>
                  <Text className="text-gray-500 text-sm mt-2" numberOfLines={2}>
                    {item.description}
                  </Text>
                  {item.isCurrent && (
                    <View className="self-start mt-3 px-3 py-1 rounded-2xl bg-green-100">
                      <Text className="text-green-600 text-sm font-semibold">Current Position</Text>
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
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 bg-white px-4 py-4 border-t border-gray-200">
        <TouchableOpacity className="bg-blue-600 rounded-2xl h-14 items-center justify-center" activeOpacity={0.9}>
          <Text className="text-white text-base font-semibold">Save Changes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EditWorkExperience;