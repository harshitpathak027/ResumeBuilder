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
    <View className="mb-3">
      {label ? (
        <Text className="text-gray-500 text-base font-medium mb-1">
          {label}
          {required ? <Text className="text-red-500"> *</Text> : null}
        </Text>
      ) : null}
      <View
        className={`rounded-2xl bg-gray-100 px-4 flex-row items-center gap-3 ${
          multiline ? "min-h-28 py-3" : "h-14"
        }`}
      >
        {icon ? <MaterialIcons  name={icon} size={20} color="#9ca3af" /> : null}
      <TextInput
          style={[
            { flex: 1, fontSize: 16, color: "#111827" },
            Platform.OS === "web" ? { outlineStyle: "none" } : null,
          ]}
          value={value || ""}
          onChangeText={onChange}
          placeholder={placeholder || label}
          placeholderTextColor="#9ca3af"
          multiline={multiline}
          editable={editable}
          keyboardType={keyboardType}
          selectionColor="#111827"
          cursorColor="#111827"
        />
      </View>
    </View>
  );
};

export default FormInputBox;