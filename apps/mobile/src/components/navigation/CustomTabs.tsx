import { BottomTabBarProps } from "expo-router/build/react-navigation/bottom-tabs";
import {
  PlatformPressable,
  useLinkBuilder,
} from "expo-router/react-navigation";
import * as Icons from "phosphor-react-native";
import { View } from "react-native";

import { colors } from "@/theme";

export default function CustomTabs({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const { buildHref } = useLinkBuilder();

  const tabBarIcons: Record<string, (isFocused: boolean) => React.ReactNode> = {
    index: (isFocused) => (
      <Icons.HouseIcon
        size={25}
        weight={isFocused ? "fill" : "regular"}
        color={isFocused ? colors.primary : colors.neutral400}
      />
    ),

    statistics: (isFocused) => (
      <Icons.ChartBarIcon
        size={25}
        weight={isFocused ? "fill" : "regular"}
        color={isFocused ? colors.primary : colors.neutral400}
      />
    ),

    wallet: (isFocused) => (
      <Icons.WalletIcon
        size={25}
        weight={isFocused ? "fill" : "regular"}
        color={isFocused ? colors.primary : colors.neutral400}
      />
    ),

    profile: (isFocused) => (
      <Icons.UserIcon
        size={25}
        weight={isFocused ? "fill" : "regular"}
        color={isFocused ? colors.primary : colors.neutral400}
      />
    ),
  };

  return (
    <View className="ios:h-[73px] h-[55px] w-full flex-row items-center justify-center border-t border-neutral-700 bg-neutral-800">
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        const icon = tabBarIcons[route.name]?.(isFocused);

        return (
          <PlatformPressable
            key={route.key}
            href={buildHref(route.name, route.params)}
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarButtonTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            className="ios:mb-2.5 mb-[5px] flex-1 items-center justify-center gap-[3px]"
          >
            {icon}
          </PlatformPressable>
        );
      })}
    </View>
  );
}
