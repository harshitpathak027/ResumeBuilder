import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';

import FormInputBox from '../../components/ui/FormInputBox';
import { API_BASE_URL } from '../../constants/api';

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please fill name, email and password');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Password and confirm password should be same');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password: password.trim(),
        }),
      });

      const message = await response.text();
      if (!response.ok) {
        Alert.alert('Signup Failed', message || 'Unable to register user');
        return;
      }

      Alert.alert('Signup Success', 'Your account is created. Please login now.');
      router.push('/login');
    } catch (error) {
      Alert.alert('Error', 'Unable to connect to server');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1 p-4 mt-8 bg-gray-50">
      <View className="flex-row items-center gap-3 mb-4">
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8}>
          <MaterialIcons name="arrow-back" size={24} color="#0073D5" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold">Signup</Text>
      </View>

      <View className="bg-white rounded-2xl p-4">
        <FormInputBox
          label="Full Name"
          value={name}
          onChange={setName}
          icon="badge"
          placeholder="Enter full name"
        />
        <FormInputBox
          label="Email"
          value={email}
          onChange={setEmail}
          icon="email"
          placeholder="Enter email"
          keyboardType="email-address"
        />
        <FormInputBox
          label="Password"
          value={password}
          onChange={setPassword}
          icon="lock"
          placeholder="Enter password"
        />
        <FormInputBox
          label="Confirm Password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          icon="lock-outline"
          placeholder="Re-enter password"
        />

        <TouchableOpacity
          className="bg-blue-600 rounded-xl py-3 items-center justify-center mt-2"
          activeOpacity={0.85}
          onPress={onSignup}
          disabled={submitting}
        >
          <Text className="text-white font-semibold">{submitting ? 'Creating account...' : 'Create Account'}</Text>
        </TouchableOpacity>

        <View className="flex-row justify-center mt-4 gap-1">
          <Text className="text-gray-600">Already have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text className="text-blue-600 font-semibold">Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
