import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import FormInputBox from "../../../components/ui/FormInputBox";

const SkillPill = ({ name, rating = 5 }) => {
  const filledStars = "★".repeat(rating);
  const emptyStars = "☆".repeat(5 - rating);

  return (
    <View className="self-start bg-gray-100 rounded-2xl px-4 py-2 mr-2 mb-2 flex-row items-center gap-2">
      <Text className="text-gray-900 text-base font-semibold">{name}</Text>
      <Text className="text-blue-600 text-sm">{filledStars}{emptyStars}</Text>
    </View>
  );
};

const EditSkills = () => {
  const router = useRouter();

  const categories = ["All", "Frontend", "Backend", "Languages", "Data"];
  const suggestions = ["Kubernetes", "Redis", "Elasticsearch", "CI/CD"];

  const groupedSkills = [
    {
      section: "Frontend",
      items: [
        { name: "React", rating: 5 },
        { name: "Tailwind CSS", rating: 5 },
        { name: "Next.js", rating: 4 },
      ],
    },
    {
      section: "Languages",
      items: [
        { name: "TypeScript", rating: 5 },
        { name: "Python", rating: 4 },
      ],
    },
  ];

  return (
    <View className="flex-1 bg-gray-100">
      <View className="pt-12 px-4 pb-3 bg-white border-b border-blue-100">
        <View className="flex-row items-start justify-between">
          <TouchableOpacity className="flex-row items-center gap-3" onPress={() => router.back()} activeOpacity={0.8}>
            <MaterialIcons name="arrow-back-ios" size={18} color="#6b7280" />
            <View>
              <Text className="text-xl font-semibold text-gray-900">Skills</Text>
              <Text className="text-gray-500 text-sm mt-1">12 skills added</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="px-3 h-8 rounded-2xl border border-gray-300 flex-row items-center gap-1" activeOpacity={0.8}>
            <MaterialIcons name="auto-fix-high" size={14} color="#3b82f6" />
            <Text className="text-gray-700 text-sm font-medium">AI</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 pt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="mx-4 mb-4 h-12 rounded-2xl bg-white border border-gray-200 px-4 flex-row items-center gap-2">
          <MaterialIcons name="search" size={20} color="#9ca3af" />
          <Text className="text-gray-500 text-base">Search skills...</Text>
        </View>

        <View className="bg-blue-50 rounded-3xl p-5 mx-4 mb-4 border border-blue-100">
          <View className="flex-row items-start gap-3 mb-3">
            <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center">
              <MaterialIcons name="auto-fix-high" size={20} color="#3b82f6" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-900">AI Skill Suggestions</Text>
              <Text className="text-gray-500 text-sm mt-1">Based on your experience, we recommend adding these skills.</Text>
            </View>
          </View>

          <View className="flex-row flex-wrap">
            {suggestions.map((item) => (
              <TouchableOpacity key={item} className="bg-white border border-gray-200 rounded-2xl px-4 py-1 mr-2 mb-2" activeOpacity={0.85}>
                <Text className="text-gray-900 text-sm font-semibold">+ {item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="bg-white rounded-3xl p-4 mx-4 mb-4 border border-gray-200">
          <Text className="text-lg font-semibold text-gray-900 mb-3">Add New Skill</Text>
          <View className="flex-row items-end gap-2">
            <View className="flex-1">
              <FormInputBox label="" value="Type a skill name..." />
            </View>
            <TouchableOpacity className="mb-3 w-12 h-12 rounded-2xl bg-blue-600 items-center justify-center" activeOpacity={0.9}>
              <Text className="text-white text-2xl">+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="mx-4 mb-4 flex-row">
          {categories.map((item, index) => (
            <TouchableOpacity
              key={item}
              className={`px-4 h-10 rounded-2xl mr-2 items-center justify-center border ${index === 0 ? "bg-blue-600 border-blue-600" : "bg-white border-gray-200"}`}
              activeOpacity={0.85}
            >
              <Text className={`${index === 0 ? "text-white" : "text-gray-900"} text-base font-semibold`}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {groupedSkills.map((group) => (
          <View key={group.section} className="mx-4 mb-4">
            <Text className="text-gray-500 text-base font-semibold mb-2">{group.section}</Text>
            <View className="bg-white rounded-3xl p-4 border border-gray-200">
              <View className="flex-row flex-wrap">
                {group.items.map((skill) => (
                  <SkillPill key={skill.name} name={skill.name} rating={skill.rating} />
                ))}
              </View>
            </View>
          </View>
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

export default EditSkills;