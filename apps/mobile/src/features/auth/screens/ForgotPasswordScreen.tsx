import { requestPasswordReset } from "@/features/auth/api/authService";
import BackButton from "@/components/ui/BackButton";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import ScreenWrapper from "@/components/ui/ScreenWrapper";
import Typo from "@/components/ui/Typo";
import { colors, spacingX, spacingY } from "@/theme";
import { useRef, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

export default function ForgotPassword(){
    const [email,setEmail]=useState("");
    const [isLoading,setIsLoading]=useState(false);
    const submittingRef=useRef(false);
    const handleSubmit=async()=>{
        if(submittingRef.current){
            return;
        }
        submittingRef.current=true;
        setIsLoading(true);
        try{
            const result =await requestPasswordReset(email);
            if(!result.success){
                Alert.alert("Reset password",result.msg);
                return;
            }
             Alert.alert(
        "Check your email",
        "If an account exists for this email, you will receive a password reset link. Check your spam folder too."
      );
        } finally{
            submittingRef.current=false;
            setIsLoading(false);
        }
    };
    return (
        <ScreenWrapper>
            <ScrollView  contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
            >
                <BackButton iconSize={28}/>
                <View style={styles.heading}>
                    <Typo size={30} fontWeight="800">
                        Reset password
                    </Typo>
                    <Typo size={16} color={colors.textLight}>Enter your account email to request a password reset link.</Typo>
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
                        <Typo size={18} fontWeight="700" color={colors.black}>
                            Send reset link
                        </Typo>
                    </Button>

            </ScrollView>
        </ScreenWrapper>
    )
}


const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: spacingX._20,
    paddingBottom: spacingY._30,
    gap: spacingY._30,
  },
  heading: {
    marginTop: spacingY._20,
    gap: spacingY._15,
  },
});