import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Platform, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import FormInputBox from "../../../components/ui/FormInputBox";
import FormSectionCard from "../../../components/ui/FormSectionCard";
import { API_BASE_URL } from "../../../constants/api";
import { authFetch } from "../../../utils/authFetch";

const EditEducation = () => {
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);
  const { resumeId } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [educationItems, setEducationItems] = useState([]);

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
      Alert.alert("Error", "Could not load education list");
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
    if (!resumeId) {
      Alert.alert("Error", "resumeId missing");
      return;
    }

    if (!formData.school.trim() || !formData.degree.trim()) {
      Alert.alert("Validation", "School and degree are required");
      return;
    }

    try {
      setSaving(true);

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
        Alert.alert("Success", editingId ? "Education updated" : "Education added");
        await fetchEducations();
        resetForm();
        setShowAddForm(false);
      } else {
        Alert.alert("Error", "Could not save education");
      }
    } catch (error) {
      console.log("Error saving education:", error);
      Alert.alert("Error", "Could not save education");
    } finally {
      setSaving(false);
    }
  };


  const handleEdit = async (id) => {
    setEditingId(id); // critical
    setShowAddForm(true);

    const req = await authFetch(`${API_BASE_URL}/education/${id}`);

    if (req.ok) {
      const data = await req.json();
      setFormData(data);
      setShowAddForm(true);
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
      const response = await authFetch(`${API_BASE_URL}/education/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchEducations();
        if (editingId === id) {
          resetForm();
          setShowAddForm(false);
        }
        Alert.alert("Deleted", "Education entry deleted successfully");
      } else {
        Alert.alert("Error", "Could not delete education");
      }
    } catch (error) {
      console.log("Error deleting education:", error);
      Alert.alert("Error", "Could not delete education");
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

    Alert.alert("Delete Education", "Are you sure you want to delete this education entry?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => performDelete(id),
      },
    ]);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  return (
    <View className="flex-1 bg-gray-100">
      <View className="pt-12 px-4 pb-3 bg-white border-b border-blue-100">
        <TouchableOpacity className="flex-row items-center gap-3" onPress={handleBack} activeOpacity={0.8}>
          <MaterialIcons name="arrow-back-ios" size={18} color="#6b7280" />
          <View>
            <Text className="text-xl font-semibold text-gray-900">Education</Text>
            <Text className="text-gray-500 text-sm mt-1">{educationItems.length} entries added</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 pt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {!showAddForm && (
          <TouchableOpacity
            className="mx-4 mb-4 rounded-2xl border border-dashed border-gray-300 bg-white h-12 items-center justify-center"
            activeOpacity={0.85}
            onPress={handleAddForm}
          >
            <Text className="text-gray-900 text-base font-semibold">+ Add Education</Text>
          </TouchableOpacity>
        )}

        {showAddForm && (
          <View className="bg-white rounded-3xl p-4 mx-4 mb-4 border border-gray-200">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-semibold text-gray-900">{editingId ? "Edit Education" : "New Education"}</Text>
              <TouchableOpacity activeOpacity={0.8} onPress={() => setShowAddForm(false)}>
                <Text className="text-gray-900 text-sm font-medium">Cancel</Text>
              </TouchableOpacity>
            </View>

            <FormInputBox
              label="School/University"
              value={formData.school}
              onChange={(v) => handleChange("school", v)}
              placeholder="University name"
              icon="school"
            />
            <FormInputBox
              label="Degree"
              value={formData.degree}
              onChange={(v) => handleChange("degree", v)}
              placeholder="e.g., Bachelor of Science"
            />

            <FormInputBox
              label="Field of Study"
              value={formData.field}
              onChange={(v) => handleChange("field", v)}
              placeholder="e.g., Computer Science"
            />
            <FormInputBox
              label="Location"
              value={formData.location}
              onChange={(v) => handleChange("location", v)}
              placeholder="City, State"
              icon="location-on"
            />
            <View className="flex-row gap-3">
              <View className="flex-1">
                <FormInputBox
                  label="Start Date"
                  value={formData.startDate}
                  onChange={(v) => handleChange("startDate", v)}
                  placeholder="Aug 2018"
                  icon="calendar-today"
                />
              </View>
              <View className="flex-1">
                <FormInputBox
                  label="End Date"
                  value={formData.endDate}
                  onChange={(v) => handleChange("endDate", v)}
                  placeholder="May 2022"
                />
              </View>
            </View>

            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-900 text-base">Currently studying here</Text>
              <Switch
                value={formData.isCurrent}
                onValueChange={(v) => handleChange("isCurrent", v)}
                trackColor={{ false: "#d1d5db", true: "#93c5fd" }}
                thumbColor="#ffffff"
              />
            </View>

            <FormInputBox
              label="GPA (optional)"
              value={formData.gpa}
              onChange={(v) => handleChange("gpa", v)}
              placeholder="e.g., 3.8"
            />
            <FormInputBox
              label="Achievements & Activities"
              value={formData.achievements}
              onChange={(v) => handleChange("achievements", v)}
              placeholder="Honors, clubs, relevant coursework..."
              multiline
            />
            <TouchableOpacity
              className={`${saving ? "bg-blue-400" : "bg-blue-600"} mt-1 rounded-2xl h-12 items-center justify-center`}
              activeOpacity={0.9}
              onPress={handleAddOrUpdate}
              disabled={saving}
            >
              <Text className="text-white text-base font-semibold">
                {editingId ? "Update Education" : "Add Education"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {educationItems.map((item) => (
          <FormSectionCard key={item.id} title={item.school}>
            <View className="flex-row items-start justify-between">
              <View className="flex-row items-start gap-3 flex-1">
                <MaterialIcons name="drag-indicator" size={20} color="#9ca3af" />
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
                  <Text className="text-gray-500 text-sm mt-1">{item.timeline}</Text>
                  <FormInputBox
                    label="GPA (optional)"
                    value={item.gpa}
                    placeholder="e.g., 3.8"
                  />
                  <Text className="text-gray-500 text-sm mt-2" numberOfLines={2}>
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
      </ScrollView>

      {/* <View className="absolute bottom-0 left-0 right-0 bg-white px-4 py-4 border-t border-gray-200">
        <TouchableOpacity className="bg-blue-600 rounded-2xl h-14 items-center justify-center" activeOpacity={0.9}>
          <Text className="text-white text-base font-semibold">Save Changes</Text>
        </TouchableOpacity>
      </View> */}
    </View>
  );
};

export default EditEducation;