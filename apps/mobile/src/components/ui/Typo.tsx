import { Text } from "react-native";

import { cn } from "@/lib/cn";

import { TypoProps } from "./types";

const Typo = ({ className, ...props }: TypoProps) => {
  return (
    <Text className={cn("text-[18px] text-white", className)} {...props} />
  );
};

export default Typo;
