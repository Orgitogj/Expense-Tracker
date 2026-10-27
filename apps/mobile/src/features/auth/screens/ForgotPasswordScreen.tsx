import { useRef, useState } from "react";
import { Alert, ScrollView, View } from "react-native";

import BackButton from "@/components/ui/BackButton";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import ScreenWrapper from "@/components/ui/ScreenWrapper";
import Typo from "@/components/ui/Typo";
import { requestPasswordReset } from "@/features/auth/api/authService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const submittingRef = useRef(false);
  const handleSubmit = async () => {
    if (submittingRef.current) {
      return;
    }
    submittingRef.current = true;
    setIsLoading(true);
    try {
      const result = await requestPasswordReset(email);
      if (!result.success) {
        Alert.alert("Reset password", result.msg);
        return;
      }
      Alert.alert(
        "Check your email",
        "If an account exists for this email, you will receive a password reset link. Check your spam folder too.",
      );
    } finally {
      submittingRef.current = false;
      setIsLoading(false);
    }
  };
  return (
    <ScreenWrapper>
      <ScrollView
        contentContainerClassName="grow gap-[30px] px-5 pb-[30px]"
        keyboardShouldPersistTaps="handled"
      >
        <BackButton iconSize={28} />
        <View className="mt-5 gap-[15px]">
          <Typo className="text-[30px] font-extrabold">Reset password</Typo>
          <Typo className="text-[16px] text-foreground-light">
            Enter your account email to request a password reset link.
          </Typo>
        </View>
        <Input
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          editable={!isLoading}
          returnKeyType="send"
          onSubmitEditing={handleSubmit}
        />
        <Button loading={isLoading} onPress={handleSubmit}>
          <Typo className="font-bold text-black">Send reset link</Typo>
        </Button>
      </ScrollView>
    </ScreenWrapper>
  );
}
