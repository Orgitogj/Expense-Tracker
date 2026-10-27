import { useRouter } from "expo-router";
import * as Icons from "phosphor-react-native";
import { useRef, useState } from "react";
import { Alert, Pressable, View } from "react-native";

import BackButton from "@/components/ui/BackButton";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import ScreenWrapper from "@/components/ui/ScreenWrapper";
import Typo from "@/components/ui/Typo";
import { useAuth } from "@/features/auth/context/authContext";
import { colors } from "@/theme";

const Login = () => {
  const emailRef = useRef("");
  const passwordRef = useRef("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login: loginUser } = useAuth();
  const handleSubmit = async () => {
    if (!emailRef.current || !passwordRef.current) {
      Alert.alert("Log in", "Please fill both fields");
      return;
    }
    setIsLoading(true);
    const res = await loginUser(emailRef.current, passwordRef.current);
    setIsLoading(false);
    if (!res.success) {
      Alert.alert("Log in", res.msg);
    }
  };
  return (
    <ScreenWrapper>
      <View className="flex-1 gap-[30px] px-5">
        <BackButton iconSize={28} />

        <View className="mt-5 gap-[5px]">
          <Typo className="text-[30px] font-extrabold">Hey,</Typo>

          <Typo className="text-[30px] font-extrabold">Welcome back</Typo>
        </View>

        <View className="gap-5">
          <Typo className="text-[16px] text-foreground-light">
            Log in now to track all your expenses
          </Typo>

          <Input
            placeholder="Enter your email"
            icon={
              <Icons.AtIcon size={16} weight="fill" color={colors.neutral300} />
            }
            onChangeText={(value) => (emailRef.current = value)}
          />
          <Input
            placeholder="Enter your password"
            icon={
              <Icons.PasswordIcon
                size={16}
                weight="fill"
                color={colors.neutral300}
              />
            }
            onChangeText={(value) => (passwordRef.current = value)}
            secureTextEntry
          />
        </View>
        <Pressable
          onPress={() => router.push("/(auth)/forgotPassword")}
          className="self-end"
          accessibilityRole="button"
          accessibilityLabel="Reset password"
        >
          <Typo className="text-[14px]">Forgot password?</Typo>
        </Pressable>
        <Button loading={isLoading} onPress={handleSubmit}>
          <Typo className="text-[21px] font-bold text-black">Log in</Typo>
        </Button>
        <View className="flex-row items-center justify-center gap-[5px]">
          <Typo className="text-[15px]">Don't have an account?</Typo>
          <Pressable onPress={() => router.navigate("/(auth)/register")}>
            <Typo className="text-[15px] font-bold text-primary">Sign up</Typo>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Login;
