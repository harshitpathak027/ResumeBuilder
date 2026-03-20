import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import FormSectionCard from "../../../components/ui/FormSectionCard";
import ProfileField from "../../../components/ui/ProfileField";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../../constants/api";
import { authFetch } from "../../../utils/authFetch";


const EditProfileInformation = () => {
  const router = useRouter();
const { name, resumeId } = useLocalSearchParams();  
console.log("resumeID: ",resumeId)
const title = name ? String(name) : "Personal Information";
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);

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
  try{
  const response = await authFetch(`${API_BASE_URL}/personal/${resumeId}`);
    if (response.ok) {
      const data = await response.json();
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
  }
  catch (error) {
    console.log("Error fetching profile:", error);
    Alert.alert("Error", "Could not load profile");
  } finally {
    setLoading(false);
  }
}
const handleSave = async () => {
  if (!resumeId) {
    Alert.alert("Error", "resumeId missing");
    return;
  }

  if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
    Alert.alert("Validation", "First name, last name, and email are required");
    return;
  }

  try {
    setSaving(true);
    const response = await authFetch(`${API_BASE_URL}/personal/${resumeId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, resumeId: Number(resumeId) }),
    });

    if (response.ok) {
      Alert.alert("Success", "Profile updated");
      handleBack();
    } else {
      Alert.alert("Error", "Update failed");
    }
  } catch (error) {
    console.log("Error saving profile:", error);
    Alert.alert("Error", "Could not save profile");
  } finally {
    setSaving(false);
  }
};

useEffect(() => {
  fetchProfileData();
}, []);

  return (
    
    <View className="flex-1 bg-gray-100">
      <View className="pt-12 px-4 pb-3 bg-white border-b  border-blue-100">
        <TouchableOpacity className="flex-row  align-middle items-center gap-3" onPress={handleBack} activeOpacity={0.8}>
          <MaterialIcons className="flex align-middle text-center justify-center" name="arrow-back-ios" size={18} color="#6b7280" />
          <View>
            <Text className="text-xl font-semibold text-gray-900">{title}</Text>
            <Text className="text-gray-500 text-sm mt-1">Basic details for your resume</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 pt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <FormSectionCard title="Full Name">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <ProfileField
                label="First Name"
                value={formData.firstName}
                onChange={(v) => handleChange("firstName", v)}
              />
            </View>
            <View className="flex-1">
              <ProfileField
  label="Last Name"
  value={formData.lastName}
  onChange={(v) => handleChange("lastName", v)}
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

      <View className="absolute bottom-0 left-0 right-0 bg-white px-4 py-4 border-t border-gray-200">
        <TouchableOpacity className="bg-blue-600 rounded-2xl h-14 items-center justify-center" onPress={handleSave} activeOpacity={0.9}>
          <Text className="text-white text-lg font-semibold" >Save Changes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EditProfileInformation;