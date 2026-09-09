import { Animated, Easing, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { triggerVibration } from "../../components/constant/vibration";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ShimmerCard from "../../components/ui/ShimmerCard";
import { useRouter } from "expo-router";
import { API_BASE_URL } from "../../constants/api";
import { authFetch } from "../../utils/authFetch";
import { clearAuthSession } from "../../utils/authStorage";

const T = {
    green: "#58CC02",
    greenPressed: "#46A302",
    greenBg: "#EEFCE2",
    ink: "#141821",
    fieldBg: "#F6F6F7",
    fieldBorder: "#EAEBED",
    caps: "#9AA0AC",
    orange: "#F5A623",
    blue: "#3B82F6",
    wireframeLine: "#E5E7EB",
    wireframeHeader: "#D1D5DB"
};

const Template = () => {
    const [templates, setTemplates] = useState([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const router = useRouter();
    const shimmerValue = useRef(new Animated.Value(0)).current;
    const shimmerItems = useMemo(() => Array.from({ length: 4 }, (_, index) => index), []);

    const fetchTemplates = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const response = await authFetch(`${API_BASE_URL}/templates`);
            if (response.status === 401) {
                await clearAuthSession();
                setTemplates([]);
                setError("Session expired. Please login again.");
                router.push('/login');
                return;
            }
            if (!response.ok) {
                throw new Error(`Request failed: ${response.status}`);
            }
            const data = await response.json();
            const normalized = Array.isArray(data) && data.length > 0 ? data : [];
            setTemplates(normalized);
            if (normalized.length > 0) {
                setSelectedTemplateId(normalized[0].id);
            }
        } catch (fetchError) {
            setError(`Could not load templates from ${API_BASE_URL}/templates`);
            setTemplates([]);
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    useEffect(() => {
        if (!loading) {
            shimmerValue.stopAnimation();
            return;
        }

        const shimmerLoop = Animated.loop(
            Animated.timing(shimmerValue, {
                toValue: 1,
                duration: 1050,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );

        shimmerValue.setValue(0);
        shimmerLoop.start();

        return () => {
            shimmerLoop.stop();
            shimmerValue.stopAnimation();
        };
    }, [loading, shimmerValue]);

    const handleSelectCard = async (id) => {
        await triggerVibration("tap");
        setSelectedTemplateId(id);
    };

    const handleConfirmSelection = async () => {
        const selected = templates.find((t) => t.id === selectedTemplateId) || templates[0];
        if (!selected) return;

        await triggerVibration("tap");
        router.push({
            pathname: "/template/[id]",
            params: { id: String(selected.id), name: String(selected.name), description: String(selected.description || "") },
        });
    };

    // Render wireframe UI matching reference image
    const renderWireframePreview = (index, name = "") => {
        const styleIndex = index % 4;

        // 1. Modern Duo Wireframe
        if (styleIndex === 0 || name.toLowerCase().includes("modern")) {
            return (
                <View style={{ width: "80%", height: "88%", backgroundColor: "#FFFFFF", borderRadius: 10, padding: 10, borderWidth: 1, borderColor: T.fieldBorder, shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 }}>
                    <View style={{ width: "45%", height: 8, backgroundColor: T.wireframeHeader, borderRadius: 4, marginBottom: 8 }} />
                    <View style={{ width: "90%", height: 4, backgroundColor: T.wireframeLine, borderRadius: 2, marginBottom: 5 }} />
                    <View style={{ width: "80%", height: 4, backgroundColor: T.wireframeLine, borderRadius: 2, marginBottom: 5 }} />
                    <View style={{ width: "65%", height: 4, backgroundColor: T.wireframeLine, borderRadius: 2 }} />
                </View>
            );
        }

        // 2. Classic Pro Wireframe
        if (styleIndex === 1 || name.toLowerCase().includes("classic")) {
            return (
                <View style={{ width: "80%", height: "88%", backgroundColor: "#FFFFFF", borderRadius: 10, padding: 10, alignItems: "center", borderWidth: 1, borderColor: T.fieldBorder, shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 }}>
                    <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: T.wireframeHeader, marginBottom: 8 }} />
                    <View style={{ width: "55%", height: 6, backgroundColor: T.wireframeHeader, borderRadius: 3, marginBottom: 6 }} />
                    <View style={{ width: "85%", height: 4, backgroundColor: T.wireframeLine, borderRadius: 2, marginBottom: 4 }} />
                    <View style={{ width: "70%", height: 4, backgroundColor: T.wireframeLine, borderRadius: 2 }} />
                </View>
            );
        }

        // 3. The Sidebar Wireframe
        if (styleIndex === 2 || name.toLowerCase().includes("sidebar")) {
            return (
                <View style={{ width: "80%", height: "88%", backgroundColor: "#FFFFFF", borderRadius: 10, padding: 8, flexDirection: "row", gap: 8, borderWidth: 1, borderColor: T.fieldBorder, shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 }}>
                    <View style={{ width: "32%", height: "100%", backgroundColor: T.wireframeHeader, borderRadius: 6 }} />
                    <View style={{ flex: 1, paddingTop: 4 }}>
                        <View style={{ width: "70%", height: 6, backgroundColor: T.wireframeHeader, borderRadius: 3, marginBottom: 6 }} />
                        <View style={{ width: "100%", height: 4, backgroundColor: T.wireframeLine, borderRadius: 2, marginBottom: 4 }} />
                        <View style={{ width: "80%", height: 4, backgroundColor: T.wireframeLine, borderRadius: 2 }} />
                    </View>
                </View>
            );
        }

        // 4. Vibrant Tech Wireframe (With Blue Header Line)
        return (
            <View style={{ width: "80%", height: "88%", backgroundColor: "#FFFFFF", borderRadius: 10, padding: 10, borderWidth: 1, borderColor: T.fieldBorder, overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 }}>
                <View style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, backgroundColor: T.blue }} />
                <View style={{ width: "45%", height: 8, backgroundColor: T.wireframeHeader, borderRadius: 4, marginTop: 4, marginBottom: 8 }} />
                <View style={{ width: "90%", height: 4, backgroundColor: T.wireframeLine, borderRadius: 2, marginBottom: 5 }} />
                <View style={{ width: "75%", height: 4, backgroundColor: T.wireframeLine, borderRadius: 2 }} />
            </View>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
            {/* Header Bar */}
            <View style={{
                flexDirection: "row",
                alignItems: "center",
                justify: "space-between",
                paddingHorizontal: 20,
                paddingTop: 54,
                paddingBottom: 16,
                borderBottomWidth: 1,
                borderBottomColor: T.fieldBorder
            }}>
                <TouchableOpacity activeOpacity={0.7} onPress={() => router.back()} style={{ padding: 4 }}>
                    <MaterialIcons name="arrow-back" size={24} color={T.caps} />
                </TouchableOpacity>
                <Text style={{ fontSize: 20, fontWeight: "800", color: T.ink }}>Pick a Style</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Grid Content */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 120 }}>
                {loading && (
                    <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
                        {shimmerItems.map((item) => (
                            <ShimmerCard key={item} shimmerValue={shimmerValue} />
                        ))}
                    </View>
                )}

                {!loading && error !== "" && (
                    <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 40 }}>
                        <Text style={{ fontSize: 14, fontWeight: "600", color: T.caps, textAlign: "center", marginBottom: 12 }}>{error}</Text>
                        <TouchableOpacity onPress={fetchTemplates} style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: T.fieldBg, borderRadius: 12 }}>
                            <Text style={{ fontSize: 13, fontWeight: "700", color: T.blue }}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {!loading && error === "" && (
                    <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 16 }}>
                        {templates.map((template, index) => {
                            const isSelected = selectedTemplateId === template.id;
                            const isPremium = Boolean(template.isPremium) || index === 3;

                            return (
                                <TouchableOpacity
                                    key={String(template.id)}
                                    activeOpacity={0.9}
                                    onPress={() => handleSelectCard(template.id)}
                                    style={{
                                        width: "48%",
                                        height: 220,
                                        borderRadius: 24,
                                        borderWidth: isSelected ? 2.5 : 1.5,
                                        borderColor: isSelected ? T.green : T.fieldBorder,
                                        backgroundColor: isSelected ? T.greenBg : T.fieldBg,
                                        overflow: "hidden",
                                        justify: "space-between"
                                    }}
                                >
                                    {/* Wireframe Preview Stage */}
                                    <View style={{
                                        height: 140,
                                        backgroundColor: T.fieldBg,
                                        alignItems: "center",
                                        justify: "center",
                                        paddingTop: 12,
                                        position: "relative"
                                    }}>
                                        {/* Premium Pill Badge */}
                                        {isPremium && (
                                            <View style={{
                                                position: "absolute",
                                                top: 10,
                                                right: 10,
                                                backgroundColor: T.orange,
                                                paddingHorizontal: 8,
                                                paddingVertical: 3,
                                                borderRadius: 8,
                                                zIndex: 2
                                            }}>
                                                <Text style={{ color: "#FFFFFF", fontSize: 9, fontWeight: "900", letterSpacing: 0.5 }}>PREMIUM</Text>
                                            </View>
                                        )}

                                        {renderWireframePreview(index, template.name)}
                                    </View>

                                    {/* Card Footer Title & Active Checkmark */}
                                    <View style={{
                                        paddingVertical: 14,
                                        paddingHorizontal: 12,
                                        alignItems: "center",
                                        justify: "center",
                                        backgroundColor: isSelected ? T.greenBg : "#FFFFFF",
                                        flex: 1
                                    }}>
                                        <Text numberOfLines={1} style={{ fontSize: 15, fontWeight: "800", color: T.ink, textAlign: "center" }}>
                                            {template.name}
                                        </Text>

                                        {isSelected && (
                                            <View style={{
                                                width: 18,
                                                height: 18,
                                                borderRadius: 9,
                                                backgroundColor: T.green,
                                                alignItems: "center",
                                                justify: "center",
                                                marginTop: 6
                                            }}>
                                                <MaterialIcons name="check" size={13} color="#FFFFFF" />
                                            </View>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}
            </ScrollView>

            {/* Bottom Select Style Button */}
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
                borderTopColor: T.fieldBorder
            }}>
                <TouchableOpacity
                    activeOpacity={0.92}
                    onPress={handleConfirmSelection}
                    disabled={!selectedTemplateId}
                >
                    <View style={{ borderRadius: 20, paddingBottom: 4, backgroundColor: T.greenPressed }}>
                        <View style={{
                            alignItems: "center",
                            justify: "center",
                            borderRadius: 20,
                            paddingVertical: 16,
                            backgroundColor: T.green
                        }}>
                            <Text style={{ fontSize: 15, fontWeight: "900", letterSpacing: 0.8, color: "#FFFFFF" }}>
                                SELECT STYLE
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default Template;