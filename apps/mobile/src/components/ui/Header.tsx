import { View } from "react-native";

import { cn } from "@/lib/cn";

import Typo from "./Typo";
import { HeaderProps } from "./types";

const Header = ({ title = "", leftIcon, className }: HeaderProps) => {
  return (
    <View className={cn("w-full flex-row items-center", className)}>
      <Typo>Header</Typo>
      {leftIcon && <View className="self-start">{leftIcon}</View>}
      {title && (
        <Typo
          className={cn(
            "text-center text-[22px] font-semibold",
            leftIcon ? "w-[82%]" : "w-full",
          )}
        >
          {title}
        </Typo>
      )}
    </View>
  );
};

export default Header;
