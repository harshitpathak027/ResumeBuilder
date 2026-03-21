import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import FormInputBox from '../../components/ui/FormInputBox';
import { API_BASE_URL } from '../../constants/api';
import { setAuthSession } from '../../utils/authStorage';
import { showErrorMessage } from '../../utils/errorMessageBus';

export default function LoginScreen() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const getMissingFields = () => {
    const missing = [];
    if (!identifier.trim()) missing.push('Email or Username');
    if (!password.trim()) missing.push('Password');
    return missing;
  };

  const isFormComplete = getMissingFields().length === 0;

  const onLogin = async () => {
    const missingFields = getMissingFields();
    if (missingFields.length > 0) {
      showErrorMessage('Missing Fields', `Please fill: ${missingFields.join(', ')}`);
      return;
    }

    setSubmitting(true);
    try {
      const isEmail = identifier.includes('@');
      const payload = isEmail
        ? { email: identifier.trim(), password: password.trim() }
        : { name: identifier.trim(), password: password.trim() };

      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const rawBody = await response.text();
      let parsedBody = null;
      try {
        parsedBody = rawBody ? JSON.parse(rawBody) : null;
      } catch {
        parsedBody = null;
      }
      const isJson = parsedBody !== null;
      const responseBody = isJson ? parsedBody : rawBody;

      if (!response.ok) {
        const errorMessage = isJson
          ? responseBody?.message || 'Invalid username/email or password'
          : responseBody || 'Invalid username/email or password';
        showErrorMessage('Login Failed', errorMessage);
        return;
      }

      const token = isJson ? responseBody?.token : responseBody;
      const trimmedToken = token?.trim();
      if (!trimmedToken) {
        showErrorMessage('Login Failed', 'Token not received from server');
        return;
      }

      let resolvedUser = isJson ? responseBody?.user : null;
      if (!resolvedUser?.id) {
        try {
          const meResponse = await fetch(`${API_BASE_URL}/users/me`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${trimmedToken}`,
            },
          });

          if (meResponse.ok) {
            resolvedUser = await meResponse.json();
          }
        } catch {
          resolvedUser = isJson ? responseBody?.user : null;
        }
      }

      await setAuthSession({
        token: trimmedToken,
        user: resolvedUser || {
          name: isEmail ? '' : identifier.trim(),
          email: isEmail ? identifier.trim() : '',
        },
      });


      router.push('/');
    } catch (error) {
      showErrorMessage('Error', `${error?.message || 'Unable to connect to server'}\nAPI: ${API_BASE_URL}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1 p-4 mt-8  items-center justify-center bg-gray-50">
      <View className="flex-row items-center gap-3 mb-4">
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8}>
          <MaterialIcons name="arrow-back" size={24} color="#0073D5" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold">Login</Text>
      </View>

      <View className="bg-white w-full rounded-2xl p-4">
        <FormInputBox
          label="Email or Username"
          value={identifier}
          onChange={setIdentifier}
          icon="person"
          placeholder="Enter email or username"
          required
        />
        <FormInputBox
          label="Password"
          value={password}
          onChange={setPassword}
          icon="lock"
          placeholder="Enter password"
          required
        />

        <TouchableOpacity
          className={`${isFormComplete ? 'bg-blue-600' : 'bg-blue-300'} rounded-xl py-3 items-center justify-center mt-2`}
          activeOpacity={0.85}
          onPress={onLogin}
          disabled={submitting}
        >
          <Text className="text-white font-semibold">{submitting ? 'Logging in...' : 'Login'}</Text>
        </TouchableOpacity>

        <View className="flex-row justify-center mt-4 gap-1">
          <Text className="text-gray-600">Don’t have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/signup')}>
            <Text className="text-blue-600 font-semibold">Signup</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
