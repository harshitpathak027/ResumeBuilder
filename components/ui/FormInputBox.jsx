import { MaterialIcons } from "@expo/vector-icons";
import { Platform, Text, TextInput, View } from "react-native";

const FormInputBox = ({ label,
  value,
  onChange,
  icon,
  multiline = false,
  placeholder,
  keyboardType = "default",
  editable = true,
  required = false, }) => {
  return (
    <View className="mb-4">
      {label ? (
        <Text className="mb-2 text-sm font-bold text-[#486581]">
          {label}
          {required ? <Text className="text-[#E76F51]"> *</Text> : null}
        </Text>
      ) : null}
      <View
        className={`flex-row items-center gap-3 rounded-[18px] border border-[#D9E2EC] bg-[#FFFFFF] px-3.5 ${
          multiline ? "min-h-28 py-3" : "h-14"
        }`}
      >
        {icon ? (
          <View className="h-8 w-8 items-center justify-center rounded-xl bg-[#DDF3F0]">
            <MaterialIcons name={icon} size={18} color="#2A9D8F" />
          </View>
        ) : null}
      <TextInput
          style={[
            { flex: 1, fontSize: 16, color: "#102A43" },
            Platform.OS === "web" ? { outlineStyle: "none" } : null,
          ]}
          value={value || ""}
          onChangeText={onChange}
          placeholder={placeholder || label}
          placeholderTextColor="#829AB1"
          multiline={multiline}
          editable={editable}
          keyboardType={keyboardType}
          selectionColor="#E76F51"
          cursorColor="#E76F51"
        />
      </View>
    </View>
  );
};

export default FormInputBox;