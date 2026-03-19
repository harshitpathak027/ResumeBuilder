import {useLocalSearchParams, useRouter} from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { API_BASE_URL } from "../../../constants/api";

const TemplateDetail = () => {
        const {id,name} = useLocalSearchParams();
  const router = useRouter();
  const [resumeId, setResumeId] = useState(null);
const [loading, setLoading] = useState(true);
  const scrollY = useRef(new Animated.Value(0)).current;
  const [expandedTab, setExpandedTab] = useState(null);
    console.log("Template ID:",id ,name);

  useEffect(()=>{
    const createResume = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/resumes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Dummy Resume",
          userId: 1,
          templateId: 2,
        }),
      });
      const data = await res.json();
// setResumeId(data.id);
setResumeId(2);
      console.log("status:", res.status);
      console.log("data:", await res.json());
    } catch (e) {
      console.log("fetch error:", e.message);
    }
  };
    createResume();

  },[])


const templateDetailTabs = [
  {
    name: "personal-information",
    label: "Personal Information",
    icon: "person",
    description: "Name, email, phone, address",
  },
  {
    name: "education",
    label: "Education",
    icon: "school",
    description: "Degree, college, graduation year",
  },
  {
    name: "experience",
    label: "Experience",
    icon: "work",
    description: "Job title, company, duration",
  },
  {
    name: "skills",
    label: "Skills",
    icon: "build",
    description: "Technical, soft skills",
  },
  {
    name: "projects",
    label: "Projects",
    icon: "code",
    description: "Project title, tech stack, and impact",
  },
];
    return(
        <>
        <View>
            <View className="flex-row  items-center gap-4 p-4 mb-2 bg-white">
                <MaterialIcons name="arrow-back" size={24} className="mt-8" color="#0073D5" onPress={()=>router.push("/Template")}/>
                <Text className="mt-8 text-xl">{name}</Text>
            </View>
        </View>

        <Animated.ScrollView
            bounces
            alwaysBounceVertical
            scrollEventThrottle={16}
            contentContainerStyle={{ paddingBottom: 20 }}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: true }
            )}
        >
            {templateDetailTabs.map((tab, index) => {
              const inputRange = [(index - 1) * 120, index * 120, (index + 1) * 120];
              const translateY = scrollY.interpolate({
                inputRange,
                outputRange: [0, 0, -14],
                extrapolate: "clamp",
              });
              const scale = scrollY.interpolate({
                inputRange,
                outputRange: [1, 1, 1],
                extrapolate: "clamp",
              });
              const opacity = scrollY.interpolate({
                inputRange,
                outputRange: [1, 1, 1],
                extrapolate: "clamp",
              });

              const isExpanded = expandedTab === tab.name;

              return (
                <Animated.View
                  key={tab.name}
                  style={{
                    transform: [{ translateY }, { scale }],
                    opacity,
                  }}
                >
                  <TouchableOpacity
                    onPress={() =>
                      setExpandedTab((prevTab) => (prevTab === tab.name ? null : tab.name))
                    }
                    activeOpacity={0.85}
                  >

                <View className="p-7 m-2 rounded-2xl bg-white">

                <View className="flex-row align-middle  justify-between items-center gap-4  rounded-2xl" >
                    <View className="flex-row justify-center items-center gap-4">

                    <View className="w-10 h-10 bg-blue-200 rounded-full items-center justify-center"> 
                        <MaterialIcons name={`${tab.icon}`} size={20} color="#0073D5"/>
                    </View>
                    <View className="flex-col items-start gap-1">
                        <Text className="text-lg font-semibold">{tab.label}</Text>
                        <Text className="text-gray-500 text-sm">{tab.description}</Text>

                    </View>
                    </View>
                    <View>
                        <MaterialIcons name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={22} color="#9ca3af"/>
                    </View>
                </View>
                {isExpanded && (
                  <View className="mt-4 border-t flex items-center justify-center  border-gray-100 pt-4">
                    <TouchableOpacity
                      className="self-center w-full bg-gray-200 px-4 py-2 rounded-lg"
                      onPress={() => {
                        let pathname = "/template/edit-profile-information";

                        if (tab.name === "experience") {
                          pathname = "/template/edit-work-experience";
                        }

                        if (tab.name === "education") {
                          pathname = "/template/edit-education";
                        }

                        if (tab.name === "skills") {
                          pathname = "/template/edit-skills";
                        }

                        if (tab.name === "projects") {
                          pathname = "/template/edit-projects";
                        }

                        router.push({
                          pathname,
                          params: { resumeId: String(resumeId), name: String(tab.label) },
                        });
                      }}
                    >
                      <Text className="font-medium text-center">Edit {tab.name}</Text>
                    </TouchableOpacity>
                  </View>
                )}
                </View>
            </TouchableOpacity>
              </Animated.View>
              )})}
          
            </Animated.ScrollView>
        </>
    )
}
export default TemplateDetail;