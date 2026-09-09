import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated, Easing, StyleSheet,
  Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, ScrollView, Linking
} from 'react-native';
import LottieView from 'lottie-react-native';
import { API_BASE_URL } from '../../constants/api';
import { showErrorMessage } from '../../utils/errorMessageBus';

const TYPING_TEXT = 'Join the learning fun!';
const MASCOT_SIZE = 200;

// Palette pulled directly from the uxpilot export: white canvas, a single
// bright blue for the brand/links, a single vivid green for the primary
// action, and neutral grays for fields and helper copy.
const T = {
  blue: '#3B82F6',
  orange: '#F5A623',
  green: '#58CC02',
  greenPressed: '#46A302',
  ink: '#141821',
  mascotBg: '#BFE7EA',
  fieldBg: '#F6F6F7',
  fieldBorder: '#E6E7EA',
  bubbleBorder: '#E6E7EA',
  placeholder: '#A9ADB6',
  caps: '#9AA0AC',
};

// Bounces a bit on press — applied to every touchable in the screen so
// interaction feels alive without relying on opacity flicker alone.
function Bouncy({ onPress, children, style, disabled, scaleTo = 0.97 }) {
  const scale = useRef(new Animated.Value(1)).current;
  const to = (v) => Animated.spring(scale, { toValue: v, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  return (
    <TouchableOpacity
      activeOpacity={1}
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => to(scaleTo)}
      onPressOut={() => to(1)}
      style={style}
    >
      <Animated.View style={{ transform: [{ scale }] }}>{children}</Animated.View>
    </TouchableOpacity>
  );
}

// Plain pill field, no icon by default — matches the mockup — but can
// show a show/hide toggle for password fields. Still animates its
// entrance (staggered via `delay`) for a bit of polish.
function FormField({ value, onChangeText, placeholder, secureTextEntry, keyboardType, autoCapitalize, delay = 0, onToggleSecure, secureVisible }) {
  const enterOpacity = useRef(new Animated.Value(0)).current;
  const enterY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(enterOpacity, { toValue: 1, duration: 380, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(enterY, { toValue: 0, duration: 380, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity: enterOpacity, transform: [{ translateY: enterY }], marginBottom: 12 }}>
      <View style={styles.fieldRow}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={T.placeholder}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          style={[styles.input, onToggleSecure && { paddingRight: 40 }]}
        />
        {onToggleSecure && (
          <TouchableOpacity onPress={onToggleSecure} style={styles.eyeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <MaterialIcons name={secureVisible ? 'visibility-off' : 'visibility'} size={20} color={T.caps} />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [typingDone, setTypingDone] = useState(false);
  const cursorOpacity = useRef(new Animated.Value(1)).current;
  const stagePop = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.spring(stagePop, { toValue: 1, friction: 6, tension: 60, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      i++;
      setDisplayedText(TYPING_TEXT.slice(0, i));
      if (i >= TYPING_TEXT.length) { clearInterval(t); setTypingDone(true); }
    }, 40);
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
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#FFFFFF' }} behavior="padding">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={{ paddingHorizontal: 20, paddingTop: 22, paddingBottom: 32 }}>

          {/* Top bar: back arrow / brand / help */}
          <View style={styles.topBar}>
            <Bouncy onPress={() => router.back()} scaleTo={0.85}>
              <MaterialIcons name="arrow-back" size={22} color="#9AA0AC" />
            </Bouncy>

            <View style={styles.brandRow}>
              <MaterialIcons name="school" size={18} color={T.orange} style={{ marginRight: 6 }} />
              <Text style={styles.brand}>Resume Builder</Text>
            </View>

            <Text style={styles.help}>HELP</Text>
          </View>

          {/* Mascot stage: speech bubble centered above the mascot */}
          <Animated.View style={{ alignItems: 'center', marginTop: 26, transform: [{ scale: stagePop }] }}>
            <View style={styles.bubbleWrap}>
              <Text style={styles.bubbleText}>
                {displayedText}
                {!typingDone && (
                  <Animated.Text style={{ opacity: cursorOpacity, color: T.ink }}> |</Animated.Text>
                )}
              </Text>
            </View>
            <View style={styles.bubbleTailOuter} />
            <View style={styles.bubbleTailInner} />

            <View style={styles.mascotBadge}>
              <LottieView
                source={require('../../assets/images/lionblink.json')}
                autoPlay
                loop
                resizeMode="cover"
                style={{ width: '100%', height: '100%' }}
              />
            </View>
          </Animated.View>

          <Text style={styles.heading}>CREATE PROFILE</Text>

          <FormField value={name} onChangeText={setName} placeholder="Full Name" delay={0} />
          <FormField value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" autoCapitalize="none" delay={60} />
          <FormField value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry={!showPassword} onToggleSecure={() => setShowPassword((v) => !v)} secureVisible={showPassword} delay={120} />
          <FormField value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Confirm Password" secureTextEntry={!showConfirmPassword} onToggleSecure={() => setShowConfirmPassword((v) => !v)} secureVisible={showConfirmPassword} delay={160} />

          <Bouncy onPress={onSignup} disabled={submitting} scaleTo={0.98}>
            <View style={styles.ctaBase}>
              <View style={[styles.cta, submitting && { backgroundColor: T.greenPressed }]}>
                <Text style={styles.ctaText}>
                  {submitting ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
                </Text>
              </View>
            </View>
          </Bouncy>

          {/* <View style={styles.termsBlock}>
            <Text style={styles.termsCaps}>BY SIGNING UP, YOU AGREE TO OUR</Text>
            <View style={{ flexDirection: 'row' }}>
              <Bouncy onPress={() => Linking.openURL('https://example.com/terms')} scaleTo={0.92}>
                <Text style={styles.termsLink}>Terms</Text>
              </Bouncy>
              <Text style={styles.termsText}> and </Text>
              <Bouncy onPress={() => Linking.openURL('https://example.com/privacy')} scaleTo={0.92}>
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Bouncy>
            </View>
          </View> */}

          <View style={styles.loginBlock}>
            <Text style={styles.termsCaps}>HAVE AN ACCOUNT?</Text>
            <Bouncy onPress={() => router.push('/login')} scaleTo={0.92}>
              <Text style={[styles.termsLink, { marginTop: 2 }]}>Log in</Text>
            </Bouncy>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brand: {
    fontSize: 16,
    fontWeight: '700',
    color: T.blue,
  },
  help: {
    fontSize: 12,
    fontWeight: '600',
    color: T.blue,
    letterSpacing: 0.4,
  },
  bubbleWrap: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: T.bubbleBorder,
    paddingHorizontal: 16,
    paddingVertical: 9,
    shadowColor: '#000000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  bubbleText: {
    fontSize: 13.5,
    fontWeight: '500',
    color: T.ink,
    textAlign: 'center',
  },
  bubbleTailOuter: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: T.bubbleBorder,
    marginTop: -1,
  },
  bubbleTailInner: {
    width: 0,
    height: 0,
    borderLeftWidth: 4.5,
    borderRightWidth: 4.5,
    borderTopWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFFFFF',
    marginTop: -6,
    marginBottom: 16,
  },
  mascotBadge: {
    width: MASCOT_SIZE,
    height: MASCOT_SIZE,
    borderRadius: 18,

    overflow: 'hidden',
    marginBottom: 24,
  },
  heading: {
    fontSize: 19,
    fontWeight: '700',
    color: T.ink,
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  fieldRow: {
    position: 'relative',
    justifyContent: 'center',
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  input: {
    backgroundColor: T.fieldBg,
    borderWidth: 1,
    borderColor: T.fieldBorder,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 14,
    color: T.ink,
    shadowColor: '#000000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  ctaBase: {
    backgroundColor: T.greenPressed,
    borderRadius: 16,
    paddingBottom: 4,
    marginTop: 8,
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cta: {
    backgroundColor: T.green,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  termsBlock: {
    alignItems: 'center',
    marginTop: 24,
  },
  loginBlock: {
    alignItems: 'center',
    marginTop: 20,
  },
  termsCaps: {
    fontSize: 10.5,
    fontWeight: '600',
    color: T.caps,
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  termsText: {
    fontSize: 13,
    color: T.ink,
  },
  termsLink: {
    fontSize: 13,
    color: T.blue,
    fontWeight: '600',
  },
});