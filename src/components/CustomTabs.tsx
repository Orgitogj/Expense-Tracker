
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useLinkBuilder, PlatformPressable } from 'expo-router/react-navigation';
import { BottomTabBarProps } from 'expo-router/build/react-navigation/bottom-tabs';
import { verticalScale } from '@/utils/styling';
import { colors, spacingY } from '../constants/theme';
import * as Icons from 'phosphor-react-native';

export default function CustomTabs({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const { buildHref } = useLinkBuilder();

  const tabBarIcons: Record<string, (isFocused: boolean) => React.ReactNode> = {
    index: (isFocused) => (
      <Icons.HouseIcon
        size={verticalScale(25)}
        weight={isFocused ? 'fill' : 'regular'}
        color={isFocused ? colors.primary : colors.neutral400}
      />
    ),

    statistics: (isFocused) => (
      <Icons.ChartBarIcon
        size={verticalScale(25)}
        weight={isFocused ? 'fill' : 'regular'}
        color={isFocused ? colors.primary : colors.neutral400}
      />
    ),

    wallet: (isFocused) => (
    <Icons.WalletIcon
        size={verticalScale(25)}
        weight={isFocused ? 'fill' : 'regular'}
        color={isFocused ? colors.primary : colors.neutral400}
    />
    ),

    profile: (isFocused) => (
      <Icons.UserIcon
        size={verticalScale(25)}
        weight={isFocused ? 'fill' : 'regular'}
        color={isFocused ? colors.primary : colors.neutral400}
      />
    ),
  };

  return (
    <View style={styles.tabbar}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];

        const label =
          typeof options.tabBarLabel === 'string'
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
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
            style={styles.tabButton}
          >
            {icon}

            {
                tabBarIcons[route.name]&&tabBarIcons [route.name](isFocused)
            }
          </PlatformPressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabbar: {
    flexDirection: 'row',
    width: '100%',
    height:
      Platform.OS === 'ios'
        ? verticalScale(73)
        : verticalScale(55),
    backgroundColor: colors.neutral800,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopColor: colors.neutral700,
    borderTopWidth: 1,
  },

  tabButton: {
    marginBottom:
      Platform.OS === 'ios'
        ? spacingY._10
        : spacingY._5,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 3,
  },

  label: {
    fontSize: 12,
    fontWeight: '500',
  },
});

