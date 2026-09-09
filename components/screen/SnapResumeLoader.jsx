import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Text, View } from "react-native";
import LottieView from "lottie-react-native";

const T = {
  ink: "#141821",
  fieldBorder: "#EAEBED",
  caps: "#9AA0AC",
  green: "#58CC02",
  greenBg: "#EEFCE2",
  blue: "#1CB0F6",
  blueBg: "#E8F2FF",
  track: "#EDEFF2",
};

const MESSAGES = [
  "Crafting your perfect resume...",
  "Polishing every bullet point...",
  "Optimizing layout and spacing...",
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
      { top: 360, left: 20, size: 110, anim: new Animated.Value(0) },
      { top: 500, right: 40, size: 70, anim: new Animated.Value(0) },
      { top: 640, left: 100, size: 42, anim: new Animated.Value(0) },
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
      duration: 8500,
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
  }, [bgFloats, dot1, dot2, dot3, iconPulse, progressAnim, ringRotate]);

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
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      {/* Background Floating Orbs */}
      {bgFloats.map((circle, index) => {
        const rise = circle.anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -10],
        });

        const fade = circle.anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.3, 0.75],
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
              backgroundColor: T.greenBg,
              opacity: fade,
              transform: [{ translateY: rise }],
            }}
          />
        );
      })}

      {/* Top Header */}
      <View style={{ paddingHorizontal: 24, paddingTop: 56, paddingBottom: 16, flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: T.greenBg, alignItems: "center", justifyContent: "center" }}>
          <MaterialIcons name="description" size={24} color={T.green} />
        </View>
        <Text style={{ fontSize: 20, fontWeight: "900", color: T.ink }}>Resume Duo</Text>
      </View>

      {/* Main Loader Stage */}
      <View style={{ flex: 1, paddingHorizontal: 24, alignItems: "center", justifyContent: "center" }}>
        {/* Ring & Mascot Stage */}
        <View style={{ width: 160, height: 160, alignItems: "center", justifyContent: "center", marginBottom: 28 }}>
          <Animated.View
            style={{
              position: "absolute",
              width: 144,
              height: 144,
              borderRadius: 72,
              borderWidth: 2,
              borderStyle: "dashed",
              borderColor: T.green,
              transform: [{ rotate: ringSpin }],
            }}
          />

          <Animated.View
            style={{
              width: 96,
              height: 96,
              borderRadius: 28,
              backgroundColor: T.blueBg,
              alignItems: "center",
              justify: "center",
              overflow: "hidden",
              transform: [{ scale: Animated.multiply(iconPulse, iconPop) }],
            }}
          >
            <LottieView
              source={require("../../assets/images/lionblink.json")}
              autoPlay
              loop
              style={{ width: "100%", height: "100%" }}
            />
          </Animated.View>
        </View>

        {/* Dynamic Message */}
        <Animated.Text
          style={{
            fontSize: 18,
            fontWeight: "800",
            color: T.ink,
            textAlign: "center",
            transform: [{ translateY: messageSlide }],
            opacity: messageOpacity,
          }}
        >
          {messages[messageIndex] || MESSAGES[messageIndex % MESSAGES.length]}
        </Animated.Text>

        {/* Animated Bouncing Dots */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 12, marginBottom: 24, gap: 8 }}>
          <Animated.View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: T.green, transform: [{ translateY: dot1 }] }} />
          <Animated.View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: T.green, transform: [{ translateY: dot2 }] }} />
          <Animated.View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: T.green, transform: [{ translateY: dot3 }] }} />
        </View>

        {/* Progress Slider */}
        <View style={{ width: "100%", maxWidth: 300, marginBottom: 12 }}>
          <View style={{ height: 10, borderRadius: 5, backgroundColor: T.track, overflow: "hidden" }}>
            <Animated.View
              style={{
                height: "100%",
                width: progressWidth,
                backgroundColor: T.green,
                borderRadius: 5,
              }}
            />
          </View>
          <Text style={{ fontSize: 13, fontWeight: "800", color: T.caps, textAlign: "right", marginTop: 6 }}>
            {String(progressValue).padStart(2, "0")}%
          </Text>
        </View>
      </View>

      {/* Footer Badge */}
      <View style={{ alignItems: "center", paddingBottom: 36 }}>
        <Text style={{ fontSize: 12, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase", color: T.caps }}>
        </Text>
      </View>
    </View>
  );
}