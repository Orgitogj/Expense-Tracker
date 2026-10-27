import { useRouter } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import Button from "@/components/ui/Button";
import ScreenWrapper from "@/components/ui/ScreenWrapper";
import Typo from "@/components/ui/Typo";

const Welcome = () => {
  const router = useRouter();
  return (
    <ScreenWrapper>
      <View className="flex-1 justify-between pt-[7px]">
        <View>
          <TouchableOpacity
            className="mr-5 self-end"
            onPress={() => router.push("/(auth)/login")}
          >
            <Typo className="font-medium">Sign in</Typo>
          </TouchableOpacity>
          <Animated.Image
            entering={FadeIn.duration(1000)}
            source={require("../../../../assets/images/welcome.png")}
            className="mt-[100px] h-[300px] w-full self-center"
            resizeMode="contain"
          />
        </View>
        <View className="android:shadow-[0px_-10px_10px_#ffffff] ios:shadow-[0px_-10px_25px_rgba(255,255,255,0.15)] items-center gap-5 bg-neutral-900 pb-[45px] pt-[30px]">
          <Animated.View
            entering={FadeInDown.duration(1000).springify().damping(12)}
            className="items-center"
          >
            <Typo className="text-[30px] font-extrabold">
              Always take control
            </Typo>
            <Typo className="text-[30px] font-extrabold">of your finances</Typo>
          </Animated.View>
          <Animated.View
            entering={FadeInDown.duration(1000)
              .delay(100)
              .springify()
              .damping(12)}
            className="items-center gap-0.5"
          >
            <Typo className="text-[17px] text-foreground-light">
              Financed must be arranged to set a better
            </Typo>
            <Typo className="text-[17px] text-foreground-light">
              lifestyle in future
            </Typo>
          </Animated.View>
          <Animated.View
            entering={FadeInDown.duration(1000)
              .delay(200)
              .springify()
              .damping(12)}
            className="w-full px-[25px]"
          >
            <Button onPress={() => router.push("/(auth)/register")}>
              <Typo className="text-[22px] font-semibold text-neutral-900">
                Get started
              </Typo>
            </Button>
          </Animated.View>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Welcome;
