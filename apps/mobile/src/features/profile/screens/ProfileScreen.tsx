import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import * as Icons from "phosphor-react-native";
import { useCallback, useRef, useState } from "react";
import {
  Alert,
  AppState,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import Header from "@/components/ui/Header";
import ScreenWrapper from "@/components/ui/ScreenWrapper";
import Typo from "@/components/ui/Typo";
import {
  checkEmailVerification,
  requestEmailVerification,
} from "@/features/auth/api/authService";
import { useAuth } from "@/features/auth/context/authContext";
import { getProfileImage } from "@/features/profile/api/imageService";
import { accountOptionType } from "@/features/profile/types";
import { cn } from "@/lib/cn";
import { auth } from "@/lib/firebase";
import { colors } from "@/theme";

export default function Profile() {
  const { user } = useAuth();
  const router = useRouter();

  const [isEmailVerified, setIsEmailVerified] = useState(
    auth.currentUser?.emailVerified ?? false,
  );
  const [verificationAction, setVerificationAction] = useState<
    "send" | "check" | null
  >(null);
  const verificationBusyRef = useRef(false);
  const autoCheckBusyRef = useRef(false);
  const isFocusedRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      isFocusedRef.current = true;

      const runAutoCheck = async () => {
        if (autoCheckBusyRef.current || verificationBusyRef.current) return;

        const currentUser = auth.currentUser;
        if (!currentUser) return;

        if (currentUser.emailVerified) {
          setIsEmailVerified(true);
          return;
        }

        autoCheckBusyRef.current = true;

        try {
          const result = await checkEmailVerification();

          if (!isFocusedRef.current || auth.currentUser !== currentUser) return;

          if (result.success) {
            setIsEmailVerified(result.verified);
          }
        } finally {
          autoCheckBusyRef.current = false;
        }
      };

      void runAutoCheck();

      const subscription = AppState.addEventListener("change", (state) => {
        if (state === "active") {
          void runAutoCheck();
        }
      });

      return () => {
        isFocusedRef.current = false;
        subscription.remove();
      };
    }, []),
  );

  const accountOptions: accountOptionType[] = [
    {
      title: "Edit profile",
      icon: <Icons.UserIcon size={26} color={colors.white} weight="fill" />,
      routeName: "/(modals)/profileModal",
      bgClassName: "bg-indigo-500",
    },
    {
      title: "Settings",
      icon: <Icons.GearSixIcon size={26} color={colors.white} weight="fill" />,
      bgClassName: "bg-emerald-600",
    },
    {
      title: "Privacy Policy",
      icon: <Icons.LockIcon size={26} color={colors.white} weight="fill" />,
      bgClassName: "bg-neutral-600",
    },
    {
      title: "Logout",
      icon: <Icons.PowerIcon size={26} color={colors.white} weight="fill" />,
      bgClassName: "bg-rose-600",
    },
  ];

  const handleVerification = async (action: "send" | "check") => {
    if (verificationBusyRef.current) return;

    const currentUser = auth.currentUser;
    if (!currentUser) return;

    verificationBusyRef.current = true;
    setVerificationAction(action);

    try {
      if (action === "send") {
        const result = await requestEmailVerification();

        if (auth.currentUser !== currentUser) return;

        if (!result.success) {
          Alert.alert("Email verification", result.msg);
          return;
        }

        setIsEmailVerified(currentUser.emailVerified);

        Alert.alert(
          "Email verification",
          currentUser.emailVerified
            ? "Your email is already verified."
            : "Verification email sent. Check your inbox and spam folder.",
        );
      } else {
        const result = await checkEmailVerification();

        if (auth.currentUser !== currentUser) return;

        if (!result.success) {
          Alert.alert("Email verification", result.msg);
          return;
        }

        setIsEmailVerified(result.verified);

        Alert.alert(
          "Email verification",
          result.verified
            ? "Your email has been verified."
            : "Your email is not verified yet. Open the link in your email, then check again.",
        );
      }
    } finally {
      verificationBusyRef.current = false;
      setVerificationAction(null);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch {
      Alert.alert("Logout", "Could not sign out. Please try again.");
    }
  };

  const showLogoutAlert = () => {
    Alert.alert("Confirm", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: () => {
          void handleLogout();
        },
        style: "destructive",
      },
    ]);
  };

  const handlePress = (item: accountOptionType) => {
    if (item.title === "Logout") {
      showLogoutAlert();
      return;
    }

    if (item.routeName) {
      router.push(item.routeName);
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView
        contentContainerClassName="grow px-5 pb-[30px]"
        showsVerticalScrollIndicator={false}
      >
        <Header title="Profile" className="my-2.5" />

        <View className="mt-[30px] items-center gap-5">
          <Image
            source={getProfileImage(user?.image)}
            className="h-[135px] w-[135px] self-center rounded-full bg-neutral-300"
            contentFit="cover"
            transition={100}
          />

          <View className="items-center gap-1">
            <Typo className="text-[24px] font-semibold text-neutral-100">
              {user?.name}
            </Typo>

            <Typo className="text-[15px] text-neutral-400">{user?.email}</Typo>
          </View>
        </View>

        <View className="mt-5 gap-2.5 rounded-[15px] bg-neutral-800 p-[15px]">
          <Typo className="text-[16px] font-semibold">
            {isEmailVerified ? "Email verified" : "Email not verified"}
          </Typo>

          {!isEmailVerified && (
            <>
              <Typo className="text-[14px] text-neutral-400">
                Verify your email to confirm that it belongs to you.
              </Typo>

              <TouchableOpacity
                onPress={() => {
                  void handleVerification("send");
                }}
                disabled={verificationAction !== null}
                accessibilityRole="button"
                className={cn(
                  "py-2.5",
                  verificationAction !== null && "opacity-50",
                )}
              >
                <Typo className="font-semibold text-primary">
                  {verificationAction === "send"
                    ? "Sending..."
                    : "Send verification email"}
                </Typo>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  void handleVerification("check");
                }}
                disabled={verificationAction !== null}
                accessibilityRole="button"
                className={cn(
                  "py-2.5",
                  verificationAction !== null && "opacity-50",
                )}
              >
                <Typo className="font-semibold text-primary">
                  {verificationAction === "check"
                    ? "Checking..."
                    : "I have verified my email"}
                </Typo>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View className="mt-[35px]">
          {accountOptions.map((item, index) => (
            <Animated.View
              key={item.title}
              entering={FadeInDown.delay(index * 50)
                .springify()
                .damping(14)}
              className="mb-[17px]"
            >
              <TouchableOpacity
                onPress={() => handlePress(item)}
                className="flex-row items-center gap-2.5"
                accessibilityRole="button"
              >
                <View
                  className={cn(
                    "h-11 w-11 items-center justify-center rounded-[15px] bg-neutral-500",
                    item.bgClassName,
                  )}
                >
                  {item.icon}
                </View>

                <Typo className="flex-1 text-[16px] font-medium">
                  {item.title}
                </Typo>

                <Icons.CaretRightIcon
                  size={20}
                  weight="bold"
                  color={colors.white}
                />
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
