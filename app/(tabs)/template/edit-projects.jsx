import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import FormInputBox from "../../../components/ui/FormInputBox";
import FormSectionCard from "../../../components/ui/FormSectionCard";

const TechChip = ({ label }) => (
  <View className="bg-gray-100 rounded-2xl px-3 py-1 mr-2 mb-2">
    <Text className="text-gray-900 text-base font-semibold">{label}</Text>
  </View>
);

const EditProjects = () => {
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);

  const projects = [
    {
      id: "proj-1",
      title: "E-Commerce Platform",
      timeline: "Mar 2023 - Jun 2023",
      summary: "Built a full-stack e-commerce platform with real-time inventory management, payment integration, and admin analytics.",
      tech: ["React", "Node.js", "PostgreSQL", "Stripe"],
    },
    {
      id: "proj-2",
      title: "Task Management App",
      timeline: "Jan 2023 - Feb 2023",
      summary: "Developed a collaborative task management application with real-time updates, drag-and-drop boards, and notifications.",
      tech: ["Next.js", "TypeScript", "Prisma", "WebSocket"],
    },
  ];

  return (
    <View className="flex-1 bg-gray-100">
      <View className="pt-12 px-4 pb-3 bg-white border-b border-blue-100">
        <TouchableOpacity className="flex-row items-start gap-3" onPress={() => router.back()} activeOpacity={0.8}>
          <MaterialIcons name="arrow-back-ios" size={18} color="#6b7280" />
          <View>
            <Text className="text-xl font-semibold text-gray-900">Projects</Text>
            <Text className="text-gray-500 text-sm mt-1">2 projects added</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 pt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {!showAddForm && (
          <TouchableOpacity
            className="mx-4 mb-4 rounded-2xl border border-dashed border-gray-300 bg-white h-12 items-center justify-center"
            activeOpacity={0.85}
            onPress={() => setShowAddForm(true)}
          >
            <Text className="text-gray-900 text-base font-semibold">+ Add New Project</Text>
          </TouchableOpacity>
        )}

        {showAddForm && (
          <View className="bg-white rounded-3xl p-4 mx-4 mb-4 border border-gray-200">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-semibold text-gray-900">New Project</Text>
              <TouchableOpacity activeOpacity={0.8} onPress={() => setShowAddForm(false)}>
                <Text className="text-gray-900 text-sm font-medium">Cancel</Text>
              </TouchableOpacity>
            </View>

            <FormInputBox label="Project Name" value="e.g., Portfolio Website" />
            <FormInputBox label="Description" value="Describe what you built and the impact..." multiline />

            <View className="mb-3">
              <Text className="text-gray-500 text-base font-medium mb-1">Technologies Used</Text>
              <View className="flex-row items-end gap-2">
                <View className="flex-1 h-14 rounded-2xl bg-gray-100 px-4 flex-row items-center">
                  <Text className="text-gray-500 text-base">Add technology...</Text>
                </View>
                <TouchableOpacity className="w-12 h-12 rounded-2xl border border-gray-300 items-center justify-center" activeOpacity={0.85}>
                  <Text className="text-gray-700 text-2xl">+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <FormInputBox label="Start Date" value="Jan 2023" />
              </View>
              <View className="flex-1">
                <FormInputBox label="End Date" value="Mar 2023" />
              </View>
            </View>

            <FormInputBox label="Live URL (optional)" value="https://yourproject.com" icon="open-in-new" />
            <FormInputBox label="Repository URL (optional)" value="https://github.com/user/repo" icon="code" />

            <TouchableOpacity className="mt-1 bg-blue-600 rounded-2xl h-12 items-center justify-center" activeOpacity={0.9}>
              <Text className="text-white text-base font-semibold">Add Project</Text>
            </TouchableOpacity>
          </View>
        )}

        {projects.map((project) => (
          <FormSectionCard key={project.id} title={project.title}>
            <View className="flex-row items-start justify-between">
              <View className="flex-row items-start gap-3 flex-1">
                <MaterialIcons name="drag-indicator" size={20} color="#9ca3af" />
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900">{project.title}</Text>
                  <Text className="text-gray-500 text-sm mt-1">{project.timeline}</Text>
                  <Text className="text-gray-500 text-sm mt-2" numberOfLines={2}>
                    {project.summary}
                  </Text>
                  <View className="flex-row flex-wrap mt-3">
                    {project.tech.map((techItem) => (
                      <TechChip key={`${project.id}-${techItem}`} label={techItem} />
                    ))}
                  </View>
                  <View className="flex-row items-center gap-4 mt-2">
                    <Text className="text-blue-600 text-base">↗ Live Demo</Text>
                    <Text className="text-blue-600 text-base">⚓ Source Code</Text>
                  </View>
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

export default EditProjects;