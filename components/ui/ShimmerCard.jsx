import { Animated, View } from "react-native";

const ShimmerCard = ({ shimmerValue }) => {
  const translateX = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-180, 180],
  });

  return (
    <View className="w-1/2 px-1 mb-4">
      <View className="h-56 overflow-hidden rounded-[24px] border border-[#D9E2EC] bg-white">
        <View className="h-3/4 overflow-hidden rounded-t-[24px] bg-[#DDEAF5]">
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
          <View className="mb-2 h-4 w-4/5 overflow-hidden rounded-md bg-[#DDF3F0]">
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
          <View className="h-3 w-2/3 overflow-hidden rounded-md bg-[#FDE2DD]">
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