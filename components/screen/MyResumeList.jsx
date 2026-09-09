import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ActivityIndicator, Modal, Platform, View, Text, TouchableOpacity, ScrollView } from "react-native";
import LottieView from "lottie-react-native";
import { API_BASE_URL } from "../../constants/api";
import { useRouter } from "expo-router";
import { authFetch } from "../../utils/authFetch";
import { clearAuthSession, getAuthToken, getAuthUser, setAuthSession } from "../../utils/authStorage";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { showErrorMessage } from "../../utils/errorMessageBus";

const T = {
    blue: "#3B82F6",
    blueBg: "#E8F2FF",
    green: "#58CC02",
    greenPressed: "#46A302",
    orange: "#F5A623",
    ink: "#141821",
    fieldBg: "#F8F9FA",
    fieldBorder: "#EAEBED",
    caps: "#9AA0AC",
    red: "#E5484D",
    redBg: "#FDECEC",
};

const ACCENTS = [
    { iconBg: "#E8F2FF", icon: "#3B82F6" },
    { iconBg: "#FFF4E5", icon: "#F5A623" },
    { iconBg: "#E6F9E9", icon: "#2FAE60" },
];

const formatRelative = (dateStr) => {
    if (!dateStr) return null;
    const diffMs = Date.now() - new Date(dateStr).getTime();
    if (Number.isNaN(diffMs) || diffMs < 0) return null;
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "LAST EDITED JUST NOW";
    if (mins < 60) return `LAST EDITED ${mins}M AGO`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `LAST EDITED ${hours}H AGO`;
    const days = Math.floor(hours / 24);
    return `LAST EDITED ${days}D AGO`;
};

