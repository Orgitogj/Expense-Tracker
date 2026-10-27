import { Image } from "expo-image";
import { PlatformPressable } from "expo-router/react-navigation";
import { cssInterop } from "nativewind";
import Animated from "react-native-reanimated";

cssInterop(Image, { className: "style" });
cssInterop(Animated.View, { className: "style" });
cssInterop(Animated.Image, { className: "style" });
cssInterop(PlatformPressable, { className: "style" });
