import { View } from "react-native";

import { cn } from "@/lib/cn";

import { ModalWrapperProps } from "./types";

const ModalWrapper = ({ className, children }: ModalWrapperProps) => {
  return (
    <View
      className={cn(
        "ios:pb-[20px] flex-1 bg-neutral-800 pb-[10px] pt-[15px]",
        className,
      )}
    >
      {children}
    </View>
  );
};

export default ModalWrapper;
