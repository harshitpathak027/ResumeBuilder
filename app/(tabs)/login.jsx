import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import {
  Animated, Keyboard, Platform, StyleSheet,
  Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, ScrollView
} from 'react-native';
import LottieView from 'lottie-react-native';
import { API_BASE_URL } from '../../constants/api';
import { setAuthSession } from '../../utils/authStorage';
import { showErrorMessage } from '../../utils/errorMessageBus';

const GREETING_TEXT = 'Welcome back!';
const MASCOT_SIZE = 200;

// Same palette system as signup.jsx, swapped to blue for the primary
// action so the two screens read as one product (brand blue stays the
// same on both).
const T = {
  blue: '#3B82F6',
  green: '#58CC02',
  greenPressed: '#46A302',
  orange: '#F5A623',
  ink: '#141821',
  mascotBg: '#BFE7EA',
  fieldBg: '#F6F6F7',
  fieldBorder: '#E6E7EA',
  bubbleBorder: '#E6E7EA',
  placeholder: '#A9ADB6',
  caps: '#9AA0AC',
  red: '#E5484D',
};

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

// Simple, forgiving email check — good enough to catch obvious typos
// without being a strict RFC validator.
const looksLikeEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

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

// Plain pill field, no icon by default — matches the signup screen — but
// can show a show/hide toggle for password fields.
function FormField({ value, onChangeText, placeholder, secureTextEntry, keyboardType, autoCapitalize, onToggleSecure, secureVisible }) {
  return (
    <View style={{ marginBottom: 12 }}>
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
    </View>
  );
}

export default function LoginScreen() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [bubbleText, setBubbleText] = useState(GREETING_TEXT);
  const [bubbleTone, setBubbleTone] = useState('neutral'); // 'neutral' | 'success' | 'error'
  const [displayedText, setDisplayedText] = useState('');
  const [typingDone, setTypingDone] = useState(false);

  const cursorOpacity = useRef(new Animated.Value(1)).current;
  const typingIntervalRef = useRef(null);
  const stagePop = useRef(new Animated.Value(0.85)).current;
  const bubblePop = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(stagePop, { toValue: 1, friction: 6, tension: 60, useNativeDriver: true }).start();
  }, []);

  // Re-runs the typewriter effect any time bubbleText changes, plus a
  // small pop so a new message feels like it just arrived.
  useEffect(() => {
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    setDisplayedText('');
    setTypingDone(false);

    bubblePop.setValue(0.9);
    Animated.spring(bubblePop, { toValue: 1, friction: 5, tension: 90, useNativeDriver: true }).start();

    let i = 0;
    typingIntervalRef.current = setInterval(() => {
      i++;
      setDisplayedText(bubbleText.slice(0, i));
      if (i >= bubbleText.length) {
        clearInterval(typingIntervalRef.current);
        setTypingDone(true);
      }
    }, 32);
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

  const sayBubble = (text, tone = 'neutral') => {
    setBubbleTone(tone);
    setBubbleText(text);
    vibrate(tone);
  };

  const onLogin = async () => {
    Keyboard.dismiss();

    const trimmedId = identifier.trim();
    if (!trimmedId || !password.trim()) {
      sayBubble('Please fill in both fields to continue', 'error');
      return;
    }

    const looksOk = trimmedId.includes('@') ? looksLikeEmail(trimmedId) : trimmedId.length >= 3;
    if (!looksOk) {
      sayBubble("That doesn't look right — mind checking it? 🤔", 'error');
      return;
    }

    setSubmitting(true);
    sayBubble('Hang tight, logging you in...', 'neutral');
    try {
      const isEmail = trimmedId.includes('@');
      const payload = isEmail
        ? { email: trimmedId, password: password.trim() }
        : { name: trimmedId, password: password.trim() };

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

        const lowerMsg = (serverMessage || '').toLowerCase();
        if (lowerMsg.includes('password')) {
          sayBubble("Oops, that password isn't right. Try again!", 'error');
        } else if (lowerMsg.includes('email') || lowerMsg.includes('user') || lowerMsg.includes('not found') || status === 404) {
          sayBubble("Can't find that account — check your email 🧐", 'error');
        } else {
          sayBubble("Hmm, something's off. Please try again.", 'error');
        }
        return;
      }

      const token = isJson ? responseBody?.token : responseBody;
      const trimmedToken = token?.trim();
      if (!trimmedToken) {
        sayBubble('Something went wrong on our end. Try again?', 'error');
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
          name: isEmail ? '' : trimmedId,
          email: isEmail ? trimmedId : '',
        },
      });
      router.push('/');
    } catch (error) {
      sayBubble("Couldn't reach the server. Check your connection.", 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const bubbleBorderColor = bubbleTone === 'error' ? T.red : bubbleTone === 'success' ? T.green : T.bubbleBorder;
  const bubbleTextColor = bubbleTone === 'error' ? T.red : T.ink;

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#FFFFFF' }} behavior="padding">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={{ paddingHorizontal: 20, paddingTop: 22, paddingBottom: 32 }}>

          {/* Top bar: brand / help (no back arrow — this is an entry screen) */}
          <View style={styles.topBar}>
            <View style={styles.brandRow}>
              <MaterialIcons name="school" size={18} color={T.orange} style={{ marginRight: 6 }} />
              <Text style={styles.brand}>Resume Builder</Text>
            </View>
            <Text style={styles.help}>HELP</Text>
          </View>

          {/* Mascot stage: speech bubble centered above the mascot */}
          <Animated.View style={{ alignItems: 'center', marginTop: 26, transform: [{ scale: stagePop }] }}>
            <Animated.View style={[styles.bubbleWrap, { borderColor: bubbleBorderColor, transform: [{ scale: bubblePop }] }]}>
              <Text style={[styles.bubbleText, { color: bubbleTextColor }]}>
                {displayedText}
                {!typingDone && (
                  <Animated.Text style={{ opacity: cursorOpacity, color: bubbleBorderColor }}> |</Animated.Text>
                )}
              </Text>
            </Animated.View>
            <View style={[styles.bubbleTailOuter, { borderTopColor: bubbleBorderColor }]} />
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

          <Text style={styles.heading}>LOG IN</Text>

          <FormField value={identifier} onChangeText={setIdentifier} placeholder="Username or Email" autoCapitalize="none" />
          <FormField value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry={!showPassword} onToggleSecure={() => setShowPassword((v) => !v)} secureVisible={showPassword} />

          <Bouncy onPress={onLogin} disabled={submitting} scaleTo={0.98}>
            <View style={styles.ctaBase}>
              <View style={[styles.cta, submitting && { backgroundColor: T.greenPressed }]}>
                <Text style={styles.ctaText}>
                  {submitting ? 'LOGGING IN...' : 'LOG IN'}
                </Text>
              </View>
            </View>
          </Bouncy>

          <View style={styles.loginBlock}>
            <Text style={styles.termsCaps}>DON'T HAVE AN ACCOUNT?</Text>
            <Bouncy onPress={() => router.push('/signup')} scaleTo={0.92}>
              <Text style={[styles.termsLink, { marginTop: 2 }]}>Sign up</Text>
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
  loginBlock: {
    alignItems: 'center',
    marginTop: 24,
  },
  termsCaps: {
    fontSize: 10.5,
    fontWeight: '600',
    color: T.caps,
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  termsLink: {
    fontSize: 13,
    color: T.blue,
    fontWeight: '600',
  },
});