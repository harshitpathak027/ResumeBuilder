import { Text, View } from "react-native";

const FormSectionCard = ({ title, rightText, children }) => {
  return (
    <View className="bg-white rounded-3xl p-4 mx-4 mb-4 border border-gray-200">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-xl font-semibold text-gray-900">{title}</Text>
        {rightText ? <Text className="text-gray-500 text-sm">{rightText}</Text> : null}
      </View>
      {children}
    </View>
  );
};

export default FormSectionCard;