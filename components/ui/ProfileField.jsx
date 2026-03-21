import { MaterialIcons } from "@expo/vector-icons";
import { Platform, Text, TextInput, View } from "react-native";

const ProfileField = ({ label, value, icon, onChange,editable = true,multiline = false, required = false }) => {
  return (
    <View className="mb-3">
      <Text className="text-gray-500 text-base font-medium mb-1">
        {label}
        {required ? <Text className="text-red-500"> *</Text> : null}
      </Text>
      <View className="h-14 rounded-2xl bg-gray-100 px-4 flex-row items-center gap-3">
        {icon ? <MaterialIcons name={icon} size={20} color="#9ca3af" /> : null}
        <TextInput
          style={[
            { flex: 1, fontSize: 18, color: "#111827" },
            Platform.OS === "web" ? { outlineStyle: "none" } : null,
          ]}
          value={value || ''}
          onChangeText={onChange}
          editable={editable}
          placeholder={`Enter ${label.toLowerCase()}`}
          placeholderTextColor="#d1d5db"
          selectionColor="#111827"
          cursorColor="#111827"
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
        />

        
      </View>
    </View>
  );
};

export default ProfileField;