import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import FormInputBox from "../../../components/ui/FormInputBox";
import FormSectionCard from "../../../components/ui/FormSectionCard";

const EditWorkExperience = () => {
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);

  const experienceItems = [
    {
      id: "exp-1",
      title: "Senior Software Engineer",
      company: "TechCorp Inc.",
      timeline: "Jan 2022 - Present · San Francisco, CA",
      summary: "Led development of microservices architecture serving 1M+ users. Mentored team members and improved release reliability.",
      isCurrent: true,
    },
    {
      id: "exp-2",
      title: "Software Engineer",
      company: "StartupXYZ",
      timeline: "Jun 2019 - Dec 2021 · Remote",
      summary: "Built and maintained React applications with TypeScript. Collaborated with design team to ship user-focused features.",
      isCurrent: false,
    },
    {
      id: "exp-3",
      title: "Junior Developer",
      company: "WebAgency Co.",
      timeline: "Aug 2017 - May 2019 · New York, NY",
      summary: "Developed custom WordPress themes and plugins for client websites. Participated in QA and deployment cycles.",
      isCurrent: false,
    },
  ];

  return (
    <View className="flex-1 bg-gray-100">
      <View className="pt-12 px-4 pb-3 bg-white border-b border-blue-100">
        <View className="flex-row items-start justify-between">
          <TouchableOpacity className="flex-row items-start gap-3" onPress={() => router.back()} activeOpacity={0.8}>
            <MaterialIcons name="arrow-back-ios" size={18} color="#6b7280" />
            <View>
              <Text className="text-xl font-semibold text-gray-900">Work Experience</Text>
              <Text className="text-gray-500 text-sm mt-1">3 positions added</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="px-3 h-8 rounded-2xl border border-gray-300 flex-row items-center gap-1" activeOpacity={0.8}>
            <MaterialIcons name="auto-fix-high" size={14} color="#3b82f6" />
            <Text className="text-gray-700 text-sm font-medium">AI</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 pt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="bg-blue-50 rounded-3xl p-5 mx-4 mb-4 border border-blue-100">
          <View className="flex-row items-start gap-3 mb-3">
            <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center">
              <MaterialIcons name="auto-fix-high" size={20} color="#3b82f6" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-900">AI Enhancement Available</Text>
              <Text className="text-gray-500 text-sm mt-1">Let AI improve your job descriptions with impactful language.</Text>
            </View>
          </View>
          <TouchableOpacity className="self-start px-4 h-10 rounded-2xl bg-blue-600 items-center justify-center" activeOpacity={0.85}>
            <Text className="text-white text-base font-semibold">Enhance All Descriptions</Text>
          </TouchableOpacity>
        </View>

        {!showAddForm && (
          <TouchableOpacity
            className="mx-4 mb-4 rounded-2xl border border-dashed border-green-500 bg-green-400 h-12 items-center justify-center"
            activeOpacity={0.85}
            onPress={() => setShowAddForm(true)}
          >
            <Text className="text-gray-900 text-base font-semibold">+ Add New Position</Text>
          </TouchableOpacity>
        )}

        {showAddForm && (
          <View className="bg-white rounded-3xl p-4 mx-4 mb-4 border border-gray-200">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-semibold text-gray-900">New Position</Text>
              <TouchableOpacity activeOpacity={0.8} onPress={() => setShowAddForm(false)}>
                <Text className="text-gray-900 text-sm font-medium">Cancel</Text>
              </TouchableOpacity>
            </View>

            <FormInputBox label="Job Title" value="e.g., Software Engineer" />
            <FormInputBox label="Company" value="Company name" icon="apartment" />
            <FormInputBox label="Location" value="City, State or Remote" />

            <View className="flex-row gap-3">
              <View className="flex-1">
                <FormInputBox label="Start Date" value="Jan 2022" icon="calendar-today" />
              </View>
              <View className="flex-1">
                <FormInputBox label="End Date" value="Present" />
              </View>
            </View>

            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-900 text-base">I currently work here</Text>
              <Switch value={false} trackColor={{ false: "#d1d5db", true: "#93c5fd" }} thumbColor="#ffffff" />
            </View>

            <FormInputBox label="Description" value="Describe your responsibilities and achievements..." multiline />

            <TouchableOpacity className="mt-1 bg-blue-600 rounded-2xl h-12 items-center justify-center" activeOpacity={0.9}>
              <Text className="text-white text-base font-semibold">Add Position</Text>
            </TouchableOpacity>
          </View>
        )}

        {experienceItems.map((item) => (
          <FormSectionCard key={item.id} title={item.title}>
            <View className="flex-row items-start justify-between">
              <View className="flex-row items-start gap-3 flex-1">
                <MaterialIcons name="drag-indicator" size={20} color="#9ca3af" />
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900">{item.title}</Text>
                  <Text className="text-gray-500 text-sm mt-1">{item.company}</Text>
                  <Text className="text-gray-500 text-sm mt-1">{item.timeline}</Text>
                  <Text className="text-gray-500 text-sm mt-2" numberOfLines={2}>
                    {item.summary}
                  </Text>
                  {item.isCurrent && (
                    <View className="self-start mt-3 px-3 py-1 rounded-2xl bg-green-100">
                      <Text className="text-green-600 text-sm font-semibold">Current Position</Text>
                    </View>
                  )}
                </View>
              </View>
              <View className="flex-row items-center gap-4">
                <TouchableOpacity activeOpacity={0.8}>
                  <MaterialIcons name="edit" size={18} color="#4b5563" />
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.8}>
                  <MaterialIcons name="delete-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          </FormSectionCard>
        ))}
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 bg-white px-4 py-4 border-t border-gray-200">
        <TouchableOpacity className="bg-blue-600 rounded-2xl h-14 items-center justify-center" activeOpacity={0.9}>
          <Text className="text-white text-base font-semibold">Save Changes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EditWorkExperience;