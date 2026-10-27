import { useRouter } from "expo-router";
import { CaretLeftIcon } from "phosphor-react-native";
import { TouchableOpacity } from "react-native";

import { cn } from "@/lib/cn";
import { colors } from "@/theme";

import { BackButtonProps } from "./types";

const BackButton = ({ className, iconSize = 26 }: BackButtonProps) => {
  const router = useRouter();
  return (
    <TouchableOpacity
      onPress={() => router.back()}
      className={cn("self-start rounded-xl bg-neutral-600 p-[5px]", className)}
    >
      <CaretLeftIcon size={iconSize} color={colors.white} weight="bold" />
    </TouchableOpacity>
  );
};

export default BackButton;
