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
import { useAuth } from '@/context/authContext'

const Register = () => {

  const emailRef=useRef("");
  const passwordRef=useRef("");
  const nameRef=useRef("");
  const [isLoading,setIsLoading]=useState(false);
  const router=useRouter();
  const {register:registerUser}=useAuth();
  const handleSubmit=async()=>{
    if (!emailRef.current || !passwordRef.current||!nameRef.current){
      Alert.alert('Sign up',"Please fill all the  fields");
      return;
    }
    setIsLoading(true);
    const res=await registerUser(emailRef.current,passwordRef.current,nameRef.current);
    setIsLoading(false);
    console.log('register result:',res);
    if(!res.success){
      Alert.alert("Sign up",res.msg);
    }
    
  }
  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <BackButton iconSize={28} />

        <View style={styles.welcomeContainer}>
          <Typo size={30} fontWeight="800">
            Let's
          </Typo>

          <Typo size={30} fontWeight="800">
            Get started
          </Typo>
        </View>

        <View style={styles.form}>
          <Typo size={16} color={colors.textLight}>
            Create an account  to track all your expenses
          </Typo>

          <Input
            placeholder="Enter your email"
            icon={<Icons.AtIcon size={verticalScale(16)}  weight="fill" color={colors.neutral300}/>}
            onChangeText={(value)=>(emailRef.current=value)}
          />
          <Input
            placeholder="Enter your name"
            icon={<Icons.UserIcon size={verticalScale(16)}  weight="fill" color={colors.neutral300}/>}
            onChangeText={(value)=>(nameRef.current=value)}
          />
          <Input
            placeholder="Enter your password"
            icon={<Icons.PasswordIcon size={verticalScale(16)}  weight="fill" color={colors.neutral300}/>}
            onChangeText={(value)=>(passwordRef.current=value)}
            secureTextEntry
          />
        </View>
        <Button  loading={isLoading} onPress={handleSubmit}>
          <Typo fontWeight={'700'} color={colors.black}size={21}>Sign up</Typo>

        </Button>
        <View style={styles.footer}>
          <Typo size={15}>Already have an account</Typo>
          <Pressable onPress={()=>router.navigate("/(auth)/login")}>
            <Typo size={15} fontWeight={"700"} color={colors.primary}>Log in</Typo>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  )
}

export default Register

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