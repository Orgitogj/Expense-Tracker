import { StatusBar, View } from "react-native";

import { cn } from "@/lib/cn";

import { ScreenWrapperProps } from "./types";

const ScreenWrapper = ({ className, children }: ScreenWrapperProps) => {
  return (
    <View
      className={cn("ios:pt-[6vh] flex-1 bg-neutral-900 pt-[50px]", className)}
    >
      <StatusBar barStyle="light-content" />
      {children}
    </View>
  );
};

export default ScreenWrapper;
