import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ActivityIndicator, Animated, Modal, Platform, View, Text, TouchableOpacity, ScrollView } from "react-native";
import { API_BASE_URL } from "../../constants/api";
import { useRouter } from "expo-router";
import { authFetch } from "../../utils/authFetch";
import { clearAuthSession, getAuthToken, getAuthUser, setAuthSession } from "../../utils/authStorage";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { showErrorMessage } from "../../utils/errorMessageBus";


const MyResumeList = ({ setResumeItem }) => {
    const router = useRouter();
    const [MyResumes, setMyResumes] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [processingAction, setProcessingAction] = useState(null);
    const [resumeToDelete, setResumeToDelete] = useState(null);
    const [shimmerValue] = useState(new Animated.Value(0));

    useEffect(() => {
        Animated.loop(
            Animated.timing(shimmerValue, {
                toValue: 1,
                duration: 1100,
                useNativeDriver: true,
            })
        ).start();
    }, [shimmerValue]);

    useEffect(()=>{
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
                            if (token) {
                                await setAuthSession({ token, user: authUser });
                            }
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

                console.log("status:", res.status);
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
    },[router, setResumeItem])

    const translateX = shimmerValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-240, 240],
    });

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

    const renderShimmerCard = (key) => (
        <View key={key} className="m-2 flex-col overflow-hidden rounded-[22px] border border-[#D9E2EC] bg-white p-6 py-8">
            <Animated.View
                pointerEvents="none"
                style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    width: 120,
                    transform: [{ translateX }, { skewX: "-18deg" }],
                    backgroundColor: "rgba(255,255,255,0.55)",
                }}
            />
            <View className="flex-row justify-between">
                <View className="flex-row gap-5 flex-1">
                    <View className="h-14 w-14 self-start rounded-2xl bg-[#DDF3F0]" />
                    <View className="flex-1">
                        <View className="mb-2 h-5 w-2/3 rounded-md bg-[#DDEAF5]" />
                        <View className="h-4 w-1/2 rounded-md bg-[#FDE2DD]" />
                    </View>
                </View>
                <View className="h-6 w-6 self-center rounded-md bg-[#F4D98A]" />
            </View>
        </View>
    );

    return (
        <>  
        <Modal
            visible={Boolean(resumeToDelete)}
            transparent
            animationType="fade"
            onRequestClose={() => setResumeToDelete(null)}
        >
            <View className="flex-1 items-center justify-center bg-[#102A43]/45 px-6">
                <View className="w-full max-w-[420px] overflow-hidden rounded-[26px] bg-white shadow-xl">
                    <View className="items-center px-6 pb-5 pt-7">
                        <View className="h-14 w-14 items-center justify-center rounded-2xl bg-[#FDE8E5]">
                            <MaterialIcons name="delete-outline" size={28} color="#D95D55" />
                        </View>
                        <Text className="mt-4 text-center text-xl font-bold text-[#102A43]">Delete this resume?</Text>
                        <Text className="mt-2 text-center text-sm leading-5 text-[#486581]">
                            {resumeToDelete?.title || "This resume"} will be permanently removed. This action cannot be undone.
                        </Text>
                    </View>
                    <View className="flex-row gap-3 border-t border-[#EDF1F3] bg-[#FBFCFD] px-5 py-4">
                        <TouchableOpacity
                            className="flex-1 items-center justify-center rounded-xl border border-[#D9E2EC] py-3"
                            activeOpacity={0.85}
                            onPress={() => setResumeToDelete(null)}
                            disabled={Boolean(processingAction)}
                        >
                            <Text className="text-sm font-bold text-[#486581]">Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="flex-1 flex-row items-center justify-center rounded-xl bg-[#D95D55] py-3"
                            activeOpacity={0.85}
                            onPress={() => deleteResume(resumeToDelete)}
                            disabled={Boolean(processingAction)}
                        >
                            {processingAction?.type === "delete" ? <ActivityIndicator size="small" color="#FFFFFF" /> : <MaterialIcons name="delete-outline" size={17} color="#FFFFFF" />}
                            <Text className="ml-1.5 text-sm font-bold text-white">{processingAction?.type === "delete" ? "Deleting..." : "Delete resume"}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
        <ScrollView showsHorizontalScrollIndicator={false}>

            {loading && [1, 2, 3].map((item) => renderShimmerCard(item))}

            {!loading && MyResumes.map((resume, index)=>{
        return (
        <View
            key={resume?.id ? String(resume.id) : `resume-${index}`}
 >

            
                        <View className="mb-3 flex-col overflow-hidden rounded-[22px] border border-[#D9E2EC] bg-white p-4 shadow-sm">
                                <View className={`absolute bottom-0 left-0 top-0 w-1 ${index % 3 === 0 ? 'bg-[#2A9D8F]' : index % 3 === 1 ? 'bg-[#E76F51]' : 'bg-[#3A86FF]'}`} />
                     <View className="flex-row justify-between gap-3">
                         <View className="min-w-0 flex-1 flex-row gap-3">
                                                      <View className={`self-start rounded-2xl p-3 ${index % 3 === 0 ? 'bg-[#DDF3F0]' : index % 3 === 1 ? 'bg-[#FDE2DD]' : 'bg-[#DDEAF5]'}`}>

                        <MaterialIcons
                            className="flex-shrink"
                            size={24}
                            name='description'
                            color={'#2A9D8F'}
                        />
                    </View>
                    <View className="min-w-0 flex-1">
                        <Text numberOfLines={1} className="text-base font-bold text-[#102A43]">{resume.title}</Text>
                        <View className="mt-1 flex-row items-center gap-1.5"><View className="h-1.5 w-1.5 rounded-full bg-[#2A9D8F]" /><Text className="text-xs font-bold uppercase tracking-wider text-[#829AB1]">Resume ready to edit</Text></View>
                        <View className="mt-3 flex-row gap-2 border-t border-[#EDF1F3] pt-2.5">
                            <TouchableOpacity className="flex-1 flex-row items-center justify-center rounded-xl bg-[#E8F8F4] py-2" activeOpacity={0.85} onPress={() => previewResume(resume)} disabled={Boolean(processingAction)}>
                                {processingAction?.id === resume.id && processingAction.type === "preview" ? <ActivityIndicator size="small" color="#176B67" /> : <MaterialIcons name="visibility" size={16} color="#176B67" />}
                                <Text className="ml-1.5 text-xs font-bold text-[#176B67]">{processingAction?.id === resume.id && processingAction.type === "preview" ? "Preparing..." : "Preview"}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity className="flex-1 flex-row items-center justify-center rounded-xl bg-[#FFF0D9] py-2" activeOpacity={0.85} onPress={() => downloadResume(resume)} disabled={Boolean(processingAction)}>
                                {processingAction?.id === resume.id && processingAction.type === "download" ? <ActivityIndicator size="small" color="#A76400" /> : <MaterialIcons name="file-download" size={16} color="#A76400" />}
                                <Text className="ml-1.5 text-xs font-bold text-[#A76400]">{processingAction?.id === resume.id && processingAction.type === "download" ? "Preparing..." : "Download"}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity className="h-8 w-8 items-center justify-center rounded-xl bg-[#FDE8E5]" activeOpacity={0.85} onPress={() => setResumeToDelete(resume)} disabled={Boolean(processingAction)}>
                                {processingAction?.id === resume.id && processingAction.type === "delete" ? <ActivityIndicator size="small" color="#D95D55" /> : <MaterialIcons name="delete-outline" size={17} color="#D95D55" />}
                            </TouchableOpacity>
                        </View>
                    </View>
                   </View>
                    <View className="flex items-center justify-center">
                        <TouchableOpacity className="h-9 w-9 items-center justify-center rounded-full bg-[#F4F8F7]" activeOpacity={0.85} onPress={() => openResumeWorkspace(resume)}>
                            <MaterialIcons size={20} name='arrow-forward' color={index % 3 === 0 ? '#2A9D8F' : index % 3 === 1 ? '#E76F51' : '#3A86FF'} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
            )}) }
            {!loading && MyResumes.length === 0 && (
                <View className="items-center rounded-[24px] border border-dashed border-[#A8DCD5] bg-[#F1FBF9] px-6 py-10">
                    <View className="h-14 w-14 items-center justify-center rounded-2xl bg-[#DDF3F0]">
                        <MaterialIcons name="add" size={28} color="#2A9D8F" />
                    </View>
                    <Text className="mt-4 text-lg font-bold text-[#102A43]">Your workspace is ready</Text>
                    <Text className="mt-1 text-center text-sm text-[#486581]">Choose a template to create your first resume.</Text>
                </View>
            )}
                 </ScrollView>
        </>
    )
}
export default MyResumeList;