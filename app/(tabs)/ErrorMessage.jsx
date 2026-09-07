import { MaterialIcons } from "@expo/vector-icons";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { triggerVibration } from "../../components/constant/vibration";

const ErrorMessage = ({ message, title = "SnapResume", visible, onClose }) => {
    const handleOkPress = async () => {
        await triggerVibration("tap");
        onClose?.();
    };

    return (
        <>
         <Modal
            transparent={true}
            animationType="fade"
            statusBarTranslucent={true}  // ← KEY: covers status bar too
            visible={visible}
                onRequestClose={onClose}

        >

            <View className="flex-1 items-center justify-center px-8 bg-black/25">
                <View className="w-full overflow-hidden rounded-[24px] border border-[#D9E2EC] bg-white">

                 <View className="items-center px-6 pb-5 pt-6">
                        <View className="mb-3 h-12 w-12 items-center justify-center rounded-2xl bg-[#FDE2DD]">
                            <MaterialIcons name="info-outline" size={25} color="#E76F51" />
                        </View>
                        <Text className="mb-1 text-center text-lg font-bold text-[#102A43]">
                            {title}
                        </Text>
                        <Text className="text-center text-base text-[#486581]">
                            {message || 'An unexpected error occurred. Please try again later.'}
                        </Text>
                    </View>

                    {/* Divider */}
                    <View className="h-px bg-[#D9E2EC]" />

                    {/* OK Button */}
                    <TouchableOpacity className="py-4 items-center" activeOpacity={0.8} style={{ outlineStyle: 'none' }} onPress={handleOkPress}>

                        <Text className="text-base font-bold text-[#E76F51]">OK</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
        </>
    )
}
export default ErrorMessage 