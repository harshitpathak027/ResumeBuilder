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
                <View className="bg-white w-full rounded-xl overflow-hidden">

                 <View className="px-6 pt-6 pb-5 items-center">
                        <Text className="text-gray-900 text-lg font-bold text-center mb-1">
                            {title}
                        </Text>
                        <Text className="text-gray-700 text-base text-center">
                            {message || 'An unexpected error occurred. Please try again later.'}
                        </Text>
                    </View>

                    {/* Divider */}
                    <View className="h-px bg-gray-200" />

                    {/* OK Button */}
                    <TouchableOpacity className="py-4 items-center" activeOpacity={0.8} style={{ outlineStyle: 'none' }} onPress={handleOkPress}>

                        <Text className="text-blue-600 text-base font-medium">OK</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
        </>
    )
}
export default ErrorMessage 