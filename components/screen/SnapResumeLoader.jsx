import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Text, View } from "react-native";

const BRAND = "#0073D5";
const LIGHT = "#E6F2FF";
const DARK_TEXT = "#0A1F44";
const MUTED = "#6B8CAE";

const MESSAGES = [
  "Crafting your perfect resume...",
  "Polishing every bullet point...",
  "Optimizing for ATS systems...",
  "Almost ready to impress!",
];

export default function SnapResumeLoader({ messages = MESSAGES }) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progressValue, setProgressValue] = useState(0);

  const ringRotate = useRef(new Animated.Value(0)).current;
  const iconPulse = useRef(new Animated.Value(1)).current;
  const iconPop = useRef(new Animated.Value(0.85)).current;
  const messageSlide = useRef(new Animated.Value(10)).current;
  const messageOpacity = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  const bgFloats = useMemo(
    () => [
      { top: 90, left: 30, size: 80, anim: new Animated.Value(0) },
      { top: 180, right: 28, size: 52, anim: new Animated.Value(0) },
      { top: 360, left: 20, size: 120, anim: new Animated.Value(0) },
      { top: 500, right: 40, size: 70, anim: new Animated.Value(0) },
      { top: 640, left: 110, size: 42, anim: new Animated.Value(0) },
    ],
    []
  );

  useEffect(() => {
    Animated.loop(
      Animated.timing(ringRotate, {
        toValue: 1,
        duration: 2600,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(iconPulse, {
          toValue: 1.08,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(iconPulse, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.timing(progressAnim, {
      toValue: 97,
      duration: 9000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    const animateDot = (dot, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: -8,
            duration: 280,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 280,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.delay(260),
        ])
      );

    animateDot(dot1, 0).start();
    animateDot(dot2, 140).start();
    animateDot(dot3, 280).start();

    bgFloats.forEach((circle, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 140),
          Animated.timing(circle.anim, {
            toValue: 1,
            duration: 2200 + index * 180,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(circle.anim, {
            toValue: 0,
            duration: 2200 + index * 180,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
    });

    const progressListener = progressAnim.addListener(({ value }) => {
      const rounded = Math.max(0, Math.min(97, Math.round(value)));
      setProgressValue(rounded);
    });

    return () => {
      progressAnim.removeListener(progressListener);
    };
  }, [
    bgFloats,
    dot1,
    dot2,
    dot3,
    iconPulse,
    progressAnim,
    ringRotate,
  ]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(messageSlide, {
        toValue: 0,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(messageOpacity, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(iconPop, {
        toValue: 1,
        friction: 5,
        tension: 110,
        useNativeDriver: true,
      }),
    ]).start();

    const messageTimer = setInterval(() => {
      messageSlide.setValue(10);
      messageOpacity.setValue(0);
      iconPop.setValue(0.85);
      setMessageIndex((current) => (current + 1) % messages.length);
    }, 2000);

    return () => {
      clearInterval(messageTimer);
    };
  }, [iconPop, messageOpacity, messageSlide, messages.length]);

  const ringSpin = ringRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 97],
    outputRange: ["0%", "97%"],
  });

  return (
    <View className="flex-1 bg-white">
      {bgFloats.map((circle, index) => {
        const rise = circle.anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -10],
        });

        const fade = circle.anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.45, 0.85],
        });

        return (
          <Animated.View
            key={`bg-circle-${index}`}
            style={{
              position: "absolute",
              top: circle.top,
              left: circle.left,
              right: circle.right,
              width: circle.size,
              height: circle.size,
              borderRadius: circle.size / 2,
              backgroundColor: LIGHT,
              opacity: fade,
              transform: [{ translateY: rise }],
            }}
          />
        );
      })}

      <View className="px-6 pt-14 pb-4 flex-row items-center gap-3">
        <View className="w-11 h-11 rounded-xl items-center justify-center" style={{ backgroundColor: LIGHT }}>
          <MaterialIcons name="description" size={24} color={BRAND} />
        </View>
        <Text className="text-2xl font-bold" style={{ color: DARK_TEXT }}>
          Resume Builder
        </Text>
      </View>

      <View className="flex-1 px-6 items-center justify-center">
        <View className="items-center justify-center mb-8" style={{ width: 150, height: 150 }}>
          <Animated.View
            style={{
              position: "absolute",
              width: 128,
              height: 128,
              borderRadius: 64,
              borderWidth: 2,
              borderStyle: "dashed",
              borderColor: BRAND,
              transform: [{ rotate: ringSpin }],
            }}
          />

          <Animated.View
            style={{
              width: 78,
              height: 78,
              borderRadius: 20,
              backgroundColor: LIGHT,
              alignItems: "center",
              justifyContent: "center",
              transform: [{ scale: Animated.multiply(iconPulse, iconPop) }],
            }}
          >
            <MaterialIcons name="article" size={40} color={BRAND} />
          </Animated.View>
        </View>

        <Animated.Text
          className="text-center font-semibold text-lg"
          style={{
            color: DARK_TEXT,
            transform: [{ translateY: messageSlide }],
            opacity: messageOpacity,
          }}
        >
          {messages[messageIndex] || MESSAGES[messageIndex % MESSAGES.length]}
        </Animated.Text>

        <View className="flex-row items-center justify-center mt-3 mb-6" style={{ gap: 8 }}>
          <Animated.View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: BRAND,
              transform: [{ translateY: dot1 }],
            }}
          />
          <Animated.View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: BRAND,
              transform: [{ translateY: dot2 }],
            }}
          />
          <Animated.View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: BRAND,
              transform: [{ translateY: dot3 }],
            }}
          />
        </View>

        <View className="w-full mb-3" style={{ maxWidth: 320 }}>
          <View className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: LIGHT }}>
            <Animated.View
              style={{
                height: "100%",
                width: progressWidth,
                backgroundColor: BRAND,
                borderRadius: 999,
              }}
            />
          </View>
          <Text className="mt-2 text-sm text-right" style={{ color: MUTED }}>
            {String(progressValue).padStart(2, "0")}%
          </Text>
        </View>
      </View>

      <View className="items-center pb-9">
        <Text style={{ color: MUTED, fontWeight: "500" }}>Powered by AI</Text>
      </View>
    </View>
  );
}