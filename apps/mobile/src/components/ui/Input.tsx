import { TextInput, View } from "react-native";

import { cn } from "@/lib/cn";
import { colors } from "@/theme";

import { InputProps } from "./types";

const Input = ({
  icon,
  containerClassName,
  className,
  inputRef,
  ...rest
}: InputProps) => {
  return (
    <View
      className={cn(
        "h-[64px] flex-row items-center justify-center gap-2.5 rounded-[17px] border border-neutral-300 px-[15px]",
        containerClassName,
      )}
    >
      {icon && icon}
      <TextInput
        className={cn("flex-1 text-[14px] text-white", className)}
        placeholderTextColor={colors.neutral400}
        ref={inputRef}
        {...rest}
      />
    </View>
  );
};

export default Input;
