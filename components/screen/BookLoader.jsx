import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, StyleSheet, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const MESSAGES = [
  
  'Finalizing...',
];

const LINES = [
  { widthPct: 0.75, height: 10, delay: 0 },
  { widthPct: 0.55, height: 7,  delay: 200 },
  { widthPct: 0.80, height: 5,  delay: 400 },
  { widthPct: 0.60, height: 5,  delay: 600 },
  { widthPct: 0.70, height: 5,  delay: 800 },
  { widthPct: 0.50, height: 5,  delay: 1000 },
  { widthPct: 0.65, height: 5,  delay: 1200 },
  { widthPct: 0.45, height: 5,  delay: 1400 },
];

const DOC_WIDTH = 80;
const DOC_HEIGHT = 115;

function ResumeLine({ widthPct, height, delay, docWidth, pulse }) {
  const maxW = docWidth - 24;
  const lineWidth = maxW * widthPct;
  const animatedOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.25, 0.95],
  });

  const delayOpacity = delay / 2500;

  return (
    <Animated.View style={{ opacity: animatedOpacity, marginBottom: 13 + delayOpacity }}>
      <LinearGradient
        colors={['#501eb4', '#b450ff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.line,
          { height, borderRadius: height / 2, width: lineWidth },
        ]}
      />
    </Animated.View>
  );
}

export default function BookLoader({ visible = true }) {
  const pulse = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cursorOpacity = useRef(new Animated.Value(1)).current;

  const [msgIndex, setMsgIndex] = useState(0);

  const TOTAL_DURATION = 2400;

  useEffect(() => {
    Animated.timing(cardOpacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(cursorOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();

    const msgInterval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % MESSAGES.length);
    }, TOTAL_DURATION / MESSAGES.length);

    return () => {
      clearInterval(msgInterval);
    };
  }, []);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade" statusBarTranslucent>
      <View style={styles.overlay} pointerEvents="auto">
        <Animated.View style={[styles.card, { opacity: cardOpacity }]}>
          <View style={styles.dogEar} />

          <View style={styles.linesWrap}>
            {LINES.map((line, i) => (
              <ResumeLine
                key={i}
                widthPct={line.widthPct}
                height={line.height}
                delay={line.delay}
                docWidth={DOC_WIDTH}
                pulse={pulse}
              />
            ))}

            <Animated.View style={[styles.cursor, { opacity: cursorOpacity }]} />
          </View>
        </Animated.View>

        <Text style={styles.message}>{MESSAGES[msgIndex]}</Text>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  card: {
    width: DOC_WIDTH,
    height: DOC_HEIGHT,
    backgroundColor: '#fafafa',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#e0d9f5',
    padding: 16,
    overflow: 'hidden',
    shadowColor: '#7c3aed',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    elevation: 4,
  },
  dogEar: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 28,
    height: 28,
    backgroundColor: '#ede9fe',
    borderBottomLeftRadius: 8,
  },
  linesWrap: {
    flex: 1,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  line: {},
  cursor: {
    width: 2,
    height: 14,
    backgroundColor: '#9333ea',
    borderRadius: 1,
    marginTop: -4,
    marginLeft: 2,
  },
  message: {
    marginTop: 24,
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.95)',
    fontFamily: 'System',
  },
});