import { Animated, View } from "react-native";

const ShimmerCard = ({ shimmerValue }) => {
  const translateX = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-180, 180],
  });

  return (
    <View className="w-1/2 px-1 mb-4">
      <View className="h-56 rounded-lg bg-white overflow-hidden">
        <View className="h-3/4 bg-gray-200 rounded-lg overflow-hidden">
          <Animated.View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              width: 90,
              transform: [{ translateX }, { skewX: "-18deg" }],
              backgroundColor: "rgba(255,255,255,0.55)",
            }}
          />
        </View>
        <View className="h-1/4 p-2 justify-center">
          <View className="h-4 w-4/5 bg-gray-200 rounded-md mb-2 overflow-hidden">
            <Animated.View
              pointerEvents="none"
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                width: 70,
                transform: [{ translateX }, { skewX: "-18deg" }],
                backgroundColor: "rgba(255,255,255,0.55)",
              }}
            />
          </View>
          <View className="h-3 w-2/3 bg-gray-200 rounded-md overflow-hidden">
            <Animated.View
              pointerEvents="none"
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                width: 60,
                transform: [{ translateX }, { skewX: "-18deg" }],
                backgroundColor: "rgba(255,255,255,0.55)",
              }}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

export default ShimmerCard;