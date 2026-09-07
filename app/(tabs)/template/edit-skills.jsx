import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useEffect, useState } from "react";
import TemplatePageHeader from "../../../components/ui/TemplatePageHeader";
import { getResumeDraft, saveResumeDraft } from "../../../utils/resumeDraftStorage";
import { API_BASE_URL } from "../../../constants/api";
import { authFetch } from "../../../utils/authFetch";
import { showErrorMessage } from "../../../utils/errorMessageBus";

const EditSkills = () => {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [skills, setSkills] = useState([]);
  const [originalSkillIds, setOriginalSkillIds] = useState([]);
  const [skillName, setSkillName] = useState("");
  const [category, setCategory] = useState("Frontend");
  const [activeCategory, setActiveCategory] = useState("All");
  const { resumeId, draft: draftParam } = useLocalSearchParams();
  const isDraft = !resumeId || draftParam === "true";

  const categories = ["All", "Frontend", "Backend", "Languages", "Data"];
  const suggestions = ["Kubernetes", "Redis", "Elasticsearch", "CI/CD"];

  useEffect(() => {
    const loadSkills = async () => {
      if (isDraft) {
        const draft = await getResumeDraft();
        setSkills(draft.skills || []);
        return;
      }
      try {
        const response = await authFetch(`${API_BASE_URL}/skills/resume/${resumeId}`);
        if (!response.ok) throw new Error("Could not load skills");
        const data = await response.json();
        const loaded = (Array.isArray(data) ? data : []).map((skill) => ({
          id: skill.id,
          name: skill.skillName || "",
          category: skill.category || "Other",
          rating: skill.rating || 1,
        }));
        setSkills(loaded);
        setOriginalSkillIds(loaded.map((skill) => skill.id));
      } catch (error) {
        showErrorMessage("Error", error.message || "Could not load skills");
      }
    };
    loadSkills();
  }, [isDraft, resumeId]);

  const addSkill = (name = skillName) => {
    const trimmed = name.trim();
    if (!trimmed || skills.some((skill) => skill.name.toLowerCase() === trimmed.toLowerCase())) return;
    setSkills((current) => [...current, { id: `skill-${Date.now()}`, name: trimmed, category, rating: 4 }]);
    setSkillName("");
  };

  const updateSkill = (id, field, value) => setSkills((current) => current.map((skill) => skill.id === id ? { ...skill, [field]: value } : skill));
  const removeSkill = (id) => setSkills((current) => current.filter((skill) => skill.id !== id));

  const handleSaveSkills = async () => {
    if (!skills.length) {
      showErrorMessage("Add a skill", "Add at least one skill before saving");
      return;
    }
    setSaving(true);
    try {
      if (isDraft) {
        await saveResumeDraft({ skills });
        const draft = await getResumeDraft();
        router.replace({ pathname: "/template/[id]", params: { id: String(draft.templateId), draft: "true", name: draft.title } });
        return;
      }

      const currentIds = skills.filter((skill) => skill.id).map((skill) => skill.id);
      const deleted = await Promise.all(originalSkillIds.filter((id) => !currentIds.includes(id)).map((id) => authFetch(`${API_BASE_URL}/skills/${id}`, { method: "DELETE" })));
      if (deleted.some((response) => !response.ok)) throw new Error("Could not delete a skill");
      const saved = await Promise.all(skills.map((skill, index) => authFetch(skill.id ? `${API_BASE_URL}/skills/${skill.id}` : `${API_BASE_URL}/skills`, {
        method: skill.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillName: skill.name.trim(), category: skill.category, rating: skill.rating, sortOrder: index, resume: { id: Number(resumeId) } }),
      })));
      if (saved.some((response) => !response.ok)) throw new Error("Could not save a skill");
      router.back();
    } catch (error) {
      showErrorMessage("Save failed", error.message || "Could not save skills");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-[#F7F9FC]">
      <TemplatePageHeader
        eyebrow="Your toolkit"
        title="Skills"
        accent="#2A9D8F"
        accentSoft="#DDF3F0"
        icon="build"
        onBack={() => router.back()}
        trailing={<View className="flex-row items-center gap-1 rounded-full bg-[#F4C95D] px-3 py-2"><MaterialIcons name="auto-fix-high" size={14} color="#102A43" /><Text className="text-sm font-bold text-[#102A43]">AI</Text></View>}
      />

      <ScrollView style={{ width: "100%", maxWidth: 760, alignSelf: "center" }} className="flex-1 pt-5" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 140 }}>
        <View className="mb-4 h-12 flex-row items-center gap-2 rounded-2xl border border-[#D9E2EC] bg-[#FFFFFF] px-4">
          <MaterialIcons name="search" size={20} color="#2A9D8F" />
          <TextInput placeholder="Search skills..." placeholderTextColor="#829AB1" className="flex-1 text-base text-[#102A43]" />
        </View>

        <View className="mb-3 rounded-[22px] border border-[#A8DCD5] bg-[#DDF3F0] p-4">
          <View className="flex-row items-start gap-3 mb-3">
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-[#102A43]">
              <MaterialIcons name="auto-fix-high" size={20} color="#F4C95D" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-[#102A43]">AI Skill Suggestions</Text>
              <Text className="mt-1 text-sm text-[#486581]">Based on your experience, we recommend adding these skills.</Text>
            </View>
          </View>

          <View className="flex-row flex-wrap">
            {suggestions.map((item) => (
              <TouchableOpacity key={item} className="mr-2 mb-2 rounded-2xl border border-[#A8DCD5] bg-white px-4 py-1" activeOpacity={0.85} onPress={() => addSkill(item)}>
                <Text className="text-sm font-bold text-[#102A43]">+ {item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="mb-3 rounded-[22px] border border-[#D9E2EC] bg-white p-4">
          <Text className="mb-3 text-lg font-bold text-[#102A43]">Add New Skill</Text>
          <View className="flex-row items-end gap-2">
            <View className="flex-1">
              <TextInput value={skillName} onChangeText={setSkillName} placeholder="Type a skill name..." placeholderTextColor="#829AB1" className="h-12 rounded-2xl border border-[#D9E2EC] px-4 text-base text-[#102A43]" />
            </View>
            <TouchableOpacity className="mb-3 h-12 w-12 items-center justify-center rounded-2xl bg-[#E76F51]" activeOpacity={0.9} onPress={() => addSkill()}>
              <MaterialIcons name="add" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="mb-4 flex-row flex-wrap">
          {categories.map((item) => (
            <TouchableOpacity
              key={item}
              className={`mr-2 mb-2 h-10 items-center justify-center rounded-2xl border px-4 ${activeCategory === item ? "border-[#102A43] bg-[#102A43]" : "border-[#D9E2EC] bg-white"}`}
              activeOpacity={0.85}
              onPress={() => {
                setActiveCategory(item);
                if (item !== "All") setCategory(item);
              }}
            >
              <Text className={`${activeCategory === item ? "text-white" : "text-[#486581]"} text-base font-bold`}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="mb-4 rounded-[22px] border border-[#D9E2EC] bg-white p-4">
          {skills.filter((skill) => activeCategory === "All" || skill.category === activeCategory).map((skill) => (
            <View key={skill.id} className="mb-3 flex-row items-center gap-2 rounded-2xl bg-[#F7F9FC] p-3">
              <TextInput value={skill.name} onChangeText={(value) => updateSkill(skill.id, "name", value)} className="min-w-0 flex-1 text-base font-bold text-[#102A43]" />
              <TouchableOpacity onPress={() => updateSkill(skill.id, "rating", Math.max(1, skill.rating - 1))}><Text className="text-lg text-[#D99B00]">−</Text></TouchableOpacity>
              <Text className="text-sm font-bold text-[#D99B00]">{skill.rating}/5</Text>
              <TouchableOpacity onPress={() => updateSkill(skill.id, "rating", Math.min(5, skill.rating + 1))}><Text className="text-lg text-[#D99B00]">+</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => removeSkill(skill.id)}><MaterialIcons name="delete-outline" size={19} color="#D56158" /></TouchableOpacity>
            </View>
          ))}
          {skills.length === 0 && <Text className="py-4 text-center text-sm text-[#829AB1]">Add your first skill above.</Text>}
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 border-t border-[#D9E2EC] bg-[#F7F9FC] px-4 py-4">
        <TouchableOpacity className="h-14 flex-row items-center justify-center rounded-2xl bg-[#E76F51]" activeOpacity={0.9} onPress={handleSaveSkills} disabled={saving}>
          <Text className="text-base font-bold text-white">Save Changes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EditSkills;