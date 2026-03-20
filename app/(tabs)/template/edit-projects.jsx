import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import FormInputBox from "../../../components/ui/FormInputBox";
import FormSectionCard from "../../../components/ui/FormSectionCard";
import { API_BASE_URL } from "../../../constants/api";
import { authFetch } from "../../../utils/authFetch";

const TechChip = ({ label }) => (
  <View className="bg-gray-100 rounded-2xl px-3 py-1 mr-2 mb-2">
    <Text className="text-gray-900 text-base font-semibold">{label}</Text>
  </View>
);

const EditProjects = () => {
  const router = useRouter();
  const { resumeId } = useLocalSearchParams();

  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [projects, setProjects] = useState([]);

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
      Alert.alert("Error", "Could not load projects");
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
    if (!resumeId) {
      Alert.alert("Error", "resumeId missing");
      return;
    }

    if (!formData.projectName.trim() || !formData.description.trim()) {
      Alert.alert("Validation", "Project name and description are required");
      return;
    }

    try {
      setSaving(true);

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

      const url = editingId
        ? `${API_BASE_URL}/projects/${editingId}`
        : `${API_BASE_URL}/projects`;

      const method = editingId ? "PUT" : "POST";

      const response = await authFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        Alert.alert("Success", editingId ? "Project updated" : "Project added");
        await fetchProjects();
        resetForm();
        setShowAddForm(false);
      } else {
        Alert.alert("Error", "Could not save project");
      }
    } catch (error) {
      console.log("Error saving project:", error);
      Alert.alert("Error", "Could not save project");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (id) => {
    try {
      const req = await authFetch(`${API_BASE_URL}/projects/${id}`);

      if (req.ok) {
        const data = await req.json();
        setEditingId(id);
        setFormData({
          projectName: data.projectName || "",
          description: data.description || "",
          technologies: data.technologies || "",
          startDate: data.startDate || "",
          endDate: data.endDate || "",
          liveUrl: data.liveUrl || "",
          repoUrl: data.repoUrl || "",
          sortOrder: data.sortOrder || 0,
        });
        setShowAddForm(true);
      }
    } catch (error) {
      console.log("Error loading project:", error);
      Alert.alert("Error", "Could not load project");
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await authFetch(`${API_BASE_URL}/projects/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchProjects();
      } else {
        Alert.alert("Error", "Could not delete project");
      }
    } catch (error) {
      console.log("Error deleting project:", error);
      Alert.alert("Error", "Could not delete project");
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
        <TouchableOpacity className="flex-row items-center gap-3" onPress={handleBack} activeOpacity={0.8}>
          <MaterialIcons name="arrow-back-ios" size={18} color="#6b7280" />
          <View>
            <Text className="text-xl font-semibold text-gray-900">Projects</Text>
            <Text className="text-gray-500 text-sm mt-1">{projects.length} projects added</Text>
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
            <Text className="text-gray-900 text-base font-semibold">+ Add New Project</Text>
          </TouchableOpacity>
        )}

        {showAddForm && (
          <View className="bg-white rounded-3xl p-4 mx-4 mb-4 border border-gray-200">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-semibold text-gray-900">{editingId ? "Edit Project" : "New Project"}</Text>
              <TouchableOpacity activeOpacity={0.8} onPress={() => setShowAddForm(false)}>
                <Text className="text-gray-900 text-sm font-medium">Cancel</Text>
              </TouchableOpacity>
            </View>

            <FormInputBox
              label="Project Name"
              value={formData.projectName}
              onChange={(v) => handleChange("projectName", v)}
              placeholder="e.g., Portfolio Website"
            />
            <FormInputBox
              label="Description"
              value={formData.description}
              onChange={(v) => handleChange("description", v)}
              placeholder="Describe what you built and the impact..."
              multiline
            />
            <FormInputBox
              label="Technologies Used"
              value={formData.technologies}
              onChange={(v) => handleChange("technologies", v)}
              placeholder="React, Node.js, PostgreSQL"
            />

            <View className="flex-row gap-3">
              <View className="flex-1">
                <FormInputBox
                  label="Start Date"
                  value={formData.startDate}
                  onChange={(v) => handleChange("startDate", v)}
                  placeholder="Jan 2023"
                />
              </View>
              <View className="flex-1">
                <FormInputBox
                  label="End Date"
                  value={formData.endDate}
                  onChange={(v) => handleChange("endDate", v)}
                  placeholder="Mar 2023"
                />
              </View>
            </View>

            <FormInputBox
              label="Live URL (optional)"
              value={formData.liveUrl}
              onChange={(v) => handleChange("liveUrl", v)}
              placeholder="https://yourproject.com"
              icon="open-in-new"
            />
            <FormInputBox
              label="Repository URL (optional)"
              value={formData.repoUrl}
              onChange={(v) => handleChange("repoUrl", v)}
              placeholder="https://github.com/user/repo"
              icon="code"
            />

            <TouchableOpacity
              className={`${saving ? "bg-blue-400" : "bg-blue-600"} mt-1 rounded-2xl h-12 items-center justify-center`}
              activeOpacity={0.9}
              onPress={handleAddOrUpdate}
              disabled={saving}
            >
              <Text className="text-white text-base font-semibold">
                {editingId ? "Update Project" : "Add Project"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {projects.map((project) => (
          <FormSectionCard key={project.id} title={project.title}>
            <View className="flex-row items-start justify-between">
              <View className="flex-row items-start gap-3 flex-1">
                <MaterialIcons name="drag-indicator" size={20} color="#9ca3af" />
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900">{project.projectName}</Text>
                  <Text className="text-gray-500 text-sm mt-1">{project.startDate} - {project.endDate}</Text>
                  <Text className="text-gray-500 text-sm mt-2" numberOfLines={2}>
                    {project.description}
                  </Text>
                  <View className="flex-row flex-wrap mt-3">
                    {(project.technologies || "").split(",").map((techItem) => techItem.trim()).filter(Boolean).map((techItem) => (
                      <TechChip key={`${project.id}-${techItem}`} label={techItem} />
                    ))}
                  </View>
                  {(project.liveUrl || project.repoUrl) ? (
                    <View className="flex-row items-center gap-4 mt-2">
                      {project.liveUrl ? <Text className="text-blue-600 text-base">↗ Live Demo</Text> : null}
                      {project.repoUrl ? <Text className="text-blue-600 text-base">⚓ Source Code</Text> : null}
                    </View>
                  ) : null}
                </View>
              </View>

              <View className="flex-row items-center gap-4">
                <TouchableOpacity activeOpacity={0.8} onPress={() => handleEdit(project.id)}>
                  <MaterialIcons name="edit" size={18} color="#4b5563" />
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.8} onPress={() => handleDelete(project.id)}>
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

export default EditProjects;