import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import {
  Animated, Dimensions, Easing, Keyboard, Platform,
  Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, ScrollView
} from 'react-native';
import LottieView from 'lottie-react-native';
import { API_BASE_URL } from '../../constants/api';
import { setAuthSession } from '../../utils/authStorage';
import { showErrorMessage } from '../../utils/errorMessageBus';

const { width } = Dimensions.get('window');
const ANIMATION_SIZE = Platform.OS === 'web' ? 160 : Math.min(Math.max(width * 0.45, 250), 250);

const GREETING_TEXT = 'Hi! Login here';

const C = {
  amber: '#EF9F27',
  brown: '#7B3F00',
  darkBrown: '#412402',
  lightAmber: '#FAC775',
  cream: '#FFF8EE',
  amberBorder: '#BA7517',
  green: '#639922',
  orange: '#ec9303',
  white: '#ffffff`',
  red: '#C0392B',
};

// Simple, forgiving email check — good enough to catch obvious typos
// without being a strict RFC validator.
const looksLikeEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

// Web doesn't support the Haptics module, so every call is guarded.
const vibrate = (tone) => {
  if (Platform.OS === 'web') return;
  try {
    if (tone === 'success') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (tone === 'error') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  } catch {
    // Haptics not available on this device — fail silently.
  }
};

