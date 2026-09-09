import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import LottieView from "lottie-react-native";
import { API_BASE_URL } from "../../../constants/api";
import { authFetch } from "../../../utils/authFetch";
import { showErrorMessage } from "../../../utils/errorMessageBus";
import { getResumeDraft, saveResumeDraft } from "../../../utils/resumeDraftStorage";

const T = {
  blue: "#3B82F6",
  bluePressed: "#2563EB",
  green: "#58CC02",
  greenPressed: "#46A302",
  greenBg: "#EEFCE2",
  ink: "#141821",
  fieldBg: "#F6F6F7",
  fieldBorder: "#E6E7EA",
  placeholder: "#A9ADB6",
  caps: "#9AA0AC",
  track: "#EDEFF2",
};

const EditSkills = () => {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [skills, setSkills] = useState([]);
  const [originalSkillIds, setOriginalSkillIds] = useState([]);
  const [skillName, setSkillName] = useState("");
  const { resumeId, draft: draftParam } = useLocalSearchParams();
  const isDraft = !resumeId || draftParam === "true";

  const popularSuggestions = ["Figma", "Wireframing", "User Testing", "React Native", "TypeScript"];
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Calculate dynamic completion percentage based on added skills
  const progressPercent = Math.min(100, (skills.length / 3) * 100);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progressPercent,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progressPercent]);

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
          name: skill.skillName || skill.name || "",
          category: skill.category || "General",
          rating: skill.rating || 4,
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
    if (!trimmed) return;
    if (skills.some((skill) => skill.name.toLowerCase() === trimmed.toLowerCase())) {
      setSkillName("");
      return;
    }
    setSkills((current) => [...current, { id: `skill-${Date.now()}`, name: trimmed, category: "General", rating: 4 }]);
    setSkillName("");
  };

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
      const saved = await Promise.all(
        skills.map((skill, index) =>
          authFetch(skill.id ? `${API_BASE_URL}/skills/${skill.id}` : `${API_BASE_URL}/skills`, {
            method: skill.id ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ skillName: skill.name.trim(), category: skill.category || "General", rating: skill.rating || 4, sortOrder: index, resume: { id: Number(resumeId) } }),
          })
        )
      );
      if (saved.some((response) => !response.ok)) throw new Error("Could not save a skill");
      router.back();
    } catch (error) {
      showErrorMessage("Save failed", error.message || "Could not save skills");
    } finally {
      setSaving(false);
    }
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
      {/* Top Header Bar with Close Icon and Animated Slider */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 16, paddingHorizontal: 20, paddingTop: 54, paddingBottom: 16 }}>
        <TouchableOpacity activeOpacity={0.7} onPress={handleBack} style={{ padding: 4 }}>
          <MaterialIcons name="close" size={26} color={T.caps} />
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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 140 }}>
        {/* Mascot Stage & Speech Bubble */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 28 }}>
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
            <Text style={{ fontSize: 18, fontWeight: "800", color: T.ink }}>Superpowers</Text>
            <Text style={{ marginTop: 4, fontSize: 13, fontWeight: "600", color: T.caps, lineHeight: 18 }}>
              What are you naturally good at? Add your best skills!
            </Text>
          </View>
        </View>

        {/* Input Box & Plus Button Row */}
        <Text style={{ fontSize: 11, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase", color: T.caps, marginBottom: 8 }}>
          ADD A SKILL
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <TextInput
            value={skillName}
            onChangeText={setSkillName}
            onSubmitEditing={() => addSkill()}
            placeholder="e.g. Figma, Python, UX Research"
            placeholderTextColor={T.placeholder}
            style={{
              flex: 1,
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
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => addSkill()}
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              backgroundColor: T.blue,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialIcons name="add" size={26} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Added Skill Pill Badges */}
        {skills.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 11, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase", color: T.caps, marginBottom: 10 }}>
              YOUR SKILLS ({skills.length})
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {skills.map((skill) => (
                <View
                  key={String(skill.id)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    borderRadius: 999,
                    borderWidth: 1.5,
                    borderColor: T.fieldBorder,
                    backgroundColor: "#FFFFFF",
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: "700", color: T.ink }}>{skill.name}</Text>
                  <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} onPress={() => removeSkill(skill.id)}>
                    <MaterialIcons name="close" size={16} color={T.caps} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Popular Suggestions Box */}
        <View
          style={{
            borderRadius: 20,
            borderWidth: 1.5,
            borderStyle: "dashed",
            borderColor: T.fieldBorder,
            backgroundColor: T.fieldBg,
            padding: 16,
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase", color: T.caps, marginBottom: 12, justifyContent: "center" }}>
            POPULAR SUGGESTIONS
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
            {popularSuggestions.map((item) => (
              <TouchableOpacity
                key={item}
                activeOpacity={0.8}
                onPress={() => addSkill(item)}
                style={{
                  borderRadius: 999,
                  borderWidth: 1,
                  justifyContent: "center",
                  borderColor: T.fieldBorder,
                  backgroundColor: "#FFFFFF",
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                }}
              >
                <Text style={{ fontSize: 13, justifyContent:"content", fontWeight: "700", color: T.ink }}>+ {item}</Text>
              </TouchableOpacity>
            ))}
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
        <TouchableOpacity activeOpacity={0.92} onPress={handleSaveSkills} disabled={saving}>
          <View style={{ borderRadius: 20, paddingBottom: 4, backgroundColor: skills.length > 0 ? T.greenPressed : T.caps }}>
            <View style={{
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 20,
              paddingVertical: 16,
              backgroundColor: skills.length > 0 ? T.green : T.fieldBorder,
            }}>
              <Text style={{ fontSize: 15, fontWeight: "900", letterSpacing: 0.8, color: "#FFFFFF" }}>
                FINALIZE RESUME
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EditSkills;