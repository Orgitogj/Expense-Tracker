import { TouchableOpacity, View } from "react-native";

import { cn } from "@/lib/cn";

import Loading from "./Loading";
import { CustomButtonProps } from "./types";

const baseClassName = "h-[52px] items-center justify-center rounded-[17px]";

const Button = ({
  className,
  onPress,
  loading = false,
  children,
}: CustomButtonProps) => {
  if (loading) {
    return (
      <View className={cn(baseClassName, className, "bg-transparent")}>
        <Loading />
      </View>
    );
  }
  return (
    <TouchableOpacity
      onPress={onPress}
      className={cn(baseClassName, "bg-primary", className)}
    >
      {children}
    </TouchableOpacity>
  );
};

export default Button;
