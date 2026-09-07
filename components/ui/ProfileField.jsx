import { MaterialIcons } from "@expo/vector-icons";
import { Platform, Text, TextInput, View } from "react-native";

const ProfileField = ({ label, value, icon, onChange,editable = true,multiline = false, required = false }) => {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-bold text-[#486581]">
        {label}
        {required ? <Text className="text-[#E76F51]"> *</Text> : null}
      </Text>
      <View className="h-14 flex-row items-center gap-3 rounded-[18px] border border-[#D9E2EC] bg-[#FFFFFF] px-3.5">
        {icon ? (
          <View className="h-8 w-8 items-center justify-center rounded-xl bg-[#DDF3F0]">
            <MaterialIcons name={icon} size={18} color="#2A9D8F" />
          </View>
        ) : null}
        <TextInput
          style={[
            { flex: 1, fontSize: 18, color: "#102A43" },
            Platform.OS === "web" ? { outlineStyle: "none" } : null,
          ]}
          value={value || ''}
          onChangeText={onChange}
          editable={editable}
          placeholder={`Enter ${label.toLowerCase()}`}
          placeholderTextColor="#829AB1"
          selectionColor="#E76F51"
          cursorColor="#E76F51"
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
        />

        
      </View>
    </View>
  );
};

export default ProfileField;