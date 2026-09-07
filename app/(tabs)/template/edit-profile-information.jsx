import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import FormSectionCard from "../../../components/ui/FormSectionCard";
import ProfileField from "../../../components/ui/ProfileField";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../../constants/api";
import { authFetch } from "../../../utils/authFetch";
import { getResumeDraft, saveResumeDraft } from "../../../utils/resumeDraftStorage";
import { showErrorMessage } from "../../../utils/errorMessageBus";
import BookLoader from "../../../components/screen/BookLoader";
import TemplatePageHeader from "../../../components/ui/TemplatePageHeader";


const EditProfileInformation = () => {
  const router = useRouter();
const { name, resumeId, templateId, resumeTitle } = useLocalSearchParams();
console.log("resumeID: ",resumeId)
const title = name ? String(name) : "Personal Information";
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
  const [queuedPopup, setQueuedPopup] = useState(null);

const [formData, setFormData] = useState({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  location: "",
  linkedinUrl: "",
  websiteUrl: "",
  professionalSummary: "",
});

const getMissingFields = () => {
  const missing = [];
  if (!formData.firstName.trim()) missing.push("First Name");
  if (!formData.lastName.trim()) missing.push("Last Name");
  if (!formData.email.trim()) missing.push("Email Address");
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

const handleBack = () => {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace("/");
  }
};

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const fetchProfileData = async () => {
    if (!resumeId) {
      setLoading(false);
      return;
    }

    try {
      const response = await authFetch(`${API_BASE_URL}/personal/${resumeId}`);
      if (response.ok) {
        const responseText = await response.text();
        let data = {};
        if (responseText.trim()) {
          try {
            data = JSON.parse(responseText) || {};
          } catch {
            data = {};
          }
        }
        setFormData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          phone: data.phone || "",
          location: data.location || "",
          linkedinUrl: data.linkedinUrl || "",
          websiteUrl: data.websiteUrl || "",
          professionalSummary: data.professionalSummary || "",
        });
      }
    } catch (error) {
      console.log("Error fetching profile:", error);
      queuePopup("Error", "Could not load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const missingFields = getMissingFields();
    if (missingFields.length > 0) {
      showErrorMessage("Missing Fields", `Please fill: ${missingFields.join(", ")}`);
      return;
    }

    try {
      setSaving(true);
      const targetResumeId = Number(Array.isArray(resumeId) ? resumeId[0] : resumeId);

      if (!Number.isFinite(targetResumeId) || targetResumeId <= 0) {
        const draft = await saveResumeDraft({
          title: String(Array.isArray(resumeTitle) ? resumeTitle[0] : resumeTitle || "My Resume").trim() || "My Resume",
          templateId: Number(Array.isArray(templateId) ? templateId[0] : templateId) || null,
          personal: formData,
        });
        router.replace({ pathname: "/template/[id]", params: { id: String(draft.templateId), draft: "true", name: draft.title } });
        return;
      }

      const response = await authFetch(`${API_BASE_URL}/personal/${targetResumeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, resumeId: targetResumeId }),
      });

      if (response.ok) {
        queuePopup("Success", "Profile updated");
        handleBack();
      } else {
        queuePopup("Error", "Update failed");
      }
    } catch (error) {
      console.log("Error saving profile:", error);
      queuePopup("Error", "Could not save profile");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!resumeId) {
      getResumeDraft().then((draft) => {
        if (draft.personal) setFormData(draft.personal);
      });
      setLoading(false);
      return;
    }
    fetchProfileData();
  }, []);

  return (
    
    <View className="flex-1 bg-[#F7F9FC]">
      <TemplatePageHeader
        eyebrow="Profile foundation"
        title={title}
        accent="#2A9D8F"
        accentSoft="#DDF3F0"
        icon="person"
        onBack={handleBack}
      />

      <ScrollView style={{ width: "100%", maxWidth: 760, alignSelf: "center" }} className="flex-1 pt-5" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 140 }}>
        <FormSectionCard title="Full Name">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <ProfileField
                label="First Name"
                value={formData.firstName}
                onChange={(v) => handleChange("firstName", v)}
                required
              />
            </View>
            <View className="flex-1">
              <ProfileField
  label="Last Name"
  value={formData.lastName}
  onChange={(v) => handleChange("lastName", v)}
  required
/>
            </View>
          </View>
        </FormSectionCard>

        <FormSectionCard title="Contact Details">
          <ProfileField
            label="Email Address"
            value={formData.email}
            icon="email"
            onChange={(v) => handleChange("email", v)}
            required
          />
          <ProfileField
            label="Phone Number"
            value={formData.phone}
            icon="phone"
            onChange={(v) => handleChange("phone", v)}
          />
          <ProfileField
            label="Location"
            value={formData.location}
            icon="location-on"
            onChange={(v) => handleChange("location", v)}
          />
        </FormSectionCard>

        <FormSectionCard title="Online Presence">
          <ProfileField
            label="LinkedIn Profile"
            value={formData.linkedinUrl}
            icon="business-center"
            onChange={(v) => handleChange("linkedinUrl", v)}
          />
          <ProfileField
            label="Personal Website"
            value={formData.websiteUrl}
            icon="language"
            onChange={(v) => handleChange("websiteUrl", v)}
          />
        </FormSectionCard>

        <FormSectionCard
  title="Professional Summary"
  rightText={`${formData.professionalSummary.length}`}
>
  <ProfileField
    label="Summary"
    value={formData.professionalSummary}
    onChange={(v) => handleChange("professionalSummary", v)}
    // multiline={true}
  />
</FormSectionCard>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 border-t border-[#D9E2EC] bg-[#F7F9FC] px-4 py-4">
        <TouchableOpacity className={`${isFormComplete ? 'bg-[#E76F51]' : 'bg-[#F2B7A9]'} h-14 flex-row items-center justify-center rounded-2xl`} onPress={handleSave} activeOpacity={0.9}>
          <Text className="text-lg font-bold text-white" >Save profile</Text>
          <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
      {(loading || saving) ? <BookLoader visible={loading || saving} /> : null}
    </View>
  );
};

export default EditProfileInformation;