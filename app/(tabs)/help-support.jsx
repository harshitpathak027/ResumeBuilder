import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { showErrorMessage } from '../../utils/errorMessageBus';

export default function HelpSupportScreen() {
  const router = useRouter();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const onSend = () => {
    if (!subject.trim() || !message.trim()) {
      showErrorMessage('Missing Details', 'Please enter subject and message');
      return;
    }

    showErrorMessage('Message Sent', 'Our support team will contact you at your registered email.');
    setSubject('');
    setMessage('');
  };

  return (
    <View className="flex-1 bg-gray-100">
      <View className="flex-row items-center gap-3 px-4 pt-10 pb-3 border-b border-gray-200 bg-white">
        <TouchableOpacity activeOpacity={0.85} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Help & Support</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-3" contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
        <Text className="text-xl font-bold text-gray-900 mb-2">Get in Touch</Text>

        <View className="flex-row gap-3 mb-4">
          <View className="flex-1 bg-white rounded-2xl p-4 shadow-black">
            <View className="w-14 h-14 bg-blue-100 rounded-2xl items-center justify-center mb-2">
              <MaterialIcons name="email" size={26} color="#1976D2" />
            </View>
            <Text className="text-lg font-bold text-gray-900 mb-1">Email Support</Text>
            <Text className="text-gray-500">er.harshitpathak@outlook.com</Text>
          </View>

          <View className="flex-1 bg-white rounded-2xl p-4 shadow-black">
            <View className="w-14 h-14 bg-emerald-100 rounded-2xl items-center justify-center mb-2">
              <MaterialIcons name="chat-bubble-outline" size={26} color="#10B981" />
            </View>
            <Text className="text-lg font-bold text-gray-900 mb-1">Live Chat</Text>
            <Text className="text-gray-500">Available 9AM-9PM EST</Text>
          </View>
        </View>

        <Text className="text-xl font-bold text-gray-900 mb-2">Send us a Message</Text>

        <View className="bg-white rounded-2xl p-4 shadow-black">
          <Text className="text-gray-500 text-base font-semibold mb-2">SUBJECT</Text>
          <TextInput
            className="bg-gray-200 rounded-2xl px-4 py-3 text-base text-gray-700 mb-4"
            placeholder="How can we help?"
            placeholderTextColor="#6B7280"
            value={subject}
            onChangeText={setSubject}
          />

          <Text className="text-gray-500 text-base font-semibold mb-2">MESSAGE</Text>
          <TextInput
            className="bg-gray-200 rounded-2xl px-4 py-3 text-base text-gray-700 mb-4"
            placeholder="Describe your issue..."
            placeholderTextColor="#6B7280"
            value={message}
            onChangeText={setMessage}
            multiline
            textAlignVertical="top"
            style={{ minHeight: 140 }}
          />

          <TouchableOpacity
            className="bg-blue-600 rounded-2xl py-3 items-center justify-center"
            activeOpacity={0.85}
            onPress={onSend}
          >
            <Text className="text-white text-lg font-semibold">Send Message</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