export default function LoginScreen() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState('email');

  // Bubble message state — driven by what's happening in the form,
  // not just the initial greeting.
  const [bubbleText, setBubbleText] = useState(GREETING_TEXT);
  const [bubbleTone, setBubbleTone] = useState('neutral'); // 'neutral' | 'success' | 'error'
  const [displayedText, setDisplayedText] = useState('');
  const [typingDone, setTypingDone] = useState(false);

  const cursorOpacity = useRef(new Animated.Value(1)).current;
  const pwSlide = useRef(new Animated.Value(30)).current;
  const pwOpacity = useRef(new Animated.Value(0)).current;
  const typingIntervalRef = useRef(null);

  // Re-runs the typewriter effect any time bubbleText changes.
  useEffect(() => {
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    setDisplayedText('');
    setTypingDone(false);
    let i = 0;
    typingIntervalRef.current = setInterval(() => {
      i++;
      setDisplayedText(bubbleText.slice(0, i));
      if (i >= bubbleText.length) {
        clearInterval(typingIntervalRef.current);
        setTypingDone(true);
      }
    }, 35);
    return () => clearInterval(typingIntervalRef.current);
  }, [bubbleText]);

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

  // Every bubble message now fires a matching haptic — light tap for
  // neutral, success buzz / error buzz for the rest.
  const sayBubble = (text, tone = 'neutral') => {
    setBubbleTone(tone);
    setBubbleText(text);
    vibrate(tone);
  };

  const goToPassword = () => {
    if (!identifier.trim()) return;
    Keyboard.dismiss();

    // Soft validation: nudge the user if it doesn't look like an email
    // or a reasonable username, but don't hard-block them.
    const trimmed = identifier.trim();
    const looksOk = trimmed.includes('@') ? looksLikeEmail(trimmed) : trimmed.length >= 3;

    if (!looksOk) {
      sayBubble("That doesn't look right — mind checking it? 🤔", 'error');
      return;
    }

    sayBubble('Great! Now enter your password 🔐', 'success');
    setStep('password');
    Animated.parallel([
      Animated.timing(pwSlide, { toValue: 0, duration: 350, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(pwOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
    ]).start();
  };

  const goBackToEmail = () => {
    Keyboard.dismiss();
    setStep('email');
    sayBubble("Sure, let's fix that — enter your email again", 'neutral');
  };

  const onLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      showErrorMessage('Missing Fields', 'Please fill all fields');
      return;
    }
    Keyboard.dismiss();
    setSubmitting(true);
    sayBubble('Hang tight, logging you in...', 'neutral');
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
      try { parsedBody = rawBody ? JSON.parse(rawBody) : null; } catch { parsedBody = null; }
      const isJson = parsedBody !== null;
      const responseBody = isJson ? parsedBody : rawBody;

      if (!response.ok) {
        const status = response.status;
        const serverMessage = isJson ? responseBody?.message : null;

        // Try to tell email-not-found apart from wrong-password when the
        // server gives us a hint; otherwise fall back to a general nudge.
        const lowerMsg = (serverMessage || '').toLowerCase();
        if (lowerMsg.includes('password')) {
          sayBubble("Oops, that password isn't right. Try again!", 'error');
        } else if (lowerMsg.includes('email') || lowerMsg.includes('user') || lowerMsg.includes('not found') || status === 404) {
          sayBubble("Can't find that account — check your email 🧐", 'error');
        } else {
          sayBubble("Hmm, something's off. Please try again.", 'error');
        }

        // showErrorMessage('Login Failed', serverMessage || 'Invalid credentials');
        return;
      }

      const token = isJson ? responseBody?.token : responseBody;
      const trimmedToken = token?.trim();
      if (!trimmedToken) {
        sayBubble('Something went wrong on our end. Try again?', 'error');
        // showErrorMessage('Login Failed', 'Token not received');
        return;
      }

      let resolvedUser = isJson ? responseBody?.user : null;
      if (!resolvedUser?.id) {
        try {
          const me = await fetch(`${API_BASE_URL}/users/me`, {
            headers: { Authorization: `Bearer ${trimmedToken}` },
          });
          if (me.ok) resolvedUser = await me.json();
        } catch { resolvedUser = isJson ? responseBody?.user : null; }
      }

      sayBubble("You're in! Welcome back 🎉", 'success');
      await setAuthSession({
        token: trimmedToken,
        user: resolvedUser || {
          name: isEmail ? '' : identifier.trim(),
          email: isEmail ? identifier.trim() : '',
        },
      });
      router.push('/');
    } catch (error) {
      sayBubble("Couldn't reach the server. Check your connection.", 'error');
      // showErrorMessage('Error', (error)?.message || 'Unable to connect');
    } finally {
      setSubmitting(false);
    }
  };

  const bubbleBorderColor = bubbleTone === 'error' ? C.red : bubbleTone === 'success' ? C.green : C.amberBorder;
  const bubbleTextColor = bubbleTone === 'error' ? C.red : C.darkBrown;

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.white }} behavior="padding">
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
          <Text style={{ fontSize: 11, fontWeight: '500', color: C.darkBrown, letterSpacing: 2, marginBottom: 12 }}>
            RESUMEBUILDER
          </Text>

          {/* Lion + speech bubble */}
          <View style={{ alignItems: 'center', width: '100%' }}>
            <View style={{
              width: '100%',
              paddingHorizontal: 20,
              alignItems: 'center',
              marginBottom: 6,
            }}>
              <View style={{
                maxWidth: '100%',
                backgroundColor: '#fff',
                borderRadius: 10,
                borderWidth: 1.5,
                borderColor: bubbleBorderColor,
                paddingHorizontal: 12,
                paddingVertical: 6,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Text style={{ fontSize: 12, color: bubbleTextColor, fontWeight: '500', textAlign: 'center', flexShrink: 1 }}>
                  {displayedText}
                </Text>
                {!typingDone && (
                  <Animated.Text style={{ fontSize: 12, color: bubbleBorderColor, fontWeight: '500', opacity: cursorOpacity }}>
                    |
                  </Animated.Text>
                )}
              </View>
              {/* Bubble tail pointing down to the lion */}
              <View style={{
                width: 0,
                height: 0,
                borderLeftWidth: 6,
                borderRightWidth: 6,
                borderTopWidth: 7,
                borderLeftColor: 'transparent',
                borderRightColor: 'transparent',
                borderTopColor: bubbleBorderColor,
                marginTop: -1,
              }} />
              <View style={{
                width: 0,
                height: 0,
                borderLeftWidth: 5,
                borderRightWidth: 5,
                borderTopWidth: 5,
                borderLeftColor: 'transparent',
                borderRightColor: 'transparent',
                borderTopColor: '#fff',
                marginTop: -7,
              }} />
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
            Welcome back!
          </Text>
        </View>

        {/* Step dots */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20, marginBottom: 4 }}>
          <View style={{
            width: step === 'email' ? 10 : 8,
            height: step === 'email' ? 10 : 8,
            borderRadius: 99,
            backgroundColor: step === 'email' ? C.amber : C.green,
            marginHorizontal: 3,
          }} />
          <View style={{
            width: step === 'password' ? 10 : 8,
            height: step === 'password' ? 10 : 8,
            borderRadius: 99,
            backgroundColor: C.amber,
            opacity: step === 'password' ? 1 : 0.3,
            marginHorizontal: 3,
          }} />
        </View>

        {/* Form */}
        <View style={{ padding: 20 }}>

          {/* Back button */}
          {step === 'password' && (
            <TouchableOpacity
              onPress={goBackToEmail}
              style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}
            >
              <MaterialIcons name="arrow-back" size={18} color={C.amberBorder} />
              <Text style={{ color: C.amberBorder, fontSize: 13, marginLeft: 4 }}>Back</Text>
            </TouchableOpacity>
          )}

          {/* Email field */}
          <View style={{ marginBottom: 8 }}>
            <Text style={{ fontSize: 11, fontWeight: '500', color: C.brown, marginBottom: 4, letterSpacing: 1 }}>
              EMAIL OR USERNAME
            </Text>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#fff',
              borderWidth: 1.5,
              borderColor: step === 'password' ? C.green : C.amber,
              borderRadius: 12,
              paddingHorizontal: 12,
            }}>
              <MaterialIcons name="mail-outline" size={18} color={C.amberBorder} />
              {step === 'email' ? (
                <TextInput
                  value={identifier}
                  onChangeText={setIdentifier}
                  placeholder="Enter email or username"
                  placeholderTextColor="#B89A78"
                  autoCapitalize="none"
                  style={{
                    flex: 1,
                    marginLeft: 8,
                    fontSize: 14,
                    color: C.darkBrown,
                    paddingVertical: 10,
                  }}
                />
              ) : (
                <Text style={{ flex: 1, marginLeft: 8, fontSize: 13, color: C.darkBrown, paddingVertical: 10 }}>
                  {identifier}
                </Text>
              )}
              {step === 'password' && (
                <MaterialIcons name="check-circle" size={18} color={C.green} />
              )}
            </View>
          </View>

          {/* Password field slides in */}
          {step === 'password' && (
            <Animated.View style={{
              marginBottom: 8,
              opacity: pwOpacity,
              transform: [{ translateY: pwSlide }],
            }}>
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
                  placeholder="Enter your password"
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
            </Animated.View>
          )}

          {/* CTA Button */}
          {step === 'email' ? (
            <TouchableOpacity
              style={{
                backgroundColor:identifier.trim()? C.orange:C.lightAmber,
                borderRadius: 12,
                paddingVertical: 13,
                alignItems: 'center',
                marginTop: 4,
                flexDirection: 'row',
                justifyContent: 'center',
              }}
              onPress={goToPassword}
              activeOpacity={0.85}
              disabled={!identifier.trim()}
            >
              <Text style={{ color: C.white, fontSize: 14, fontWeight: '500' }}>Continue</Text>
              <MaterialIcons name="arrow-forward" size={18} color={C.white} style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={{
                backgroundColor: password.trim() ? C.orange : C.lightAmber,
                borderRadius: 12,
                paddingVertical: 13,
                alignItems: 'center',
                marginTop: 4,
                flexDirection: 'row',
                justifyContent: 'center',
              }}
              onPress={onLogin}
              activeOpacity={0.85}
              disabled={submitting || !password.trim()}
            >
              <Text style={{ color: C.white, fontSize: 14, fontWeight: '500' }}>
                {submitting ? 'Logging in...' : 'Login to your account'}
              </Text>
              {!submitting && (
                <MaterialIcons name="arrow-forward" size={18} color={C.white} style={{ marginLeft: 6 }} />
              )}
            </TouchableOpacity>
          )}

          {/* Divider */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 16 }}>
            <View style={{ flex: 1, height: 0.5, backgroundColor: C.amber, opacity: 0.3 }} />
            <Text style={{ fontSize: 11, color: C.brown, marginHorizontal: 8 }}>new here?</Text>
            <View style={{ flex: 1, height: 0.5, backgroundColor: C.amber, opacity: 0.3 }} />
          </View>

          {/* Signup row */}
          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <Text style={{ color: C.brown, fontSize: 13 }}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/signup')}>
              <Text style={{ color: C.amberBorder, fontSize: 13, fontWeight: '500' }}>Sign up</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
