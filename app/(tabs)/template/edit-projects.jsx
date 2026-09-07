import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import FormInputBox from "../../../components/ui/FormInputBox";
import FormSectionCard from "../../../components/ui/FormSectionCard";
import BookLoader from "../../../components/screen/BookLoader";
import { API_BASE_URL } from "../../../constants/api";
import { authFetch } from "../../../utils/authFetch";
import { showErrorMessage } from "../../../utils/errorMessageBus";
import { getResumeDraft, saveResumeDraft } from "../../../utils/resumeDraftStorage";
import TemplatePageHeader from "../../../components/ui/TemplatePageHeader";

const TechChip = ({ label }) => (
  <View className="mr-2 mb-2 rounded-xl bg-[#DDF3F0] px-3 py-1">
    <Text className="text-base font-bold text-[#176B67]">{label}</Text>
  </View>
);

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

  const getMissingFields = () => {
    const missing = [];
    if (!formData.projectName.trim()) missing.push("Project Name");
    if (!formData.description.trim()) missing.push("Description");
    if (!formData.technologies.trim()) missing.push("Technologies Used");
    if (!formData.startDate.trim()) missing.push("Start Date");
    if (!formData.endDate.trim()) missing.push("End Date");
    if (!formData.liveUrl.trim()) missing.push("Live URL");
    if (!formData.repoUrl.trim()) missing.push("Repository URL");
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
          ? current.projects.map((item) => item.id === editingId ? { ...formData, id: editingId } : item)
          : [...(current.projects || []), { ...formData, id: `project-${Date.now()}` }];
        await saveResumeDraft({ projects: nextProjects });
        setProjects(nextProjects);
        resetForm();
        setShowAddForm(false);
        router.replace({ pathname: "/template/[id]", params: { id: String(current.templateId), draft: "true", name: current.title || "Resume" } });
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

  const handleEdit = async (id) => {
    try {
      setSaving(true);
      if (isDraft) {
        const draft = await getResumeDraft();
        const item = draft.projects.find((entry) => entry.id === id);
        if (item) setFormData(item);
        setEditingId(id);
        setShowAddForm(true);
        setSaving(false);
        return;
      }
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
        requestAnimationFrame(() => {
          scrollRef.current?.scrollTo?.({ y: 0, animated: true });
        });
      }
    } catch (error) {
      console.log("Error loading project:", error);
      queuePopup("Error", "Could not load project");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
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
        eyebrow="Proof of work"
        title="Projects"
        accent="#E76F51"
        accentSoft="#FDE2DD"
        icon="rocket-launch"
        onBack={handleBack}
      />

      <ScrollView ref={scrollRef} style={{ width: "100%", maxWidth: 760, alignSelf: "center" }} className="flex-1 pt-5" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 140 }}>
        {!showAddForm && (
          <TouchableOpacity
            className="mb-4 h-12 items-center justify-center rounded-2xl border border-dashed border-[#F4A99A] bg-[#FFF7F5]"
            activeOpacity={0.85}
            onPress={handleAddForm}
          >
            <Text className="text-base font-bold text-[#C24F39]">+ Add New Project</Text>
          </TouchableOpacity>
        )}

        {showAddForm && (
          <View className="mb-3 rounded-[24px] border border-[#D9E2EC] bg-white p-4 shadow-sm">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-[#102A43]">{editingId ? "Edit Project" : "New Project"}</Text>
              <TouchableOpacity activeOpacity={0.8} onPress={() => setShowAddForm(false)}>
                <Text className="text-sm font-bold text-[#E76F51]">Cancel</Text>
              </TouchableOpacity>
            </View>

            <FormInputBox
              label="Project Name"
              value={formData.projectName}
              onChange={(v) => handleChange("projectName", v)}
              placeholder="e.g., Portfolio Website"
              required
            />
            <FormInputBox
              label="Description"
              value={formData.description}
              onChange={(v) => handleChange("description", v)}
              placeholder="Describe what you built and the impact..."
              multiline
              required
            />
            <FormInputBox
              label="Technologies Used"
              value={formData.technologies}
              onChange={(v) => handleChange("technologies", v)}
              placeholder="React, Node.js, PostgreSQL"
              required
            />

            <View className="flex-row gap-3">
              <View className="flex-1">
                <FormInputBox
                  label="Start Date"
                  value={formData.startDate}
                  onChange={(v) => handleChange("startDate", v)}
                  placeholder="Jan 2023"
                  required
                />
              </View>
              <View className="flex-1">
                <FormInputBox
                  label="End Date"
                  value={formData.endDate}
                  onChange={(v) => handleChange("endDate", v)}
                  placeholder="Mar 2023"
                  required
                />
              </View>
            </View>

            <FormInputBox
              label="Live URL"
              value={formData.liveUrl}
              onChange={(v) => handleChange("liveUrl", v)}
              placeholder="https://yourproject.com"
              icon="open-in-new"
              required
            />
            <FormInputBox
              label="Repository URL"
              value={formData.repoUrl}
              onChange={(v) => handleChange("repoUrl", v)}
              placeholder="https://github.com/user/repo"
              icon="code"
              required
            />

            <TouchableOpacity
              className={`${saving || !isFormComplete ? "bg-[#F2B7A9]" : "bg-[#E76F51]"} mt-1 h-12 flex-row items-center justify-center rounded-2xl`}
              activeOpacity={0.9}
              onPress={handleAddOrUpdate}
              disabled={saving}
            >
              <Text className="text-base font-bold text-white">
                {editingId ? "Update Project" : "Add Project"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {projects.map((project) => (
          <FormSectionCard key={project.id} title={project.title} accent="#E76F51" icon="rocket-launch">
            <View className="flex-row items-start justify-between">
              <View className="flex-row items-start gap-3 flex-1">
                <MaterialIcons name="drag-indicator" size={20} color="#829AB1" />
                <View className="flex-1">
                  <Text className="text-base font-bold text-[#102A43]">{project.projectName}</Text>
                  <Text className="mt-1 text-sm text-[#486581]">{project.startDate} - {project.endDate}</Text>
                  <Text className="mt-2 text-sm text-[#486581]" numberOfLines={2}>
                    {project.description}
                  </Text>
                  <View className="flex-row flex-wrap mt-3">
                    {(project.technologies || "").split(",").map((techItem) => techItem.trim()).filter(Boolean).map((techItem) => (
                      <TechChip key={`${project.id}-${techItem}`} label={techItem} />
                    ))}
                  </View>
                  {(project.liveUrl || project.repoUrl) ? (
                    <View className="flex-row items-center gap-4 mt-2">
                      {project.liveUrl ? <Text className="text-base font-bold text-[#A76400]">Live Demo</Text> : null}
                      {project.repoUrl ? <Text className="text-base font-bold text-[#A76400]">Source Code</Text> : null}
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
        {!showAddForm && projects.length === 0 && (
          <View className="items-center rounded-[24px] border border-dashed border-[#F4A99A] bg-[#FFF7F5] px-6 py-9">
            <View className="h-14 w-14 items-center justify-center rounded-full bg-[#FDE2DD]">
              <MaterialIcons name="rocket-launch" size={28} color="#E76F51" />
            </View>
            <Text className="mt-4 text-lg font-bold text-[#102A43]">Show what you built</Text>
            <Text className="mt-1 text-center text-sm text-[#486581]">Show the work that makes your experience credible.</Text>
          </View>
        )}
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 border-t border-[#D9E2EC] bg-[#F7F9FC] px-4 py-4">
        <TouchableOpacity className="h-14 flex-row items-center justify-center rounded-2xl bg-[#E76F51]" activeOpacity={0.9} onPress={showAddForm ? handleAddOrUpdate : isDraft ? () => router.back() : handleAddForm} disabled={saving}>
          <Text className="text-base font-bold text-white">{showAddForm ? (editingId ? "Update Project" : "Add Project") : isDraft ? "Back to checklist" : "Add Project"}</Text>
        </TouchableOpacity>
      </View>
      {(loading || saving) ? <BookLoader visible={loading || saving} /> : null}
    </View>
  );
};

export default EditProjects;