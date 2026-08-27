import { Alert, Pressable, StyleSheet, View } from 'react-native'
import ScreenWrapper from '@/src/components/ScreenWrapper'
import { colors, spacingX, spacingY } from '@/src/constants/theme'
import { verticalScale } from '@/utils/styling'
import BackButton from '@/src/components/BackButton'
import Button from '@/src/components/Button'
import Typo from '@/src/components/Typo'
import Input from '@/src/components/Input'
import * as Icons from 'phosphor-react-native'
import { useRef, useState } from 'react'
import { useRouter } from 'expo-router'

const Login = () => {

  const emailRef=useRef("");
  const passwordRef=useRef("");
  const [isLoading,setIsLoading]=useState(false);
  const router=useRouter();
  const handleSubmit=async()=>{
    if (!emailRef.current || !passwordRef.current){
      Alert.alert('Log in',"Please fill both fields");
      return;
    }
    console.log('email:' ,emailRef.current)
    console.log('password:' ,passwordRef.current)
    
  }
  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <BackButton iconSize={28} />

        <View style={styles.welcomeContainer}>
          <Typo size={30} fontWeight="800">
            Hey,
          </Typo>

          <Typo size={30} fontWeight="800">
            Welcome back
          </Typo>
        </View>

        <View style={styles.form}>
          <Typo size={16} color={colors.textLight}>
            Log in now to track all your expenses
          </Typo>

          <Input
            placeholder="Enter your email"
            icon={<Icons.AtIcon size={verticalScale(16)}  weight="fill" color={colors.neutral300}/>}
            onChangeText={(value)=>(emailRef.current=value)}
          />
          <Input
            placeholder="Enter your password"
            icon={<Icons.PasswordIcon size={verticalScale(16)}  weight="fill" color={colors.neutral300}/>}
            onChangeText={(value)=>(passwordRef.current=value)}
            secureTextEntry
          />
        </View>
        <Typo size={14} color={colors.text} style={{alignSelf:"flex-end"}}>Forgot password?</Typo>
        <Button  loading={isLoading} onPress={handleSubmit}>
          <Typo fontWeight={'700'} color={colors.black}size={21}>Log in</Typo>

        </Button>
        <View style={styles.footer}>
          <Typo size={15}>Don't have an account?</Typo>
          <Pressable onPress={()=>router.navigate("/(auth)/register")}>
            <Typo size={15} fontWeight={"700"} color={colors.primary}>Sign up</Typo>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  )
}

export default Login

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacingY._30,
    paddingHorizontal: spacingX._20,
  },

  welcomeContainer: {
    gap: 5,
    marginTop: spacingY._20,
  },

  form: {
    gap: spacingY._20,
  },

  forgotPassword: {
    textAlign: 'right',
    fontWeight: '500',
    color: colors.text,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },

  footerText: {
    textAlign: 'center',
    color: colors.text,
    fontSize: verticalScale(15),
  },
})