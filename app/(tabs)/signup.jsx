import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated, Dimensions, Easing, Platform,
  Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, ScrollView
} from 'react-native';
import LottieView from 'lottie-react-native';
import { API_BASE_URL } from '../../constants/api';
import { showErrorMessage } from '../../utils/errorMessageBus';

const { width } = Dimensions.get('window');
const ANIMATION_SIZE = Platform.OS === 'web' ? 160 : Math.min(Math.max(width * 0.45, 250), 250);
const TYPING_TEXT = "Hi! Let's get started";

const C = {
  amber: '#EF9F27',
  brown: '#7B3F00',
  darkBrown: '#412402',
  lightAmber: '#FAC775',
  cream: '#FFF8EE',
  amberBorder: '#BA7517',
  green: '#639922',
};

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [typingDone, setTypingDone] = useState(false);
  const cursorOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      i++;
      setDisplayedText(TYPING_TEXT.slice(0, i));
      if (i >= TYPING_TEXT.length) { clearInterval(t); setTypingDone(true); }
    }, 70);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const blink = Animated.loop(Animated.sequence([
      Animated.timing(cursorOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
      Animated.timing(cursorOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]));
    blink.start();
    if (typingDone) {
      const t = setTimeout(() => blink.stop(), 2000);
      return () => clearTimeout(t);
    }
    return () => blink.stop();
  }, [typingDone]);

  const getMissingFields = () => {
    const missing = [];
    if (!name.trim()) missing.push('Full Name');
    if (!email.trim()) missing.push('Email');
    if (!password.trim()) missing.push('Password');
    if (!confirmPassword.trim()) missing.push('Confirm Password');
    return missing;
  };

  const isFormComplete = getMissingFields().length === 0;

  const onSignup = async () => {
    const missingFields = getMissingFields();
    if (missingFields.length > 0) {
      showErrorMessage('Missing Fields', `Please fill: ${missingFields.join(', ')}`);
      return;
    }

    if (password !== confirmPassword) {
      showErrorMessage('Password Mismatch', 'Password and confirm password should be same');
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
        showErrorMessage('Failed', message || 'Unable to register user');
        return;
      }

      showErrorMessage('Success', 'Your account is created. Please login now.');
      router.push('/login');
    } catch (error) {
      showErrorMessage('Error', `${error?.message || 'Unable to connect to server'}\nAPI: ${API_BASE_URL}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.cream }} behavior="padding">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">

        {/* Golden header */}
        <View style={{
          backgroundColor: C.lightAmber,
          paddingTop: 60,
          paddingBottom: 32,
          alignItems: 'center',
          borderBottomLeftRadius: 36,
          borderBottomRightRadius: 36,
        }}>
          {/* Back button */}
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.8}
            style={{ position: 'absolute', top: 60, left: 20, zIndex: 20 }}
          >
            <MaterialIcons name="arrow-back" size={24} color={C.darkBrown} />
          </TouchableOpacity>

          <Text style={{ fontSize: 11, fontWeight: '500', color: C.darkBrown, letterSpacing: 2, marginBottom: 8 }}>
            RESUMEBUILDER
          </Text>

          {/* Lion + speech bubble */}
          <View style={{ position: 'relative', alignItems: 'center' }}>
            <View style={{
              position: 'absolute',
              top: 22,
              left: ANIMATION_SIZE - 80,
              zIndex: 10,
              backgroundColor: '#fff',
              borderRadius: 10,
              borderWidth: 1.5,
              borderColor: C.amberBorder,
              paddingHorizontal: 10,
              paddingVertical: 5,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              {/* Bubble tail */}
              <View style={{
                position: 'absolute',
                left: -7,
                top: 8,
                borderTopWidth: 5,
                borderBottomWidth: 5,
                borderRightWidth: 7,
                borderTopColor: 'transparent',
                borderBottomColor: 'transparent',
                borderRightColor: C.amberBorder,
              }} />
              <View style={{
                position: 'absolute',
                left: -4,
                top: 9,
                borderTopWidth: 4,
                borderBottomWidth: 4,
                borderRightWidth: 5,
                borderTopColor: 'transparent',
                borderBottomColor: 'transparent',
                borderRightColor: '#fff',
                zIndex: 1,
              }} />
              <Text style={{ fontSize: 12, color: C.darkBrown, fontWeight: '500' }}>
                {displayedText}
              </Text>
              {!typingDone && (
                <Animated.Text style={{ fontSize: 12, color: C.amberBorder, fontWeight: '500', opacity: cursorOpacity }}>
                  |
                </Animated.Text>
              )}
            </View>

            <View style={{ width: ANIMATION_SIZE, height: ANIMATION_SIZE, overflow: 'hidden' }}>
              <LottieView
                source={require('../../assets/images/lionblink.json')}
                autoPlay
                loop
                resizeMode="cover"
                style={{ width: '100%', height: '100%' }}
              />
            </View>
          </View>

          <Text style={{ fontSize: 14, color: C.darkBrown, fontWeight: '500', marginTop: 8 }}>
            Create your account
          </Text>
        </View>

        {/* Form */}
        <View style={{ padding: 20 }}>

          {/* Full Name field */}
          <View style={{ marginBottom: 8 }}>
            <Text style={{ fontSize: 11, fontWeight: '500', color: C.brown, marginBottom: 4, letterSpacing: 1 }}>
              FULL NAME
            </Text>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#fff',
              borderWidth: 1.5,
              borderColor: C.amber,
              borderRadius: 12,
              paddingHorizontal: 12,
            }}>
              <MaterialIcons name="badge" size={18} color={C.amberBorder} />
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter full name"
                placeholderTextColor="#B89A78"
                style={{
                  flex: 1,
                  marginLeft: 8,
                  fontSize: 14,
                  color: C.darkBrown,
                  paddingVertical: 10,
                }}
              />
            </View>
          </View>

          {/* Email field */}
          <View style={{ marginBottom: 8 }}>
            <Text style={{ fontSize: 11, fontWeight: '500', color: C.brown, marginBottom: 4, letterSpacing: 1 }}>
              EMAIL
            </Text>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#fff',
              borderWidth: 1.5,
              borderColor: C.amber,
              borderRadius: 12,
              paddingHorizontal: 12,
            }}>
              <MaterialIcons name="mail-outline" size={18} color={C.amberBorder} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter email"
                placeholderTextColor="#B89A78"
                keyboardType="email-address"
                autoCapitalize="none"
                style={{
                  flex: 1,
                  marginLeft: 8,
                  fontSize: 14,
                  color: C.darkBrown,
                  paddingVertical: 10,
                }}
              />
            </View>
          </View>

          {/* Password field */}
          <View style={{ marginBottom: 8 }}>
            <Text style={{ fontSize: 11, fontWeight: '500', color: C.brown, marginBottom: 4, letterSpacing: 1 }}>
              PASSWORD
            </Text>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#fff',
              borderWidth: 1.5,
              borderColor: C.amber,
              borderRadius: 12,
              paddingHorizontal: 12,
            }}>
              <MaterialIcons name="lock" size={18} color={C.amberBorder} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter password"
                placeholderTextColor="#B89A78"
                secureTextEntry
                style={{
                  flex: 1,
                  marginLeft: 8,
                  fontSize: 14,
                  color: C.darkBrown,
                  paddingVertical: 10,
                }}
              />
            </View>
          </View>

          {/* Confirm Password field */}
          <View style={{ marginBottom: 8 }}>
            <Text style={{ fontSize: 11, fontWeight: '500', color: C.brown, marginBottom: 4, letterSpacing: 1 }}>
              CONFIRM PASSWORD
            </Text>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#fff',
              borderWidth: 1.5,
              borderColor: C.amber,
              borderRadius: 12,
              paddingHorizontal: 12,
            }}>
              <MaterialIcons name="lock-outline" size={18} color={C.amberBorder} />
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter password"
                placeholderTextColor="#B89A78"
                secureTextEntry
                style={{
                  flex: 1,
                  marginLeft: 8,
                  fontSize: 14,
                  color: C.darkBrown,
                  paddingVertical: 10,
                }}
              />
            </View>
          </View>

          {/* CTA Button */}
          <TouchableOpacity
            style={{
              backgroundColor: isFormComplete ? C.amber : C.lightAmber,
              borderRadius: 12,
              paddingVertical: 13,
              alignItems: 'center',
              marginTop: 4,
              flexDirection: 'row',
              justifyContent: 'center',
            }}
            onPress={onSignup}
            activeOpacity={0.85}
            disabled={submitting}
          >
            <Text style={{ color: C.darkBrown, fontSize: 14, fontWeight: '500' }}>
              {submitting ? 'Creating account...' : 'Create Account'}
            </Text>
            {!submitting && (
              <MaterialIcons name="arrow-forward" size={18} color={C.darkBrown} style={{ marginLeft: 6 }} />
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 16 }}>
            <View style={{ flex: 1, height: 0.5, backgroundColor: C.amber, opacity: 0.3 }} />
            <Text style={{ fontSize: 11, color: C.brown, marginHorizontal: 8 }}>already a member?</Text>
            <View style={{ flex: 1, height: 0.5, backgroundColor: C.amber, opacity: 0.3 }} />
          </View>

          {/* Login row */}
          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <Text style={{ color: C.brown, fontSize: 13 }}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={{ color: C.amberBorder, fontSize: 13, fontWeight: '500' }}>Login</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
