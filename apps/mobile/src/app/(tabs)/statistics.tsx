import { View } from "react-native";

import ScreenWrapper from "@/components/ui/ScreenWrapper";
import Typo from "@/components/ui/Typo";

export default function Statistics() {
  return (
    <ScreenWrapper>
      <View className="flex-1 items-center justify-center">
        <View className="rounded-2xl border border-primary px-6 py-3">
          <Typo>Statistics</Typo>
        </View>
      </View>
    </ScreenWrapper>
  );
}