const MyResumeList = ({ setResumeItem }) => {
    const router = useRouter();
    const [MyResumes, setMyResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingAction, setProcessingAction] = useState(null);
    const [resumeToDelete, setResumeToDelete] = useState(null);

    useEffect(() => {
        const fetchResumes = async () => {
            try {
                let authUser = await getAuthUser();
                let userId = authUser?.id;

                if (!userId) {
                    const meRes = await authFetch(`${API_BASE_URL}/users/me`);
                    if (meRes.ok) {
                        const meData = await meRes.json();
                        userId = meData?.id;
                        authUser = meData;
                        if (userId) {
                            const token = await getAuthToken();
                            if (token) await setAuthSession({ token, user: authUser });
                        }
                    }
                }

                if (!userId) {
                    await clearAuthSession();
                    setMyResumes([]);
                    setResumeItem?.([]);
                    router.push('/login');
                    return;
                }

                const res = await authFetch(`${API_BASE_URL}/resumes/user/${userId}`);
                if (res.status === 401) {
                    await clearAuthSession();
                    setMyResumes([]);
                    setResumeItem?.([]);
                    router.push('/login');
                    return;
                }

                const data = await res.json();
                const normalized = Array.isArray(data) ? data : [];
                setMyResumes(normalized);
                setResumeItem?.(normalized);
            } catch (e) {
                console.log("fetch error:", e.message);
                setResumeItem?.([]);
            } finally {
                setLoading(false);
            }
        };
        fetchResumes();
    }, [router, setResumeItem]);

    const openResumeWorkspace = (resume) => {
        const templateId = resume?.template?.id;
        const templateName = resume?.template?.name || "Resume";
        if (!templateId) {
            showErrorMessage("Error", "Template information missing for this resume");
            return;
        }
        router.push({ pathname: "/template/[id]", params: { id: String(templateId), name: String(templateName), resumeId: String(resume.id) } });
    };

    const downloadResume = async (resume) => {
        if (processingAction) return;
        setProcessingAction({ id: resume.id, type: "download" });
        try {
            const response = await authFetch(`${API_BASE_URL}/resumes/${resume.id}/export-pdf`);
            if (!response.ok) throw new Error("Unable to download resume");
            if (Platform.OS === "web") {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `${resume.title || "resume"}.pdf`;
                link.click();
                URL.revokeObjectURL(url);
                return;
            }
            const token = await getAuthToken();
            const fileUri = `${FileSystem.cacheDirectory}resume-${resume.id}.pdf`;
            await FileSystem.downloadAsync(`${API_BASE_URL}/resumes/${resume.id}/export-pdf`, fileUri, { headers: { Authorization: `Bearer ${token}` } });
            if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(fileUri, { mimeType: "application/pdf", dialogTitle: "Download resume" });
        } catch (error) {
            showErrorMessage("Download failed", error?.message || "Unable to download resume");
        } finally {
            setProcessingAction(null);
        }
    };

    const previewResume = async (resume) => {
        if (processingAction) return;
        setProcessingAction({ id: resume.id, type: "preview" });
        try {
            const response = await authFetch(`${API_BASE_URL}/resumes/${resume.id}/preview`);
            if (!response.ok) throw new Error("Unable to load preview");
            router.push({
                pathname: Platform.OS === "web" ? "/(tabs)/template/web-preview" : "/(tabs)/template/preview",
                params: { resumeId: String(resume.id), name: String(resume.title || "Resume") },
            });
        } catch (error) {
            showErrorMessage("Preview failed", error?.message || "Unable to load preview");
        } finally {
            setProcessingAction(null);
        }
    };

    const deleteResume = async (resume) => {
        try {
            setProcessingAction({ id: resume.id, type: "delete" });
            const response = await authFetch(`${API_BASE_URL}/resumes/${resume.id}`, { method: "DELETE" });
            if (!response.ok) throw new Error("Unable to delete resume");
            const remaining = MyResumes.filter((item) => item.id !== resume.id);
            setMyResumes(remaining);
            setResumeItem?.(remaining);
        } catch (error) {
            showErrorMessage("Delete failed", error?.message || "Unable to delete resume");
        } finally {
            setProcessingAction(null);
            setResumeToDelete(null);
        }
    };

    return (
        <>
            {/* Delete Confirmation Modal */}
            <Modal visible={Boolean(resumeToDelete)} transparent animationType="fade" onRequestClose={() => setResumeToDelete(null)}>
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 20, backgroundColor: "rgba(20,24,33,0.45)" }}>
                    <View style={{ width: "100%", maxWidth: 420, overflow: "hidden", borderRadius: 24, backgroundColor: "#FFFFFF" }}>
                        <View style={{ alignItems: "center", paddingHorizontal: 24, paddingBottom: 20, paddingTop: 28 }}>
                            <View style={{ height: 56, width: 56, alignItems: "center", justifyContent: "center", borderRadius: 18, backgroundColor: T.redBg }}>
                                <MaterialIcons name="delete-outline" size={28} color={T.red} />
                            </View>
                            <Text style={{ marginTop: 16, textAlign: "center", fontSize: 19, fontWeight: "800", color: T.ink }}>Delete this resume?</Text>
                            <Text style={{ marginTop: 8, textAlign: "center", fontSize: 14, lineHeight: 20, color: T.caps }}>
                                {resumeToDelete?.title || "This resume"} will be permanently removed.
                            </Text>
                        </View>
                        <View style={{ flexDirection: "row", gap: 12, borderTopWidth: 1, borderColor: T.fieldBorder, backgroundColor: T.fieldBg, paddingHorizontal: 20, paddingVertical: 16 }}>
                            <TouchableOpacity style={{ flex: 1, height: 44, alignItems: "center", justifyContent: "center", borderRadius: 14, borderWidth: 1, borderColor: T.fieldBorder, backgroundColor: "#FFFFFF" }}
                                activeOpacity={0.85} onPress={() => setResumeToDelete(null)} disabled={Boolean(processingAction)}>
                                <Text style={{ fontSize: 14, fontWeight: "700", color: T.caps }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ flex: 1, height: 44, flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: T.red }}
                                activeOpacity={0.85} onPress={() => deleteResume(resumeToDelete)} disabled={Boolean(processingAction)}>
                                {processingAction?.type === "delete" ? <ActivityIndicator size="small" color="#FFFFFF" /> : <MaterialIcons name="delete-outline" size={18} color="#FFFFFF" />}
                                <Text style={{ marginLeft: 6, fontSize: 14, fontWeight: "700", color: "#FFFFFF" }}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <ScrollView showsHorizontalScrollIndicator={false}>
                <Text style={{ marginBottom: 14, fontSize: 11, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase", color: T.caps }}>RECENT PROJECTS</Text>

                {loading && (
                    <ActivityIndicator size="large" color={T.green} style={{ marginVertical: 24 }} />
                )}

                {!loading && MyResumes.map((resume, index) => {
                    const accent = ACCENTS[index % ACCENTS.length];
                    const meta = formatRelative(resume?.updatedAt) || (index === 1 ? "DRAFT — LEVEL 2" : "LAST EDITED 2H AGO");
                    const isBusy = processingAction?.id === resume.id;

                    return (
                        <TouchableOpacity
                            key={resume?.id ? String(resume.id) : `resume-${index}`}
                            activeOpacity={0.85}
                            onPress={() => openResumeWorkspace(resume)}
                            style={{
                                marginBottom: 16,
                                borderRadius: 24,
                                borderWidth: 1,
                                borderColor: T.fieldBorder,
                                backgroundColor: "#FFFFFF",
                                padding: 18,
                                shadowColor: "#000000",
                                shadowOpacity: 0.05,
                                shadowRadius: 10,
                                shadowOffset: { width: 0, height: 4 },
                                elevation: 2,
                            }}
                        >
                            {/* Card Top Section */}
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                                <View style={{ width: 52, height: 52, alignItems: "center", justifyContent: "center", borderRadius: 16, backgroundColor: accent.iconBg }}>
                                    <MaterialIcons name="description" size={26} color={accent.icon} />
                                </View>
                                
                                <View style={{ flex: 1, minWidth: 0, justifyContent: "center" }}>
                                    <Text numberOfLines={1} style={{ fontSize: 17, fontWeight: "800", color: T.ink }}>{resume.title}</Text>
                                    <Text style={{ marginTop: 2, fontSize: 11, fontWeight: "800", letterSpacing: 0.6, color: T.caps }}>{meta}</Text>
                                </View>
                            </View>

                            {/* Aligned Action Buttons Row */}
                            <View style={{ 
                                marginTop: 16, 
                                paddingTop: 14, 
                                borderTopWidth: 1, 
                                borderColor: T.fieldBorder, 
                                flexDirection: "row", 
                                alignItems: "center", 
                                gap: 10 
                            }}>
                                
                                {/* Preview Button */}
                                <TouchableOpacity 
                                    activeOpacity={0.7}
                                    onPress={(e) => { e.stopPropagation(); previewResume(resume); }}
                                    disabled={isBusy}
                                    style={{
                                        flex: 1,
                                        height: 42,
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: 6,
                                        borderRadius: 14,
                                        backgroundColor: T.fieldBg,
                                        borderWidth: 1,
                                        borderColor: T.fieldBorder
                                    }}
                                >
                                    {isBusy && processingAction?.type === "preview" ? (
                                        <ActivityIndicator size="small" color={T.ink} />
                                    ) : (
                                        <>
                                            <MaterialIcons name="visibility" size={18} color={T.ink} />
                                            <Text style={{ fontSize: 13, fontWeight: "700", color: T.ink }}>Preview</Text>
                                        </>
                                    )}
                                </TouchableOpacity>

                                {/* Download Button */}
                                <TouchableOpacity 
                                    activeOpacity={0.7}
                                    onPress={(e) => { e.stopPropagation(); downloadResume(resume); }}
                                    disabled={isBusy}
                                    style={{
                                        flex: 1,
                                        height: 42,
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: 6,
                                        borderRadius: 14,
                                        backgroundColor: T.blueBg,
                                        borderWidth: 1,
                                        borderColor: T.blueBg
                                    }}
                                >
                                    {isBusy && processingAction?.type === "download" ? (
                                        <ActivityIndicator size="small" color={T.blue} />
                                    ) : (
                                        <>
                                            <MaterialIcons name="file-download" size={18} color={T.blue} />
                                            <Text style={{ fontSize: 13, fontWeight: "700", color: T.blue }}>Download</Text>
                                        </>
                                    )}
                                </TouchableOpacity>

                                {/* Delete Button */}
                                <TouchableOpacity 
                                    activeOpacity={0.7}
                                    onPress={(e) => { e.stopPropagation(); setResumeToDelete(resume); }}
                                    disabled={isBusy}
                                    style={{
                                        width: 42,
                                        height: 42,
                                        alignItems: "center",
                                        justifyContent: "center",
                                        borderRadius: 14,
                                        backgroundColor: T.redBg,
                                        borderWidth: 1,
                                        borderColor: T.redBg
                                    }}
                                >
                                    <MaterialIcons name="delete-outline" size={20} color={T.red} />
                                </TouchableOpacity>

                            </View>
                        </TouchableOpacity>
                    );
                })}

                {!loading && MyResumes.length === 0 && (
                    <View style={{ alignItems: "center", borderRadius: 24, borderWidth: 1, borderStyle: "dashed", borderColor: T.fieldBorder, backgroundColor: T.fieldBg, paddingHorizontal: 24, paddingVertical: 40 }}>
                        <View style={{ width: 80, height: 80 }}>
                            <LottieView source={require("../../assets/images/lionblink.json")} autoPlay loop style={{ width: "100%", height: "100%" }} />
                        </View>
                        <Text style={{ marginTop: 12, fontSize: 17, fontWeight: "800", color: T.ink }}>Your workspace is ready</Text>
                        <Text style={{ marginTop: 4, textAlign: "center", fontSize: 13, color: T.caps }}>Choose a template to create your first resume.</Text>
                    </View>
                )}
            </ScrollView>
        </>
    );
};

export default MyResumeList;