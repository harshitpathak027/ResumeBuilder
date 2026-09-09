import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Animated, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useEffect, useRef, useState } from "react";
import LottieView from "lottie-react-native";
import { API_BASE_URL } from "../../../constants/api";
import { authFetch } from "../../../utils/authFetch";
import { getResumeDraft, saveResumeDraft } from "../../../utils/resumeDraftStorage";
import { showErrorMessage } from "../../../utils/errorMessageBus";
import BookLoader from "../../../components/screen/BookLoader";

const T = {
  blue: "#3B82F6",
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

const EditProfileInformation = () => {
  const router = useRouter();
  const { name, resumeId, templateId, resumeTitle } = useLocalSearchParams();
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

  const progressAnim = useRef(new Animated.Value(0)).current;

  // Track progress on per-field basis
  const trackedFields = [
    formData.firstName,
    formData.lastName,
    formData.email,
    formData.phone,
    formData.location,
    formData.professionalSummary,
  ];
  
  const filledCount = trackedFields.filter((f) => String(f || "").trim().length > 0).length;
  const progressPercent = (filledCount / trackedFields.length) * 100;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progressPercent,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progressPercent]);

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
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      {/* Top Bar with Close Icon and Animated Slider Bar */}
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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 120 }}>
        {/* Mascot Stage & Speech Bubble Container */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 24 }}>
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
            <Text style={{ fontSize: 18, fontWeight: "800", color: T.ink }}>Personal Details</Text>
            <Text style={{ marginTop: 4, fontSize: 13, fontWeight: "600", color: T.caps, lineHeight: 18 }}>
              Let's start with the basics! What should recruiters call you?
            </Text>
          </View>
        </View>

        {/* Form Fields matching PDF design */}
        <View style={{ gap: 16 }}>
          {/* First Name */}
          <View>
            <Text style={{ fontSize: 11, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase", color: T.caps, marginBottom: 6 }}>
              FIRST NAME *
            </Text>
            <TextInput
              value={formData.firstName}
              onChangeText={(v) => handleChange("firstName", v)}
              placeholder="e.g. John"
              placeholderTextColor={T.placeholder}
              style={{
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
          </View>

          {/* Last Name */}
          <View>
            <Text style={{ fontSize: 11, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase", color: T.caps, marginBottom: 6 }}>
              LAST NAME *
            </Text>
            <TextInput
              value={formData.lastName}
              onChangeText={(v) => handleChange("lastName", v)}
              placeholder="e.g. Doe"
              placeholderTextColor={T.placeholder}
              style={{
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
          </View>

          {/* Email Address */}
          <View>
            <Text style={{ fontSize: 11, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase", color: T.caps, marginBottom: 6 }}>
              EMAIL ADDRESS *
            </Text>
            <TextInput
              value={formData.email}
              onChangeText={(v) => handleChange("email", v)}
              placeholder="hello@resumeduo.com"
              placeholderTextColor={T.placeholder}
              keyboardType="email-address"
              autoCapitalize="none"
              style={{
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
          </View>

          {/* Phone Number */}
          <View>
            <Text style={{ fontSize: 11, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase", color: T.caps, marginBottom: 6 }}>
              PHONE NUMBER
            </Text>
            <TextInput
              value={formData.phone}
              onChangeText={(v) => handleChange("phone", v)}
              placeholder="+1 (555) 000-0000"
              placeholderTextColor={T.placeholder}
              keyboardType="phone-pad"
              style={{
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
          </View>

          {/* Location */}
          <View>
            <Text style={{ fontSize: 11, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase", color: T.caps, marginBottom: 6 }}>
              LOCATION
            </Text>
            <TextInput
              value={formData.location}
              onChangeText={(v) => handleChange("location", v)}
              placeholder="e.g. San Francisco, CA"
              placeholderTextColor={T.placeholder}
              style={{
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
          </View>

          {/* LinkedIn Profile */}
          <View>
            <Text style={{ fontSize: 11, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase", color: T.caps, marginBottom: 6 }}>
              LINKEDIN URL
            </Text>
            <TextInput
              value={formData.linkedinUrl}
              onChangeText={(v) => handleChange("linkedinUrl", v)}
              placeholder="linkedin.com/in/johndoe"
              placeholderTextColor={T.placeholder}
              autoCapitalize="none"
              style={{
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
          </View>

          {/* Professional Summary */}
          <View>
            <Text style={{ fontSize: 11, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase", color: T.caps, marginBottom: 6 }}>
              PROFESSIONAL SUMMARY
            </Text>
            <TextInput
              value={formData.professionalSummary}
              onChangeText={(v) => handleChange("professionalSummary", v)}
              placeholder="Brief summary about your skills and goals..."
              placeholderTextColor={T.placeholder}
              multiline
              numberOfLines={4}
              style={{
                backgroundColor: T.fieldBg,
                borderWidth: 1,
                borderColor: T.fieldBorder,
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 15,
                fontWeight: "600",
                color: T.ink,
                minHeight: 100,
                textAlignVertical: "top",
              }}
            />
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
        <TouchableOpacity activeOpacity={0.92} onPress={handleSave}>
          <View style={{ borderRadius: 20, paddingBottom: 4, backgroundColor: isFormComplete ? T.greenPressed : T.caps }}>
            <View style={{
              alignItems: "center",
              justify: "center",
              borderRadius: 20,
              paddingVertical: 16,
              backgroundColor: isFormComplete ? T.green : T.fieldBorder,
            }}>
              <Text style={{ fontSize: 15, fontWeight: "900", letterSpacing: 0.8, color: "#FFFFFF" }}>
                SAVE PROFILE
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {(loading || saving) && <BookLoader visible={loading || saving} />}
    </View>
  );
};

export default EditProfileInformation;