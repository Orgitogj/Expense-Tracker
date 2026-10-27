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

const Register = () => {
  const emailRef = useRef("");
  const passwordRef = useRef("");
  const nameRef = useRef("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const submittingRef = useRef(false);
  const { register: registerUser, retryProfileSave } = useAuth();
  const showProfileRetry = (msg: string) => {
    Alert.alert("Sign up", msg, [
      { text: "Later", style: "cancel" },
      {
        text: "Try again",
        onPress: async () => {
          const res = await retryProfileSave();
          if (res.success) return;
          if (res.retryable) {
            showProfileRetry(res.msg);
          } else {
            Alert.alert("Sign up", res.msg);
          }
        },
      },
    ]);
  };
  const handleSubmit = async () => {
    if (submittingRef.current) return;
    const email = emailRef.current.trim();
    const name = nameRef.current.trim();
    const password = passwordRef.current;
    if (!email || !password || !name) {
      Alert.alert("Sign up", "Please fill all the  fields");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      Alert.alert("Sign up", "Please enter a valid email address.");
      return;
    }
    submittingRef.current = true;
    setIsLoading(true);
    try {
      const res = await registerUser(email, password, name);
      console.log("register result:", res.status);
      if (res.status === "auth-failed") {
        Alert.alert("Sign up", res.msg);
      } else if (res.status === "profile-failed") {
        showProfileRetry(
          res.verificationWarning
            ? `${res.msg}\n\n${res.verificationWarning}`
            : res.msg,
        );
      } else if (res.status === "success" && res.verificationWarning) {
        Alert.alert("Account created", res.verificationWarning);
      }
    } finally {
      submittingRef.current = false;
      setIsLoading(false);
    }
  };
  return (
    <ScreenWrapper>
      <View className="flex-1 gap-[30px] px-5">
        <BackButton iconSize={28} />

        <View className="mt-5 gap-[5px]">
          <Typo className="text-[30px] font-extrabold">Let's</Typo>

          <Typo className="text-[30px] font-extrabold">Get started</Typo>
        </View>

        <View className="gap-5">
          <Typo className="text-[16px] text-foreground-light">
            Create an account to track all your expenses
          </Typo>

          <Input
            placeholder="Enter your email"
            icon={
              <Icons.AtIcon size={16} weight="fill" color={colors.neutral300} />
            }
            onChangeText={(value) => (emailRef.current = value)}
          />
          <Input
            placeholder="Enter your name"
            icon={
              <Icons.UserIcon
                size={16}
                weight="fill"
                color={colors.neutral300}
              />
            }
            onChangeText={(value) => (nameRef.current = value)}
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
        <Button loading={isLoading} onPress={handleSubmit}>
          <Typo className="text-[21px] font-bold text-black">Sign up</Typo>
        </Button>
        <View className="flex-row items-center justify-center gap-[5px]">
          <Typo className="text-[15px]">Already have an account</Typo>
          <Pressable onPress={() => router.navigate("/(auth)/login")}>
            <Typo className="text-[15px] font-bold text-primary">Log in</Typo>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Register;
